// src/hooks/useGameEngine.ts
import { useReducer, useEffect, useRef } from "react";
import { gameReducer, initialGameState } from "../reducers/gameReducer";
// import { Enemy, Tower, Bullet, Position } from "../models/types";
import { Position } from "../models/types";
import { distance, interpolatePosition } from "../utils/pathFinding";

export function useGameEngine() {
    const [state, dispatch] = useReducer(gameReducer, initialGameState);
    const requestRef = useRef<number>(0);

    const gameLoop = (_: number) => {
        // 如果游戏处于暂停状态，则不执行更新逻辑
        if (state.paused) {
            requestRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        const dt = 0.016; // 假设 60fps，dt=0.016秒

        // 1. 更新敌人位置
        state.enemies.forEach((enemy) => {
            const progressIncrement = enemy.speed * dt;
            const newProgress = enemy.progress + progressIncrement;
            if (enemy.path.length === 0) return;
            if (newProgress >= enemy.path.length - 1) {
                // 敌人到达出口，扣除生命值，移除敌人
                dispatch({ type: "REMOVE_ENEMY", payload: enemy.id });
                dispatch({
                    type: "UPDATE_GAME",
                    payload: { lives: state.lives - enemy.damage },
                });
            } else {
                const updatedEnemy = { ...enemy, progress: newProgress };
                updatedEnemy.position = interpolatePosition(enemy.path, newProgress);
                dispatch({ type: "UPDATE_ENEMY", payload: updatedEnemy });
            }
        });

        // 2. 更新子弹位置，并检测命中目标
        state.bullets.forEach((bullet) => {
            const target = state.enemies.find((e) => e.id === bullet.targetId);
            if (!target) {
                dispatch({ type: "REMOVE_BULLET", payload: bullet.id });
                return;
            }
            const dx = target.position.x - bullet.position.x;
            const dy = target.position.y - bullet.position.y;
            const dist = distance(bullet.position, target.position);
            const moveDist = bullet.speed * dt;
            if (dist <= moveDist + 0.1) {
                // 命中目标，更新敌人生命值
                const newHealth = target.health - bullet.damage;
                if (newHealth <= 0) {
                    dispatch({ type: "REMOVE_ENEMY", payload: target.id });
                    // 增加金币奖励
                    dispatch({
                        type: "UPDATE_GAME",
                        payload: { gold: state.gold + target.reward },
                    });
                } else {
                    const updatedEnemy = { ...target, health: newHealth };
                    dispatch({ type: "UPDATE_ENEMY", payload: updatedEnemy });
                }
                // 移除子弹
                dispatch({ type: "REMOVE_BULLET", payload: bullet.id });
            } else {
                const ratio = moveDist / dist;
                const newPos: Position = {
                    x: bullet.position.x + dx * ratio,
                    y: bullet.position.y + dy * ratio,
                };
                // 简化处理：直接修改 bullet 对象（实际项目建议使用不可变更新方式）
                bullet.position = newPos;
            }
        });

        // 3. 塔攻击逻辑：每个塔检查冷却是否结束，若找到射程内敌人则生成子弹
        const now = performance.now();
        state.towers.forEach((tower) => {
            if (!tower.lastShotTime || now - tower.lastShotTime >= tower.attackInterval * 1000) {
                // 寻找第一个在射程内的敌人
                const target = state.enemies.find(
                    (enemy) => distance(tower.position, enemy.position) <= tower.range
                );
                if (target) {
                    // 计算随机伤害
                    let damage =
                        tower.damageMin +
                        Math.floor(Math.random() * (tower.damageMax - tower.damageMin + 1));
                    let isCrit = Math.random() < tower.critChance;
                    if (isCrit) {
                        damage = Math.floor(damage * tower.critMultiplier);
                    }
                    // 根据塔的 projectileType 设置子弹速度和图片（此处简化）
                    const bulletSpeed = 3;
                    const bullet = {
                        id: Date.now().toString() + Math.random().toString(),
                        position: { ...tower.position },
                        targetId: target.id,
                        damage,
                        speed: bulletSpeed,
                        sourceTowerId: tower.id,
                        crit: isCrit,
                        element: tower.element,
                        effect: tower.specialEffect,
                        imgPath:
                            tower.projectileType === "arrow"
                                ? "/assets/bullets/arrow.png"
                                : "/assets/bullets/cannonball.png",
                    };
                    dispatch({ type: "ADD_BULLET", payload: bullet });
                    // 更新塔的最后射击时间
                    tower.lastShotTime = now;
                }
            }
        });

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(gameLoop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [state.paused, state.enemies, state.towers, state.bullets, state.lives]);

    return { state, dispatch };
}
