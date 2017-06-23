import P from './Point';
import { random, floor, addVec, multiplyVec, divideVec } from './vectorMaths';
import { damping, vertexMass, vertexRadius, vertexCharge } from './config';

const uuidChunk = () => floor(random() * 1000000);
const uuid = () => '' + uuidChunk() + '-' + uuidChunk() + '-' + uuidChunk();

class Vertex {

    id: string;
    position: P;
    velocity: P;
    mass: number;
    charge: number;


    constructor(xOrPoint: P);
    constructor(xOrPoint: number, y: number);
    constructor(xOrPoint: P | number, y?: number) {
        this.id = uuid();

        let point: P;
        if (y) {
            point = new P(xOrPoint as number, y);
        } else {
            point = xOrPoint as P;
        }
        this.position = point;
        this.velocity = new P(0, 0);

        this.mass = vertexMass;
        this.charge = vertexCharge;
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

    applyForce(vector: P) {
        this.velocity = addVec(this.velocity, divideVec(vector, this.mass));
    }

    applyMovement(vector: P) {
        this.position = addVec(this.position, vector);
    }

    drag(position: P) {
        this.position = position;
    }


    // drag

    render(ctx: CanvasRenderingContext2D) {
        // draws directly onto canvas
        const { x, y } = this.position;

        ctx.beginPath();
        ctx.arc(x, y, vertexRadius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

export default Vertex;
