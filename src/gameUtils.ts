import {
  ROWS,
  COLS,
  BLOCK_SIZE,
  LINES_PER_LEVEL,
  FALL_SPEED_INCREMENT_PER_LEVEL,
} from "./const";
import { printGrid } from "./utils"; // Import printGrid
import * as PIXI from "pixi.js";
import { createOrUpdateTextLabel } from "./utils"; // Import the new helper function for text updates
import { fallSpeed, setFallSpeed } from "./gameState";

// Type Definitions
export type Position = [number, number];
export type Cell = { filled: boolean; color?: number };

let gameLevel = 1; // Example: Level counter
let booster = 0; // Example: Booster counter
let totalLinesCleared = 0;

// gameUtils.ts or grid.ts
export const grid: { filled: boolean; color?: number }[][] = Array.from(
  { length: ROWS },
  () => Array.from({ length: COLS }, () => ({ filled: false }))
);

// Helper function to convert Cell[][] to boolean[][]
export function getBooleanGrid(grid: Cell[][]): boolean[][] {
  return grid.map((row) => row.map((cell) => cell.filled));
}

// Function to check if the top row is filled
export function checkTopRow(grid: Cell[][]): boolean {
  return grid[0].some((cell) => cell.filled);
}

export const spriteGrid: (PIXI.Sprite | undefined)[][] = Array.from(
  { length: ROWS },
  () => Array.from({ length: COLS }, () => undefined)
);
// Function to place the tetromino on the grid
export function placeTetrominoOnGrid(
  tetromino: PIXI.Container,
  normalized: Position[],
  grid: Cell[][]
) {
  normalized.forEach(([x, y], index) => {
    const gridX = Math.floor((tetromino.x + x * BLOCK_SIZE) / BLOCK_SIZE);
    const gridY = Math.floor((tetromino.y + y * BLOCK_SIZE) / BLOCK_SIZE);
    if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
      const sprite = tetromino.getChildAt(index) as PIXI.Sprite;

      grid[gridY][gridX] = {
        filled: true,
        color: sprite.tint,
      };
      spriteGrid[gridY][gridX] = sprite;

      sprite.interactive = true;
      sprite.buttonMode = true;
      sprite.on("pointerdown", () => {
        const clickedColor = grid[gridY][gridX].color;
        console.log(`Clicked cell (${gridX}, ${gridY})`);
        console.log(`Clicked color: ${clickedColor?.toString(16)}`);
        // sprite.tint = 0xffffff;
        const color = sprite.tint;
        grid[gridY][gridX] = { filled: false, color: color };
        const colorToDestroy = sprite.tint;

        console.log(
          `Starting flood fill for color: ${colorToDestroy.toString(16)}`
        );
        floodFill(grid, gridX, gridY, colorToDestroy);
        printGrid(
          grid.map((row) => row.map((cell) => cell.filled)),
          ROWS
        );
        // Remove the sprite from the container
        tetromino.removeChild(sprite);
      });
    }
  });
  printGrid(
    grid.map((row) => row.map((cell) => cell.filled)),
    ROWS
  );
}

// Flood fill algorithm to destroy adjacent squares with the same color
function floodFill(grid: Cell[][], x: number, y: number, targetColor: number) {
  const stack: Position[] = [[x, y]]; // Stack to keep track of cells to visit
  const directions: Position[] = [
    [0, 1], // Down
    [1, 0], // Right
    [0, -1], // Up
    [-1, 0], // Left
  ];

  while (stack.length > 0) {
    const [curX, curY] = stack.pop()!;

    console.log(`Processing cell at (${curX}, ${curY})`);

    // Skip if the cell is out of bounds or not matching the target color
    if (curX < 0 || curX >= COLS || curY < 0 || curY >= ROWS) continue;

    const cell = grid[curY][curX];
    const sprite = spriteGrid[curY][curX];

    if (grid[curY][curX].color !== targetColor) {
      console.log(
        `Skipping cell at (${curX}, ${curY}): Not matching the target color`
      );
      continue;
    }

    // Destroy the current cell (mark it as empty)
    console.log(
      `Destroying cell at (${curX}, ${curY}) with color ${grid[curY][
        curX
      ].color.toString(16)}`
    );

    // Remove the sprite visually
    if (sprite) {
      sprite.parent?.removeChild(sprite); // Remove from container
      spriteGrid[curY][curX] = undefined; // Clear reference
    }
    grid[curY][curX] = { filled: false, color: undefined };

    // Iterate over the 4 possible directions (right, down, left, up)
    for (const [dx, dy] of directions) {
      const newX = curX + dx;
      const newY = curY + dy;

      // Add the adjacent cell to the stack if it's within bounds and filled with the target color
      if (
        newX >= 0 &&
        newX < COLS &&
        newY >= 0 &&
        newY < ROWS &&
        grid[newY][newX].filled && // The cell should be filled
        grid[newY][newX].color === targetColor // The color must match the target
      ) {
        console.log(`Adding adjacent cell (${newX}, ${newY}) to stack`);
        stack.push([newX, newY]);
      }
    }
  }

  // Print grid status for debugging after the flood fill
  printGrid(
    grid.map((row) => row.map((cell) => cell.filled)),
    ROWS
  );
}

// Function to redraw the board after clearing lines
export function redrawBoard(
  container: PIXI.Container,
  grid: Cell[][],
  texture: PIXI.Texture
) {
  container.removeChildren();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = grid[y][x];
      if (cell.filled) {
        const block = new PIXI.Sprite(texture);
        block.width = BLOCK_SIZE;
        block.height = BLOCK_SIZE;
        block.x = x * BLOCK_SIZE;
        block.y = y * BLOCK_SIZE;
        block.tint = cell.color!;
        container.addChild(block);
      }
    }
  }
}

// Function to clear completed lines
export function clearCompletedLines(
  grid: Cell[][],
  container: PIXI.Container,
  texture: PIXI.Texture,
  app: PIXI.Application, // Ensure app is passed here
  gameLevelText: PIXI.Text | undefined, // Optional parameter for game level text
  boosterText: PIXI.Text | undefined // Optional parameter for booster text
) {
  let linesCleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every((cell) => cell.filled)) {
      grid.splice(y, 1);
      grid.unshift(Array.from({ length: COLS }, () => ({ filled: false })));
      linesCleared++;
      y++; // Check the same row again
    }
  }

  if (linesCleared > 0) {
    // Redraw the board
    totalLinesCleared += linesCleared;
    console.log("Total lines cleared:", totalLinesCleared);
    redrawBoard(container, grid, texture);

    // Update the game level and booster texts
    const newLevel = Math.floor(totalLinesCleared / LINES_PER_LEVEL) + 1;
    console.log(
      "Total lines cleared:",
      totalLinesCleared,
      LINES_PER_LEVEL,
      newLevel,
      gameLevel
    );
    // gameLevel += 1; // Increase level after clearing lines (adjust this logic as needed)
    // booster += 1; // You can modify this as needed based on game mechanics
    if (newLevel > gameLevel) {
      gameLevel = newLevel;
      booster = newLevel - 1;
      setFallSpeed(fallSpeed * FALL_SPEED_INCREMENT_PER_LEVEL); // Slower speed = faster fall
    }

    // Update text labels
    createOrUpdateTextLabel(
      `Game Level: ${gameLevel}`,
      18,
      0x000000,
      5,
      5,
      app, // Pass app to the text update function
      gameLevelText
    );
    createOrUpdateTextLabel(
      `Booster: ${booster}`,
      18,
      0x000000,
      app.screen.width - 100,
      5,
      app, // Pass app to the text update function
      boosterText
    );
  }
}
