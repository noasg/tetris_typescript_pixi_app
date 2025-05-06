import * as PIXI from "pixi.js";
import { createRandomTetromino } from "./createRandomTetromino"; // Adjust path if needed
import { COLS, BLOCK_SIZE, ROWS } from "./const";
import { createOrUpdateTextLabel } from "./utils"; // Import the utility function

const GAME_WIDTH = COLS * BLOCK_SIZE;
const GAME_HEIGHT = ROWS * BLOCK_SIZE; // Add extra space for the text

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

// Function to setup the game
function setup() {
  const squareTexture = PIXI.Texture.from("square");

  createOrUpdateTextLabel("Game Level: 1", 18, 0x000000, 5, 5, app);

  // Create the "Booster" counter text using the utility function
  createOrUpdateTextLabel("Booster: 0", 18, 0x000000, GAME_WIDTH - 100, 5, app);
  // Create a random tetromino with a random color and shape
  createRandomTetromino(squareTexture, app.stage, app);
}
