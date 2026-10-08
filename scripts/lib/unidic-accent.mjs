/**
 * A second witness for the pitch accent (scripts/build-pitch-reference.mjs):
 * the accent type UniDic records for a word.
 *
 * Kanjium's list has one source, so nothing checks it. UniDic (NINJAL's
 * dictionary, the one scripts/lib/unidic.mjs already uses to check the
 * furigana) annotates an accent type (`aType`) on its entries. The Lindera
 * package embeds UniDic without that field, and NINJAL ships the full
 * dictionary only compiled for MeCab, so this reads that file itself.
 *
 * The file is a MeCab binary dictionary: a header, a Darts double array that
 * maps a spelling to a run of tokens, the token table, and the feature strings
 * (one CSV line per entry, UniDic's 29 fields). Reading it needs no MeCab.
 * The archive is downloaded from NINJAL at a pinned version, checked against
 * its size and checksum, and its `sys.dic` kept in the cache; the build is
 * otherwise offline and deterministic.
 */
import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { inflateRawSync } from "node:zlib";
import { toKatakana } from "wanakana";

export const UNIDIC_ACCENT_SOURCE = {
  name: "UniDic-cwj 3.1.1 accent types",
  version: "3.1.1",
  url: "https://clrd.ninjal.ac.jp/unidic_archive/cwj/3.1.1/unidic-cwj-3.1.1.zip",
  bytes: 551323689,
  sha256: "6f547a3e715639a3e0178a22df94223a147d95aceb112a590f2d684c644ad310",
  entry: "unidic-cwj-3.1.1/sys.dic",
  dicBytes: 243418052,
  dicSha256: "b7c03c1ea2b96c36961fb1987deb038e5b077d156095df622a75546b9ef7c6a8",
  licence: "BSD, LGPL or GPL",
};

/** UniDic's CSV fields that the accent lookup reads (the feature.def order). */
const FIELD = {
  pos: 0,
  posSub: 1,
  readingForm: 6, // lForm: the dictionary reading, in katakana
  orthBase: 10, // the dictionary spelling
  variant: 14, // iForm: 基本形, or 濁音形 for a voiced (rendaku) variant
  accent: 24, // aType: "2", or "2,0" for several, or "*" for none
};
const FIELDS = 29;

/** One entry of a ZIP file, inflated. Only what the pinned archive needs:
 *  no ZIP64, no encryption, stored or deflated. */
export function readZipEntry(file, name) {
  const fd = openSync(file, "r");
  try {
    const size = statSync(file).size;
    const tailLength = Math.min(size, 65557);
    const tail = Buffer.alloc(tailLength);
    readSync(fd, tail, 0, tailLength, size - tailLength);
    const eocd = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (eocd === -1) throw new Error(`${file} is not a ZIP file`);
    const count = tail.readUInt16LE(eocd + 10);
    const dirSize = tail.readUInt32LE(eocd + 12);
    const dirAt = tail.readUInt32LE(eocd + 16);
    if (dirAt === 0xffffffff) throw new Error(`${file} is a ZIP64 file`);
    const dir = Buffer.alloc(dirSize);
    readSync(fd, dir, 0, dirSize, dirAt);
    let at = 0;
    for (let i = 0; i < count; i++) {
      if (dir.readUInt32LE(at) !== 0x02014b50)
        throw new Error(`${file}: bad central directory`);
      const method = dir.readUInt16LE(at + 10);
      const packed = dir.readUInt32LE(at + 20);
      const unpacked = dir.readUInt32LE(at + 24);
      const nameLength = dir.readUInt16LE(at + 28);
      const extraLength = dir.readUInt16LE(at + 30);
      const noteLength = dir.readUInt16LE(at + 32);
      const local = dir.readUInt32LE(at + 42);
      const entry = dir.toString("utf8", at + 46, at + 46 + nameLength);
      at += 46 + nameLength + extraLength + noteLength;
      if (entry !== name) continue;
      const head = Buffer.alloc(30);
      readSync(fd, head, 0, 30, local);
      const start = local + 30 + head.readUInt16LE(26) + head.readUInt16LE(28);
      const data = Buffer.alloc(packed);
      readSync(fd, data, 0, packed, start);
      const out =
        method === 0 ? data : method === 8 ? inflateRawSync(data) : null;
      if (!out) throw new Error(`${name}: unsupported ZIP method ${method}`);
      if (out.length !== unpacked)
        throw new Error(`${name}: inflated to ${out.length}, not ${unpacked}`);
      return out;
    }
    throw new Error(`${file} has no ${name}`);
  } finally {
    closeSync(fd);
  }
}

/** The pinned `sys.dic`, from `path` if given, else from the cache, else
 *  extracted from the archive (downloaded to the cache if need be). Always
 *  verified. */
export async function loadUnidicDictionary(cacheDir, path) {
  const check = (data, where) => {
    const digest = createHash("sha256").update(data).digest("hex");
    if (
      data.length !== UNIDIC_ACCENT_SOURCE.dicBytes ||
      digest !== UNIDIC_ACCENT_SOURCE.dicSha256
    )
      throw new Error(
        `${where} is not the pinned sys.dic (expected ${UNIDIC_ACCENT_SOURCE.dicBytes} bytes and sha256 ${UNIDIC_ACCENT_SOURCE.dicSha256}, got ${data.length} and ${digest})`,
      );
    return data;
  };
  if (path) return check(readFileSync(path), path);
  const cached = join(cacheDir, "unidic-sys.dic");
  if (existsSync(cached)) return check(readFileSync(cached), cached);
  const zip = join(cacheDir, "unidic-cwj-3.1.1.zip");
  mkdirSync(cacheDir, { recursive: true });
  if (!existsSync(zip)) {
    console.log(
      `Downloading ${UNIDIC_ACCENT_SOURCE.name} (${Math.round(UNIDIC_ACCENT_SOURCE.bytes / 1e6)} MB)…`,
    );
    const res = await fetch(UNIDIC_ACCENT_SOURCE.url);
    if (!res.ok)
      throw new Error(`GET ${UNIDIC_ACCENT_SOURCE.url} → ${res.status}`);
    writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
  }
  const digest = createHash("sha256").update(readFileSync(zip)).digest("hex");
  if (
    statSync(zip).size !== UNIDIC_ACCENT_SOURCE.bytes ||
    digest !== UNIDIC_ACCENT_SOURCE.sha256
  ) {
    rmSync(zip);
    throw new Error(
      `${zip} is not the pinned archive (expected ${UNIDIC_ACCENT_SOURCE.bytes} bytes and sha256 ${UNIDIC_ACCENT_SOURCE.sha256}, got ${digest}); removed it`,
    );
  }
  const dic = check(readZipEntry(zip, UNIDIC_ACCENT_SOURCE.entry), zip);
  writeFileSync(cached, dic);
  rmSync(zip);
  return dic;
}

/** One CSV line into its fields; a field in quotes may hold commas. */
export function parseFeature(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c !== '"') cur += c;
      else if (line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

const MAGIC = 0xef718f77;
const HEADER = 72;
const TOKEN = 16;

/** A MeCab binary dictionary held in memory. `lookup(spelling)` gives the
 *  feature fields of every entry spelled exactly so. */
export class MecabDictionary {
  constructor(buf) {
    this.buf = buf;
    // The first word is the file's own size, xor a constant.
    if (buf.length < HEADER || (buf.readUInt32LE(0) ^ MAGIC) !== buf.length)
      throw new Error("not a MeCab dictionary");
    const charset = buf.toString("latin1", 40, 72).replace(/\0.*/s, "");
    if (charset.toUpperCase() !== "UTF-8")
      throw new Error(`dictionary is ${charset}, not UTF-8`);
    this.array = HEADER;
    this.tokens = this.array + buf.readUInt32LE(24);
    this.features = this.tokens + buf.readUInt32LE(28);
  }

  base(i) {
    return this.buf.readInt32LE(this.array + i * 8);
  }

  check(i) {
    return this.buf.readUInt32LE(this.array + i * 8 + 4);
  }

  /** The Darts exact match: the stored value, or -1. */
  exact(key) {
    let b = this.base(0);
    for (const byte of key) {
      const p = b + byte + 1;
      if (b !== this.check(p)) return -1;
      b = this.base(p);
    }
    const n = this.base(b);
    return b === this.check(b) && n < 0 ? -n - 1 : -1;
  }

  lookup(spelling) {
    const value = this.exact(Buffer.from(spelling, "utf8"));
    if (value < 0) return [];
    // The low byte is how many tokens, the rest where they start.
    const count = value & 0xff;
    const first = value >>> 8;
    const out = [];
    for (let i = 0; i < count; i++) {
      const at =
        this.features +
        this.buf.readUInt32LE(this.tokens + (first + i) * TOKEN + 8);
      let end = at;
      while (this.buf[end]) end++;
      out.push(parseFeature(this.buf.toString("utf8", at, end)));
    }
    return out;
  }
}

/** The accents UniDic gives a word of this spelling and reading, in the order
 *  it lists them, or []. An entry counts only if it spells the word and reads
 *  it as the word is read, and carries an accent. Three kinds of entry are
 *  left out: a proper name that shares the spelling, a suffix (a different
 *  word), and the voiced variant of a word (it is the same word, and its
 *  accent is the base form's). */
export function unidicAccents(dict, term, kana) {
  const reading = toKatakana(kana);
  const accents = [];
  for (const f of dict.lookup(term)) {
    if (f.length < FIELDS) continue;
    if (f[FIELD.orthBase] !== term || f[FIELD.readingForm] !== reading)
      continue;
    if (f[FIELD.posSub] === "固有名詞" || f[FIELD.pos] === "接尾辞") continue;
    if (f[FIELD.variant] === "濁音形") continue;
    if (f[FIELD.accent] === "*") continue;
    for (const a of f[FIELD.accent].split(","))
      if (/^\d+$/.test(a) && !accents.includes(Number(a)))
        accents.push(Number(a));
  }
  return accents;
}

/** Which of Kanjium's accents UniDic bears out: those both give, in Kanjium's
 *  order. An accent only one of them gives is not shown. */
export function agreedAccents(kanjium, unidic) {
  return kanjium.filter((a) => unidic.includes(a));
}
