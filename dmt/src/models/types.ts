// src/models/types.ts

export interface Position {
  x: number;
  y: number;
}

export type ElementType = 'metal' | 'wood' | 'water' | 'fire' | 'earth';

/** 塔的静态配置，来源于 JSON 配置文件 */
export interface TowerTemplate {
  id: string;
  type: string;
  maxLevel: number;
  stage: number;
  evolutionCost: number;
  buyCost: number;
  range: number;
  damageMin: number;
  damageMax: number;
  attackInterval: number;
  critChance: number;
  critMultiplier: number;
  element: ElementType;
  canAttackAir: boolean;
  aoeRadius: number;
  specialEffect?: string;
  projectileType: string;
  nextTowerIds: string[];
  imgPath: string;
}

export interface Tower extends TowerTemplate {
  position: Position;
  level: number;
  levelUpCost: number;
  lastShotTime?: number;
  createdAt: number;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  speed: number;
  element: ElementType;
  isFlying: boolean;
  reward: number;
  damage: number;
  imgPath: string;
}

export interface Enemy extends EnemyTemplate {
  position: Position;
  path: Position[];
  progress: number;
  status: {
    slowed?: number;
    poisoned?: number;
    burned?: number;
  };
  createdAt: number;
}

export interface Bullet {
  id: string;
  position: Position;
  targetId: string;
  damage: number;
  speed: number;
  sourceTowerId: string;
  crit: boolean;
  element: ElementType;
  effect?: string;
  imgPath: string;
}


/** 游戏整体状态 */
export interface GameState {
  towers: Tower[];
  enemies: Enemy[];
  bullets: Bullet[];
  lives: number;
  score: number;
  gold: number;
  currentWave: number;
  totalWaves: number;
  paused: boolean;
  currentLevelId: string;
}
