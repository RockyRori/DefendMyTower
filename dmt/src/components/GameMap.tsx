// src/components/GameMap.tsx
import React from 'react';
import './GameMap.css';
import { GameState } from '../models/types';
import Tower from './Tower';
import Enemy from './Enemy';
import Bullet from './Bullet';

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
      {state.towers.map(tower => (
        <Tower key={tower.id} tower={tower} />
      ))}
      {state.enemies.map(enemy => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
      {state.bullets.map(bullet => (
        <Bullet key={bullet.id} bullet={bullet} />
      ))}
    </div>
  );
};

export default GameMap;
