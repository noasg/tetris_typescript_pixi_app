// gameUtils.ts (This file will contain the refactored helper functions)
import { ROWS, COLS, BLOCK_SIZE } from "./const";
import { printGrid } from "./utils"; // Import printGrid
import * as PIXI from "pixi.js";
// Type Definitions
export type Position = [number, number];

export type Cell = { filled: boolean; color?: number };

// Helper function to convert Cell[][] to boolean[][]
export function getBooleanGrid(grid: Cell[][]): boolean[][] {
  return grid.map((row) => row.map((cell) => cell.filled));
}

// Function to check if the top row is filled
export function checkTopRow(grid: Cell[][]): boolean {
  return grid[0].some((cell) => cell.filled);
}

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
      grid[gridY][gridX] = {
        filled: true,
        color: (tetromino.getChildAt(index) as PIXI.Sprite).tint,
      };
    }
  });
  printGrid(
    grid.map((row) => row.map((cell) => cell.filled)),
    ROWS,
    COLS
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
  texture: PIXI.Texture
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
    redrawBoard(container, grid, texture);
  }
}
