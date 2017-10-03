import Edge from "./Edge";
import map from "lodash/map";

class EdgeCollection {
  private edges: { [id: string]: Edge };
  public length: number;

  constructor(edges?: Edge[]) {
    this.edges = {};

    if (edges) {
      for (const edge of edges) {
        const { id } = edge;
        this.edges[id] = edge;
      }

      this.length = edges.length;
    }
    this.length = 0;
  }

  push(edge: Edge) {
    const { id } = edge;
    this.edges[id] = edge;

    this.length += 1;
  }

  delete(edge: Edge);
  delete(edgeId: string);
  delete(edgeOrId: Edge | string) {
    const id = edgeOrId instanceof Edge ? edgeOrId.id : edgeOrId;

    delete this.edges[id];

    this.length -= 1;
  }

  toArray() {
    const array = map(this.edges, edge => edge);
    return array;
  }
}

export default EdgeCollection;
