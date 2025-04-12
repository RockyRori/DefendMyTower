// src/components/Bullet.tsx
import React from 'react';
import './Bullet.css';
import { Bullet as BulletType } from '../models/types';

interface BulletProps {
  bullet: BulletType;
}

const Bullet: React.FC<BulletProps> = ({ bullet }) => {
  const dynamicStyle = {
    left: `${bullet.position.x * 50 + 20}px`,
    top: `${bullet.position.y * 50 + 20}px`
  };

  return <div className="bullet" style={dynamicStyle}></div>;
};

export default Bullet;
