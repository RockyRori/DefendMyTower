// src/components/Tower.tsx
import React from 'react';
import './Tower.css';
import { Tower as TowerType } from '../models/types';

interface TowerProps {
  tower: TowerType;
}

const Tower: React.FC<TowerProps> = ({ tower }) => {
  const dynamicStyle = {
    left: `${tower.position.x * 50}px`,
    top: `${tower.position.y * 50}px`
  };

  return (
    <div className="tower" style={dynamicStyle}>
      T{tower.level}
    </div>
  );
};

export default Tower;
