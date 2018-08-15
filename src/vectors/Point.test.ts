import Point from "./Point";
import { getXY } from "../testHelpers";

describe("Basic Point creation", () => {
  test("Explicit coords", () => {
    const point = new Point(0, 1);
    expect(getXY(point)).toEqual({ x: 0, y: 1 });
  });

  test("Copying point", () => {
    const point = new Point(3, 8).copy();
    expect(getXY(point)).toEqual({ x: 3, y: 8 });
  });

  test("No coords should return Null Island ({0,0})", () => {
    const point = new Point();
    expect(getXY(point)).toEqual({ x: 0, y: 0 });
  });
});

describe("Point methods", () => {
  const { SQRT2 } = Math;

  const p0 = new Point();
  const p1 = new Point(1, 1);
  const p2 = new Point(10 * SQRT2, 10 * SQRT2);

  test("Get vector length", () => {
    expect(p0.length).toBe(0);
    expect(p1.length).toBe(SQRT2);
    expect(p2.length).toBe(20);
  });

  test("Get distance", () => {
    expect(p0.getDistance(p1)).toBe(SQRT2);
  });

  test("Normalise", () => {
    expect(() => p0.normalise()).toThrow();

    const newCoord = 1 / SQRT2;
    expect(p1.normalise()).toEqual(new Point(newCoord, newCoord));
  });

  test("Add vectors", () => {
    expect(p1.add(p1)).toEqual(new Point(2, 2));
  });

  test("Add length", () => {
    expect(p1.add(SQRT2)).toEqual(new Point(2, 2));
  });

  test("Subtract vectors", () => {
    expect(p1.subtract(p1)).toEqual(new Point());
  });

  test("Multiply vectors", () => {
    expect(p1.multiply(2)).toEqual(new Point(2, 2));
  });

  test("Divide vectors", () => {
    expect(p1.multiply(2).divide(2)).toEqual(new Point(1, 1));
  });
});
