/**
 * Furigana for an example sentence, kept only where the sources can stand
 * behind it. Pure and deterministic: no model supplies or chooses a reading.
 *
 * Tatoeba's own transcription of the sentence is the main source: every
 * sentence has one, with a reading for each kanji of a word (`[最上|さい|じょう]`).
 * About a third were written by a contributor; the rest were made by
 * Tatoeba's software (MeCab), which Tatoeba itself says sometimes gets a
 * reading wrong. A transcribed run of kanji gets its ruby when
 *  - it is checked: each kanji's piece is a reading KANJIDIC2 gives that kanji
 *    (allowing rendaku and the small tsu), or JMdict gives the whole spelling
 *    that reading; and
 *  - it is trusted: a contributor wrote it, or kuromoji (the IPADIC
 *    dictionary) hears the same reading, or the sources the sentence builder
 *    has always used (below) already agree on it.
 *
 * UniDic (scripts/lib/unidic.mjs) is a second, independent analyser: a
 * different dictionary from kuromoji's IPADIC and from Tatoeba's MeCab, so
 * where it hears a run as the transcription does, that counts as kuromoji's
 * hearing does, and where the sources confirm its reading it can read a run the
 * transcription left bare. Each analyser stands or falls by its own hearing: a
 * reading one of them contradicts is not rescued by the other.
 *
 * Those older sources still decide on their own where the transcription has
 * nothing for a run, and veto it where they disagree. kuromoji picks a reading
 * by statistics and gets some wrong (後 as ご where the sentence means のち,
 * 柵 as しがらみ for さく), so its token's reading counts only when
 *  - Tatoeba's index gives the dictionary word a reading and kuromoji reads
 *    the token the same way; or
 *  - the index is silent and JMdict gives that spelling exactly one reading,
 *    which kuromoji also reads.
 * A run the sources disagree on, one that is not plain kanji, and a reading
 * that would cross the edge of the word's own form (unless the transcription
 * splits it per kanji, so it can be cut there) get no ruby; the sentence keeps
 * its plain text there.
 *
 * The result is a list of parts that, joined, give the sentence back
 * unchanged: `[text]` for plain text, `[kanji, reading]` for kanji with a
 * reading.
 */
import { toHiragana } from "wanakana";

const HAN = "\\p{sc=Han}々";
/** hiragana prefix, a run of kanji, hiragana okurigana */
const SHAPE = new RegExp(
  `^(\\p{sc=Hiragana}*)([${HAN}]+)(\\p{sc=Hiragana}*)$`,
  "u",
);
const KANJI_RUN = new RegExp(`^[${HAN}]+$`, "u");
const KANA = /^[\p{sc=Hiragana}ー]+$/u;

const VOICED = {
  か: "が", き: "ぎ", く: "ぐ", け: "げ", こ: "ご",
  さ: "ざ", し: "じ", す: "ず", せ: "ぜ", そ: "ぞ",
  た: "だ", ち: "ぢ", つ: "づ", て: "で", と: "ど",
  は: "ば", ひ: "び", ふ: "ぶ", へ: "べ", ほ: "ぼ",
}; // prettier-ignore
const SEMI_VOICED = { は: "ぱ", ひ: "ぴ", ふ: "ぷ", へ: "ぺ", ほ: "ぽ" };

/** A reading and the ways compounding changes it: rendaku (かわ → がわ),
 *  the p-sound (ふん → ぷん) and the small tsu (にち → にっ). */
function variants(reading) {
  const out = new Set([reading]);
  const first = reading[0];
  if (VOICED[first]) out.add(VOICED[first] + reading.slice(1));
  if (SEMI_VOICED[first]) out.add(SEMI_VOICED[first] + reading.slice(1));
  for (const v of [...out])
    if (/[ちつくき]$/.test(v)) out.add(`${v.slice(0, -1)}っ`);
  return out;
}

/** A KANJIDIC2 reading as the kana a kanji contributes: `-` marks and the
 *  okurigana after the `.` are not part of it. */
const stem = (r) => toHiragana(r.replace(/-/g, "").split(".")[0]);

/**
 * @param {string} ja the sentence
 * @param {string} form the word's own form in it (食べた), which no reading
 *   may straddle: the page marks it, so a reading that crosses its edge is
 *   cut there when it can be and left plain when it cannot
 * @param {{ surface_form: string, reading?: string, basic_form?: string }[]} tokens
 *   kuromoji's tokens of `ja`
 * @param {{
 *   indexReadings: Map<string, string>,
 *   jmdictReadings: (spelling: string) => string[],
 *   kanjiReadings?: (kanji: string) => string[],
 *   transcription?: { text: string, human: boolean },
 *   unidicTokens?: { surface_form: string, reading?: string, basic_form?: string }[],
 * }} sources
 *   Tatoeba's index readings for this sentence by dictionary word (hiragana),
 *   every reading JMdict gives a spelling, every on and kun reading KANJIDIC2
 *   gives a kanji, Tatoeba's furigana of the sentence (`human`: a
 *   contributor wrote it) and UniDic's tokens of it, in kuromoji's shape
 * @returns {string[][] | undefined} the parts, or undefined when no kanji got a reading
 */
export function furiganaFor(
  ja,
  form,
  tokens,
  {
    indexReadings,
    jmdictReadings,
    kanjiReadings = () => [],
    transcription,
    unidicTokens = [],
  },
) {
  // The tokens are evidence, not the frame: if they do not spell the sentence
  // they say nothing. Each analyser's runs stay apart, so one's reading is
  // never stitched to the other's.
  const attested = attestedBy(indexReadings, jmdictReadings);
  const hearing = (list) =>
    list.map((t) => t.surface_form).join("") === ja
      ? tokenRuns(list, attested)
      : [];
  const voices = [hearing(tokens), hearing(unidicTokens)];

  /** Ruby spans `{ a, b, reading, pieces? }` over `ja`, never overlapping. */
  const spans = [];
  const transcribed = transcription
    ? segmentsOf(transcription.text, ja)
    : undefined;
  /** An analyser hears this segment as the transcription reads it, and the
   *  dictionary does not give the word it heard there another reading. */
  const heardAs = (seg, reading) =>
    voices.some(
      (runs) =>
        runsCovering(runs, seg.a, seg.b, "claimed") === reading &&
        !contradictedIn(runs, seg),
    );

  const segments = transcribed ?? [];
  /** Tatoeba's index, written by people, reads the word the same way. */
  const indexed = (seg) => {
    const reading = seg.pieces.join("");
    for (const [word, said] of indexReadings) {
      if (word === seg.text && said === reading) return true;
      const tail = word.slice(seg.text.length);
      if (
        word.startsWith(seg.text) &&
        /^\p{sc=Hiragana}+$/u.test(tail) &&
        said === reading + tail
      )
        return true;
    }
    return false;
  };
  /** The dictionary gives the word an analyser heard here another reading. */
  const contradictedIn = (runs, seg) =>
    runs.some((r) => r.contradicted && r.a < seg.b && r.b > seg.a);
  const touching = (r) => segments.filter((s) => s.a < r.b && s.b > r.a);
  const verified = new Set(
    voices.flatMap((runs) => runs.filter((r) => r.confirmed !== undefined)),
  );
  const dropped = new Set();
  const supported = new Set();
  for (const run of [...verified]) {
    const segs = touching(run);
    if (!segs.length) continue;
    if (agree(run, segs)) {
      for (const s of segs) if (s.a >= run.a && s.b <= run.b) supported.add(s);
    } else {
      // The transcription and the older sources read these kanji differently.
      // A contributor knew the sentence (何ですか is なん, 三匹 is びき) where
      // kuromoji and the index's headword reading cannot tell, so the
      // contributor's reading stands if it is checked; Tatoeba's software
      // loses to the older sources.
      if (transcription.human) verified.delete(run);
      else for (const s of segs) dropped.add(s);
    }
  }
  for (const seg of segments) {
    if (dropped.has(seg) && !supported.has(seg)) continue;
    const reading = seg.pieces.join("");
    if (
      supported.has(seg) ||
      (checked(seg, jmdictReadings, kanjiReadings) &&
        (transcription.human || indexed(seg) || heardAs(seg, reading)))
    )
      spans.push({ ...seg, reading });
  }
  // Where the transcription gave nothing, the older sources' verified reading stands.
  for (const run of verified)
    if (!spans.some((s) => s.a < run.b && s.b > run.a))
      spans.push({ a: run.a, b: run.b, reading: run.confirmed });

  // A ruby over the edge of the word's form is cut there, or dropped.
  const at = ja.indexOf(form);
  const edges = at < 0 ? [] : [at, at + form.length];
  const cut = [];
  for (const span of spans.sort((x, y) => x.a - y.a)) {
    let pending = [span];
    for (const edge of edges)
      pending = pending.flatMap((s) =>
        edge > s.a && edge < s.b ? split(s, edge) : [s],
      );
    cut.push(...pending);
  }

  const parts = [];
  const push = (text, reading) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (!reading && last && last.length === 1) last[0] += text;
    else parts.push(reading ? [text, reading] : [text]);
  };
  let offset = 0;
  for (const span of cut) {
    push(ja.slice(offset, span.a));
    push(ja.slice(span.a, span.b), span.reading);
    offset = span.b;
  }
  push(ja.slice(offset));
  return parts.some((p) => p.length === 2) ? parts : undefined;
}

/** Cuts a span in two at an offset inside it, which is possible only when the
 *  transcription gave each kanji its own reading; otherwise it gives nothing. */
function split(span, edge) {
  const { a, pieces } = span;
  if (!pieces || pieces.length !== span.b - span.a) return [];
  const left = pieces.slice(0, edge - a);
  const right = pieces.slice(edge - a);
  return [
    { a, b: edge, reading: left.join(""), pieces: left },
    { a: edge, b: span.b, reading: right.join(""), pieces: right },
  ];
}

/** The kanji-run segments of a Tatoeba transcription (`[漢字|か|ん|じ]`), as
 *  `{ a, b, text, pieces }` offsets into the sentence, or undefined when the
 *  transcription does not spell the sentence. Segments that are not all kanji
 *  (a digit with its counter) or lack a kana reading are left out. */
function segmentsOf(text, ja) {
  const segments = [];
  const bracket = /\[([^\]|]+)((?:\|[^\]|]*)*)\]/g;
  let plain = "";
  let last = 0;
  let m;
  while ((m = bracket.exec(text))) {
    plain += text.slice(last, m.index);
    const a = plain.length;
    plain += m[1];
    last = bracket.lastIndex;
    const pieces = m[2].slice(1).split("|").map(toHiragana);
    if (KANJI_RUN.test(m[1]) && pieces.every((p) => KANA.test(p)))
      segments.push({ a, b: plain.length, text: m[1], pieces });
  }
  plain += text.slice(last);
  return plain === ja ? segments : undefined;
}

/** True when each kanji's piece is a reading KANJIDIC2 gives it, or JMdict
 *  gives the whole run of kanji that reading. The pieces are not compared with
 *  the sentence, only with what the kanji can say. */
function checked(seg, jmdictReadings, kanjiReadings) {
  const kanji = [...seg.text];
  const reading = seg.pieces.join("");
  if (kanji.length === seg.pieces.length) {
    const perKanji = kanji.every((k, i) => {
      if (k === "々")
        return variants(seg.pieces[i - 1] ?? "").has(seg.pieces[i]);
      return kanjiReadings(k).some((r) => variants(stem(r)).has(seg.pieces[i]));
    });
    if (perKanji) return true;
  }
  return jmdictReadings(seg.text).map(toHiragana).includes(reading);
}

/** The dictionary reading both sources stand behind, if any. */
function attestedBy(indexReadings, jmdictReadings) {
  return (word) => {
    const indexed = indexReadings.get(word);
    if (indexed) return indexed;
    const all = [...new Set(jmdictReadings(word).map(toHiragana))];
    return all.length === 1 ? all[0] : undefined;
  };
}

/** True when the segments touching a verified run read it the way it was
 *  verified: one segment around it, kanji by kanji where the transcription gives
 *  a piece for each, or segments that tile it exactly. */
function agree(run, segs) {
  if (segs.length === 1) {
    const [seg] = segs;
    if (seg.a <= run.a && seg.b >= run.b) {
      if (seg.pieces.length === seg.b - seg.a)
        return (
          seg.pieces.slice(run.a - seg.a, run.b - seg.a).join("") ===
          run.confirmed
        );
      return (
        seg.a === run.a &&
        seg.b === run.b &&
        seg.pieces.join("") === run.confirmed
      );
    }
  }
  const first = segs[0];
  const last = segs[segs.length - 1];
  if (first.a !== run.a || last.b !== run.b) return false;
  for (let i = 1; i < segs.length; i++)
    if (segs[i].a !== segs[i - 1].b) return false;
  return segs.map((s) => s.pieces.join("")).join("") === run.confirmed;
}

/** Where a joined run of kanji (the segment `a`..`b`) is read by tokens that
 *  tile it exactly, the readings joined; undefined otherwise. `kind` is which
 *  reading counts: what kuromoji `claimed`, or what the older sources
 *  `confirmed`. */
function runsCovering(runs, from, to, kind) {
  const inside = runs.filter((r) => r.a >= from && r.b <= to);
  let cursor = from;
  let reading = "";
  for (const r of inside) {
    if (r.a !== cursor || r[kind] === undefined) return undefined;
    reading += r[kind];
    cursor = r.b;
  }
  return cursor === to && inside.length ? reading : undefined;
}

/** Every token's runs of kanji as `{ a, b, claimed, confirmed?, contradicted? }`:
 *  what kuromoji hears there; that reading again as `confirmed` when the other
 *  sources back it; `contradicted` when they give the word another reading. */
function tokenRuns(tokens, attested) {
  const runs = [];
  let offset = 0;
  for (const token of tokens) {
    const surface = token.surface_form;
    const m = SHAPE.exec(surface);
    const claimed = m ? claimOf(token, m) : undefined;
    if (claimed !== undefined) {
      const a = offset + m[1].length;
      const verdict = verdictOn(token, m, claimed, attested);
      runs.push({
        a,
        b: a + m[2].length,
        claimed,
        ...(verdict === "confirmed" ? { confirmed: claimed } : {}),
        ...(verdict === "contradicted" ? { contradicted: true } : {}),
      });
    } else if (!m) {
      // Kanji on both sides of okurigana (乗り越え, 持ち主): read only where
      // the token's reading divides one way.
      for (const run of multiRunClaims(token))
        runs.push({ ...run, a: run.a + offset, b: run.b + offset });
    }
    offset += surface.length;
  }
  return runs;
}

/** The reading kuromoji gives a token's kanji run, or undefined. */
function claimOf(token, m) {
  if (!token.reading || token.reading === "*") return undefined;
  const [, prefix, , suffix] = m;
  const heard = toHiragana(token.reading);
  if (
    !heard.startsWith(prefix) ||
    !heard.endsWith(suffix) ||
    heard.length <= prefix.length + suffix.length
  )
    return undefined;
  return heard.slice(prefix.length, heard.length - suffix.length);
}

/** The runs of a token spelled kanji and hiragana in turn, with a reading for
 *  each when its reading splits around the hiragana in exactly one way. */
function multiRunClaims(token) {
  const surface = token.surface_form;
  if (!token.reading || token.reading === "*") return [];
  const pieces = surface.match(new RegExp(`[${HAN}]+|\\p{sc=Hiragana}+`, "gu"));
  if (!pieces || pieces.join("") !== surface) return [];
  if (pieces.filter((p) => KANJI_RUN.test(p)).length < 2) return [];

  const heard = toHiragana(token.reading);
  const splits = [];
  const walk = (i, at, got) => {
    if (i === pieces.length)
      return void (at === heard.length && splits.push(got));
    const piece = pieces[i];
    if (!KANJI_RUN.test(piece))
      return void (
        heard.startsWith(piece, at) && walk(i + 1, at + piece.length, got)
      );
    for (let end = at + 1; end <= heard.length; end++)
      walk(i + 1, end, [...got, heard.slice(at, end)]);
  };
  walk(0, 0, []);
  if (splits.length !== 1) return [];

  const runs = [];
  let offset = 0;
  let k = 0;
  for (const piece of pieces) {
    if (KANJI_RUN.test(piece))
      runs.push({
        a: offset,
        b: offset + piece.length,
        claimed: splits[0][k++],
      });
    offset += piece.length;
  }
  return runs;
}

/** Whether the index or JMdict stands behind kuromoji's reading of the token
 *  ("confirmed"), gives the word a different one ("contradicted"), or says
 *  nothing. */
function verdictOn(token, m, kanjiReading, attested) {
  const prefix = m[1];
  const surface = token.surface_form;
  const base =
    token.basic_form && token.basic_form !== "*" ? token.basic_form : surface;
  if (base === surface) {
    const dictionary = attested(surface);
    if (dictionary === undefined) return "unknown";
    const heard = toHiragana(token.reading);
    if (dictionary === heard) return "confirmed";
    // Compounding changes a reading (つかい → づかい) without contradicting it.
    return variants(dictionary).has(heard) ? "unknown" : "contradicted";
  }

  // An inflected token (怒っ for 怒る): its kanji must be the dictionary
  // word's own, and read like its stem. A stem that differs is no
  // contradiction: 来る, 行く and 為る change theirs.
  const b = SHAPE.exec(base);
  if (!b || prefix || b[1] || b[2] !== m[2]) return "unknown";
  const dictionary = attested(base);
  if (!dictionary || !dictionary.endsWith(b[3])) return "unknown";
  return dictionary.slice(0, dictionary.length - b[3].length) === kanjiReading
    ? "confirmed"
    : "unknown";
}
