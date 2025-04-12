// src/utils/pathFinding.ts
import { Position, Tower } from '../models/types';

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 10;

export function findPath(towers: Tower[], start: Position, end: Position): Position[] | null {
  // 建立二维数组，0 表示可通行，1 表示障碍
  const grid: number[][] = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));
  towers.forEach(tower => {
    if (
      tower.position.x >= 0 && tower.position.x < GRID_WIDTH &&
      tower.position.y >= 0 && tower.position.y < GRID_HEIGHT
    ) {
      grid[tower.position.y][tower.position.x] = 1;
    }
  });

  // BFS 算法寻路
  const queue: Position[] = [];
  const visited: boolean[][] = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(false));
  const parent: (Position | null)[][] = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));

  queue.push(start);
  visited[start.y][start.x] = true;

  const directions = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x === end.x && current.y === end.y) {
      // 重构路径
      const path: Position[] = [];
      let cur: Position | null = current;
      while (cur) {
        path.unshift(cur);
        cur = parent[cur.y][cur.x];
      }
      return path;
    }

    for (const { dx, dy } of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (
        nx >= 0 && nx < GRID_WIDTH &&
        ny >= 0 && ny < GRID_HEIGHT &&
        !visited[ny][nx] &&
        grid[ny][nx] === 0
      ) {
        visited[ny][nx] = true;
        parent[ny][nx] = current;
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return null;
}
