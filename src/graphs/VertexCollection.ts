import Vertex from "./Vertex";
import { floor, random } from "../vectors/Point";
import map from "lodash/map";

import { voidFunc, IdMap, itemsToObjById } from "./collectionHelpers";

class VertexCollection {
  private vertices: IdMap<Vertex>;
  // @TODO if more than 2 places for `length` mutation, make it gettable property
  private subscribers: voidFunc[];

  constructor(vertices?: Vertex[]) {
    this.vertices = {};

    if (vertices) {
      // for (const vertex of vertices) {
      //   const { id } = vertex;
      //   this.vertices[id] = vertex;
      // }

      const vertexMap = itemsToObjById(vertices);
      this.vertices = vertexMap;
    }

    this.subscribers = [];
  }

  get(id: string): Vertex {
    return this.vertices[id];
  }

  push(vertex: Vertex) {
    const { id } = vertex;
    this.vertices[id] = vertex;

    this.change();
  }

  delete(vertex: Vertex): void;
  delete(vertexId: string): void;
  delete(vertexOrId: Vertex | string): void {
    const id = vertexOrId instanceof Vertex ? vertexOrId.id : vertexOrId;

    delete this.vertices[id];
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

  replace(vertices: Vertex[]) {
    this.vertices = itemsToObjById(vertices);

    this.change();
  }

  onChange(func: voidFunc) {
    this.subscribers.push(func);
  }

  get length() {
    return this.toArray().length;
  }

  offChange(thisFunc: voidFunc) {
    // unsubscribe from changes
    this.subscribers = this.subscribers.filter(func => func !== thisFunc);
  }

  private change() {
    this.subscribers.forEach(func => func());
  }
}

export default VertexCollection;
