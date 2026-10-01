/**
 * Builds one daily-word entry from SOURCES ONLY — no model-written text.
 *
 *   pool record (kana, meaning, level)   ← data/reference/n*-reference.json
 *   part of speech                       ← the same file's JMdict senses, tags verbatim
 *   stratum / on-kun analysis            ← KANJIDIC2 readings in that file
 *   evidence (`sources`)                 ← the pinned Wiktionary section for THIS reading, line by line
 *   morphemes                            ← parsed from that evidence ("A (a, “gloss”) + B (b, “gloss”)"),
 *                                          kept only if the parts literally spell the word and join to its reading
 *   processes                            ← tags found by keyword in that evidence
 *
 * The only hand-written field is the headline (data/word-plan/*.json). Pure
 * functions: scripts/generate-word-entries.mjs does the I/O, and
 * test/content/word-generation.test.ts regenerates everything in CI and
 * fails if a committed entry differs, so a derived field can't be edited by
 * hand or drift from its source.
 */
import { toHiragana } from "wanakana";
import { meaningWords } from "../../shared/meanings.ts";

const KANA = "\\p{sc=Hiragana}\\p{sc=Katakana}ー";
const JP = `\\p{sc=Han}々${KANA}`;
const NOISE_LINE =
  /^(?:(?:English|Japanese)\s+Wikipedia(?:\s+ja)?(?:\s+has an article on:.*)?|Wikipedia(?:\s+ja)?|.*\bon Japanese Wikipedia|.*\bon Wikipedia)$/;
const HIRA = /^[\p{sc=Hiragana}ー]+$/u;

/** Collapse the invisible direction marks Wiktionary puts around "+". */
export const clean = (s) =>
  s
    .replace(/[‎‏]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();

// ---------------------------------------------------------------- evidence

const KATAKANA_WORD = /^[\p{sc=Katakana}ー]+$/u;

/** Does a section's declared reading cover this word's? Verb and adjective
 *  headword templates give only the stem (せお for せおう), so a reading that
 *  is the word minus up to two final kana counts. */
function covers(declared, hira) {
  return declared.some(
    (r) =>
      r === hira ||
      (r.length >= 2 && hira.startsWith(r) && hira.length - r.length <= 2),
  );
}

// Curly quotes Wiktionary wraps glosses in ("“eye”") so a meaning word like
// bread never matches the literal token "bread”" unless they're stripped first.
const CURLY_QUOTES = /[‘’“”]/g;

/** True when a meaning word and a word from the Etymology text are plausibly
 *  the same word — exact, or one contains the other (so "porter" still finds
 *  "bellboy"'s "boy", and "boy" still finds "bellboy"). Deliberately looser
 *  than shared/meanings.ts's meaningsOverlap(), which is strict about full
 *  glosses; this only has to rule out an unrelated homograph ("gram" / "glam",
 *  "bread" / "pan"), not prove equivalence. */
function sharesWord(meaning, text) {
  const metaWords = meaningWords(meaning);
  const textWords = meaningWords(text.replace(CURLY_QUOTES, ""));
  for (const w of metaWords)
    for (const t of textWords)
      if (
        w === t ||
        (w.length >= 3 && t.length >= 3 && (w.includes(t) || t.includes(w)))
      )
        return true;
  return false;
}

/** The Etymology section(s) that belong to this word's reading. A page with
 *  several readings (大人 → おとな / うし / たいじん / だいにん) has one section
 *  per reading; quoting another reading's section would misattribute it.
 *  Katakana loanword pages usually declare no reading at all. Most of the
 *  time their sections are alternative etymologies of the one spelling
 *  (ガラス / グラス, "glass"), so all of them apply — but a few are true
 *  homographs with unrelated senses sharing a spelling (パン "bread" vs. a
 *  stray "borrowed from English pan" section that isn't about bread at all),
 *  caught by checking each section against the word's own pool meaning. */
export function pickSections(snapshotEntry, kana, term = kana, meaning) {
  const sections = snapshotEntry?.etymologies ?? [];
  if (sections.length === 0) throw new Error("no Etymology section pinned");
  const hira = toHiragana(kana);
  const katakana = KATAKANA_WORD.test(term);
  if (sections.length === 1) {
    const only = sections[0];
    if (!katakana && only.readings?.length && !covers(only.readings, hira))
      throw new Error(
        `its only section is for ${only.readings.join("/")}, not ${kana}`,
      );
    return sections;
  }
  const matched = sections.filter((x) => covers(x.readings ?? [], hira));
  if (matched.length > 0) return matched;
  if (katakana && sections.every((x) => !x.readings?.length)) {
    if (meaning) {
      const bySense = sections.filter((x) => sharesWord(meaning, x.text));
      if (bySense.length > 0) return bySense;
    }
    return sections;
  }
  throw new Error(
    `${sections.length} sections, none for ${kana} (they cover ${sections
      .map((x) => x.readings?.join("/") || "?")
      .join(", ")})`,
  );
}

/** One quote per line of the matched section(s): Wiktionary's own words,
 *  minus page furniture (Wikipedia links, loanword family-tree dumps). */
export function evidenceLines(sections) {
  const lines = [];
  for (const sec of sections) {
    let rows = sec.text.split("\n").map(clean).filter(Boolean);
    if (/^Etymology tree/.test(rows[0] ?? "")) {
      const end = rows.findIndex((r) => /^Japanese\s/.test(r));
      rows = end === -1 ? [] : rows.slice(end + 1);
    }
    for (const r of rows)
      if (!NOISE_LINE.test(r) && !lines.includes(r)) lines.push(r);
  }
  return lines;
}

// ------------------------------------------------------------- part of speech

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9'’ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** JMdict's own tags for the sense(s) the pool's meaning came from, verbatim. */
export function posOf(vocab) {
  const hira = toHiragana(vocab.kana);
  const entries = (vocab.jmdict ?? []).filter(
    (j) =>
      j.readings.some((r) => toHiragana(r) === hira) &&
      (j.kanji.includes(vocab.term) || toHiragana(vocab.term) === hira),
  );
  const pool = new Set(vocab.meaning.split(/[,;]/).map(norm).filter(Boolean));
  for (const e of entries) {
    const hit = e.senses.filter((s) =>
      (s.glosses ?? []).some((g) => pool.has(norm(g))),
    );
    if (hit.length) return [...new Set(hit.flatMap((s) => s.pos))];
  }
  return entries[0] ? [...new Set(entries[0].senses[0]?.pos ?? [])] : [];
}

// ------------------------------------------------------------------ morphemes

const MACRON = {
  ā: ["aa"],
  ī: ["ii"],
  ū: ["uu"],
  ē: ["ei", "ee"],
  ō: ["ou", "oo"],
};

function romajiVariants(romaji) {
  let out = [romaji.toLowerCase().replace(/[-\s]/g, "")];
  for (const [m, subs] of Object.entries(MACRON)) {
    if (!out.some((r) => r.includes(m))) continue;
    out = out.flatMap((r) =>
      r.includes(m) ? subs.map((s) => r.replace(m, s)) : [r],
    );
  }
  return out
    .flatMap((r) => (/[āīūēō]/.test(r) ? [] : [toHiragana(r)]))
    .filter((k) => HIRA.test(k));
}

/** Walk a balanced "( … )" starting at `i` (which must be "("); returns the
 *  index just past the matching ")" and the inner text. */
function group(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "(") depth++;
    else if (s[j] === ")" && --depth === 0)
      return { end: j + 1, inner: s.slice(i + 1, j) };
  }
  return null;
}

function topLevelSplit(s) {
  const out = [];
  let depth = 0;
  let quoted = false;
  let cur = "";
  for (const ch of s) {
    if (ch === "“") quoted = true;
    else if (ch === "”") quoted = false;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0 && !quoted) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** "(hana, “flower”)" / "(-shii, adjectivizing suffix)" → { romaji, gloss }. */
function parseGroup(inner) {
  const segs = topLevelSplit(inner);
  const romaji = (segs[0] ?? "").replace(/^[-‑]+|[-‑]+$/g, "");
  let gloss;
  // "(mae, front)": with only two segments a lone plain word is the gloss;
  // with more, it is an alternative romanisation ("kano, ano, “that”").
  if (segs.length === 2 && /^[A-Za-z][A-Za-z' -]*$/.test(segs[1])) {
    return { romaji, gloss: segs[1] };
  }
  for (const seg of segs.slice(1)) {
    const q = /^“([^”]+)”/.exec(seg);
    if (q) {
      gloss = q[1];
      break;
    }
    if (
      /\s/.test(seg) &&
      /^[A-Za-z][A-Za-z' -]+$/.test(seg) &&
      !/^the /i.test(seg)
    ) {
      gloss = seg;
      break;
    }
  }
  return { romaji, gloss };
}

/** The Japanese token starting at s[i] with ruby: 上(あ)がり → text 上がり, reading あがり. */
function token(s, i) {
  const re = new RegExp(
    `^((?:[\\p{sc=Han}々](?:\\([${KANA}]+\\))?|[${KANA}])+)`,
    "u",
  );
  const m = re.exec(s.slice(i));
  if (!m) return null;
  const raw = m[1];
  const text = raw.replace(new RegExp(`\\([${KANA}]+\\)`, "gu"), "");
  const hasRuby = raw !== text;
  const reading = hasRuby
    ? toHiragana(
        raw.replace(
          new RegExp(`[\\p{sc=Han}々]\\(([${KANA}]+)\\)`, "gu"),
          "$1",
        ),
      )
    : null;
  return {
    raw,
    text,
    ruby: reading && HIRA.test(reading) ? reading : null,
    end: i + raw.length,
  };
}

/** Every "A (a, “gloss”) + B (b, “gloss”) …" chain in a line. */
export function chains(line) {
  const out = [];
  for (let i = 0; i < line.length; i++) {
    if (!new RegExp(`[${JP}]`, "u").test(line[i])) continue;
    const parts = [];
    let p = i;
    for (;;) {
      const t = token(line, p);
      if (!t) break;
      let q = t.end;
      while (line[q] === " ") q++;
      if (line[q] !== "(") break;
      const g = group(line, q);
      if (!g) break;
      parts.push({ ...t, ...parseGroup(g.inner) });
      // After the gloss, only a "+" continues the chain; commentary ("of the verb …") may sit before it.
      const rest = line.slice(g.end);
      const m = /^[^+]*?\s\+\s/.exec(rest);
      if (!m || /[.;]/.test(m[0].replace(/\([^)]*\)/g, ""))) break;
      p = g.end + m[0].length;
    }
    if (parts.length >= 2) out.push(parts);
    if (parts.length) i = Math.max(i, p);
  }
  return out;
}

const VOICE = {
  か: ["が"],
  き: ["ぎ"],
  く: ["ぐ"],
  け: ["げ"],
  こ: ["ご"],
  さ: ["ざ"],
  し: ["じ"],
  す: ["ず"],
  せ: ["ぜ"],
  そ: ["ぞ"],
  た: ["だ"],
  ち: ["ぢ", "じ"],
  つ: ["づ", "ず"],
  て: ["で"],
  と: ["ど"],
  は: ["ば"],
  ひ: ["び"],
  ふ: ["ぶ"],
  へ: ["べ"],
  ほ: ["ぼ"],
};

/** Choose one reading per part so they join to `kana`, allowing rendaku
 *  (first kana of a later part voiced). Returns [{reading, base?}] or null. */
function joinParts(readingSets, kana) {
  const go = (i, pos) => {
    if (i === readingSets.length) return pos === kana.length ? [] : null;
    for (const r of readingSets[i]) {
      if (kana.startsWith(r, pos)) {
        const tail = go(i + 1, pos + r.length);
        if (tail) return [{ reading: r }, ...tail];
      }
      if (i > 0) {
        for (const v of VOICE[r[0]] ?? []) {
          const voiced = v + r.slice(1);
          if (kana.startsWith(voiced, pos)) {
            const tail = go(i + 1, pos + voiced.length);
            if (tail) return [{ reading: voiced, base: r }, ...tail];
          }
        }
      }
    }
    return null;
  };
  return go(0, 0);
}

/** Morphemes parsed from the evidence — only when the parts literally spell
 *  the word and their readings join to its reading. Otherwise none (the
 *  page then says no clean breakdown could be read from the source). */
export function parseMorphemes(lines, term, kana) {
  const target = toHiragana(kana);
  for (const line of lines) {
    for (const parts of chains(line)) {
      if (parts.some((p) => !p.gloss)) continue;
      const sets = parts.map((p) =>
        p.ruby ? [p.ruby] : [...new Set(romajiVariants(p.romaji))],
      );
      if (sets.some((s) => s.length === 0)) continue;
      const joined = joinParts(sets, target);
      if (!joined) continue;
      // The parts must spell the word. Sources write the honorific as 御
      // (o-), and a word may write a kanji part in kana (基づく for 基 + 付く):
      // each part matches either its own text or its reading.
      const spelled = [];
      let at = 0;
      for (let i = 0; i < parts.length; i++) {
        const options = [
          parts[i].text,
          ...(parts[i].text === "御" ? ["お"] : []),
          joined[i].reading,
        ];
        const hit = options.find((o) => term.startsWith(o, at));
        if (!hit) break;
        spelled.push(
          hit === parts[i].text || hit === "お" ? hit : parts[i].text,
        );
        at += hit.length;
      }
      if (spelled.length !== parts.length || at !== term.length) continue;
      return parts.map((p, i) => ({
        text: spelled[i],
        reading: joined[i].reading,
        ...(joined[i].base ? { base: joined[i].base } : {}),
        meaning: p.gloss,
      }));
    }
  }
  return [];
}

const LOAN =
  /(?:[Bb]orrow(?:ed|ing)|[Ff]rom|[Dd]erived? from)\s+(?:(?:American|British)\s+)?(English|Dutch|Portuguese|German|French|Italian|Spanish|Russian)\s+([A-Za-zÀ-ÿ'’-]+(?: (?!or\b|and\b|via\b|also\b|with\b)[A-Za-zÀ-ÿ'’-]+)?)/;

/** A katakana loanword's single morpheme, only when the source names exactly
 *  one language+word with no hedge ("or", "possibly", "via", …). */
export function parseLoan(lines, term) {
  if (!/^[\p{sc=Katakana}ー]+$/u.test(term)) return [];
  const found = new Set();
  for (const line of lines) {
    if (
      /\b(or|possibly|probably|likely|via|influenced|internationalism|alternatively)\b/i.test(
        line,
      )
    )
      return [];
    const m = LOAN.exec(line);
    if (m) found.add(`${m[1]} ${m[2].replace(/[.,;]$/, "")}`);
  }
  if (found.size !== 1) return [];
  return [{ text: term, reading: term, meaning: [...found][0] }];
}

// ----------------------------------------------------------------- processes

const has = (re, text) => re.test(text);

export function processesOf(text, morphemes) {
  const p = [];
  const add = (cond, id) => cond && p.push(id);
  add(morphemes.length >= 2 || has(/\bcompound\b/i, text), "compound");
  add(
    has(
      /\b(suffix|prefix|derivation|reduplication|nominali[sz]ation|stem of|adjectivi[sz]ing)\b/i,
      text,
    ),
    "derivation",
  );
  add(morphemes.some((m) => m.base) || has(/rendaku/i, text), "rendaku");
  add(
    has(
      /\b(coined in (Japan|Japanese)|Japanese coinage|wasei|calque)\b/i,
      text,
    ),
    "wasei",
  );
  add(
    has(
      /\b(borrow(?:ed|ing)?|from (?:Middle )?Chinese|from (?:American |British )?(?:English|Dutch|Portuguese|German|French|Italian|Spanish|Russian)|internationalism)\b/i,
      text,
    ),
    "borrowing",
  );
  add(has(/\b(clipping|clipped|shortening|abbreviation)\b/i, text), "clipping");
  add(
    has(
      /(sound (change|shift)|\bshift(ed)? (from|in)\b|contraction|alteration|tensening|assimilation|→)/i,
      text,
    ),
    "sound-change",
  );
  add(
    has(
      /(semantic shift|sense shift|meaning (shifted|narrowed|underwent|has changed)|repurposed)/i,
      text,
    ),
    "meaning-shift",
  );
  add(has(/\b(ateji|jukujikun)\b/i, text), "ateji");
  add(has(/(sinicization|re-?read|later read with)/i, text), "reread");
  add(
    has(
      /\b(unknown|uncertain|unclear|missing or incomplete|incomplete)\b/i,
      text,
    ),
    "unclear",
  );
  return p;
}

// -------------------------------------------------------------------- stratum

const toKatakanaless = (s) => toHiragana(s);
const RENYO = {
  う: "い",
  く: "き",
  ぐ: "ぎ",
  す: "し",
  つ: "ち",
  ぬ: "に",
  ぶ: "び",
  む: "み",
  る: "り",
};

/** KANJIDIC2 reading variants for one kanji: [{r, type, base?}] with rendaku
 *  and sokuon forms (`base` is the dictionary form they came from), type
 *  "on" | "kun". */
function readingVariants(k) {
  const out = [];
  const push = (r, type) => {
    if (!r) return;
    out.push({ r, type });
    for (const v of VOICE[r[0]] ?? [])
      out.push({ r: v + r.slice(1), type, base: r });
    if (/[ちつきく]$/.test(r))
      out.push({ r: r.slice(0, -1) + "っ", type, base: r });
  };
  for (const on of k.on) push(toKatakanaless(on), "on");
  for (const kun of k.kun) {
    const [stem, okuri = ""] = kun.replace(/-/g, "").split(".");
    push(stem, "kun");
    // With the okurigana a spelling may leave out (缶詰 = かん + づめ): the
    // dictionary form, the stem noun (renyōkei) and the ichidan stem.
    if (okuri) {
      push(stem + okuri, "kun");
      const last = okuri.at(-1);
      if (RENYO[last]) push(stem + okuri.slice(0, -1) + RENYO[last], "kun");
      if (okuri.length > 1 && last === "る")
        push(stem + okuri.slice(0, -1), "kun");
    }
  }
  return out;
}

/** Every way KANJIDIC2's readings spell out the word's reading, one kanji at
 *  a time: [[{r, type, base?} | {kana}], …] (kana in the spelling are literal). */
function segmentPaths(term, kana, kanji) {
  const chars = [...term].map((c, i, a) => (c === "々" ? a[i - 1] : c));
  const target = toHiragana(kana);
  const go = (i, j) => {
    if (i === chars.length) return j === target.length ? [[]] : [];
    const c = chars[i];
    if (/\p{sc=Han}/u.test(c)) {
      const k = kanji[c];
      if (!k) return [];
      const out = [];
      for (const v of readingVariants(k)) {
        if (!target.startsWith(v.r, j)) continue;
        for (const tail of go(i + 1, j + v.r.length)) out.push([v, ...tail]);
      }
      return out;
    }
    return toHiragana(c) === target[j]
      ? go(i + 1, j + 1).map((tail) => [{ kana: c }, ...tail])
      : [];
  };
  return go(0, 0);
}

/** Which layers a spelling's own kanji readings allow: a Set of "on"/"kun"
 *  masks, or null if KANJIDIC2 can't account for the reading. */
function segmentationMasks(term, kana, kanji) {
  const masks = new Set(
    segmentPaths(term, kana, kanji).map((path) =>
      path.reduce((m, v) => (v.type ? m | (v.type === "on" ? 1 : 2) : m), 0),
    ),
  );
  return masks.size ? masks : null;
}

/** Literal glosses a source gives a compound — “warm + spring”, or
 *  “deficient, lacking” + “point, spot” — one per character of an all-kanji
 *  word, paired with that character's KANJIDIC2 reading when the reading
 *  splits one way only. The glosses are Wiktionary's own words. */
export function parseLiteral(lines, term, kana, kanji) {
  const chars = [...term];
  if (chars.length < 2 || !chars.every((c) => /\p{sc=Han}/u.test(c))) return [];
  const paths = segmentPaths(term, kana, kanji);
  const distinct = new Set(paths.map((p) => p.map((v) => v.r).join("|")));
  if (distinct.size !== 1) return [];
  for (const line of lines) {
    const found = [
      ...[...line.matchAll(/“([^”]+)”/g)].map((m) => m[1].split(/\s\+\s/)),
      ...[...line.matchAll(/“([^”]+)”\s*\+\s*“([^”]+)”/g)].map((m) => [
        m[1],
        m[2],
      ]),
    ].find((pieces) => pieces.length === chars.length);
    if (!found) continue;
    return paths[0].map((v, i) => ({
      text: chars[i],
      reading: v.r,
      ...(v.base ? { base: v.base } : {}),
      meaning: found[i].trim(),
    }));
  }
  return [];
}

export function stratumOf(term, kana, morphemes, text, kanji) {
  if (/^[\p{sc=Katakana}ー]+$/u.test(term)) return "gairaigo";
  // A spelling that mixes kanji and katakana (消しゴム, ローマ字) mixes layers by construction.
  if (/\p{sc=Katakana}/u.test(term) && /\p{sc=Han}/u.test(term))
    return "hybrid";
  const loan =
    /\b(?:borrow(?:ed|ing)|from)\s+(?:(?:American|British)\s+)?(?:English|Dutch|Portuguese|German|French|Italian|Spanish|Russian)\b/i;
  if (loan.test(text) && !/Middle Chinese|Chinese/.test(text))
    return "gairaigo";
  const masks = segmentationMasks(term, kana, kanji);
  if (masks) {
    const onOnly = masks.has(1);
    const kunOnly = masks.has(0) || masks.has(2);
    if (onOnly && !kunOnly) return "kango";
    if (kunOnly && !onOnly) return "wago";
    if (!onOnly && !kunOnly) return "hybrid";
  }
  if (/\bMiddle Chinese\b/.test(text) && !/Old Japanese/.test(text))
    return "kango";
  if (/\bOld Japanese\b/.test(text) && !/Middle Chinese/.test(text))
    return "wago";
  return null;
}

// ---------------------------------------------------------------------- entry

/** Mark a morpheme irregular when KANJIDIC2 doesn't list its reading — the
 *  content test skips the reading check for those (ateji, archaic forms). */
function flagIrregular(morphemes, kanji) {
  const SINGLE = /^\p{sc=Han}\p{sc=Hiragana}*$/u;
  return morphemes.map((m) => {
    if (!SINGLE.test(m.text)) return m;
    const k = kanji[[...m.text][0]];
    if (!k) return { ...m, irregular: true };
    const r = toHiragana(m.base ?? m.reading);
    const fits =
      k.on.map(toKatakanaless).includes(r) ||
      k.kun
        .map((x) => x.replace(/-/g, "").split(".")[0])
        .filter(Boolean)
        .some((s) => r.startsWith(s));
    return fits ? m : { ...m, irregular: true };
  });
}

/** plan: { date, term, headline }.  ctx: { vocab(term) → [{...ref vocab, level}], kanji, snapshot } */
export function buildEntry(plan, ctx) {
  const candidates = ctx
    .vocab(plan.term)
    .filter((v) => !plan.kana || v.kana === plan.kana);
  if (candidates.length !== 1)
    throw new Error(
      `${plan.term}: ${candidates.length} pool words with that spelling${plan.kana ? ` and reading ${plan.kana}` : " — name the reading as `kana` in the plan"}`,
    );
  const word = candidates[0];
  const snap = ctx.snapshot.entries[plan.term];
  if (!snap) throw new Error(`${plan.term}: no pinned Wiktionary page`);
  const sections = pickSections(snap, word.kana, plan.term, word.meaning);
  const lines = evidenceLines(sections);
  if (lines.length === 0)
    throw new Error(`${plan.term}: matched section has no text`);
  const text = lines.join("\n");

  let morphemes = parseMorphemes(lines, plan.term, word.kana);
  if (morphemes.length === 0)
    morphemes = parseLiteral(lines, plan.term, word.kana, ctx.kanji);
  if (morphemes.length === 0) morphemes = parseLoan(lines, plan.term);
  morphemes = flagIrregular(morphemes, ctx.kanji);

  const stratum = stratumOf(plan.term, word.kana, morphemes, text, ctx.kanji);
  // The layer is only stated when KANJIDIC2 (or the evidence) establishes it;
  // irregular spellings (今年, 田舎) leave it out rather than guess.

  return {
    date: plan.date,
    term: plan.term,
    kana: word.kana,
    meaning: word.meaning,
    level: word.level,
    pos: posOf(word),
    ...(stratum ? { stratum } : {}),
    processes: processesOf(text, morphemes),
    headline: plan.headline,
    morphemes,
    sources: lines.map((quote) => ({ quote })),
    wiktionaryRev: snap.revid,
  };
}
