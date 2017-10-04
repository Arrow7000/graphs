import Edge from "./Edge";
import map from "lodash/map";

type voidFunc = () => void;

class EdgeCollection {
  private edges: { [id: string]: Edge };
  public length: number;
  private subscribers: voidFunc[];

  constructor(edges?: Edge[]) {
    this.edges = {};

    if (edges) {
      for (const edge of edges) {
        const { id } = edge;
        this.edges[id] = edge;
      }

      this.length = edges.length;
    } else {
      this.length = 0;
    }

    this.subscribers = [];
  }

  push(edge: Edge) {
    const { id } = edge;
    this.edges[id] = edge;

    this.length += 1;
    this.change();
  }

  delete(edge: Edge);
  delete(edgeId: string);
  delete(edgeOrId: Edge | string) {
    const id = edgeOrId instanceof Edge ? edgeOrId.id : edgeOrId;

    delete this.edges[id];

    this.length -= 1;
    this.change();
  }

  toArray() {
    const array = map(this.edges, edge => edge);
    return array;
  }

  onChange(func: voidFunc) {
    this.subscribers.push(func);
  }

  private change() {
    this.subscribers.forEach(func => func());
  }
}

export default EdgeCollection;
