// src/hooks/useGameEngine.ts
import { useReducer, useEffect, useRef } from 'react';
import { gameReducer, initialGameState } from '../reducers/gameReducer';
import { Enemy } from '../models/types';

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const requestRef = useRef<number>(0);

  // 游戏主循环：计算每个敌人沿其 path 插值前进
  const gameLoop = (time: number) => {
    state.enemies.forEach(enemy => {
      // 每帧更新进度，假设 60fps，所以 0.016 秒每帧
      const progressIncrement = enemy.speed * 0.016;
      const newProgress = enemy.progress + progressIncrement;

      if (newProgress >= enemy.path.length - 1) {
        // 敌人到达终点，扣除玩家生命并移除该敌人
        dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
        dispatch({ type: 'UPDATE_GAME', payload: { lives: state.lives - 1 } });
      } else {
        let updatedEnemy = { ...enemy, progress: newProgress };
        // 根据邻近两格进行线性插值计算位置
        const currentIndex = Math.floor(newProgress);
        const nextIndex = currentIndex + 1;
        if (nextIndex < enemy.path.length) {
          const currentPos = enemy.path[currentIndex];
          const nextPos = enemy.path[nextIndex];
          const t = newProgress - currentIndex;
          updatedEnemy.position = {
            x: currentPos.x + (nextPos.x - currentPos.x) * t,
            y: currentPos.y + (nextPos.y - currentPos.y) * t,
          };
        }
        dispatch({ type: 'UPDATE_ENEMY', payload: updatedEnemy });
      }
    });
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // 此处依赖 state.enemies，保证每帧更新最新敌人状态
  }, [state.enemies]);

  return { state, dispatch };
}
