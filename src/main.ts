import * as PIXI from "pixi.js";
import { createRandomTetromino } from "./createRandomTetromino";
import { COLS, BLOCK_SIZE, ROWS, BOOSTER_INITIAL_VALUE } from "./const";
import { createOrUpdateTextLabel } from "./utils";

const GAME_WIDTH = COLS * BLOCK_SIZE; // 400
const GAME_HEIGHT = ROWS * BLOCK_SIZE; // 800

// Apply full-screen, black background styling
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "#000"; // Optional black bg
let boosterText: PIXI.Text;
let gameLevelText: PIXI.Text;

export const app = new PIXI.Application({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: 0xffffff,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.body.appendChild(app.view as HTMLCanvasElement);

// Load the square texture and set up the game
PIXI.Loader.shared.add("square", "assets/square.svg").load(setup);

function setup() {
  const squareTexture = PIXI.Texture.from("square");

  //crating the game level text
  gameLevelText = createOrUpdateTextLabel(
    `Game Level: 0`,
    18,
    0x000000,
    5,
    5,
    app
  );

  //crating the booster text
  boosterText = createOrUpdateTextLabel(
    `Booster: ${BOOSTER_INITIAL_VALUE}`,
    18,
    0x000000,
    GAME_WIDTH - 100,
    5,
    app
  );

  //creating the first tetromino -> starting the game
  createRandomTetromino(
    squareTexture,
    app.stage,
    app,
    gameLevelText,
    boosterText
  );

  resize(); // Initial call to fit the screen
}

// Resize the canvas to always show the full game scene, centered
function resize() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const availableHeight = windowHeight * 0.8; // 10% top + 10% bottom = 80% usable
  const scaleX = windowWidth / GAME_WIDTH;
  const scaleY = availableHeight / GAME_HEIGHT;
  const scale = Math.min(scaleX, scaleY); // Ensure full scene fits

  const newWidth = GAME_WIDTH * scale;
  const newHeight = GAME_HEIGHT * scale;

  app.view.style.width = `${newWidth}px`;
  app.view.style.height = `${newHeight}px`;
  app.view.style.position = "absolute";
  app.view.style.left = "50%";
  app.view.style.top = "10%";
  app.view.style.transform = "translateX(-50%)";
}

window.addEventListener("resize", resize);
