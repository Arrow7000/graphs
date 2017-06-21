import { random, floor, addVec, multiplyVec, divideVec } from './vectorMaths';
import { damping, vertexMass, vertexRadius } from './config';

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
        return multiplyVec(this.velocity, this.mass);
    }

    update() {
        // actual movement happens here
        // The rest is commentary
        this.velocity = multiplyVec(this.velocity, 1 - damping);
        this.position = addVec(this.position, this.velocity);

    }

    applyForce(vector) {
        this.velocity = addVec(this.velocity, divideVec(vector, this.mass));
    }

    applyMovement(vector) {
        this.position = addVec(this.position, vector);
    }


    // drag

    render(ctx) {
        // draws directly onto canvas
        const { x, y } = this.position;

        ctx.beginPath();
        ctx.arc(x, y, vertexRadius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

export default Vertex;
