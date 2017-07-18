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

    add(p: Point) { return addVec(this, p); }

    subtract(p: Point) { return subtrVec(this, p); }

    multiply(factor: number) { return multiplyVec(this, factor); }

    divide(divisor: number) { return divideVec(this, divisor); }

    rotate(degrees: number) { return rotate(this, degrees); }

    combine(vectors: Point[]) { return combineVectors([this, ...vectors]); }

    isWithinRadius(point: Point, radius: number) { return this.getDistance(point) < radius; }
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

// get angle of vector


export function rotate(vector: Point, degrees: number) {
    const { x, y } = vector;
    const radians = degrees * PI / 180;

    return new Point(
        x * cos(radians) - y * sin(radians),
        x * sin(radians) - y * cos(radians),
    )
}

export function combineVectors(vectors: Point[]): Point {
    return vectors.reduce((result, vector) => {
        return addVec(result, vector);
    }, new Point());
}

export default Point;
