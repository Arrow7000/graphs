import Vertex from "./Vertex";
import { floor, random } from "./Point";
import map from "lodash/map";

type voidFunc = () => void;

class VertexCollection {
  private vertices: { [id: string]: Vertex };
  public length: number;
  private subscribers: voidFunc[];

  constructor(vertices?: Vertex[]) {
    this.vertices = {};

    if (vertices) {
      for (const vertex of vertices) {
        const { id } = vertex;
        this.vertices[id] = vertex;
      }

      this.length = vertices.length;
    } else {
      this.length = 0;
    }

    this.subscribers = [];
  }

  push(vertex: Vertex) {
    const { id } = vertex;
    this.vertices[id] = vertex;

    this.length += 1;
    this.change();
  }

  delete(vertex: Vertex);
  delete(vertexId: string);
  delete(vertexOrId: Vertex | string) {
    const id = vertexOrId instanceof Vertex ? vertexOrId.id : vertexOrId;

    delete this.vertices[id];
    this.length -= 1;
    this.change();
  }

  toArray() {
    const array = map(this.vertices, vertex => vertex);
    return array;
  }

  getRandom(): Vertex {
    const ids = Object.keys(this.vertices);
    const chosenIndex = floor(random() * ids.length);
    const chosenId = ids[chosenIndex];
    return this.vertices[chosenId] || null;
  }

  onChange(func: voidFunc) {
    this.subscribers.push(func);
  }

  private change() {
    this.subscribers.forEach(func => func());
  }
}

export default VertexCollection;
