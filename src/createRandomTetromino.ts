// main file (e.g., game.ts or index.ts)
import * as PIXI from "pixi.js";
import { setupTetrominoControls } from "./tetrominoController";
import { tetrominoTypes } from "./tetrominoData"; // Import the tetromino types data
import { printGridWithSuspended, rotatePosition } from "./utils";
import {
  getBooleanGrid,
  checkTopRow,
  placeTetrominoOnGrid,
  clearCompletedLines,
  dropFloatingBlocks,
  grid,
} from "./gameUtils"; // Import the helper functions
import { ROWS, COLS, BLOCK_SIZE } from "./const";
import { fallSpeed } from "./gameState";
import { getSuspendedBlocksWithDrop } from "./gameUtils"; // make sure it's imported

// Type definitions for position and cell state
type Position = [number, number];
type Cell = { filled: boolean; color?: number };

// Initialize the game grid as a 2D array of cells, all set to 'not filled'

let canGenerate = true; // Flag to control tetromino generation (prevents spamming new pieces)

// Define suspendedContainer globally to hold suspended blocks
const suspendedContainer = new PIXI.Container();
// Function to create a random tetromino, handle falling logic, and clear completed lines
export function createRandomTetromino(
  texture: PIXI.Texture,
  container: PIXI.Container,
  app: PIXI.Application,
  gameLevelText?: PIXI.Text,
  boosterText?: PIXI.Text
) {
  // Prevent generating a new tetromino if the flag is false
  if (!canGenerate) return;
  canGenerate = false; // Disable generation until the current tetromino is settled

  // Randomly select a tetromino type from the available types
  const keys = Object.keys(tetrominoTypes);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const { positions, color } = tetrominoTypes[randomKey];

  // Randomly select a rotation (0, 90, 180, or 270 degrees)
  const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
  const rotatedPositions = positions.map((pos) =>
    rotatePosition(pos, rotation)
  );

  // Normalize positions so that they are within bounds
  const minX = Math.min(...rotatedPositions.map(([x]) => x));
  const minY = Math.min(...rotatedPositions.map(([_, y]) => y));
  const normalized: Position[] = rotatedPositions.map(
    ([x, y]) => [x - minX, y - minY] as Position
  );

  // Create a PIXI container for the tetromino
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

  // Calculate the width of the tetromino shape
  const shapeWidth = Math.max(...normalized.map(([x]) => x)) + 1;

  // Position the tetromino at the center of the screen
  tetromino.x = (COLS * BLOCK_SIZE - shapeWidth * BLOCK_SIZE) / 2;
  tetromino.x = Math.round(tetromino.x / BLOCK_SIZE) * BLOCK_SIZE;
  tetromino.y = -BLOCK_SIZE;

  container.addChild(tetromino);

  // Setup tetromino controls for movement and rotation
  const controller = setupTetrominoControls(
    tetromino,
    normalized,
    positions,
    () => getBooleanGrid(grid),
    () => {}
  );

  // Check if the top row is already filled (game over condition)
  if (checkTopRow(grid)) {
    console.log("Game Over: Top row is filled.");
    return;
  }

  // Smooth falling logic: variables to handle timing and fall speed
  let lastTime = performance.now();
  createRandomTetromino;
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

  // Function to animate tetromino falling
  function animate(time: number) {
    const delta = time - lastTime; // Time difference from last frame
    lastTime = time; // Update the last time
    accumulated += (delta / 1000) * fallSpeed; // Calculate accumulated time for fall speed

    // Move the tetromino down if enough time has passed
    if (accumulated >= BLOCK_SIZE) {
      const moved = controller.forceMoveDown(); // Try to move the tetromino down
      accumulated = 0;

      dropFloatingBlocks();
      // Move suspended blocks down by 1 cell as the tetromino moves down
      // const suspendedData = getSuspendedBlocksWithDrop(grid);
      // const suspendedCoordinates: [number, number][] = suspendedData.flatMap(
      //   (data) => data.cluster
      // );

      // // console.log("Suspended coordinates:", suspendedData);

      // // Redraw the grid after moving suspended blocks
      // printGridWithSuspended(
      //   grid.map((row) => row.map((cell) => cell.filled)),
      //   suspendedCoordinates,
      //   ROWS
      // );

      // If the tetromino cannot move further down, we need to place it
      if (!moved) {
        // Place the tetromino on the grid
        placeTetrominoOnGrid(tetromino, normalized, grid, app, boosterText);

        // Clear any completed lines
        clearCompletedLines(
          grid,
          container,
          texture,
          app,
          gameLevelText,
          boosterText
        );

        // Cleanup and enable generation of the next piece
        controller.cleanup();
        canGenerate = true;

        // Generate a new random tetromino after this one settles
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

    requestAnimationFrame(animate); // Continue animation loop
  }

  requestAnimationFrame(animate);

  return randomKey;
}
