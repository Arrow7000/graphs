import P from './Point';

export const sqr = num => num * num
export const { sqrt, random, floor } = Math;


export function getDistance(a, b) {
    const xDiff = sqr(b.x - a.x);
    const yDiff = sqr(b.y - a.y);
    return sqrt(xDiff + yDiff);
}

export function getVectorLen({ x, y }) {
    return sqrt(sqr(x) + sqr(y));
}


export function getAvgPosition(coords) {
    const totalCoords = coords.reduce((totalCoord, thisCoord) => {
        return new P(
            totalCoord.x + thisCoord.x,
            totalCoord.y + thisCoord.y
        );
    }, new P(0, 0));

    const avgPosition = divideVec(totalCoords, coords.length);
    return avgPosition;
}

export function normaliseVec(vector) {
    const length = getVectorLen(vector);
    const normalised = divideVec(vector, length);
    return normalised;
}

export function vecFromTo(from, to) {
    return subtrVec(to, from);
}


// arithmetic operations

export function addVec(vecA, vecB) {
    const x = vecA.x + vecB.x;
    const y = vecA.y + vecB.y;
    return new P(x, y);
}

export function subtrVec(vecA, vecB) {
    const x = vecA.x - vecB.x;
    const y = vecA.y - vecB.y;
    return new P(x, y);
}

export function multiplyVec({ x, y }, factor) {
    return new P(
        x * factor,
        y * factor
    );
}

export function divideVec({ x, y }, divisor) {
    return new P(
        x / divisor,
        y / divisor
    );
}
