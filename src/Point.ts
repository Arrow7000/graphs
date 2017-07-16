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

    combine(vectors: Point[]) { return combineVectors([this, ...vectors]); }
}





export function addVec(vecA: Point, vecB: Point): Point {
    const x = vecA.x + vecB.x;
    const y = vecA.y + vecB.y;
    return new Point(x, y);
}

export function subtrVec(vecA: Point, vecB: Point): Point {
    const x = vecA.x - vecB.x;
    const y = vecA.y - vecB.y;
    return new Point(x, y);
}

export function multiplyVec({ x, y }: Point, factor: number): Point {
    return new Point(
        x * factor,
        y * factor
    );
}

export function divideVec({ x, y }: Point, divisor: number): Point {
    return new Point(
        x / divisor,
        y / divisor
    );
}




export const sqr = num => num * num;
export const { sqrt, random, floor } = Math;


export function getDistance(a: Point, b: Point): number {
    const xDiff = sqr(b.x - a.x);
    const yDiff = sqr(b.y - a.y);
    return sqrt(xDiff + yDiff);
}

export function getVectorLen({ x, y }: Point): number {
    return sqrt(sqr(x) + sqr(y));
}


export function getAvgPosition(coords: Point[]): Point {
    const totalCoords = coords.reduce((totalCoord, thisCoord) => {
        return new Point(
            totalCoord.x + thisCoord.x,
            totalCoord.y + thisCoord.y
        );
    }, new Point(0, 0));

    const avgPosition = divideVec(totalCoords, coords.length);
    return avgPosition;
}

export function normaliseVec(vector: Point): Point {
    // const length = getVectorLen(vector);
    const length = vector.length();
    if (length === 0) {
        // return new Point(0, 0);
        throw new Error('cannot normalise vector of length 0');
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

export function limitVec(vector: Point, maxLength: number) {
    if (vector.length() > maxLength) {
        return vector.toLen(maxLength);
    }
    return vector;
}

export function combineVectors(vectors: Point[]): Point {
    return vectors.reduce((result, vector) => {
        return addVec(result, vector);
    }, new Point(0, 0));
}

export default Point;
