import { getNewSquare, getAvgMomentum } from "./forceUtils";
import Vertex from "./Vertex";
import P from "../vectors/Point";

describe("getAvgMomentum", () => {
  test("No vertices", () => {
    expect(getAvgMomentum([])).toBe(0);
  });

  test("With 2 vertices", () => {
    const v0 = new Vertex(new P());
    v0.applyForce(new P());

    const v1 = new Vertex(new P());
    v1.applyForce(new P(2, 2));

    const vertices = [v0, v1];

    expect(getAvgMomentum(vertices)).toBe(Math.SQRT2);
  });

  test("With 3 vertices", () => {
    const v0 = new Vertex(new P());
    v0.applyForce(new P(1, 0));

    const v1 = new Vertex(new P());
    v1.applyForce(new P(0, 2));

    const v2 = new Vertex(new P());
    v2.applyForce(new P(3, 0));

    const vertices = [v0, v1];

    expect(getAvgMomentum(vertices)).toBe(2);
  });
});
