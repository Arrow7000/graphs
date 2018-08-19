import {
  getSubSquareByDirection,
  getAvgMomentum,
  getQuadOfVertex,
  isInSquare,
  NW,
  SW,
  NE,
  SE,
  constructQuadTree
} from "./forceUtils";
import Vertex from "./Vertex";
import P from "../vectors/Point";

describe("getAvgMomentum", () => {
  test("No vertices", () => {
    expect(getAvgMomentum([])).toBe(0);
  });

  test("With 1 verte", () => {
    const v0 = new Vertex(new P());
    v0.applyForce(new P(1, 1));

    const vertices = [v0];
    expect(getAvgMomentum(vertices)).toBe(Math.SQRT2);
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

    const vertices = [v0, v1, v2];
    expect(getAvgMomentum(vertices)).toBe(2);
  });
});

describe("groupVertexByQuad", () => {
  const box = new P(3, 3);
  const v = new Vertex(new P());

  function getResultFromPoint(point: P) {
    const end = point.add(box);
    return getQuadOfVertex([point, end], v);
  }

  test("Out of bounds should throw", () => {
    expect(() => getResultFromPoint(new P(1, 1))).toThrow();
  });

  test("Should be NW", () => {
    const dir = getResultFromPoint(new P(-1, -1));
    expect(dir).toBe(NW);
  });

  test("Should be SW", () => {
    const dir = getResultFromPoint(new P(-1, -2));
    expect(dir).toBe(SW);
  });

  test("Should be NE", () => {
    const dir = getResultFromPoint(new P(-2, -1));
    expect(dir).toBe(NE);
  });

  test("Should be SE", () => {
    const dir = getResultFromPoint(new P(-2, -2));
    expect(dir).toBe(SE);
  });
});

describe("getSubSquareByDirection", () => {
  const square: [P, P] = [new P(-1, -1), new P(1, 1)];

  test("Get NW quadrant", () => {
    const quadrant = getSubSquareByDirection(square, NW);
    expect(quadrant).toEqual([new P(-1, -1), new P(0, 0)]);
  });
  test("Get SW quadrant", () => {
    const quadrant = getSubSquareByDirection(square, SW);
    expect(quadrant).toEqual([new P(-1, 0), new P(0, 1)]);
  });
  test("Get NE quadrant", () => {
    const quadrant = getSubSquareByDirection(square, NE);
    expect(quadrant).toEqual([new P(0, -1), new P(1, 0)]);
  });
  test("Get SE quadrant", () => {
    const quadrant = getSubSquareByDirection(square, SE);
    expect(quadrant).toEqual([new P(0, 0), new P(1, 1)]);
  });
});

describe("isInSquare", () => {
  const square: [P, P] = [new P(-1, -1), new P(1, 1)];
  const isInGivenSquare = (point: P) => isInSquare(square, point);

  test("Is in square", () => {
    expect(isInGivenSquare(new P())).toBe(true);
  });

  test("Is N of square", () => {
    expect(isInGivenSquare(new P(0, -2))).toBe(false);
  });
  test("Is NE of square", () => {
    expect(isInGivenSquare(new P(2, -2))).toBe(false);
  });
  test("Is E of square", () => {
    expect(isInGivenSquare(new P(2, 0))).toBe(false);
  });
  test("Is SE of square", () => {
    expect(isInGivenSquare(new P(2, 2))).toBe(false);
  });
  test("Is S of square", () => {
    expect(isInGivenSquare(new P(0, 2))).toBe(false);
  });
  test("Is SW of square", () => {
    expect(isInGivenSquare(new P(-2, 2))).toBe(false);
  });
  test("Is W of square", () => {
    expect(isInGivenSquare(new P(-2, 0))).toBe(false);
  });
  test("Is NW of square", () => {
    expect(isInGivenSquare(new P(-2, -2))).toBe(false);
  });
});

describe("constructQuadTree", () => {
  const square: [P, P] = [new P(0, 0), new P(3, 3)];

  test("No vertices", () => {
    expect(constructQuadTree([], square)).toEqual({
      vertex: null,
      squareWidth: 3
    });
  });

  test("Vertex outside square should throw", () => {
    const v0 = new Vertex(new P(-1, -1));
    const v1 = new Vertex(new P());
    expect(() => constructQuadTree([v0, v1], square)).toThrow();
  });

  test("2 vertices, 1 level of nesting", () => {
    const v0 = new Vertex(new P(0, 0));
    v0.charge = 1;
    const v1 = new Vertex(new P(2, 2));
    v1.charge = 1;

    const tree = constructQuadTree([v0, v1], square);
    expect(tree).toEqual({
      totalCharge: 2,
      vertices: [v0, v1],
      centerOfCharge: new P(1, 1),
      squareWidth: 3,

      NW: { vertex: v0, squareWidth: 1.5 },
      SE: { vertex: v1, squareWidth: 1.5 }
    });
  });

  test("2 vertices, 2 levels of nesting", () => {
    const v0 = new Vertex(new P(0, 0));
    v0.charge = 1;
    const v1 = new Vertex(new P(1, 1));
    v1.charge = 1;

    const tree = constructQuadTree([v0, v1], square);
    expect(tree).toEqual({
      totalCharge: 2,
      vertices: [v0, v1],
      centerOfCharge: new P(0.5, 0.5),
      squareWidth: 3,

      NW: {
        totalCharge: 2,
        vertices: [v0, v1],
        centerOfCharge: new P(0.5, 0.5),
        squareWidth: 1.5,

        NW: { vertex: v0, squareWidth: 0.75 },
        SE: { vertex: v1, squareWidth: 0.75 }
      }
    });
  });

  test("3 vertices, 2 & 1 levels of nesting", () => {
    const v0 = new Vertex(new P(0, 0));
    v0.charge = 1;
    const v1 = new Vertex(new P(1, 1));
    v1.charge = 1;
    const v2 = new Vertex(new P(2, 2));
    v2.charge = 1;

    const tree = constructQuadTree([v0, v1, v2], square);
    expect(tree).toEqual({
      totalCharge: 3,
      vertices: [v0, v1, v2],
      centerOfCharge: new P(1, 1),
      squareWidth: 3,

      SE: { vertex: v2, squareWidth: 1.5 },

      NW: {
        totalCharge: 2,
        vertices: [v0, v1],
        centerOfCharge: new P(0.5, 0.5),
        squareWidth: 1.5,

        NW: { vertex: v0, squareWidth: 0.75 },
        SE: { vertex: v1, squareWidth: 0.75 }
      }
    });
  });
});
