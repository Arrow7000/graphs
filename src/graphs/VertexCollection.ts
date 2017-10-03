import Vertex from "./Vertex";
import { floor, random } from "./Point";
import map from "lodash/map";

class VertexCollection {
  private vertices: { [id: string]: Vertex };

  constructor(vertices?: Vertex[]) {
    this.vertices = {};

    if (vertices) {
      for (const vertex of vertices) {
        const { id } = vertex;
        this.vertices[id] = vertex;
      }
    }
  }

  push(vertex: Vertex) {
    const { id } = vertex;
    this.vertices[id] = vertex;
  }

  delete(vertex: Vertex);
  delete(vertexId: string);
  delete(vertexOrId: Vertex | string) {
    const id = vertexOrId instanceof Vertex ? vertexOrId.id : vertexOrId;

    delete this.vertices[id];
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
}

export default VertexCollection;
