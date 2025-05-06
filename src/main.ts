import * as PIXI from "pixi.js";
import { createRandomTetromino } from "./createRandomTetromino"; // Adjust path if needed

// Constants for the game
const BLOCK_SIZE = 40;
const COLS = 10;
const ROWS = 20;

const GAME_WIDTH = COLS * BLOCK_SIZE;
const GAME_HEIGHT = ROWS * BLOCK_SIZE;

export const app = new PIXI.Application({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: 0xffffff,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.body.appendChild(app.view as HTMLCanvasElement);

// Load the individual square (used to create tetrominoes)
PIXI.Loader.shared.add("square", "assets/square.svg").load(setup);

function setup() {
  const squareTexture = PIXI.Texture.from("square");

  // Create a random tetromino with a random color and shape
  createRandomTetromino(squareTexture, app.stage);
}
