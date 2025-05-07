// import { ROWS, COLS } from "./const";

// // Flood fill logic
// export function floodFill(
//   grid: { filled: boolean; color?: number }[][],
//   x: number,
//   y: number,
//   targetColor: number
// ) {
//   const visited = new Set<string>();

//   function fill(x: number, y: number) {
//     const key = `${x},${y}`;
//     if (
//       x < 0 ||
//       x >= COLS ||
//       y < 0 ||
//       y >= ROWS ||
//       visited.has(key) ||
//       !grid[y][x].filled ||
//       grid[y][x].color !== targetColor
//     ) {
//       return;
//     }

//     visited.add(key);
//     grid[y][x] = { filled: false }; // Clear the block

//     // Recursively check the neighboring blocks
//     fill(x + 1, y);
//     fill(x - 1, y);
//     fill(x, y + 1);
//     fill(x, y - 1);
//   }

//   fill(x, y);
// }

// // // Function to redraw the board
// // export function redrawBoard(
// //   container: PIXI.Container,
// //   grid: { filled: boolean; color?: number }[][],
// //   texture: PIXI.Texture
// // ) {
// //   container.removeChildren(); // Clear the current stage
// //   for (let y = 0; y < ROWS; y++) {
// //     for (let x = 0; x < COLS; x++) {
// //       const cell = grid[y][x];
// //       if (cell.filled) {
// //         const block = new PIXI.Sprite(texture);
// //         block.width = 30; // BLOCK_SIZE
// //         block.height = 30; // BLOCK_SIZE
// //         block.x = x * 30; // Adjust if needed
// //         block.y = y * 30; // Adjust if needed
// //         block.tint = cell.color!;
// //         container.addChild(block);
// //       }
// //     }
// //   }
// // }
