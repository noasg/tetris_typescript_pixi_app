import * as PIXI from "pixi.js";
import { rotatePosition } from "./utils";
import { BLOCK_SIZE, COLS, ROWS } from "./const";

type Position = [number, number];

// Function to setup controls for a tetromino (movement and rotation)
export function setupTetrominoControls(
  tetromino: PIXI.Container,
  normalized: Position[], // The current position of the tetromino on the grid
  positions: Position[], // The current position of the tetromino on the grid
  getGrid: () => boolean[][], // Dynamic getter to retrieve the current grid state
  updatePlacementCallback: () => void
) {
  let gridX = Math.floor(tetromino.x / BLOCK_SIZE);
  let gridY = Math.floor(tetromino.y / BLOCK_SIZE);

  // Function to apply the current grid position to the tetromino
  function applyPosition() {
    tetromino.x = gridX * BLOCK_SIZE;
    tetromino.y = gridY * BLOCK_SIZE;
  }

  // Function to check if a tetromino can move to a new position (newX, newY)
  function canMove(newX: number, newY: number, shape = normalized): boolean {
    const currentGrid = getGrid(); // Get the current grid state
    return shape.every(([x, y]) => {
      // Calculating the new grid position for each block
      const gx = newX + x;
      const gy = newY + y;
      // Check that the new position is within the grid boundaries and not occupied
      return (
        gx >= 0 && gx < COLS && gy < ROWS && (gy < 0 || !currentGrid[gy][gx])
      );
    });
  }

  // Function to move the tetromino by a certain delta (dx, dy)
  function move(dx: number, dy: number): boolean {
    const newX = gridX + dx;
    const newY = gridY + dy;

    // Only move if the new position is valid (canMove returns true)
    if (canMove(newX, newY)) {
      gridX = newX;
      gridY = newY;
      applyPosition();
      updatePlacementCallback();
      return true;
    }
    return false;
  }

  // Function to rotate the tetromino (left or right)
  function rotate(direction: "left" | "right") {
    const angle = direction === "left" ? -90 : 90;
    const rotated = positions.map((pos) => rotatePosition(pos, angle));

    // Normalize the rotated positions to ensure they fit within the grid
    const minX = Math.min(...rotated.map(([x]) => x));
    const minY = Math.min(...rotated.map(([_, y]) => y));
    const testShape = rotated.map(([x, y]) => [x - minX, y - minY] as Position);

    // Only rotate if the new rotated positions are valid (canMove returns true)
    if (canMove(gridX, gridY, testShape)) {
      // Update normalized and positions arrays with the rotated shape
      normalized.length = 0;
      normalized.push(...testShape);

      positions.length = 0;
      positions.push(...rotated);

      // Update the tetromino's child sprites (blocks) with new rotated positions
      tetromino.children.forEach((child, i) => {
        const [x, y] = testShape[i];
        child.x = x * BLOCK_SIZE;
        child.y = y * BLOCK_SIZE;
      });

      updatePlacementCallback();
    }
  }

  //When the user taps any of those keys, the tetromino will move in the direction of the arrow key pressed
  //or rotate left or right depending on the key pressed
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

  //  event for keys to control the tetromino
  window.addEventListener("keydown", handler);

  return {
    cleanup: () => window.removeEventListener("keydown", handler), // Cleanup function to remove event listener
    getGridPosition: () => ({ gridX, gridY }), // Function to get the current grid position of the tetromino
    forceMoveDown: () => move(0, 1), // Force move the tetromino down (used for falling)
  };
}
