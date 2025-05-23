// Defining the scene as a matrix of 10x20
// width will be 10*40 =400px
// height will be 20*40 =800px
// The game will be played in a 10x20 grid, where each block is 40x40 pixels

export const BLOCK_SIZE = 40;
export const COLS = 10;
export const ROWS = 20;

export const FALL_SPEED = 40; // pixels per second
export const FALL_SPEED_FAST_MULTIPLIER = 4; // when ArrowDown is held

export const LINES_PER_LEVEL = 1;
export const FALL_SPEED_INCREMENT_PER_LEVEL = 1.5; //50% speed per level

export const BOOSTER_INITIAL_VALUE = 0; // Initial value for booster
export const BOOSTER_MAX_VALUE = 10; // Increment value for booster
