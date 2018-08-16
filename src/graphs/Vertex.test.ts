import Vertex from "./Vertex";
import P from "../vectors/Point";
import { getXY } from "../testHelpers";

const getVXY = (v: Vertex) => getXY(v.position);

describe("Vertex", () => {
  describe("Create new Vertex", () => {
    test("No parameters", () => {
      const v = new Vertex();

      expect(v.position.x).toBeLessThanOrEqual(1);
      expect(v.position.x).toBeGreaterThanOrEqual(0);

      expect(v.position.y).toBeLessThanOrEqual(1);
      expect(v.position.y).toBeGreaterThanOrEqual(0);
    });

    test("Initialise coords", () => {
      const v = new Vertex(new P());

      expect(getVXY(v)).toEqual({ x: 0, y: 0 });
    });

    test("Initialise coords and ID", () => {
      const v = new Vertex(new P(), "test-id");

      expect(getVXY(v)).toEqual({ x: 0, y: 0 });
      expect(v.id).toBe("test-id");
    });
  });

  describe("Forces and movements", () => {
    test("Apply force", () => {
      const v = new Vertex();
      v.applyForce(new P(1, 0));
      v.applyForce(new P(0, 1));

      expect(v.momentum).toEqual(new P(1, 1));
      expect(v.velocity).toEqual(new P(1, 1).divide(v.mass));
    });

    test("Update", () => {
      const v = new Vertex();
      v.applyForce(new P(1, 2));
      v.update();

      expect(v.position).toEqual(new P(1, 2).divide(v.mass));
    });

    test("Move", () => {
      const v = new Vertex();
      v.move(new P(1, 7));
      expect(v.position).toEqual(new P(1, 7));
    });
  });
});
