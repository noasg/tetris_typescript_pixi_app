import * as PIXI from "pixi.js";
import { rotatePosition } from "./utils";

const BLOCK_SIZE = 40;
const COLS = 10;
const ROWS = 20;

type Position = [number, number];

export function setupTetrominoControls(
  tetromino: PIXI.Container,
  normalized: Position[],
  positions: Position[],
  grid: boolean[][],
  updatePlacementCallback: () => void
) {
  let gridX = Math.floor(tetromino.x / BLOCK_SIZE);
  let gridY = Math.floor(tetromino.y / BLOCK_SIZE);

  function applyPosition() {
    tetromino.x = gridX * BLOCK_SIZE;
    tetromino.y = gridY * BLOCK_SIZE;
  }

  function canMove(newX: number, newY: number, shape = normalized): boolean {
    return shape.every(([x, y]) => {
      const gx = newX + x;
      const gy = newY + y;
      return (
        gx >= 0 && gx < COLS && gy < ROWS && (gy < 0 || !grid[gy][gx]) // Allow above top
      );
    });
  }

  function move(dx: number, dy: number): boolean {
    const newX = gridX + dx;
    const newY = gridY + dy;
    if (canMove(newX, newY)) {
      gridX = newX;
      gridY = newY;
      applyPosition();
      updatePlacementCallback();
      return true;
    }
    return false;
  }

  function rotate(direction: "left" | "right") {
    const angle = direction === "left" ? -90 : 90;
    const rotated = positions.map((pos) => rotatePosition(pos, angle));
    const minX = Math.min(...rotated.map(([x]) => x));
    const minY = Math.min(...rotated.map(([_, y]) => y));
    const testShape = rotated.map(([x, y]) => [x - minX, y - minY] as Position);

    if (canMove(gridX, gridY, testShape)) {
      normalized.length = 0;
      normalized.push(...testShape);

      positions.length = 0;
      positions.push(...rotated);

      tetromino.children.forEach((child, i) => {
        const [x, y] = testShape[i];
        child.x = x * BLOCK_SIZE;
        child.y = y * BLOCK_SIZE;
      });

      updatePlacementCallback();
    }
  }

  // Keyboard input
  const handler = (e: KeyboardEvent) => {
    switch (e.code) {
      case "ArrowLeft":
        move(-1, 0);
        break;
      case "ArrowRight":
        move(1, 0);
        break;
      case "ArrowDown":
        move(0, 1);
        break;
      case "KeyZ":
        rotate("left");
        break;
      case "KeyX":
        rotate("right");
        break;
    }
  };

  window.addEventListener("keydown", handler);

  return {
    cleanup: () => window.removeEventListener("keydown", handler),
    getGridPosition: () => ({ gridX, gridY }),
    forceMoveDown: () => move(0, 1),
  };
}
