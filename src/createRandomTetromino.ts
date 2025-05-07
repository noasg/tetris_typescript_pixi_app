// main file (e.g., game.ts or index.ts)
import * as PIXI from "pixi.js";
import { setupTetrominoControls } from "./tetrominoController";
import { tetrominoTypes } from "./tetrominoData"; // Import the tetromino types data
import { rotatePosition } from "./utils";
import {
  getBooleanGrid,
  checkTopRow,
  placeTetrominoOnGrid,
  clearCompletedLines,
} from "./gameUtils"; // Import the helper functions
import { ROWS, COLS, BLOCK_SIZE } from "./const";
import { fallSpeed } from "./gameState";

// Type definitions
type Position = [number, number];
type Cell = { filled: boolean; color?: number };
const grid: Cell[][] = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => ({ filled: false }))
);

let canGenerate = true; // Flag to control tetromino generation

export function createRandomTetromino(
  texture: PIXI.Texture,
  container: PIXI.Container,
  app: PIXI.Application,
  gameLevelText?: PIXI.Text,
  boosterText?: PIXI.Text
) {
  if (!canGenerate) return;
  canGenerate = false;

  const keys = Object.keys(tetrominoTypes);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const { positions, color } = tetrominoTypes[randomKey];

  const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
  const rotatedPositions = positions.map((pos) =>
    rotatePosition(pos, rotation)
  );
  const minX = Math.min(...rotatedPositions.map(([x]) => x));
  const minY = Math.min(...rotatedPositions.map(([_, y]) => y));
  const normalized: Position[] = rotatedPositions.map(
    ([x, y]) => [x - minX, y - minY] as Position
  );

  const tetromino = new PIXI.Container();
  normalized.forEach(([x, y]) => {
    const square = new PIXI.Sprite(texture);
    square.width = BLOCK_SIZE;
    square.height = BLOCK_SIZE;
    square.x = x * BLOCK_SIZE;
    square.y = y * BLOCK_SIZE;
    square.tint = color;
    tetromino.addChild(square);
  });

  const shapeWidth = Math.max(...normalized.map(([x]) => x)) + 1;
  tetromino.x = (COLS * BLOCK_SIZE - shapeWidth * BLOCK_SIZE) / 2;
  tetromino.x = Math.round(tetromino.x / BLOCK_SIZE) * BLOCK_SIZE;
  tetromino.y = -BLOCK_SIZE;

  container.addChild(tetromino);

  // Setup tetromino controls
  const controller = setupTetrominoControls(
    tetromino,
    normalized,
    positions,
    () => getBooleanGrid(grid),
    () => {}
  );

  // Check if the top row is filled
  if (checkTopRow(grid)) {
    console.log("Game Over: Top row is filled.");
    return;
  }

  // Smooth falling logic
  let lastTime = performance.now();
  let accumulated = 0;

  // window.addEventListener("keydown", (e) => {
  //   if (e.code === "ArrowDown") {
  //     fallSpeed = FALL_SPEED * FALL_SPEED_FAST_MULTIPLIER;
  //   }
  // });

  // window.addEventListener("keyup", (e) => {
  //   if (e.code === "ArrowDown") {
  //     fallSpeed = FALL_SPEED;
  //   }
  // });

  function animate(time: number) {
    const delta = time - lastTime;
    lastTime = time;
    accumulated += (delta / 1000) * fallSpeed;

    if (accumulated >= BLOCK_SIZE) {
      const moved = controller.forceMoveDown();
      accumulated = 0;

      if (!moved) {
        placeTetrominoOnGrid(tetromino, normalized, grid, app, boosterText);
        clearCompletedLines(
          grid,
          container,
          texture,
          app,
          gameLevelText,
          boosterText
        );

        controller.cleanup();
        canGenerate = true;

        console.log("generate a new piece", canGenerate);
        if (canGenerate) {
          createRandomTetromino(
            texture,
            container,
            app,
            gameLevelText,
            boosterText
          );
        }
        return;
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  return randomKey;
}
