// src/pages/GamePage.tsx
import React, { useCallback } from 'react';
import './GamePage.css';
import { useGameEngine } from '../hooks/useGameEngine';
import GameMap from '../components/GameMap';
import { Tower, Enemy } from '../models/types';
import { findPath, GRID_WIDTH, GRID_HEIGHT } from '../utils/pathFinding';

const GamePage: React.FC = () => {
  const { state, dispatch } = useGameEngine();

  // 点击地图放置塔
  const handleMapClick = useCallback((x: number, y: number) => {
    // 新塔对象
    const newTower: Tower = {
      id: Date.now().toString(),
      position: { x, y },
      range: 2,
      damage: 10,
      level: 1,
    };

    // 模拟放置后所有塔的集合，检测敌人能否通行
    const simulatedTowers = [...state.towers, newTower];
    const newPath = findPath(simulatedTowers, { x: 0, y: 0 }, { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 });
    if (!newPath) {
      alert('塔的放置阻挡了敌人的路径，无法放置！');
      return;
    }

    // 放置塔
    dispatch({ type: 'ADD_TOWER', payload: newTower });

    // 更新所有已存在的敌人：重置路径、进度和位置到起点
    state.enemies.forEach(enemy => {
      const updatedEnemy: Enemy = {
        ...enemy,
        path: newPath,
        progress: 0,
        position: { ...newPath[0] },
      };
      dispatch({ type: 'UPDATE_ENEMY', payload: updatedEnemy });
    });
  }, [state.towers, state.enemies, dispatch]);

  // 生成敌人（使用当前塔布局计算路径）
  const spawnEnemy = useCallback(() => {
    const path = findPath(state.towers, { x: 0, y: 0 }, { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 });
    if (!path) {
      alert('当前塔布局阻挡了敌人的路径，无法生成敌人！');
      return;
    }
    const enemy = {
      id: Date.now().toString(),
      position: { ...path[0] },
      health: 100,
      speed: 1,
      progress: 0,
      path: path,
    };
    dispatch({ type: 'SPAWN_ENEMY', payload: enemy });
  }, [state.towers, dispatch]);

  return (
    <div className="game-page">
      <h1>Tower Defense Game</h1>
      <p>
        Score: {state.score} &nbsp; Lives: {state.lives}
      </p>
      <button onClick={spawnEnemy}>Spawn Enemy</button>
      <GameMap state={state} onMapClick={handleMapClick} />
    </div>
  );
};

export default GamePage;
