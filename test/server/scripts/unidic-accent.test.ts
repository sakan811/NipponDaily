import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deflateRawSync } from "node:zlib";
import { describe, it, expect } from "vitest";
// @ts-expect-error — plain .mjs module without type declarations
import * as lib from "../../../scripts/lib/unidic-accent.mjs";

const {
  MecabDictionary,
  agreedAccents,
  parseFeature,
  readZipEntry,
  unidicAccents,
} = lib as Record<string, any>;

/** A UniDic feature line: only the fields the lookup reads are filled. */
function feature(f: {
  pos?: string;
  sub?: string;
  reading: string;
  orth: string;
  variant?: string;
  accent: string;
}): string {
  const fields = Array.from({ length: 29 }, () => "*");
  fields[0] = f.pos ?? "名詞";
  fields[1] = f.sub ?? "普通名詞";
  fields[6] = f.reading;
  fields[10] = f.orth;
  fields[14] = f.variant ?? "*";
  fields[24] = f.accent;
  return fields.map((x) => (x.includes(",") ? `"${x}"` : x)).join(",");
}

/**
 * A MeCab dictionary holding `words`: a Darts double array with one chain of
 * units per spelling (each key gets its own region, so no two share a unit),
 * one token per feature line, and the feature strings. Built the way MeCab
 * lays it out, so the reader is tested against the real format.
 */
function dictionary(words: Record<string, string[]>): Buffer {
  const UNIT = 8;
  const units = new Map<number, { base: number; check: number }>();
  const tokens: Buffer[] = [];
  const features: Buffer[] = [];
  let featureAt = 0;
  let region = 1000;
  // Root: its base points at the first region; keys start from there.
  const root = region;
  units.set(0, { base: root, check: 0 });
  // The first byte decides where a key leaves the root, so keys whose first
  // byte is shared would need a shared unit; the test words differ there.
  for (const [spelling, lines] of Object.entries(words)) {
    const key = Buffer.from(spelling, "utf8");
    let b = root;
    for (const byte of key) {
      const p = b + byte + 1;
      region += 1000;
      units.set(p, { base: region, check: b });
      b = region;
    }
    const first = tokens.length;
    for (const line of lines) {
      const text = Buffer.from(`${line}\0`, "utf8");
      const token = Buffer.alloc(16);
      token.writeUInt32LE(featureAt, 8);
      tokens.push(token);
      features.push(text);
      featureAt += text.length;
    }
    units.set(b, { base: -((first << 8) | lines.length) - 1, check: b });
  }
  const last = Math.max(...units.keys());
  const array = Buffer.alloc((last + 1) * UNIT);
  for (const [i, u] of units) {
    array.writeInt32LE(u.base, i * UNIT);
    array.writeUInt32LE(u.check, i * UNIT + 4);
  }
  const tokenTable = Buffer.concat(tokens);
  const featurePool = Buffer.concat(features);
  const header = Buffer.alloc(72);
  const size = 72 + array.length + tokenTable.length + featurePool.length;
  header.writeUInt32LE((size ^ 0xef718f77) >>> 0, 0);
  header.writeUInt32LE(102, 4);
  header.writeUInt32LE(array.length, 24);
  header.writeUInt32LE(tokenTable.length, 28);
  header.writeUInt32LE(featurePool.length, 32);
  header.write("UTF-8", 40, "latin1");
  return Buffer.concat([header, array, tokenTable, featurePool]);
}

describe("parseFeature", () => {
  it("splits on commas and keeps a quoted field whole", () => {
    expect(parseFeature('a,b,"0,1",d')).toEqual(["a", "b", "0,1", "d"]);
    expect(parseFeature('a,"say ""hi""",c')).toEqual(["a", 'say "hi"', "c"]);
  });
});

describe("MecabDictionary", () => {
  const dict = new MecabDictionary(
    dictionary({
      橋: [
        feature({ reading: "ハシ", orth: "橋", accent: "2" }),
        feature({ reading: "キョウ", orth: "橋", accent: "*", pos: "接尾辞" }),
      ],
      箸: [feature({ reading: "ハシ", orth: "箸", accent: "1" })],
    }),
  );

  it("finds the entries spelled exactly so, and none otherwise", () => {
    expect(dict.lookup("橋")).toHaveLength(2);
    expect(dict.lookup("橋")[0]![6]).toBe("ハシ");
    expect(dict.lookup("箸")).toHaveLength(1);
    expect(dict.lookup("端")).toEqual([]);
    expect(dict.lookup("")).toEqual([]);
  });

  it("refuses a file that is not a MeCab dictionary", () => {
    expect(() => new MecabDictionary(Buffer.alloc(100))).toThrow(/MeCab/);
    expect(() => new MecabDictionary(Buffer.from("short"))).toThrow(/MeCab/);
  });
});

describe("unidicAccents", () => {
  const words = {
    橋: [
      feature({ reading: "ハシ", orth: "橋", accent: "2" }),
      // a suffix, a surname and a voiced variant share the spelling
      feature({ reading: "ハシ", orth: "橋", accent: "9", pos: "接尾辞" }),
      feature({ reading: "ハシ", orth: "橋", accent: "8", sub: "固有名詞" }),
      feature({ reading: "ハシ", orth: "橋", accent: "7", variant: "濁音形" }),
      // another reading of the spelling
      feature({ reading: "キョウ", orth: "橋", accent: "1" }),
    ],
    端: [
      feature({ reading: "ハシ", orth: "端", accent: "0" }),
      feature({ reading: "ハシ", orth: "端", accent: "0,1" }),
      feature({ reading: "ハシ", orth: "端", accent: "*" }),
    ],
  };
  const dict = new MecabDictionary(dictionary(words));

  it("reads only the entry that spells and reads the word, with an accent", () => {
    expect(unidicAccents(dict, "橋", "はし")).toEqual([2]);
    expect(unidicAccents(dict, "橋", "きょう")).toEqual([1]);
  });

  it("lists every accent once, in UniDic's order", () => {
    expect(unidicAccents(dict, "端", "はし")).toEqual([0, 1]);
  });

  it("says nothing for a word UniDic lacks or reads otherwise", () => {
    expect(unidicAccents(dict, "箸", "はし")).toEqual([]);
    expect(unidicAccents(dict, "橋", "ばし")).toEqual([]);
  });
});

describe("agreedAccents", () => {
  it("keeps the accents both give, in Kanjium's order", () => {
    expect(agreedAccents([3, 0], [0, 3, 4])).toEqual([3, 0]);
    expect(agreedAccents([1, 2, 0], [2, 0])).toEqual([2, 0]);
  });

  it("keeps nothing where they disagree or UniDic is silent", () => {
    expect(agreedAccents([1], [0])).toEqual([]);
    expect(agreedAccents([1], [])).toEqual([]);
  });
});

describe("readZipEntry", () => {
  /** A one-entry ZIP file, made by hand. */
  function zip(name: string, data: Buffer, method: 0 | 8): string {
    const body = method === 8 ? deflateRawSync(data) : data;
    const nameBytes = Buffer.from(name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(0, 42);
    const directory = Buffer.concat([central, nameBytes]);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(1, 8);
    end.writeUInt16LE(1, 10);
    end.writeUInt32LE(directory.length, 12);
    end.writeUInt32LE(local.length + nameBytes.length + body.length, 16);
    const file = join(mkdtempSync(join(tmpdir(), "zip-")), "a.zip");
    writeFileSync(
      file,
      Buffer.concat([local, nameBytes, body, directory, end]),
    );
    return file;
  }

  const text = Buffer.from("accent ".repeat(500));

  it("inflates a deflated entry and returns a stored one as is", () => {
    expect(readZipEntry(zip("dir/a.dic", text, 8), "dir/a.dic")).toEqual(text);
    expect(readZipEntry(zip("a.dic", text, 0), "a.dic")).toEqual(text);
  });

  it("throws for a missing entry or a file that is not a ZIP", () => {
    expect(() => readZipEntry(zip("a.dic", text, 8), "b.dic")).toThrow(/no b/);
    const plain = join(mkdtempSync(join(tmpdir(), "zip-")), "x");
    writeFileSync(plain, "not a zip");
    expect(() => readZipEntry(plain, "a.dic")).toThrow(/not a ZIP/);
  });
});
