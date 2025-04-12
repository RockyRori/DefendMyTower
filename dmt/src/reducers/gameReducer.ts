// src/reducers/gameReducer.ts
import { GameState, Tower, Enemy, Bullet } from '../models/types';

export type GameAction = 
  | { type: 'ADD_TOWER'; payload: Tower }
  | { type: 'SPAWN_ENEMY'; payload: Enemy }
  | { type: 'ADD_BULLET'; payload: Bullet }
  | { type: 'REMOVE_ENEMY'; payload: string } // enemy id
  | { type: 'REMOVE_BULLET'; payload: string } // bullet id
  | { type: 'UPDATE_ENEMY'; payload: Enemy }
  | { type: 'UPDATE_GAME'; payload: Partial<GameState> }; // 更新 lives、score 等

export const initialGameState: GameState = {
  towers: [],
  enemies: [],
  bullets: [],
  lives: 10,
  score: 0,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_TOWER':
      return { ...state, towers: [...state.towers, action.payload] };
    case 'SPAWN_ENEMY':
      return { ...state, enemies: [...state.enemies, action.payload] };
    case 'ADD_BULLET':
      return { ...state, bullets: [...state.bullets, action.payload] };
    case 'REMOVE_ENEMY':
      return { ...state, enemies: state.enemies.filter(enemy => enemy.id !== action.payload) };
    case 'REMOVE_BULLET':
      return { ...state, bullets: state.bullets.filter(bullet => bullet.id !== action.payload) };
    case 'UPDATE_ENEMY':
      return {
        ...state,
        enemies: state.enemies.map(enemy =>
          enemy.id === action.payload.id ? action.payload : enemy
        ),
      };
    case 'UPDATE_GAME':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
