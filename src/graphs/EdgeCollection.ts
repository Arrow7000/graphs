import Edge from "./Edge";
import map from "lodash/map";

import { voidFunc, IdMap, itemsToObjById } from "./collectionHelpers";

class EdgeCollection {
  private edges: IdMap<Edge>;
  // @TODO if more than 2 places for `length` mutation, make it gettable property
  private subscribers: voidFunc[];

  constructor(edges?: Edge[]) {
    this.edges = {};

    if (edges) {
      // for (const edge of edges) {
      //   const { id } = edge;
      //   this.edges[id] = edge;
      // }

      this.edges = itemsToObjById(edges);
    }

    this.subscribers = [];
  }

  push(edge: Edge) {
    const { id } = edge;
    this.edges[id] = edge;

    this.change();
  }

  delete(edge: Edge): void;
  delete(edgeId: string): void;
  delete(edgeOrId: Edge | string): void {
    const id = edgeOrId instanceof Edge ? edgeOrId.id : edgeOrId;

    delete this.edges[id];

    this.change();
  }

  toArray() {
    const array = map(this.edges, edge => edge);
    return array;
  }

  replace(edges: Edge[]) {
    this.edges = itemsToObjById(edges);

    this.change();
  }

  get length() {
    throw new Error(
      "make replace a method on Network class, otherwise change doesnt propagate properly"
    );
    return this.toArray().length;
  }

  onChange(func: voidFunc) {
    this.subscribers.push(func);
  }

  offChange(thisFunc: voidFunc) {
    // unsubscribe from changes
    this.subscribers = this.subscribers.filter(func => func !== thisFunc);
  }

  private change() {
    this.subscribers.forEach(func => func());
  }
}

export default EdgeCollection;
