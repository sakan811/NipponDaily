import { describe, it, expect } from "vitest";
import { strokeStart } from "~/app/utils/strokes";

describe("strokeStart", () => {
  it("reads the first move-to of a path", () => {
    expect(strokeStart("M31.5,24.5c1.12,1.12,1.74,2.75,1.74,4.75")).toEqual({
      x: 31.5,
      y: 24.5,
    });
    expect(strokeStart("M54.5,88 c -0.83,0 -1.5,0.67 -1.5,1.5")).toEqual({
      x: 54.5,
      y: 88,
    });
  });

  it("takes a lower-case m as absolute at the start of a path", () => {
    expect(strokeStart("m13.25,34.02c0.77,0.92")).toEqual({
      x: 13.25,
      y: 34.02,
    });
  });

  it("is undefined for data that does not begin with one", () => {
    expect(strokeStart("c1,2")).toBeUndefined();
    expect(strokeStart("")).toBeUndefined();
  });
});
