/**
 * Builds the fonts the share images are drawn with (`pnpm assets:og-font`):
 * Zen Old Mincho Bold for Japanese, cut down to the characters a card can show
 * (the full font is 5 MB; the subset is about 1 MB, so it can live in the repo
 * and ship with the server), and Outfit Bold for Latin text, which Zen Old
 * Mincho lacks the macron vowels of (ō, ū). Both are the site's own faces.
 *
 *   server/assets/og/zen-old-mincho-bold.ttf   the subset (generated)
 *   server/assets/og/OFL.txt                   its licence (SIL OFL 1.1)
 *   server/assets/og/outfit-latin-700.woff     copied from @fontsource/outfit
 *   server/assets/og/outfit-latin-ext-700.woff
 *   server/assets/og/OFL-outfit.txt            its licence
 *   server/assets/og/glyphs.json               every character the fonts can draw,
 *                                              so a card leaves out a headline
 *                                              it cannot draw rather than show a box
 *
 * The characters come from the entries (term, reading, meaning, headline) plus
 * ASCII and the few marks the card draws itself, so a new word with a kanji the
 * subset lacks fails `test/server/og-font.test.ts` until this is run again.
 *
 * The upstream file is pinned by commit and checksum, like the Wiktionary dump,
 * and is never committed: download it from the URL below into the repo root
 * (git-ignored) or point `--font` at it.
 *
 *   node scripts/build-og-font.mjs [--font <path to ZenOldMincho-Bold.ttf>]
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import subsetFont from "subset-font";

const opentype = createRequire(import.meta.url)("opentype.js");

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const OG_FONT = {
  file: "ZenOldMincho-Bold.ttf",
  url: "https://raw.githubusercontent.com/google/fonts/dac28ca2a883c27a817104b72bfa8d5e7e973954/ofl/zenoldmincho/ZenOldMincho-Bold.ttf",
  licenceUrl:
    "https://raw.githubusercontent.com/google/fonts/dac28ca2a883c27a817104b72bfa8d5e7e973954/ofl/zenoldmincho/OFL.txt",
  bytes: 5436460,
  sha256: "d6b95c1ff45c8dac153d28961e4c37d7d03b648330c71f884d124dc652a13c0d",
  out: "server/assets/og/zen-old-mincho-bold.ttf",
  licenceOut: "server/assets/og/OFL.txt",
};

const OUTFIT = {
  from: "node_modules/@fontsource/outfit",
  files: ["outfit-latin-700.woff", "outfit-latin-ext-700.woff"],
  dir: "server/assets/og",
  licenceOut: "server/assets/og/OFL-outfit.txt",
};

const parse = (path) => {
  const b = readFileSync(path);
  return opentype.parse(
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength),
  );
};

/** Marks the card draws that are not in any entry. */
const CARD_CHARS = "“”‘’–—·→…・、。〜～ 和語漢語外来語混種語";

/** Every character a card may draw. */
export function cardCharacters(root = ROOT) {
  const chars = new Set(CARD_CHARS);
  for (let c = 0x20; c < 0x7f; c++) chars.add(String.fromCharCode(c));
  const dir = join(root, "data/words");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")))
    for (const e of JSON.parse(readFileSync(join(dir, file), "utf8")))
      for (const c of e.term + e.kana + e.meaning + e.headline) chars.add(c);
  return [...chars].sort().join("");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf("--font");
  const path = resolve(
    i === -1 ? join(ROOT, OG_FONT.file) : process.argv[i + 1],
  );
  if (!existsSync(path))
    throw new Error(
      `No font at ${path}. Download ${OG_FONT.url} (or pass --font <path>).`,
    );
  const source = readFileSync(path);
  const sha256 = createHash("sha256").update(source).digest("hex");
  if (source.length !== OG_FONT.bytes || sha256 !== OG_FONT.sha256)
    throw new Error(
      `${path} is not the pinned ${OG_FONT.file} (expected sha256 ${OG_FONT.sha256}, got ${sha256}). Bump the pin in scripts/build-og-font.mjs deliberately.`,
    );

  const text = cardCharacters();
  const subset = await subsetFont(source, text, { targetFormat: "sfnt" });
  mkdirSync(join(ROOT, "server/assets/og"), { recursive: true });
  writeFileSync(join(ROOT, OG_FONT.out), subset);
  console.log(
    `Wrote ${OG_FONT.out}: ${[...text].length} characters, ${(subset.length / 1024).toFixed(0)} KB`,
  );

  for (const f of OUTFIT.files)
    copyFileSync(
      join(ROOT, OUTFIT.from, "files", f.replace(/\.woff$/, "-normal.woff")),
      join(ROOT, OUTFIT.dir, f),
    );
  copyFileSync(
    join(ROOT, OUTFIT.from, "LICENSE"),
    join(ROOT, OUTFIT.licenceOut),
  );

  // What the fonts can draw: the characters of the entries, one by one.
  const fonts = [
    parse(join(ROOT, OG_FONT.out)),
    ...OUTFIT.files.map((f) => parse(join(ROOT, OUTFIT.dir, f))),
  ];
  const drawable = [...cardCharacters()].filter((c) =>
    fonts.some((f) => f.charToGlyphIndex(c) > 0),
  );
  writeFileSync(
    join(ROOT, OUTFIT.dir, "glyphs.json"),
    JSON.stringify({ chars: drawable.join("") }) + "\n",
  );
  console.log(
    `Wrote ${OUTFIT.dir}/glyphs.json: ${drawable.length} drawable characters`,
  );

  const licence = join(dirname(path), "OFL.txt");
  if (existsSync(licence))
    copyFileSync(licence, join(ROOT, OG_FONT.licenceOut));
  else
    console.log(
      `Download ${OG_FONT.licenceUrl} to ${OG_FONT.licenceOut} (the font's licence travels with it).`,
    );
}
