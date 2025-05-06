// Tetromino shapes data
export const tetrominoTypes: Record<
  string,
  { positions: [number, number][]; color: number }
> = {
  line: {
    positions: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    color: 0xff0000, // Red
  },
  L: {
    positions: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    color: 0xff9d00, // Orange
  },
  S: {
    positions: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    color: 0x29bb00, // Green
  },
  square: {
    positions: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    color: 0xfffb00, // Yellow
  },
  T: {
    positions: [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    color: 0x9b0089, // Purple
  },
};
