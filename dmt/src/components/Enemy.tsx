// src/components/Enemy.tsx
import React from 'react';
import './Enemy.css';
import { Enemy as EnemyType } from '../models/types';

interface EnemyProps {
  enemy: EnemyType;
}

const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  const dynamicStyle = {
    left: `${enemy.position.x * 50}px`,
    top: `${enemy.position.y * 50}px`
  };

  return (
    <div className="enemy" style={dynamicStyle}>
      {enemy.health}
    </div>
  );
};

export default Enemy;
