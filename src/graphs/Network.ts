import Vertex from "./Vertex";
import VertexCollection from "./VertexCollection";
import Edge from "./Edge";
import EdgeCollection from "./EdgeCollection";

type voidFunc = () => void;

class Network {
  vertices: VertexCollection;
  edges: EdgeCollection;
  private subscribers: voidFunc[];

  constructor(vertexArray?: Vertex[], edgeArray?: Edge[]) {
    this.vertices = new VertexCollection(vertexArray);
    this.edges = new EdgeCollection(edgeArray);

    this.subscribers = [];
  }

  pushVertex(vertex: Vertex) {
    this.vertices.push(vertex);

    this.change();
  }

  pushEdge(edge: Edge) {
    this.edges.push(edge);

    this.change();
  }

  getVertex(id: string) {
    return this.vertices.get(id);
  }

  deleteVertex(vertex: Vertex): void;
  deleteVertex(vertexId: string): void;
  deleteVertex(vertexOrId: Vertex | string): void {
    if (typeof vertexOrId === "string") {
      // dumb workaround to typing error
      this.vertices.delete(vertexOrId);
    } else {
      this.vertices.delete(vertexOrId);
    }

    this.change();
  }

  deleteEdge(edge: Edge): void;
  deleteEdge(edgeId: string): void;
  deleteEdge(edgeOrId: Edge | string): void {
    if (typeof edgeOrId === "string") {
      // dumb workaround to typing error
      this.edges.delete(edgeOrId);
    } else {
      this.edges.delete(edgeOrId);
    }

    this.change();
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

export default Network;
