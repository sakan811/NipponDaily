/**
 * Pure helpers that judge a pool word against the committed JMdict evidence
 * (data/reference/<level>-reference.json) by one set of rules — is its reading
 * attested, is its meaning backed by that reading's glosses, what are its
 * part-of-speech tags, which words are homophones or transitive/intransitive
 * pairs. test/content/reading-attested.test.ts gates on readingIsAttested.
 *
 * Everything here is deterministic and offline. None of it *proves* a word
 * right — test/content/ is the gate — it finds the words an author should
 * look at twice, which is far cheaper than discovering a wrong reading or
 * gloss in review.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { meaningWords } from "../../shared/meanings.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, "..", "..");

export const LEVELS = ["N5", "N4", "N3", "N2", "N1"];

export function loadReference(level) {
  return JSON.parse(
    readFileSync(
      join(ROOT, "data", "reference", `${level.toLowerCase()}-reference.json`),
      "utf-8",
    ),
  );
}

/** Katakana -> hiragana, so a reading compares equal however it was written. */
export const toHiragana = (s) =>
  s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

/** Drops the ～/〜 affix markers and whitespace the word lists put around
 *  prefixes/suffixes/counters. */
export const stripAffix = (s) => s.replace(/[～〜~\s]/g, "");

/** The source lists write suru-nouns as "べんきょう (する)" / "運動する", and
 *  a few adverbs with a trailing と/に that JMdict's headword omits. These
 *  are the candidate readings to look for in JMdict for a listed kana. */
export function readingCandidates(kana) {
  const bare = toHiragana(stripAffix(kana.replace(/\(.*?\)|（.*?）/g, "")));
  const out = new Set([bare]);
  for (const tail of ["する", "と", "に"]) {
    if (bare.endsWith(tail) && bare.length > tail.length) {
      out.add(bare.slice(0, -tail.length));
    }
  }
  return [...out];
}

/** Every reading JMdict attests for the entries matched to this word. */
export function attestedReadings(vocab) {
  return new Set(
    vocab.jmdict.flatMap((e) => e.readings.map((r) => toHiragana(r))),
  );
}

/** True when the word's kana is one JMdict actually gives (or the word has no
 *  JMdict entry at all, which the reference's own unresolved list covers). */
export function readingIsAttested(vocab) {
  if (vocab.jmdict.length === 0) return true;
  const attested = attestedReadings(vocab);
  return readingCandidates(vocab.kana).some((c) => attested.has(c));
}

export function glossesOf(vocab) {
  return vocab.jmdict.flatMap((e) => e.senses.flatMap((s) => s.glosses));
}

/** Crude English stemmer — only ever used to decide whether two glosses talk
 *  about the same thing ("honesty"/"honest", "preparation"/"prepare"), never
 *  to display anything. Deliberately looser than shared/meanings.ts's
 *  meaningsOverlap(), which decides game-distractor collisions and must stay
 *  strict. */
function loosely(a, b) {
  if (a === b) return true;
  const n = Math.min(a.length, b.length);
  if (n < 5) return false;
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i >= 5 && i / n >= 0.75;
}

/** True when two English glosses share a content word, allowing inflection
 *  and derivation ("to hesitate" ~ "to be hesitant"). */
export function glossesAgree(a, b) {
  const wa = [...meaningWords(a)];
  const wb = [...meaningWords(b)];
  return wa.some((x) => wb.some((y) => loosely(x, y)));
}

/** A served meaning that is a usage note about another word ("-- honorific
 *  expression for する --", "(hon.) to be") rather than a gloss. It can't be
 *  compared to JMdict's English glosses, so it is reported apart, not as
 *  unsupported. */
const isUsageNote = (sense) =>
  /^--|^\(hon|^\(hum|honorific|humble|extra-modest|polite (?:verb|form)/i.test(
    sense,
  );

/** JMdict entries attesting the word's own reading. Judging the meaning
 *  against these only — not every entry sharing the written form — is what
 *  catches a source-list row whose kana and gloss belong to different words
 *  (盛り read さかり "peak" carrying もり's "helping, serving"). Falls back to
 *  every matched entry when none attests the reading. */
export function entriesForReading(vocab) {
  const wanted = readingCandidates(vocab.kana);
  const own = vocab.jmdict.filter((e) =>
    e.readings.some((r) => wanted.includes(toHiragana(r))),
  );
  return own.length > 0 ? own : vocab.jmdict;
}

/**
 * How well a served meaning is backed by JMdict's glosses for that word.
 *  - "backed":      every `;`-sense of the meaning agrees with some gloss
 *  - "partial":     some senses agree, some don't (returns the ones that don't)
 *  - "unsupported": no sense agrees with any gloss — the highest-priority
 *                   review flag (a synonym gloss, a wrong-entry match in the
 *                   evidence, or a genuinely wrong meaning)
 *  - "usage-note":  the meaning is a note about another word, not a gloss
 *  - "no-evidence": the word has no JMdict entry to compare against
 */
export function meaningSupport(vocab) {
  const glosses = entriesForReading(vocab).flatMap((e) =>
    e.senses.flatMap((s) => s.glosses),
  );
  if (glosses.length === 0) return { status: "no-evidence", unbacked: [] };
  const all = glosses.join("; ");
  const senses = vocab.meaning
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  if (senses.length > 0 && senses.every(isUsageNote)) {
    return { status: "usage-note", unbacked: [] };
  }
  const unbacked = senses
    .filter((s) => !isUsageNote(s))
    .filter(
      (s) => !glosses.some((g) => glossesAgree(s, g)) && !glossesAgree(s, all),
    );
  if (unbacked.length === 0) return { status: "backed", unbacked };
  return {
    status: unbacked.length === senses.length ? "unsupported" : "partial",
    unbacked,
  };
}

/** JMdict's long POS labels -> the short tags an author actually reasons
 *  about (transitivity, conjugation class, adjective type). */
const POS_TAGS = [
  [/godan verb/i, "v5"],
  [/ichidan verb/i, "v1"],
  [/suru verb|aux\.? verb suru|takes the aux\. verb suru/i, "suru"],
  [/kuru verb/i, "vk"],
  [/\btransitive verb/i, "vt"],
  [/intransitive verb/i, "vi"],
  [/adjective \(keiyoushi\)/i, "adj-i"],
  [/adjectival noun|keiyodoshi|keiyōdōshi/i, "adj-na"],
  [/pre-noun adjectival|rentaishi/i, "adj-pn"],
  [/adverb/i, "adv"],
  [/counter/i, "ctr"],
  [/prefix/i, "pref"],
  [/suffix/i, "suf"],
  [/conjunction/i, "conj"],
  [/interjection/i, "int"],
  [/expression/i, "exp"],
  [/particle/i, "prt"],
  [/pronoun/i, "pron"],
  [/numeric/i, "num"],
  [/noun/i, "n"],
];

/** Short POS tags for a word's *first* JMdict sense group, in a stable order
 *  ("v1 vt", "adj-na", "n suru"). Only the first sense: it's the one the
 *  site's own classifyPartOfSpeech() reads, so what's shown here is what the
 *  word's bucket was decided from. */
export function posTags(vocab) {
  const labels = vocab.jmdict[0]?.senses?.[0]?.pos ?? [];
  const tags = [];
  for (const label of labels) {
    // First match per label: "adjectival noun" must read adj-na, not also n.
    const hit = POS_TAGS.find(([re]) => re.test(label));
    if (hit && !tags.includes(hit[1])) tags.push(hit[1]);
  }
  return tags;
}

export function isVerb(tags) {
  return tags.some((t) => t === "v1" || t === "v5" || t === "vk");
}

/** Words that share a spoken reading but are written differently — the raw
 *  material for a "homophones" cluster (N3's opens with one) and the single
 *  most common source of a lesson attaching the wrong kanji to a meaning. */
export function homophoneGroups(vocab) {
  const byKana = new Map();
  for (const v of vocab) {
    const key = readingCandidates(v.kana)[0];
    if (!key || [...key].length < 2) continue;
    if (!byKana.has(key)) byKana.set(key, []);
    byKana.get(key).push(v);
  }
  return [...byKana.entries()]
    .map(([kana, words]) => [kana, words.filter((w) => /[一-鿿]/.test(w.term))])
    .filter(([, words]) => new Set(words.map((w) => w.term)).size >= 2)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

/** The first CJK ideograph in a term, or "" for a kana-only word. */
export function firstKanji(term) {
  return term.match(/[一-鿿]/)?.[0] ?? "";
}

/**
 * Candidate transitive/intransitive verb pairs: same leading kanji, one vt and
 * one vi, and readings that share at least their first kana (開ける/開く,
 * 始める/始まる). A *candidate* — JMdict tags each verb's transitivity, but
 * whether two verbs are a teachable pair is the author's call; this just
 * makes sure they see it, and gives them the tags to write the pair note from.
 */
export function transitivityPairs(vocab) {
  const verbs = vocab
    .map((v) => ({ v, tags: posTags(v) }))
    .filter(({ v, tags }) => isVerb(tags) && firstKanji(v.term));
  const byKanji = new Map();
  for (const item of verbs) {
    const k = firstKanji(item.v.term);
    if (!byKanji.has(k)) byKanji.set(k, []);
    byKanji.get(k).push(item);
  }
  const pairs = [];
  for (const items of byKanji.values()) {
    const vts = items.filter((i) => i.tags.includes("vt"));
    const vis = items.filter((i) => i.tags.includes("vi"));
    for (const t of vts) {
      for (const i of vis) {
        if (t.v.id === i.v.id) continue;
        const a = toHiragana(t.v.kana);
        const b = toHiragana(i.v.kana);
        let n = 0;
        while (n < Math.min(a.length, b.length) && a[n] === b[n]) n++;
        if (n >= 1) pairs.push([t.v, i.v]);
      }
    }
  }
  return pairs;
}

/** One line of everything an author needs to know about a word. */
export function describeWord(v) {
  const tags = posTags(v);
  const support = meaningSupport(v);
  const notes = [];
  if (!readingIsAttested(v)) {
    notes.push(
      `reading not in JMdict (${[...attestedReadings(v)].slice(0, 3).join("/")})`,
    );
  }
  if (support.status === "unsupported") notes.push("meaning ≠ JMdict");
  else if (support.status === "partial") {
    notes.push(`unbacked sense: ${support.unbacked.join("; ")}`);
  }
  if (support.status !== "backed" && support.status !== "no-evidence") {
    const gl = v.jmdict
      .flatMap((e) =>
        e.senses.slice(0, 2).flatMap((s) => s.glosses.slice(0, 3)),
      )
      .slice(0, 5)
      .join(" | ");
    notes.push(`JMdict: ${gl}`);
  }
  const extraSenses = v.jmdict.reduce((n, e) => n + e.senses.length, 0);
  if (v.jmdict.length > 1) notes.push(`${v.jmdict.length} JMdict entries`);
  return { tags, support, notes, senses: extraSenses };
}
