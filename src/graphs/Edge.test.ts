import Edge from "./Edge";
import Vertex from "./Vertex";
import P from "../vectors/Point";

describe("Edge", () => {
  test("Create new edge", () => {
    const v1 = new Vertex();
    const e = new Edge(v1, new P());
  });
});
