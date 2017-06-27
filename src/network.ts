import range from 'lodash/range';
import uniqWith from 'lodash/uniqWith';

type EdgeSpec = [number, number];

const { floor, random } = Math;

// export const nodes = range(20);

// export const edges: EdgeSpec[] = [
//     [0, 1],
//     [0, 2],
//     [0, 3],
//     [0, 4],
//     [0, 5],
//     [0, 6],
//     [0, 7],
//     [0, 8],
//     [0, 9],
//     [0, 10],
//     [0, 11],
//     [0, 12],
//     [0, 13],
//     [0, 14],
//     [0, 15],
//     [0, 16],
//     [0, 17],
//     [0, 18],
//     [0, 19],
//     [12, 3],
//     [14, 9],
//     [3, 10],
//     [2, 19],
//     [3, 19],
//     [16, 19],
//     [17, 19],
//     [18, 19],
//     [2, 19],
//     [2, 19],
//     [2, 19],
//     [2, 19],
//     [2, 19],
//     [2, 19],
// ];
const randNode = () => floor(random() * (nodes.length - 1));

function isSame(a: EdgeSpec, b: EdgeSpec) {
    const isSelfie = a[0] === a[1] || b[0] === b[1]; // connects to self
    const isSame = a[0] === b[0] && a[1] === b[1]; // are identical
    const isReverseSame = a[0] === b[1] && a[1] === b[0]; // are mirror image identical

    if (isSelfie || isSame || isReverseSame) {
        return true;
    }
    return false;
}



export const nodes = range(80);

export const edges: EdgeSpec[] = uniqWith([
    ...range(nodes.length)
        .map(index => {
            return [index, randNode()]
        }),
    ...range(80)
        .map(() => [randNode(), randNode()])
], isSame);