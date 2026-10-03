import { describe, it, expect } from "vitest";
import { layoutDiagram, COL_W, NODE_W } from "~/app/utils/diagram";

const spec = {
  nodes: [
    { id: "a", label: "A", col: 0, row: 0 },
    { id: "b", label: "B", sub: "sub", col: 1, row: 0 },
    { id: "c", label: "C\nline two", col: 1, row: 1 },
  ],
  edges: [
    { from: "a", to: "b", label: "go" },
    { from: "b", to: "c" },
    { from: "a", to: "c" },
  ],
};

describe("layoutDiagram", () => {
  it("places boxes on the grid, one column apart", () => {
    const laid = layoutDiagram(spec);
    const [a, b] = laid.nodes;
    expect(b!.x + b!.w / 2 - (a!.x + a!.w / 2)).toBe(COL_W);
    expect(a!.w).toBe(NODE_W);
  });

  it("sizes a box to its lines and its sub-line", () => {
    const [a, b, c] = layoutDiagram(spec).nodes;
    expect(b!.h).toBeGreaterThan(a!.h);
    expect(c!.lines).toEqual(["C", "line two"]);
    expect(c!.h).toBeGreaterThan(a!.h);
  });

  it("joins boxes with straight or orthogonal routes and labels the longest segment", () => {
    const { edges } = layoutDiagram(spec);
    expect(edges[0]!.d).toMatch(/^M[\d.]+ [\d.]+ L[\d.]+ [\d.]+$/);
    expect(edges[0]!.horizontalLabel).toBe(true);
    // a (top-left) to c (below-right): a Z, not a diagonal.
    const points = edges[2]!.d.split(" L").length;
    expect(points).toBe(4);
    for (const e of edges) expect(e.d).not.toContain("NaN");
  });

  it("keeps every box and arrow inside the viewBox", () => {
    const laid = layoutDiagram({
      ...spec,
      edges: [{ from: "a", to: "b", kind: "never", out: "t", into: "t" }],
    });
    for (const n of laid.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(laid.x);
      expect(n.y).toBeGreaterThanOrEqual(laid.y);
      expect(n.x + n.w).toBeLessThanOrEqual(laid.x + laid.width);
      expect(n.y + n.h).toBeLessThanOrEqual(laid.y + laid.height);
    }
    // The loop over the top reaches above row 0, so the box starts above 0.
    expect(laid.y).toBeLessThan(0);
  });

  it("draws a group around its members", () => {
    const laid = layoutDiagram({
      ...spec,
      groups: [{ label: "G", ids: ["b", "c"] }],
    });
    const [g] = laid.groups;
    for (const n of laid.nodes.filter((n) => n.id !== "a")) {
      expect(n.x).toBeGreaterThan(g!.x);
      expect(n.x + n.w).toBeLessThan(g!.x + g!.w);
      expect(n.y).toBeGreaterThan(g!.y);
      expect(n.y + n.h).toBeLessThan(g!.y + g!.h);
    }
  });

  it("refuses an edge to a box that does not exist", () => {
    expect(() =>
      layoutDiagram({ nodes: spec.nodes, edges: [{ from: "a", to: "zz" }] }),
    ).toThrow(/unknown node "zz"/);
  });
});
