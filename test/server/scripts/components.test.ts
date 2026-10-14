import { deflateRawSync } from "node:zlib";
import { describe, it, expect } from "vitest";
// @ts-expect-error — plain .mjs module without type declarations
import * as builder from "../../../scripts/build-components-reference.mjs";
// @ts-expect-error — plain .mjs module without type declarations
import * as zip from "../../../scripts/lib/zip.mjs";

const { parseComponents, buildComponents } = builder as Record<
  string,
  (...args: any[]) => any
>;
const { readZipFile, zipNames } = zip as Record<
  string,
  (...args: any[]) => any
>;

describe("parseComponents", () => {
  const text = [
    "# a comment",
    "亜 : ｜ 一 口",
    "唖 : ｜ 一 口",
    "日 : 日",
    "",
  ].join("\n");

  it("reads each line as a kanji and the shapes it lists, skipping comments", () => {
    const parsed = parseComponents([text]);
    expect(parsed.get("亜")).toEqual(["｜", "一", "口"]);
    expect(parsed.get("日")).toEqual(["日"]);
    expect(parsed.size).toBe(3);
  });

  it("keeps the first line of a kanji that two files both list", () => {
    const parsed = parseComponents(["亜 : 一", "亜 : 口"]);
    expect(parsed.get("亜")).toEqual(["一"]);
  });
});

describe("buildComponents", () => {
  it("takes only the kanji asked for, and none the file has no line for", () => {
    const listed = new Map([
      ["亜", ["一"]],
      ["唖", ["口"]],
    ]);
    expect(buildComponents({ 亜: {}, 謎: {} }, listed)).toEqual({ 亜: ["一"] });
  });
});

/** A one-file zip archive, made by hand so the reader is tested on known bytes. */
function zipOf(name: string, body: Buffer, deflate: boolean): Buffer {
  const packed = deflate ? deflateRawSync(body) : body;
  const nameBytes = Buffer.from(name);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(deflate ? 8 : 0, 8);
  local.writeUInt32LE(packed.length, 18);
  local.writeUInt32LE(body.length, 22);
  local.writeUInt16LE(nameBytes.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(deflate ? 8 : 0, 10);
  central.writeUInt32LE(packed.length, 20);
  central.writeUInt32LE(body.length, 24);
  central.writeUInt16LE(nameBytes.length, 28);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  const centralAt = local.length + nameBytes.length + packed.length;
  end.writeUInt32LE(central.length + nameBytes.length, 12);
  end.writeUInt32LE(centralAt, 16);
  return Buffer.concat([local, nameBytes, packed, central, nameBytes, end]);
}

describe("the zip reader", () => {
  const body = Buffer.from("亜 : ｜ 一 口\n".repeat(20));

  it("reads a deflated file and a stored one", () => {
    for (const deflate of [true, false]) {
      const data = zipOf("kradfile", body, deflate);
      expect(zipNames(data)).toEqual(["kradfile"]);
      expect(readZipFile(data, "kradfile").equals(body)).toBe(true);
    }
  });

  it("refuses a file the archive does not hold, and bytes that are no archive", () => {
    expect(() => readZipFile(zipOf("a", body, true), "b")).toThrow(/no file/);
    expect(() =>
      zipNames(Buffer.from("not a zip at all, but long enough")),
    ).toThrow(/not a zip/);
  });
});
