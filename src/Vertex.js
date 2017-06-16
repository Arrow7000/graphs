import each from 'lodash/each';
import { sqr, random, floor, getDistance, subtrVec, multiplyVec, divideVec } from './utils';
import { damping, vertexMass, coulombConst, vertexCharge } from './config';

const uuidChunk = () => floor(random() * 1000000);
const uuid = () => '' + uuidChunk() + '-' + uuidChunk() + '-' + uuidChunk();

class Vertex {
    constructor(x, y) {
        this.id = uuid();
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };

        this.mass = vertexMass;
    }

    getMomentum() {
        const { x, y } = this.velocity;
        return {
            x: x * this.mass,
            y: y * this.mass,
        };
    }

    update(nodes) {
        // actual movement happens here
        // The rest is commentary
        this.velocity.x *= 1 - damping;
        this.velocity.y *= 1 - damping;

        const { x, y } = this.velocity;
        this.position.x += x;
        this.position.y += y;

        each(nodes, node => {
            if (this.id !== node.id) {
                const distance = getDistance(this.position, node.position);

                const force = coulombConst * (vertexCharge * vertexCharge) / sqr(distance / 2);

                const vecToNode = subtrVec(this.position, node.position);
                const normalisedDirection = divideVec(vecToNode, distance);
                const vector = multiplyVec(normalisedDirection, force);
                console.log(vector);
                this.applyForce(vector);
            }
        });

        // console.log(this.position);
    }

    applyForce({ x, y }) {
        this.velocity.x += x / this.mass;
        this.velocity.y += y / this.mass;
    }


    // drag

    render(ctx) {
        // draws directly onto canvas
        const { x, y } = this.position;

        ctx.beginPath();
        ctx.arc(x, y, 50, 0, 2 * Math.PI);
        ctx.fill();
    }
}

export default Vertex;
