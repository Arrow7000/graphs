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

export function addVec(vecA, vecB) {
    const x = vecA.x + vecB.x;
    const y = vecA.y + vecB.y;
    return { x, y };
}

export function subtrVec(vecA, vecB) {
    const x = vecA.x - vecB.x;
    const y = vecA.y - vecB.y;
    return { x, y };
}

export function multiplyVec({ x, y }, factor) {
    return {
        x: x * factor,
        y: y * factor
    };
}

export function divideVec({ x, y }, divisor) {
    return {
        x: x / divisor,
        y: y / divisor
    };
}
