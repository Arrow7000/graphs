import Edge from "./Edge";
import Vertex from "./Vertex";
import P from "../vectors/Point";

describe("Edge", () => {
  let v0: Vertex, v1: Vertex;
  let p1: P, p2: P;

  beforeEach(() => {
    p1 = new P(1, 1);
    p2 = new P(2, 2);
    v0 = new Vertex(new P(0, 0));
    v1 = new Vertex(p1);
  });

  describe("Get length", () => {
    test("Get length when unconnected", () => {
      const e = new Edge(v0, p1);
      expect(e.length).toBe(Math.SQRT2);
    });

    test("Get length when connected", () => {
      const e = new Edge(v0, v1);
      expect(e.length).toBe(Math.SQRT2);
    });
  });

  describe("Set point B", () => {
    test("Set point B when unconnected", () => {
      const e = new Edge(v0, p1);
      e.setPointB(p2);
      expect(e.vertices.b).toEqual(p2);
    });

    test("When connected set point B should throw", () => {
      const e = new Edge(v0, v1);
      expect(() => e.setPointB(p2)).toThrow();
    });
  });

  test("Attach to vertex", () => {
    const e = new Edge(v0, p1);
    e.attachToVertex(v1);
    expect(e.to).toBe(v1);
  });

  describe("Is connected", () => {
    test("When not connected", () => {
      const e = new Edge(v0, p1);
      expect(e.isConnected).toBe(false);
    });

    test("When connected", () => {
      const e = new Edge(v0, v1);
      expect(e.isConnected).toBe(true);
    });
  });

  describe("Get from and to", () => {
    test("From", () => {
      const e = new Edge(v0, p1);
      expect(e.from).toEqual(v0);
    });

    describe("To", () => {
      test("When not connected", () => {
        const e = new Edge(v0, p1);
        expect(e.to).toBe(null);
      });

      test("When connected", () => {
        const e = new Edge(v0, v1);
        expect(e.to).toBe(v1);
      });
    });
  });
});
