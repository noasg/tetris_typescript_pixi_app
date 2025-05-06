import * as PIXI from "pixi.js";
import { setupTetrominoControls } from "./tetrominoController";
import { tetrominoTypes } from "./tetrominoData"; // Import the tetromino types data
import { rotatePosition } from "./utils";

const BLOCK_SIZE = 40;
const COLS = 10; // Number of columns for the grid
const ROWS = 20; // Number of rows for the grid

// Type definitions
type Position = [number, number];

const grid: boolean[][] = Array.from({ length: ROWS }, () =>
  Array(COLS).fill(false)
);

let canGenerate = true; // Flag to control tetromino generation

export function createRandomTetromino(
  texture: PIXI.Texture,
  container: PIXI.Container
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

  // Set the initial Y position to just above the canvas
  tetromino.y = -BLOCK_SIZE;

  container.addChild(tetromino);

  const controller = setupTetrominoControls(
    tetromino,
    normalized,
    positions,
    grid,
    () => {}
  );

  function checkTopRow() {
    return grid[0].some((cell) => cell);
  }

  if (checkTopRow()) {
    console.log("Game Over: Top row is filled.");
    return;
  }

  function placeTetrominoOnGrid(
    tetromino: PIXI.Container,
    normalized: Position[]
  ) {
    normalized.forEach(([x, y]) => {
      const gridX = Math.floor((tetromino.x + x * BLOCK_SIZE) / BLOCK_SIZE);
      const gridY = Math.floor((tetromino.y + y * BLOCK_SIZE) / BLOCK_SIZE);
      if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
        grid[gridY][gridX] = true;
      }
    });
  }

  // 🎯 Smooth falling
  let lastTime = performance.now();
  let accumulated = 0;
  const fallSpeed = 30; // pixels per second

  function animate(time: number) {
    const delta = time - lastTime;
    lastTime = time;
    accumulated += (delta / 1000) * fallSpeed;

    if (accumulated >= BLOCK_SIZE) {
      const moved = controller.forceMoveDown();
      accumulated = 0;

      if (!moved) {
        placeTetrominoOnGrid(tetromino, normalized);
        controller.cleanup();
        canGenerate = true;

        console.log("generate a new piece", canGenerate);
        if (canGenerate) {
          createRandomTetromino(texture, container);
        }
        return;
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
  return randomKey;
}
