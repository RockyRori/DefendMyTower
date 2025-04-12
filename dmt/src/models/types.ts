// src/models/types.ts
export interface Position {
  x: number;
  y: number;
}

export interface Tower {
  id: string;
  position: Position;
  range: number;    // 攻击范围，单位：格子数
  damage: number;   // 每次攻击的伤害
  level: number;
}

export interface Enemy {
  id: string;
  position: Position;
  health: number;
  speed: number;    // 每秒或每帧移动的步长
  path: Position[]; // 行进路径，为网格节点序列
  progress: number; // 当前在路径中的进度（浮点数，用于插值动画）
}

export interface Bullet {
  id: string;
  position: Position;
  targetId: string;
  damage: number;
  speed: number;
}

export interface GameState {
  towers: Tower[];
  enemies: Enemy[];
  bullets: Bullet[];
  lives: number;
  score: number;
}
