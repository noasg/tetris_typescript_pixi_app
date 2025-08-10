# Tetrominoes Game Demo

A simple Tetrominoes puzzle game demo

---

## Game Overview

This game is designed specifically for **iPhone 15** resolution in **portrait mode**.

It features 5 unique Tetromino pieces that the player can control using intuitive keyboard or touch controls.

---

## Controls

- **Move Left:** Moves the active Tetromino piece one unit/square to the left.
- **Move Right:** Moves the active Tetromino piece one unit/square to the right.
- **Move Down:** Accelerates the fall speed of the active piece by a set percentage.
- **Rotate Left:** Rotates the active piece counterclockwise.
- **Rotate Right:** Rotates the active piece clockwise.

---

## Technical Details

- Developed with **TypeScript** for type safety and maintainability.
- Uses **Pixi.js**, a fast 2D rendering library, for rendering game graphics.
- Optimized for iPhone 15 screen resolution and portrait orientation.
- Smooth animations and responsive controls for a seamless gameplay experience.

---

## Features

### Difficulty Level
- Every 10 cleared lines, the **game level** increases by 1.
- At each level up, the default fall speed of the Tetrominoes increases by a set percentage.
- The current level counter is always displayed on the screen.

### Clicker Booster
- When charged, the Clicker Booster allows the player to tap on one resting piece on the screen and destroy it.
- All adjacent pieces of the same color as the tapped piece are also destroyed.
- Each time the game levels up, the booster is charged with one additional charge, up to a maximum of 10 charges.
- Each booster use consumes one charge.
- The current booster icon and charge level are always displayed on the screen.

### Production Value
- Tetrominoes are affected by gravity when landing, adding a natural physics feel to the gameplay.

---

## Technical Details

## How to Run

1. Clone the repository  
2. npm install
3. npm run build
4. npm start
