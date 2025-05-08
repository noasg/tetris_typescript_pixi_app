import {
  ROWS,
  COLS,
  BLOCK_SIZE,
  LINES_PER_LEVEL,
  FALL_SPEED_INCREMENT_PER_LEVEL,
  BOOSTER_MAX_VALUE,
  BOOSTER_INITIAL_VALUE,
} from "./const";
import { animateBlockDestruction, printGridWithSuspended } from "./utils"; // Import printGrid
import * as PIXI from "pixi.js";
import { createOrUpdateTextLabel } from "./utils"; // Import the new helper function for text updates
import { fallSpeed, setFallSpeed } from "./gameState";

// Type Definitions
export type Position = [number, number];
export type Cell = { filled: boolean; color?: number };

let gameLevel = 0; // Game level counter
let booster = BOOSTER_INITIAL_VALUE; // Booster power-up counter
let totalLinesCleared = 0; // Total number of lines cleared
// Grid initialization (2D array of cells, each cell starts as empty)
export const grid: { filled: boolean; color?: number }[][] = Array.from(
  { length: ROWS },
  () => Array.from({ length: COLS }, () => ({ filled: false }))
);

// Helper function to convert Cell[][] to boolean[][] (for internal grid logic)
export function getBooleanGrid(grid: Cell[][]): boolean[][] {
  return grid.map((row) => row.map((cell) => cell.filled));
}

// Function to check if the top row of the grid is filled (used for game over check)
export function checkTopRow(grid: Cell[][]): boolean {
  return grid[0].some((cell) => cell.filled);
}

// Sprite grid to keep track of visual representation of blocks
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
  console.log("placeTetrominoOnGrid");

  normalized.forEach(([x, y], index) => {
    const gridX = Math.floor((tetromino.x + x * BLOCK_SIZE) / BLOCK_SIZE); // Calculate grid position X
    const gridY = Math.floor((tetromino.y + y * BLOCK_SIZE) / BLOCK_SIZE); // Calculate grid position Y
    if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
      // Ensure the position is within bounds
      const sprite = tetromino.getChildAt(index) as PIXI.Sprite;
      sprite.anchor.set(0.5);
      sprite.x += sprite.width / 2;
      sprite.y += sprite.height / 2;
      grid[gridY][gridX] = {
        filled: true,
        color: sprite.tint,
      };
      spriteGrid[gridY][gridX] = sprite;

      if (booster > 0) {
        sprite.interactive = true;
        sprite.buttonMode = true;

        sprite.on("pointerdown", () => {
          const colorToDestroy = sprite.tint;
          console.log("colorToDestroy", colorToDestroy);
          // floodFill(grid, gridX, gridY, colorToDestroy); // Use flood fill to destroy adjacent blocks

          // animateBlockDestruction(sprite, () => {
          //   sprite.parent?.removeChild(sprite); // Remove the sprite from the stage
          //   spriteGrid[gridY][gridX] = undefined; // Remove the sprite from the stage
          //   grid[gridY][gridX] = { filled: false, color: undefined }; // Update grid
          // });

          booster--;
          if (booster <= 0) {
            booster = 0;
            disableAllBlockInteractions(); // Disable all interactions when booster runs out
          }
          // Update booster UI label
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
          // dropFloatingBlocks(grid, spriteGrid); // Drop any floating blocks after destruction

          // printGrid(
          //   grid.map((row) => row.map((cell) => cell.filled)),
          //   ROWS
          // );
        });
      }
    }
  });
  // printGrid(
  //   grid.map((row) => row.map((cell) => cell.filled)),
  //   ROWS
  // );
}

// Flood fill algorithm to destroy adjacent squares with the same color
function floodFill(grid: Cell[][], x: number, y: number, targetColor: number) {
  console.log("Flood fill initiated at:", x, y, targetColor);
  const stack: Position[] = [[x, y]]; // Stack to keep track of cells to visit
  console.log("Stack initialized:", stack);
  const visited = new Set<string>();
  const directions: Position[] = [
    [0, 1], // Down
    [1, 0], // Right
    [0, -1], // Up
    [-1, 0], // Left
  ];

  while (stack.length > 0) {
    const [curX, curY] = stack.pop()!;
    console.log("Processing cell at:", [curX, curY]);

    const key = `${curX},${curY}`;
    if (visited.has(key)) continue; // Skip if already visited
    visited.add(key);

    // Out of bounds check
    if (curX < 0 || curX >= COLS || curY < 0 || curY >= ROWS) continue;

    const sprite = spriteGrid[curY][curX];
    if (!sprite) {
      console.log(`No sprite found at ${curX}, ${curY}`);
      continue; // Skip if no sprite exists at the current cell
    }

    // Check the sprite's tint instead of grid color
    if (sprite.tint !== targetColor) {
      console.log(
        "Color mismatch (tint) — skipping:",
        sprite.tint,
        targetColor
      );
      continue; // Skip if the tint doesn't match the target color
    }

    // Destroy the block if it matches the target color
    console.log("Destroying block at:", curX, curY, targetColor);
    animateBlockDestruction(sprite, () => {
      sprite?.parent?.removeChild(sprite);
      spriteGrid[curY][curX] = undefined;
      grid[curY][curX] = { filled: false, color: undefined };
    });

    // Check adjacent cells (right, down, left, up)
    for (const [dx, dy] of directions) {
      const newX = curX + dx;
      const newY = curY + dy;
      const newKey = `${newX},${newY}`;
      // Add the adjacent cell to the stack if it's within bounds and filled with the target color (checked by sprite tint)
      if (
        newX >= 0 &&
        newX < COLS &&
        newY >= 0 &&
        newY < ROWS &&
        grid[newY][newX].filled && // The cell should be filled
        spriteGrid[newY][newX]?.tint === targetColor && // Check sprite's tint
        !visited.has(newKey) // The color (tint) must match the target
      ) {
        stack.push([newX, newY]);
      }
    }
  }
  // dropFloatingBlocks(); // Optional: drop the floating blocks if necessary
}

// Function to redraw the board after clearing lines
export function redrawBoard(
  container: PIXI.Container,
  grid: Cell[][],
  texture: PIXI.Texture,
  app: PIXI.Application, // Needed for text update
  boosterText?: PIXI.Text // Optional booster text element
) {
  container.removeChildren();
  console.log("Redrawing board with booster:", booster);

  // Iterate over the grid and add blocks to the container
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
            // floodFill(grid, x, y, colorToDestroy);

            // animateBlockDestruction(block, () => {
            //   block.parent?.removeChild(block);
            //   spriteGrid[y][x] = undefined;
            //   grid[y][x] = { filled: false, color: undefined };
            // });

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

            floodFill(grid, x, y, colorToDestroy);

            createOrUpdateTextLabel(
              `Booster: ${booster}`,
              18,
              0x000000,
              app.screen.width - 100,
              5,
              app,
              boosterText
            );
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
  // Check each row from bottom to top
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every((cell) => cell.filled)) {
      grid.splice(y, 1); // Remove the full row
      grid.unshift(Array.from({ length: COLS }, () => ({ filled: false })));
      linesCleared++;
      y++; // Check the same row again after the shift
    }
  }

  if (linesCleared > 0) {
    // Redraw the board and update line count
    totalLinesCleared += linesCleared;
    console.log("Total lines cleared:", totalLinesCleared);
    redrawBoard(container, grid, texture, app, boosterText);

    // Update the game level and booster texts
    const newLevel = Math.floor(totalLinesCleared / LINES_PER_LEVEL); // Calculate new level based on cleared lines

    console.log("New level:", newLevel);
    console.log("Game level:", gameLevel);
    console.log(
      "Total lines cleared:",
      totalLinesCleared,
      LINES_PER_LEVEL,
      newLevel,
      gameLevel
    );
    // If level has increased, update booster and fall speed
    if (newLevel >= gameLevel) {
      booster = booster + newLevel - gameLevel; // Increase booster based on level difference
      gameLevel = newLevel;
      if (booster > 10) {
        booster = BOOSTER_MAX_VALUE; // Cap the booster at max value
      }
      console.log("BOOSER", booster);
      setFallSpeed(fallSpeed * FALL_SPEED_INCREMENT_PER_LEVEL); // Adjust fall speed
    }
    redrawBoard(container, grid, texture, app, boosterText);

    // Update text labels for game level and booster
    createOrUpdateTextLabel(
      `Game Level: ${gameLevel}`,
      18,
      0x000000,
      5,
      5,
      app,
      gameLevelText
    );
    createOrUpdateTextLabel(
      `Booster: ${booster}`,
      18,
      0x000000,
      app.screen.width - 100,
      5,
      app,
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

export function getSuspendedBlocksWithDrop(
  grid: Cell[][]
): { cluster: [number, number][]; dropDistance: number }[] {
  const visited = new Set<string>();
  const suspendedClusters: {
    cluster: [number, number][];
    dropDistance: number;
  }[] = [];

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1], // up, down, left, right
  ];

  function bfs(startRow: number, startCol: number): [number, number][] {
    const cluster: [number, number][] = [];
    const queue: [number, number][] = [[startRow, startCol]];
    visited.add(`${startRow},${startCol}`);

    while (queue.length > 0) {
      const [row, col] = queue.shift()!;
      cluster.push([row, col]);

      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          grid[newRow][newCol].filled &&
          !visited.has(`${newRow},${newCol}`)
        ) {
          visited.add(`${newRow},${newCol}`);
          queue.push([newRow, newCol]);
        }
      }
    }

    return cluster;
  }

  function isTouchingBottom(cluster: [number, number][]): boolean {
    return cluster.some(([row]) => row === ROWS - 1);
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col].filled && !visited.has(`${row},${col}`)) {
        const cluster = bfs(row, col);

        if (!isTouchingBottom(cluster)) {
          // === Calculate maximum drop distance for entire cluster ===
          let drop = 0;
          while (true) {
            const canDrop = cluster.every(([r, c]) => {
              const newRow = r + drop + 1;
              return (
                newRow < ROWS &&
                (!grid[newRow][c].filled ||
                  cluster.some(([cr, cc]) => cr === newRow && cc === c))
              );
            });

            if (canDrop) {
              drop++;
            } else {
              break;
            }
          }

          console.log(
            `Suspended cluster starting at (${row}, ${col}) can fall by ${drop} cells`
          );

          suspendedClusters.push({
            cluster,
            dropDistance: drop,
          });
        }
      }
    }
  }

  return suspendedClusters;
}
export function dropFloatingBlocks() {
  // Get clusters of blocks that are suspended and calculate how far they can drop
  const suspendedClusters = getSuspendedBlocksWithDrop(grid);

  // Loop through each suspended cluster and apply the drop
  for (const { cluster, dropDistance } of suspendedClusters) {
    // Sort from bottom to top to avoid overwriting cells during the drop
    cluster.sort((a, b) => b[0] - a[0]);

    // Process each block in the cluster
    for (const [row, col] of cluster) {
      const newRow = row + dropDistance; // Calculate the new row after dropping

      // Get the current color of the block in the grid
      const currentColor = grid[row][col].color;

      // Ensure that we have a valid color
      if (currentColor === undefined) {
        console.warn(`Warning: Block at [${row}, ${col}] has no color!`);
        continue;
      }

      // Update the grid to reflect the new position
      grid[newRow][col] = {
        filled: true,
        color: currentColor, // Keep the original color for this block
      };

      // If there is a sprite at the old position, move it to the new position
      if (spriteGrid[row][col]) {
        // Move the sprite down by the drop distance
        spriteGrid[newRow][col] = spriteGrid[row][col];
        spriteGrid[newRow][col]!.y += dropDistance * BLOCK_SIZE; // Move sprite visually

        // Set the sprite's tint (color) to the original block color
        spriteGrid[newRow][col]!.tint = currentColor;
      }

      // Clear the old position in the grid
      grid[row][col] = { filled: false };

      // Debug: Check if color matches after the move
      if (grid[newRow][col].color !== currentColor) {
        console.warn(`Color mismatch after drop at [${newRow}, ${col}]`);
      }

      // Ensure that we maintain the structure of the tetromino
      // This part of the logic ensures that if there are multiple colors in the shape, each color is preserved in the dropped block
      // and that the tetromino shape remains intact.
      if (spriteGrid[newRow][col]) {
        const sprite = spriteGrid[newRow][col];
        const initialTint = currentColor;

        // Confirm the color consistency
        if (sprite.tint !== initialTint) {
          console.warn(`Color mismatch for sprite at [${newRow}, ${col}]`);
          sprite.tint = initialTint;
        }
      }
    }
  }
}

function logSpriteGrid() {
  for (let y = 0; y < ROWS; y++) {
    let rowLog = "";
    for (let x = 0; x < COLS; x++) {
      rowLog += spriteGrid[y][x] ? "X" : "O"; // 'X' if sprite exists, 'O' if not
    }
    console.log(rowLog); // Log each row of the grid with 'X' or 'O'
  }
}

function logGridColors() {
  for (let y = 0; y < ROWS; y++) {
    let rowLog = "";
    for (let x = 0; x < COLS; x++) {
      const cell = grid[y][x];
      rowLog += `${cell.color || "N/A"} `;
    }
    console.log(rowLog); // Logs color of each cell in the grid
  }
}
