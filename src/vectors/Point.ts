// import Point from "./P";

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number);
  // constructor(point: P);
  constructor();
  constructor(xCoord: number = 0, yCoord: number = 0) {
    // let position: P;

    // if (yCoord !== undefined) {
    //   position = new P(xOrP as number, yCoord);
    // } else if (xOrP !== undefined) {
    //   position = xOrP as P;
    // } else {
    //   position = new P(0, 0);
    // }

    // if (yCoord !== undefined) {
    //   position = new P(xCoord as number, yCoord);
    //   // } else if (xOrP !== undefined) {
    // } else {
    //   // position = new P(0, 0);
    //   position = xCoord as P;
    // }
    // const { x, y } = position;
    // super(x, y);
    this.x = xCoord;
    this.y = yCoord;
  }
  // constructor(xOrP: P | number = new P(0, 0), yCoord?: number) {
  //   let position: P;

  //   // if (yCoord !== undefined) {
  //   //   position = new P(xOrP as number, yCoord);
  //   // } else if (xOrP !== undefined) {
  //   //   position = xOrP as P;
  //   // } else {
  //   //   position = new P(0, 0);
  //   // }

  //   if (yCoord !== undefined) {
  //     position = new P(xOrP as number, yCoord);
  //     // } else if (xOrP !== undefined) {
  //   } else {
  //     // position = new P(0, 0);
  //     position = xOrP as P;
  //   }
  //   const { x, y } = position;
  //   super(x, y);
  // }

  get length() {
    return getVectorLen(this);
  }

  getDistance(p: Point) {
    return getDistance(this, p);
  }

  normalise() {
    return normaliseVec(this);
  }

  vecTo(p: Point) {
    return vecFromTo(this, p);
  }

  vecFrom(p: Point) {
    return vecFromTo(p, this);
  }

  toLen(length: number) {
    return setVecToLen(this, length);
  }

  add(p: Point | number) {
    if (p instanceof Point) {
      return addVec(this, p);
    } else {
      return addLength(this, p);
    }
  }

  subtract(p: Point) {
    return subtrVec(this, p);
  }

  multiply(factor: number) {
    return multiplyVec(this, factor);
  }

  divide(divisor: number) {
    return divideVec(this, divisor);
  }

  rotate(degrees: number, center: Point = new Point()) {
    return rotateAround(this, degrees, center);
  }

  getAngle(from: Point = new Point(0, -1)) {
    return getAngle(this, from);
  }

  combine(vectors: Point[]) {
    return combineVectors([this, ...vectors]);
  }

  isWithinRadius(point: Point, radius: number) {
    return isWithinRadius(this, point, radius);
  }

  distanceToLine(lineA: Point, lineB: Point): number {
    return shortestDistanceToLine(this, lineA, lineB);
  }
}

export function addVec(vecA: Point, vecB: Point): Point {
  const x = vecA.x + vecB.x;
  const y = vecA.y + vecB.y;
  return new Point(x, y);
}

export function subtrVec(vecA: Point, vecB: Point): Point {
  return addVec(vecA, vecB.multiply(-1));
}

export function multiplyVec({ x, y }: Point, factor: number): Point {
  return new Point(x * factor, y * factor);
}

export function divideVec(vec: Point, divisor: number): Point {
  return multiplyVec(vec, 1 / divisor);
}

export const sqr = (num: number) => num * num;
export const {
  sqrt,
  random,
  abs,
  floor,
  sin,
  cos,
  tan,
  pow,
  PI,
  max,
  min
} = Math;

export function addLength(vector: Point, length: number): Point {
  const origLen = getVectorLen(vector);
  const newVec = setVecToLen(vector, origLen + length);
  return newVec;
}

export function getDistance(a: Point, b: Point): number {
  return getVectorLen(vecFromTo(a, b));
}

export function getVectorLen({ x, y }: Point): number {
  return sqrt(sqr(x) + sqr(y));
}

export function getAvgPosition(coords: Point[]): Point {
  const totalCoords = coords.reduce((totalCoord, thisCoord) => {
    return addVec(totalCoord, thisCoord);
  }, new Point());

  const avgPosition = divideVec(totalCoords, coords.length);
  return avgPosition;
}

export function normaliseVec(vector: Point): Point {
  const length = getVectorLen(vector);
  if (length <= 0) {
    throw new Error("Cannot normalise vector of length 0");
  }
  const normalised = divideVec(vector, length);
  return normalised;
}

export function vecFromTo(from: Point, to: Point): Point {
  return subtrVec(to, from);
}

export function setVecToLen(vector: Point, length: number) {
  const normalised = normaliseVec(vector);
  return multiplyVec(normalised, length);
}

export function maxVec(vector: Point, maxLength: number) {
  if (vector.length > maxLength) {
    return setVecToLen(vector, maxLength);
  }
  return vector;
}

export function minVec(vector: Point, minLength: number) {
  if (vector.length < minLength) {
    return setVecToLen(vector, minLength);
  }
  return vector;
}

export function getAngle(vector: Point, from: Point = new Point(0, -1)) {
  const angle = Math.atan2(vector.y - from.y, vector.x - from.x);
  const degrees = (180 * angle) / PI;
  return degrees % 360;
}

export function rotateAround(
  vector: Point,
  degrees: number,
  center: Point = new Point()
) {
  const fromCenter = vecFromTo(center, vector);
  const rotated = rotate(fromCenter, degrees);
  return addVec(rotated, center);
}

function rotate(vector: Point, degrees: number) {
  const { x, y } = vector;
  const radians = (degrees * PI) / 180;

  const ca = cos(radians);
  const sa = sin(radians);

  return new Point(x * ca - y * sa, x * sa + y * ca);
}

export function isWithinRadius(from: Point, to: Point, radius: number) {
  return getDistance(from, to) < radius;
}

function pDistance(
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) {
    //in case of 0 length line
    param = dot / len_sq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return sqrt(dx * dx + dy * dy);
}

export function shortestDistanceToLine(
  point: Point,
  lineA: Point,
  lineB: Point
) {
  return pDistance(point.x, point.y, lineA.x, lineA.y, lineB.x, lineB.y);
}

function cap(num: number, limit: number, isLowerBound: boolean): number {
  if (isLowerBound) {
    return num < limit ? limit : num;
  }
  return num > limit ? limit : num;
}

// export function isInBox(point: Point, origin: Point, end: Point): boolean {
//   const { x, y } = point;
//   const leftMost = min(origin.x, end.x);
//   const upMost = min(origin.y, end.y);
//   const rightMost = max(origin.x, end.x);
//   const downMost = max(origin.y, end.y);

//   return x < leftMost || x > rightMost || y < upMost || y > downMost;
// }

const toBound = (val: number, min: number, max: number) =>
  val < min ? min - val : val > max ? max - val : val;

export function toBox(point: Point, origin: Point, end: Point): Point {
  const { x, y } = point;
  const leftMost = min(origin.x, end.x);
  const upMost = min(origin.y, end.y);
  const rightMost = max(origin.x, end.x);
  const downMost = max(origin.y, end.y);

  const isInBox = x < leftMost || x > rightMost || y < upMost || y > downMost;
  if (isInBox) {
    return new Point();
  }
  const xToBox = toBound(x, leftMost, rightMost);
  const yToBox = toBound(y, upMost, downMost);

  return new Point(xToBox, yToBox);
}

export function combineVectors(vectors: Point[]): Point {
  return vectors.reduce((result, vector) => {
    return addVec(result, vector);
  }, new Point());
}

export const isP = (vOrP: Point | any): vOrP is Point => vOrP instanceof Point;

export default Point;
