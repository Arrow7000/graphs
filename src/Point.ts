import P from './P';


class Point extends P {

    constructor(x: number, y: number);
    constructor(point: P);
    constructor();
    constructor(xOrP?: P | number, yCoord?: number) {
        let position: P;

        if (yCoord !== undefined) {
            position = new P(xOrP as number, yCoord);
        } else if (xOrP !== undefined) {
            position = xOrP as P;
        } else {
            position = new P(0, 0);
        }
        const { x, y } = position;
        super(x, y);
    }


    length() { return getVectorLen(this); }

    getDistance(p: Point) { return getDistance(this, p); }

    normalise() { return normaliseVec(this); }

    vecTo(p: Point) { return vecFromTo(this, p); }

    vecFrom(p: Point) { return vecFromTo(p, this); }

    toLen(length: number) { return setVecToLen(this, length); }

    add(p: Point | number) {
        if (p instanceof Point) {
            return addVec(this, p);
        } else {
            return addLength(this, p);
        }
    }

    subtract(p: Point) { return subtrVec(this, p); }

    multiply(factor: number) { return multiplyVec(this, factor); }

    divide(divisor: number) { return divideVec(this, divisor); }

    rotate(degrees: number, center: Point = new Point()) {
        return rotateAround(this, degrees, center);
    }

    getAngle(from: Point = new Point(0, -1)) { return getAngle(this, from); }

    combine(vectors: Point[]) { return combineVectors([this, ...vectors]); }

    isWithinRadius(point: Point, radius: number) { return isWithinRadius(this, point, radius); }
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
    return new Point(
        x * factor,
        y * factor
    );
}

export function divideVec(vec: Point, divisor: number): Point {
    return multiplyVec(vec, 1 / divisor);
}




export const sqr = (num: number) => num * num;
export const { sqrt, random, floor, sin, cos, tan, pow, PI } = Math;


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
        throw new Error('Cannot normalise vector of length 0');
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
    if (vector.length() > maxLength) {
        return setVecToLen(vector, maxLength);
    }
    return vector;
}

export function minVec(vector: Point, minLength: number) {
    if (vector.length() < minLength) {
        return setVecToLen(vector, minLength);
    }
    return vector;
}

export function getAngle(vector: Point, from: Point = new Point(0, -1)) {
    const angle = Math.atan2(vector.y - from.y, vector.x - from.x);
    const degrees = 180 * angle / PI;
    return degrees % 360;
}

export function rotateAround(vector: Point, degrees: number, center: Point = new Point()) {
    const fromCenter = vecFromTo(center, vector);
    const rotated = rotate(fromCenter, degrees);
    return addVec(rotated, center);
}

function rotate(vector: Point, degrees: number) {
    const { x, y } = vector;
    const radians = degrees * PI / 180;

    const ca = cos(radians);
    const sa = sin(radians);

    return new Point(
        (x * ca) - (y * sa),
        (x * sa) + (y * ca)
    );
}

export function isWithinRadius(from: Point, to: Point, radius: number) { return getDistance(from, to) < radius; }


export function combineVectors(vectors: Point[]): Point {
    return vectors.reduce((result, vector) => {
        return addVec(result, vector);
    }, new Point());
}

export const isP = (vOrP: P | any): vOrP is P => vOrP instanceof P;

export default Point;
