// src/reducers/gameReducer.ts
import { GameState, Tower, Enemy, Bullet } from "../models/types";

export type GameAction =
  | { type: "ADD_TOWER"; payload: Tower }
  | { type: "REMOVE_TOWER"; payload: string }  // 根据塔的 id 删除塔
  | { type: "SPAWN_ENEMY"; payload: Enemy }
  | { type: "ADD_BULLET"; payload: Bullet }
  | { type: "REMOVE_ENEMY"; payload: string }
  | { type: "REMOVE_BULLET"; payload: string }
  | { type: "UPDATE_ENEMY"; payload: Enemy }
  | { type: "UPDATE_GAME"; payload: Partial<GameState> }
  | { type: "INITIALIZE_LEVEL"; payload: GameState } // 关卡初始化
  | { type: "SET_PAUSED"; payload: boolean };

export const initialGameState: GameState = {
  towers: [],
  enemies: [],
  bullets: [],
  lives: 10,
  score: 0,
  gold: 0,
  currentWave: 0,
  totalWaves: 0,
  paused: false,
  currentLevelId: "",
};

export function gameReducer(
  state: GameState,
  action: GameAction
): GameState {
  switch (action.type) {
    case "ADD_TOWER":
      return { ...state, towers: [...state.towers, action.payload] };
    case "REMOVE_TOWER":
      return {
        ...state,
        towers: state.towers.filter((t) => t.id !== action.payload),
      };
    case "SPAWN_ENEMY":
      return { ...state, enemies: [...state.enemies, action.payload] };
    case "ADD_BULLET":
      return { ...state, bullets: [...state.bullets, action.payload] };
    case "REMOVE_ENEMY":
      return {
        ...state,
        enemies: state.enemies.filter((e) => e.id !== action.payload),
      };
    case "REMOVE_BULLET":
      return {
        ...state,
        bullets: state.bullets.filter((b) => b.id !== action.payload),
      };
    case "UPDATE_ENEMY":
      return {
        ...state,
        enemies: state.enemies.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case "UPDATE_GAME":
      return { ...state, ...action.payload };
    case "INITIALIZE_LEVEL":
      return { ...action.payload };
    case "SET_PAUSED":
      return { ...state, paused: action.payload };
    default:
      return state;
  }
}
