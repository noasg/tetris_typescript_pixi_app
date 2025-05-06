// utils.ts

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
