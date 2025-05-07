import {
  ROWS,
  COLS,
  BLOCK_SIZE,
  LINES_PER_LEVEL,
  FALL_SPEED_INCREMENT_PER_LEVEL,
  BOOSTER_MAX_VALUE,
  BOOSTER_INITIAL_VALUE,
} from "./const";
import { printGrid } from "./utils"; // Import printGrid
import * as PIXI from "pixi.js";
import { createOrUpdateTextLabel } from "./utils"; // Import the new helper function for text updates
import { fallSpeed, setFallSpeed } from "./gameState";

// Type Definitions
export type Position = [number, number];
export type Cell = { filled: boolean; color?: number };

let gameLevel = 1; // Example: Level counter
let booster = BOOSTER_INITIAL_VALUE; // Example: Booster counter
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
  grid: Cell[][],
  app: PIXI.Application,
  boosterText?: PIXI.Text
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

      if (booster > 0) {
        sprite.interactive = true;
        sprite.buttonMode = true;

        sprite.on("pointerdown", () => {
          console.log("Booster activated on new piece!");
          const colorToDestroy = sprite.tint;
          floodFill(grid, gridX, gridY, colorToDestroy);

          // Remove the block and clear the grid
          grid[gridY][gridX] = { filled: false, color: undefined };
          sprite.parent?.removeChild(sprite);
          spriteGrid[gridY][gridX] = undefined;

          booster--;
          if (booster <= 0) {
            booster = 0;
            disableAllBlockInteractions(); // Disable all interactions when booster runs out
          }

          createOrUpdateTextLabel(
            `Booster: ${booster}`,
            18,
            0x000000,
            app.screen.width - 100,
            5,
            app,
            boosterText
          );

          floodFill(grid, gridX, gridY, colorToDestroy); // Perform flood fill
        });
      }
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
  texture: PIXI.Texture,
  app: PIXI.Application, // Needed for text update
  boosterText?: PIXI.Text
) {
  container.removeChildren();
  console.log("Redrawing board with booster:", booster);
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
        spriteGrid[y][x] = block; // Restore sprite grid

        if (booster > 0) {
          block.interactive = true;
          block.buttonMode = true;
          block.on("pointerdown", () => {
            console.log("Booster activated!");
            const colorToDestroy = block.tint;
            floodFill(grid, x, y, colorToDestroy);

            grid[y][x] = { filled: false, color: undefined };
            block.parent?.removeChild(block);
            spriteGrid[y][x] = undefined;

            booster--;
            if (booster <= 0) {
              booster = 0;
              for (let yy = 0; yy < ROWS; yy++) {
                for (let xx = 0; xx < COLS; xx++) {
                  const b = spriteGrid[yy][xx];
                  if (b) {
                    b.interactive = false;
                    b.buttonMode = false;
                    b.removeAllListeners("pointerdown");
                  }
                }
              }
            }

            createOrUpdateTextLabel(
              `Booster: ${booster}`,
              18,
              0x000000,
              app.screen.width - 100,
              5,
              app,
              boosterText
            );

            floodFill(grid, x, y, colorToDestroy);
          });
        }
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
    redrawBoard(container, grid, texture, app, boosterText);

    // Update the game level and booster texts
    const newLevel = Math.floor(totalLinesCleared / LINES_PER_LEVEL);

    console.log("New level:", newLevel);
    console.log("Game level:", gameLevel);
    console.log(
      "Total lines cleared:",
      totalLinesCleared,
      LINES_PER_LEVEL,
      newLevel,
      gameLevel
    );
    // gameLevel += 1; // Increase level after clearing lines (adjust this logic as needed)
    // booster += 1; // You can modify this as needed based on game mechanics
    if (newLevel >= gameLevel) {
      gameLevel = newLevel;
      booster = booster + newLevel;
      if (booster > 10) {
        booster = BOOSTER_MAX_VALUE; // Cap the booster value at 10
      }
      console.log("BOOSER", booster);
      setFallSpeed(fallSpeed * FALL_SPEED_INCREMENT_PER_LEVEL); // Slower speed = faster fall
    }
    redrawBoard(container, grid, texture, app, boosterText);
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

//Function to disable interaction for all blocks
export function disableAllBlockInteractions() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const block = spriteGrid[y][x];
      if (block) {
        block.interactive = false;
        block.buttonMode = false;
        block.removeAllListeners("pointerdown");
      }
    }
  }
}
