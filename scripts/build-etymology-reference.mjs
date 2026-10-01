/**
 * Builds data/reference/etymology-reference.json (`pnpm data:etymology`).
 *
 * The daily-word entries under data/words/ make origin claims ("a clipping of
 * 湯帷子", "originally plural"). Nothing in JMdict/KANJIDIC2 backs those, so each
 * claim cites a quote from English Wiktionary's Japanese Etymology section, and
 * this snapshot is the committed evidence test/content/words.test.ts checks the
 * quotes against.
 *
 * Deterministic: every page is pinned to a Wiktionary revision id. A term that
 * already has a pin in the snapshot is re-fetched at that exact revision (same
 * input, same output); a term with no pin yet is fetched at its current revision
 * and the id recorded. Bump a pin deliberately with `--refresh <term>`.
 *
 * Terms are every entry's `term` in data/words/*.json, every term already
 * pinned in the snapshot, plus an optional `--terms a,b,c` for bootstrapping a
 * new batch before its entries exist.
 *
 * Wiktionary text is CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/);
 * the snapshot keeps each page's permalink so the attribution stays traceable.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data/reference/etymology-reference.json");
const API = "https://en.wiktionary.org/w/api.php";
const USER_AGENT = "NipponDaily-data-build/1.0";

const args = process.argv.slice(2);
const flagValue = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const refresh = new Set(
  (flagValue("--refresh") ?? "").split(",").filter(Boolean),
);

function entryTerms() {
  const dir = join(ROOT, "data/words");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) =>
      JSON.parse(readFileSync(join(dir, f), "utf8")).map((e) => e.term),
    );
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const wait = Number(res.headers.get("retry-after")) || 2 ** attempt * 2;
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`Wiktionary ${res.status} for ${url}`);
    const json = await res.json();
    if (json.error) throw new Error(`Wiktionary: ${json.error.info} (${url})`);
    await new Promise((r) => setTimeout(r, 1000));
    return json;
  }
}

/** Rendered Wiktionary HTML → the plain sentence text a reader would see. */
export function htmlToText(html) {
  return (
    html
      .replace(/<style[\s\S]*?<\/style>/g, "")
      // The "Kanji in this term" boxes and other layout tables aren't etymology.
      .replace(/<table[\s\S]*?<\/table>/g, "")
      .replace(/<img[^>]*>/g, "")
      .replace(/<sup[^>]*class="[^"]*reference[^"]*"[\s\S]*?<\/sup>/g, "")
      .replace(/<span class="mw-editsection[\s\S]*?<\/span>\s*<\/span>/g, "")
      .replace(/<(?:br|\/p|\/li|\/dd|\/dt|\/div)\s*\/?>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
        String.fromCodePoint(parseInt(n, 16)),
      )
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{2,}/g, "\n")
      .trim()
  );
}

/** The Japanese section's Etymology blocks, from one rendered page. Wiktionary
 *  renders each heading as `<div class="mw-heading mw-headingN">`; an etymology's
 *  body ends at the next heading of any level (Pronunciation, Noun, Etymology 2). */
export function japaneseEtymologies(term, html) {
  const headings = [
    ...html.matchAll(/<div class="mw-heading mw-heading(\d)">[\s\S]*?<\/div>/g),
  ];
  const idOf = (h) => /id="([^"]+)"/.exec(h[0])?.[1] ?? "";
  const start = headings.findIndex(
    (h) => h[1] === "2" && idOf(h) === "Japanese",
  );
  if (start === -1) throw new Error(`${term}: no Japanese section`);
  const result = [];
  for (let i = start + 1; i < headings.length && headings[i][1] !== "2"; i++) {
    const h = headings[i];
    const id = idOf(h);
    if (h[1] !== "3" || !/^Etymology/.test(id)) continue;
    const from = h.index + h[0].length;
    const to = headings[i + 1]?.index ?? html.length;
    result.push({
      heading: id.replace(/_/g, " "),
      text: htmlToText(html.slice(from, to)),
    });
  }
  return result;
}

/** One request per word: the rendered page (pinned `oldid`, or the current
 *  revision for a new term) plus the revision id it came from. */
async function fetchPage(term, pinnedRevid) {
  const { parse } = await api({
    action: "parse",
    prop: "text|revid",
    disablelimitreport: "1",
    ...(pinnedRevid ? { oldid: String(pinnedRevid) } : { page: term }),
  });
  return {
    revid: parse.revid,
    etymologies: japaneseEtymologies(term, parse.text),
  };
}

const existing = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, "utf8"))
  : { entries: {} };
const terms = [
  ...new Set([
    ...Object.keys(existing.entries ?? {}),
    ...entryTerms(),
    ...(flagValue("--terms") ?? "").split(",").filter(Boolean),
  ]),
];
if (terms.length === 0)
  throw new Error(
    "No terms: add data/words/*.json entries or pass --terms a,b,c",
  );

const entries = {};
for (const term of terms.sort()) {
  const pinned = refresh.has(term)
    ? undefined
    : existing.entries?.[term]?.revid;
  const { revid, etymologies } = await fetchPage(term, pinned);
  entries[term] = {
    revid,
    url: `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(term)}&oldid=${revid}`,
    etymologies,
  };
  console.log(
    `${term}: rev ${revid}, ${etymologies.length} etymology section(s)${pinned ? "" : " (new pin)"}`,
  );
}

const snapshot = {
  meta: {
    source:
      "English Wiktionary (https://en.wiktionary.org), Japanese Etymology sections, pinned per revision id",
    license: "CC BY-SA 4.0 — https://creativecommons.org/licenses/by-sa/4.0/",
    note: "Generated by `pnpm data:etymology` — never edit by hand. Quotes in data/words/*.json are checked against `etymologies[].text`.",
  },
  entries,
};
writeFileSync(OUT, JSON.stringify(snapshot, null, 1) + "\n");
console.log(`Wrote ${OUT}`);
