/**
 * Builds data/reference/etymology-reference.json (`pnpm data:etymology`).
 *
 * Every daily word quotes its origin from English Wiktionary's Japanese
 * Etymology section (the entries under data/words/ are generated from this
 * snapshot — see scripts/lib/word-entry.mjs). Nothing in JMdict/KANJIDIC2
 * backs those claims, so this snapshot is the committed evidence, and
 * test/content/words.test.ts checks every quote against it.
 *
 * Deterministic: every page is pinned to a Wiktionary revision id. A term that
 * already has a pin keeps its stored text untouched (same input, same output);
 * a term with no pin yet is fetched at its current revision and the id
 * recorded. Bump a pin deliberately with `--refresh <term>`.
 *
 * Each Etymology section also records the reading(s) the page's own `ja-pron`
 * and headword templates declare for it (`readings`), so an entry can quote
 * only the section for its own reading — a page like 大人 has one section for
 * each of おとな, うし, たいじん and だいにん. Pins that predate this get their
 * readings from the pinned revision's wikitext, fetched in batches.
 *
 * Terms are every entry's `term` in data/words/*.json, every term already
 * pinned in the snapshot, plus an optional `--terms a,b,c` for bootstrapping a
 * new batch before its entries exist. `--prune` drops pins nothing uses.
 *
 * Wiktionary text is CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/);
 * the snapshot keeps each page's permalink so the attribution stays traceable.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  japaneseEtymologyWikitexts,
  readingsOf,
} from "./lib/wiktionary-readings.mjs";

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

/** Apply a removal until it stops matching. A single `replace` pass can leave a
 *  fresh match behind (`<scr<script></script>ipt>` collapses to `<script>`), so
 *  a multi-character pattern is only safely gone once a pass changes nothing. */
function removeAll(text, pattern, replacement = "") {
  let previous;
  do {
    previous = text;
    text = text.replace(pattern, replacement);
  } while (text !== previous);
  return text;
}

/** Rendered Wiktionary HTML → the plain sentence text a reader would see. */
export function htmlToText(html) {
  let text = html;
  for (const [pattern, replacement] of [
    [/<style[\s\S]*?<\/style>/g, ""],
    // The "Kanji in this term" boxes and other layout tables aren't etymology.
    [/<table[\s\S]*?<\/table>/g, ""],
    [/<img[^>]*>/g, ""],
    [/<sup[^>]*class="[^"]*reference[^"]*"[\s\S]*?<\/sup>/g, ""],
    [/<span class="mw-editsection[\s\S]*?<\/span>\s*<\/span>/g, ""],
    [/<(?:br|\/p|\/li|\/dd|\/dt|\/div)\s*\/?>/g, "\n"],
    [/<[^>]+>/g, ""],
  ]) {
    text = removeAll(text, pattern, replacement);
  }
  // The output is plain text, never re-parsed as HTML, so entities are decoded
  // only after every tag is gone.
  return text
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
    .trim();
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

/** One request per word: the rendered page at its current revision, plus the
 *  revision id it came from. The wikitext
 *  rides along so each Etymology section can be tied to the reading(s) the
 *  page's own `ja-pron`/headword templates declare for it. */
async function fetchPage(term) {
  const { parse } = await api({
    action: "parse",
    prop: "text|revid|wikitext",
    disablelimitreport: "1",
    page: term,
  });
  const etymologies = japaneseEtymologies(term, parse.text);
  const sections = japaneseEtymologyWikitexts(parse.wikitext);
  if (sections.length !== etymologies.length)
    throw new Error(
      `${term}: ${etymologies.length} rendered Etymology sections but ${sections.length} in the wikitext`,
    );
  return {
    revid: parse.revid,
    etymologies: etymologies.map((e, i) => ({
      ...e,
      readings: readingsOf(sections[i]),
    })),
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

/** The wikitext of already-pinned revisions, many per request: the pinned
 *  text is kept as it is, and only each section's reading is read from here. */
async function fetchWikitexts(revids) {
  const out = new Map();
  for (let i = 0; i < revids.length; i += 20) {
    const json = await api({
      action: "query",
      prop: "revisions",
      rvprop: "ids|content",
      rvslots: "main",
      revids: revids.slice(i, i + 20).join("|"),
    });
    for (const page of json.query?.pages ?? [])
      for (const rev of page.revisions ?? [])
        out.set(rev.revid, rev.slots.main.content);
  }
  return out;
}

const isPinned = (term) =>
  !refresh.has(term) && Boolean(existing.entries?.[term]?.etymologies);
const missingReadings = (term) =>
  existing.entries[term].etymologies.some((e) => !("readings" in e));
const wikitexts = await fetchWikitexts(
  terms
    .filter((t) => isPinned(t) && missingReadings(t))
    .map((t) => existing.entries[t].revid),
);

// `--prune` drops pins that no entry and no `--terms` still uses (a word that
// left the catalogue); without it pins are kept, so a batch can be pinned
// before its entries exist.
if (args.includes("--prune")) {
  const keep = new Set([
    ...entryTerms(),
    ...(flagValue("--terms") ?? "").split(",").filter(Boolean),
  ]);
  for (let i = terms.length - 1; i >= 0; i--)
    if (!keep.has(terms[i])) terms.splice(i, 1);
}

const entries = {};
for (const term of terms.sort()) {
  let revid;
  let etymologies;
  if (isPinned(term)) {
    // Same revision, same text: nothing to re-fetch. Fill in the readings
    // of the sections if this pin predates them.
    ({ revid, etymologies } = existing.entries[term]);
    if (missingReadings(term)) {
      const sections = japaneseEtymologyWikitexts(wikitexts.get(revid) ?? "");
      if (sections.length !== etymologies.length)
        throw new Error(
          `${term}: ${etymologies.length} pinned Etymology sections but ${sections.length} in revision ${revid}'s wikitext`,
        );
      etymologies = etymologies.map((e, i) => ({
        ...e,
        readings: readingsOf(sections[i]),
      }));
    }
  } else {
    ({ revid, etymologies } = await fetchPage(term));
  }
  entries[term] = {
    revid,
    url: `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(term)}&oldid=${revid}`,
    etymologies,
  };
  console.log(
    `${term}: rev ${revid}, ${etymologies.length} etymology section(s)${isPinned(term) ? "" : " (new pin)"}`,
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
