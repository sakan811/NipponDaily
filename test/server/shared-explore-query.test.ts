import { describe, it, expect } from "vitest";
import {
  filtersFromQuery,
  queryFromFilters,
  splitList,
} from "~~/shared/explore-query";

describe("splitList", () => {
  it("splits on commas, trims, drops blanks and repeats", () => {
    expect(splitList("a, b,,a")).toEqual(["a", "b"]);
    expect(splitList(["a,b", "c"])).toEqual(["a", "b", "c"]);
    expect(splitList(undefined)).toEqual([]);
    expect(splitList(3)).toEqual([]);
  });
});

describe("filtersFromQuery", () => {
  it("reads lists and drops values the API would refuse", () => {
    expect(
      filtersFromQuery({
        level: "N5,N6,N4",
        stratum: "wago,bogus,unstated",
        process: ["rendaku", "compound"],
        pos: "verb,bogus",
        frequency: "common,bogus,less",
        match: "all",
        part: "日",
        q: " water ",
      }),
    ).toEqual({
      level: ["N5", "N4"],
      stratum: ["wago", "unstated"],
      process: ["rendaku", "compound"],
      pos: ["verb"],
      frequency: ["common", "less"],
      match: "all",
      part: "日",
      q: "water",
    });
  });

  it("returns nothing for an empty or unknown query", () => {
    expect(filtersFromQuery({})).toEqual({});
    expect(filtersFromQuery({ level: "N6", match: "some", q: "" })).toEqual({});
  });
});

describe("queryFromFilters", () => {
  it("joins lists with commas and leaves out empties and the default match", () => {
    expect(
      queryFromFilters({
        level: ["N5", "N4"],
        process: [],
        match: "any",
        q: "water",
      }),
    ).toEqual({ level: "N5,N4", q: "water" });
    expect(queryFromFilters({ pos: ["verb"], match: "all" })).toEqual({
      pos: "verb",
      match: "all",
    });
  });

  it("round-trips through filtersFromQuery", () => {
    const filters = {
      level: ["N3" as const],
      stratum: ["unstated" as const, "wago" as const],
      process: ["rendaku" as const, "compound" as const],
      match: "all" as const,
    };
    expect(filtersFromQuery(queryFromFilters(filters))).toEqual(filters);
  });
});
