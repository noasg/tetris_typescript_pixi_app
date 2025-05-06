// utils.ts
import { BLOCK_SIZE } from "./const";
import * as PIXI from "pixi.js";

export type Position = [number, number];

export function rotatePosition([x, y]: Position, angle: number): Position {
  switch (angle) {
    case 90:
      return [-y, x];
    case -90:
    case 270:
      return [y, -x];
    case 180:
    case -180:
      return [-x, -y];
    default:
      return [x, y];
  }
}

// Print the grid for debugging
export function printGrid(grid: boolean[][], ROWS: number, COLS: number): void {
  for (let row = 0; row < ROWS; row++) {
    const rowStr = grid[row].map((cell) => (cell ? "1" : "0")).join(" ");
    console.log(rowStr);
  }
}
// Utility function to create or update text labels
export function createOrUpdateTextLabel(
  text: string,
  fontSize: number,
  color: number,
  x: number,
  y: number,
  app: PIXI.Application,
  existingLabel?: PIXI.Text // Optional parameter for an existing label to update
) {
  if (existingLabel) {
    existingLabel.text = text; // Update the existing text
  } else {
    const label = new PIXI.Text(text, {
      fontFamily: "Arial",
      fontSize: fontSize,
      fill: color, // Text color
      align: "center",
    });

    // Position the text
    label.x = x;
    label.y = y;

    // Add the text to the stage
    app.stage.addChild(label);
    return label;
  }
  return existingLabel; // Return updated label
}
