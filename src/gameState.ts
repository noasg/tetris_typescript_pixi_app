// gameState.ts
import { FALL_SPEED } from "./const";

export let fallSpeed = FALL_SPEED;

export function setFallSpeed(newSpeed: number) {
  fallSpeed = newSpeed;
}
