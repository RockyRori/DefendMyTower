// src/pages/GamePage.tsx
import React, { useCallback, useEffect, useState } from "react";
import "./GamePage.css";
import { useGameEngine } from "../hooks/useGameEngine";
import GameMap from "../components/GameMap";
import {
  Tower,
  TowerTemplate,
  GameState,
  Enemy,
  // Position,
} from "../models/types";
import towersData from "../data/towers.json";
import levelsData from "../data/levels.json";
import wavesData from "../data/waves.json";
import {
  findPath,
  GRID_WIDTH,
  GRID_HEIGHT,
  // interpolatePosition,
} from "../utils/pathFinding";

// 所有 Hook 调用必须在函数组件内部
const GamePage: React.FC = () => {
  const [towerTemplates] = useState<TowerTemplate[]>(
    towersData as TowerTemplate[]
  );
  const [levels] = useState<any[]>(levelsData.levels);
  const [selectedTowerTemplate, setSelectedTowerTemplate] =
    useState<TowerTemplate>(towerTemplates[0]);
  const [currentWaveIndex, setCurrentWaveIndex] = useState<number>(0);
  const [waves, setWaves] = useState<any[]>([]);
  const [isDemolishMode, setIsDemolishMode] = useState<boolean>(false);

  const { state, dispatch } = useGameEngine();

  // 关卡初始化：构造全新的 GameState 对象
  const initializeLevel = useCallback(
    (levelId: string) => {
      const level = levels.find((l) => l.id === levelId);
      if (!level) return;
      const initState: GameState = {
        towers: [],
        enemies: [],
        bullets: [],
        lives: 10,
        score: 0,
        gold: level.gold,
        currentWave: 0,
        totalWaves: level.waves,
        paused: false,
        currentLevelId: level.id,
      };
      dispatch({ type: "INITIALIZE_LEVEL", payload: initState });
      // 加载对应关卡的波次数据
      const levelWaves = wavesData.levels.find(
        (lvl: any) => lvl.levelId === levelId
      );
      setWaves(levelWaves ? levelWaves.waves : []);
      setCurrentWaveIndex(0);
    },
    [dispatch, levels]
  );

  // 初始加载第一个关卡数据
  useEffect(() => {
    if (levels.length > 0) {
      initializeLevel(levels[0].id);
    }
  }, [initializeLevel, levels]);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    initializeLevel(e.target.value);
  };

  // 播放/暂停按钮逻辑
  const togglePaused = () => {
    dispatch({ type: "SET_PAUSED", payload: !state.paused });
  };

  // 拆除模式切换：进入拆除模式时自动暂停游戏
  const toggleDemolishMode = () => {
    dispatch({ type: "SET_PAUSED", payload: true });
    setIsDemolishMode(true);
  };

  // 检查胜利条件：当当前波次达到上限且场上无敌人时宣布胜利
  useEffect(() => {
    if (
      state.currentWave >= state.totalWaves &&
      state.enemies.length === 0 &&
      state.lives > 0
    ) {
      alert("Victory! Level cleared!");
      dispatch({ type: "SET_PAUSED", payload: true });
    }
  }, [state.currentWave, state.totalWaves, state.enemies, state.lives, dispatch]);

  // 点击地图：根据当前模式放置塔或拆除塔
  const handleMapClick = useCallback(
    (x: number, y: number) => {
      if (state.paused && !isDemolishMode) return; // 如果处于暂停状态且非拆除模式，不响应点击

      // 若处于拆除模式，查找该格是否有塔
      const existingTower = state.towers.find(
        (t) => t.position.x === x && t.position.y === y
      );
      if (isDemolishMode && existingTower) {
        if (window.confirm("Are you sure to demolish this tower?")) {
          dispatch({ type: "REMOVE_TOWER", payload: existingTower.id });
          // 拆除完成后自动恢复播放并退出拆除模式
          dispatch({ type: "SET_PAUSED", payload: false });
          setIsDemolishMode(false);
        }
        return;
      }

      // 非拆除模式下，检查该位置是否已有塔
      if (state.towers.some((t) => t.position.x === x && t.position.y === y)) {
        return;
      }
      // 检查金币条件（直接购买塔）
      if (
        selectedTowerTemplate.buyCost > 0 &&
        state.gold < selectedTowerTemplate.buyCost
      ) {
        alert("Not enough gold to purchase this tower!");
        return;
      }
      // 构造新塔，赋予动态属性（初始 level 为 1，levelUpCost = stage * level）
      const newTower: Tower = {
        ...selectedTowerTemplate,
        position: { x, y },
        level: 1,
        levelUpCost: selectedTowerTemplate.stage * 1,
        createdAt: Date.now(),
      };
      // 模拟加入塔后的全局塔布局，检测敌人路径
      const simulatedTowers = [...state.towers, newTower];
      const globalPath = findPath(
        simulatedTowers,
        { x: 0, y: 0 },
        { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 }
      );
      if (!globalPath) {
        alert("Tower placement blocks enemy path, cannot place tower!");
        return;
      }
      // 扣除金币（若 buyCost > 0）
      if (selectedTowerTemplate.buyCost > 0) {
        dispatch({
          type: "UPDATE_GAME",
          payload: { gold: state.gold - selectedTowerTemplate.buyCost },
        });
      }
      dispatch({ type: "ADD_TOWER", payload: newTower });
    },
    [state, selectedTowerTemplate, dispatch, isDemolishMode]
  );

  // “下一波敌人”按钮逻辑：根据 waves 数据生成本波所有敌人
  const nextWave = useCallback(() => {
    if (currentWaveIndex >= waves.length) {
      alert("No more waves in this level!");
      return;
    }
    const wave = waves[currentWaveIndex];
    // 针对本波配置，生成所有敌人（简化为一次性生成，每个敌人均调用 findPath 计算路径）
    wave.enemies.forEach((enemyData: { enemyId: string; count: number; interval: number }) => {
      for (let i = 0; i < enemyData.count; i++) {
        const path = findPath(
          state.towers,
          { x: 0, y: 0 },
          { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 }
        );
        const enemy: Enemy = {
          id: Date.now().toString() + i,
          name: enemyData.enemyId,
          health: 100,
          maxHealth: 100,
          speed: 1,
          position: path ? { ...path[0] } : { x: 0, y: 0 },
          path: path || [],
          progress: 0,
          element: "fire",
          isFlying: false,
          reward: 20,
          damage: 1,
          status: {},
          createdAt: Date.now(),
          imgPath: "/assets/enemies/goblin.png",
        };
        dispatch({ type: "SPAWN_ENEMY", payload: enemy });
      }
    });
    dispatch({
      type: "UPDATE_GAME",
      payload: { currentWave: state.currentWave + 1 },
    });
    setCurrentWaveIndex(currentWaveIndex + 1);
  }, [currentWaveIndex, waves, dispatch, state.towers, state.currentWave]);

  return (
    <div className="game-page">
      <div className="header-bar">
        {/* 关卡选择 */}
        <select onChange={handleLevelChange}>
          {levels.map((level: any) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
        {/* 塔选择列表 */}
        <div className="tower-selection">
          {towerTemplates.map((tpl) => (
            <button
              key={tpl.id}
              className={tpl.id === selectedTowerTemplate.id ? "selected" : ""}
              onClick={() => setSelectedTowerTemplate(tpl)}
            >
              {tpl.type}
            </button>
          ))}
        </div>
        {/* 操作按钮 */}
        <button onClick={togglePaused}>
          {state.paused ? "Play" : "Pause"}
        </button>
        <button onClick={toggleDemolishMode}>Demolish Tower</button>
        <button onClick={nextWave}>Next Wave</button>
        {/* 信息显示：金币、剩余爱心、波次 */}
        <div className="info">
          <span>Gold: {state.gold}</span>
          <span>Lives: {state.lives}</span>
          <span>
            Wave: {state.currentWave}/{state.totalWaves}
          </span>
        </div>
      </div>
      <GameMap state={state} onMapClick={handleMapClick} />
    </div>
  );
};

export default GamePage;
