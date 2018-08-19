import { coulombStrength, getCoulombForce, getLargestSquare } from "./forces";
import Vertex from "./Vertex";
import P from "../vectors/Point";

describe("coulombStrength", () => {
  test("Throw when distance too small", () => {
    expect(() => coulombStrength(1, 1, 1, 0.00001)).toThrow();
  });

  test("Distance is 1", () => {
    const strength = coulombStrength(2, 3, 5, 1);
    expect(strength).toBe(30 / 0.25);
  });

  test("Distance is 2", () => {
    const strength = coulombStrength(2, 3, 5, 2);
    expect(strength).toBe(30);
  });

  test("Distance is 3", () => {
    const strength = coulombStrength(2, 3, 5, 3);
    expect(strength).toBe(30 / 1.5 ** 2);
  });
});

describe("getLargestSquare", () => {
  test("With 0 vertices", () => {
    const square = getLargestSquare([]);
    expect(square).toEqual([new P(0, 0), new P(0, 0)]);
  });

  test("With 3 vertices", () => {
    const v0 = new Vertex(new P(0, 0));
    const v1 = new Vertex(new P(2, -1));
    const v2 = new Vertex(new P(3, 1));

    const square = getLargestSquare([v0, v1, v2]);
    expect(square).toEqual([new P(0, -1), new P(3, 1)]);
  });
});
