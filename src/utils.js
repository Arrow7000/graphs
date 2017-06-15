const sqr = num => num * num
const { sqrt } = Math;


export function getDistance(aX, aY, bX, bY) {
    const xDiff = sqr(bX - aX);
    const yDiff = sqr(bY - aY);
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
