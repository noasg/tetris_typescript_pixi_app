import * as PIXI from "pixi.js";

type Position = [number, number]; // Define the Position type

export class GridManager {
  private grid: boolean[][];
  private readonly rows: number;
  private readonly cols: number;
  private readonly blockSize: number;
  private spriteMap: PIXI.Sprite[][]; // To track the sprites on the grid

  constructor(rows: number, cols: number, blockSize: number) {
    this.rows = rows;
    this.cols = cols;
    this.blockSize = blockSize;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill(false));
    this.spriteMap = Array.from({ length: rows }, () => Array(cols).fill(null)); // Initialize sprite map
  }

  // Check if the top row is full (game over condition)
  checkTopRow(): boolean {
    return this.grid[0].some((cell) => cell);
  }

  // Check if a line is full
  isLineFull(row: number): boolean {
    return this.grid[row].every((cell) => cell);
  }

  // Remove a line and shift all the rows above it down
  removeLine(row: number): void {
    for (let r = row; r > 0; r--) {
      this.grid[r] = [...this.grid[r - 1]]; // Shift the row down
      this.spriteMap[r] = [...this.spriteMap[r - 1]]; // Shift sprites down
    }
    this.grid[0] = Array(this.cols).fill(false); // Clear the top row
    this.spriteMap[0] = Array(this.cols).fill(null); // Clear sprite map for the top row
  }

  // Remove all full lines
  clearFullLines(): void {
    for (let r = 0; r < this.rows; r++) {
      if (this.isLineFull(r)) {
        this.removeLine(r);
      }
    }
  }

  // Place a tetromino on the grid and add the corresponding sprite to the sprite map
  placeTetromino(tetromino: PIXI.Container, normalized: Position[]): void {
    normalized.forEach(([x, y]) => {
      const gridX = Math.floor(
        (tetromino.x + x * this.blockSize) / this.blockSize
      );
      const gridY = Math.floor(
        (tetromino.y + y * this.blockSize) / this.blockSize
      );
      if (gridY >= 0 && gridY < this.rows && gridX >= 0 && gridX < this.cols) {
        this.grid[gridY][gridX] = true;

        // Access the sprite directly by iterating over normalized
        const sprite = tetromino.getChildAt(
          normalized.indexOf([x, y])
        ) as PIXI.Sprite;
        this.spriteMap[gridY][gridX] = sprite; // Track the sprite in the map
      }
    });
  }

  // Remove the sprite for a cell from the container
  removeSprite(gridX: number, gridY: number, container: PIXI.Container): void {
    const sprite = this.spriteMap[gridY][gridX];
    if (sprite) {
      container.removeChild(sprite); // Remove the sprite from the container
      this.spriteMap[gridY][gridX] = null; // Clear the sprite from the map
    }
  }

  // Get the grid for external reference
  getGrid(): boolean[][] {
    return this.grid;
  }
}
