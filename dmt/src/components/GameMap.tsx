// src/components/GameMap.tsx
import React from 'react';
import './GameMap.css';
import { GameState } from '../models/types';
import Tower from './Tower';
import Enemy from './Enemy';
import Bullet from './Bullet';
// import { GRID_WIDTH, GRID_HEIGHT } from '../utils/pathFinding';
// 导入本地图片
import entranceImg from '../assets/entrance.webp';
import exitImg from '../assets/exit.webp';

interface GameMapProps {
  state: GameState;
  onMapClick?: (x: number, y: number) => void;
}

const GameMap: React.FC<GameMapProps> = ({ state, onMapClick }) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 50);
    const y = Math.floor((event.clientY - rect.top) / 50);
    onMapClick && onMapClick(x, y);
  };

  return (
    <div className="game-map" onClick={handleClick}>
      {/* 显示入口与出口图片 */}
      <img src={entranceImg} alt="入口" className="entrance" />
      <img src={exitImg} alt="出口" className="exit" />
      
      {state.towers.map(tower => (
        <Tower key={`${tower.id}-${(tower.createdAt ?? Date.now()).toString().slice(-4)}`} tower={tower} />
      ))}
      {state.enemies.map(enemy => (
        <Enemy key={`${enemy.id}-${(enemy.createdAt ?? Date.now()).toString().slice(-4)}`} enemy={enemy} />
      ))}
      {state.bullets.map(bullet => (
        <Bullet key={`${bullet.id}-${(bullet.id ?? Date.now()).toString().slice(-4)}`} bullet={bullet} />
      ))}
    </div>
  );
};

export default GameMap;
