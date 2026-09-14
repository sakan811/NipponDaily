import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import kuromoji from "kuromoji";
import * as wanakana from "wanakana";
import type { JpToken } from "~~/types/index";

/**
 * Auto-tokenizes a lesson's `originalText` into a draft `JpToken[]` the moment
 * it's stored (see `LessonsService.saveLesson`), before the MCP agent has
 * looked at the article at all. This is segmentation only — no meaning
 * lookup — because the agent reviews this draft against the source article
 * afterwards (fixing any bad merges, e.g. an address run like 陽東６丁目
 * getting glued into one token) and supplies meanings itself from context, so
 * a dictionary-driven guess here would just be redundant work later thrown
 * away. Whatever `tokens` the agent finally submits via `upsert_lesson`
 * replaces this draft outright.
 */

/** The kuromoji morpheme fields the merge/classify logic reads. */
export type Morph = Pick<
  kuromoji.IpadicFeatures,
  | "surface_form"
  | "pos"
  | "pos_detail_1"
  | "basic_form"
  | "conjugated_type"
  | "reading"
>;

/** Nitro server asset name for kuromoji's dictionary (see nuxt.config.ts `nitro.serverAssets`). */
const KUROMOJI_DICT_ASSET = "assets:kuromoji-dict";

const KUROMOJI_DICT_FILES = [
  "base.dat.gz",
  "check.dat.gz",
  "tid.dat.gz",
  "tid_pos.dat.gz",
  "tid_map.dat.gz",
  "cc.dat.gz",
  "unk.dat.gz",
  "unk_pos.dat.gz",
  "unk_map.dat.gz",
  "unk_char.dat.gz",
  "unk_compat.dat.gz",
  "unk_invoke.dat.gz",
];

/**
 * Writes kuromoji's dictionary files to a tmp dir so kuromoji's own fs-based
 * loader can read them by path. Serverless builds (e.g. Vercel) only deploy
 * files reachable from the require/import graph — they never see kuromoji's
 * runtime `fs.readFile(dicPath)` calls, so the dict/*.dat.gz files bundled in
 * node_modules would otherwise be silently dropped from the deployment.
 * Sourcing them from the Nitro server asset (embedded into the server build
 * itself) instead sidesteps that gap.
 */
const materializeDictDir = async (): Promise<string> => {
  const dicPath = path.join(os.tmpdir(), "nippondaily-kuromoji-dict");
  await fs.mkdir(dicPath, { recursive: true });
  const storage = useStorage(KUROMOJI_DICT_ASSET);
  await Promise.all(
    KUROMOJI_DICT_FILES.map(async (filename) => {
      const dest = path.join(dicPath, filename);
      const alreadyWritten = await fs
        .access(dest)
        .then(() => true)
        .catch(() => false);
      if (alreadyWritten) return;
      const bytes = await storage.getItemRaw(filename);
      if (!bytes) {
        throw new Error(`Missing kuromoji dictionary asset: ${filename}`);
      }
      await fs.writeFile(dest, Buffer.from(bytes as Uint8Array));
    }),
  );
  return dicPath;
};

let tokenizerPromise: Promise<
  kuromoji.Tokenizer<kuromoji.IpadicFeatures>
> | null = null;

/** Lazily builds a singleton kuromoji tokenizer (IPADIC dictionary load is a one-time ~300-400ms cost). */
const getTokenizer = (): Promise<
  kuromoji.Tokenizer<kuromoji.IpadicFeatures>
> => {
  if (!tokenizerPromise) {
    tokenizerPromise = materializeDictDir().then(
      (dicPath) =>
        new Promise((resolve, reject) => {
          kuromoji.builder({ dicPath }).build((err, tokenizer) => {
            if (err) reject(err);
            else resolve(tokenizer);
          });
        }),
    );
  }
  return tokenizerPromise;
};

const isSuruCapableNoun = (m: Morph): boolean =>
  m.pos === "名詞" && m.pos_detail_1 === "サ変接続";

const isSuruVerb = (m: Morph): boolean =>
  m.pos === "動詞" && (m.basic_form === "する" || m.basic_form === "できる");

/**
 * Whether `cur` should be folded into the same word as `prev` rather than
 * starting a new one. Handles the merges a learner actually wants to see:
 * compound nouns (東京+都 -> 東京都), noun+する verbs (表明+し+た -> 表明した),
 * and verb/adjective conjugation chains (話し合っ+た -> 話し合った).
 */
export const shouldMergeMorphemes = (prev: Morph, cur: Morph): boolean => {
  if (prev.pos === "名詞" && cur.pos === "名詞") return true;
  if (isSuruCapableNoun(prev) && isSuruVerb(cur)) return true;
  if (
    (prev.pos === "動詞" || prev.pos === "形容詞" || prev.pos === "助動詞") &&
    cur.pos === "助動詞"
  )
    return true;
  return false;
};

/** Greedily groups morphemes into words using {@link shouldMergeMorphemes}. */
export const groupMorphemes = (morphemes: Morph[]): Morph[][] => {
  const groups: Morph[][] = [];
  for (const m of morphemes) {
    const current = groups[groups.length - 1];
    const prev = current?.[current.length - 1];
    if (prev && shouldMergeMorphemes(prev, m)) {
      current.push(m);
    } else {
      groups.push([m]);
    }
  }
  return groups;
};

const JAPANESE_POS_LABELS: Record<string, string> = {
  名詞: "noun",
  副詞: "adverb",
  助詞: "particle",
  助動詞: "auxiliary verb",
  接続詞: "conjunction",
  感動詞: "interjection",
  連体詞: "adnominal",
  接頭詞: "prefix",
  フィラー: "filler",
  その他: "other",
};

/** Derives a human-readable part of speech (matching VocabItem.partOfSpeech style) for a merged word group. */
export const classifyPartOfSpeech = (group: Morph[]): string => {
  const verb = group.find((m) => m.pos === "動詞");
  if (verb) {
    const conjugation = verb.conjugated_type ?? "";
    if (conjugation.startsWith("サ変")) return "suru verb";
    if (conjugation.startsWith("五段")) return "godan verb";
    if (conjugation.startsWith("一段")) return "ichidan verb";
    if (conjugation.startsWith("カ変")) return "irregular verb";
    return "verb";
  }
  if (group.some((m) => m.pos === "形容詞")) return "i-adjective";
  if (group.some((m) => m.pos_detail_1 === "形容動詞語幹"))
    return "na-adjective";
  if (group.some((m) => m.pos === "名詞")) return "noun";
  return JAPANESE_POS_LABELS[group[group.length - 1]?.pos ?? ""] ?? "other";
};

/** Katakana (kuromoji's reading field) to hiragana, matching this app's existing reading style. */
const toHiraganaReading = (katakana: string): string =>
  wanakana.toHiragana(katakana);

/** Hepburn rōmaji with macrons for long vowels, matching this app's existing romaji style (e.g. "shushō"). */
const toMacronRomaji = (hiragana: string): string =>
  wanakana
    .toRomaji(hiragana)
    .replace(/ou/g, "ō")
    .replace(/oo/g, "ō")
    .replace(/uu/g, "ū");

/** Morphemes that are never their own clickable word (punctuation, whitespace). */
const isSkippable = (m: Morph): boolean =>
  m.pos === "記号" || m.surface_form.trim() === "";

/**
 * は/へ/を are pronounced "wa"/"e"/"o" when used as grammatical particles,
 * not their literal kana readings ("ha"/"he"/"wo") — matching this app's
 * existing romaji convention (e.g. romajiText renders は as "wa").
 */
const PARTICLE_ROMAJI_OVERRIDES: Record<string, string> = {
  は: "wa",
  へ: "e",
  を: "o",
};

const romajiForGroup = (group: Morph[], reading: string): string => {
  const only = group.length === 1 ? group[0] : undefined;
  if (only && only.pos === "助詞") {
    const override = PARTICLE_ROMAJI_OVERRIDES[only.surface_form];
    if (override) return override;
  }
  return toMacronRomaji(reading);
};

/**
 * Turns raw kuromoji morphemes into deduplicated, merged word-level tokens.
 * Pure so it can be unit tested against fixture morphemes. Never attaches a
 * `meaning` — that's left to the MCP agent's own review pass.
 */
export const buildJpTokens = (morphemes: Morph[]): JpToken[] => {
  const groups = groupMorphemes(morphemes.filter((m) => !isSkippable(m)));
  const seen = new Set<string>();
  const tokens: JpToken[] = [];
  for (const group of groups) {
    const surface = group.map((m) => m.surface_form).join("");
    if (!surface || seen.has(surface)) continue;
    seen.add(surface);
    const katakanaReading = group
      .map((m) => m.reading ?? m.surface_form)
      .join("");
    const reading = toHiraganaReading(katakanaReading);
    const partOfSpeech = classifyPartOfSpeech(group);
    tokens.push({
      surface,
      reading,
      romaji: romajiForGroup(group, reading),
      partOfSpeech,
    });
  }
  return tokens;
};

/**
 * Tokenizes a Japanese passage into merged, deduplicated draft words with
 * readings, rōmaji and part of speech, for the MCP agent to review and
 * correct against the actual article before finalizing a lesson's `tokens`.
 * Never throws — returns [] if the tokenizer dictionary can't be loaded so a
 * tokenization failure never blocks storing the lesson.
 */
export const analyzeJapanese = async (text: string): Promise<JpToken[]> => {
  if (!text || !text.trim()) return [];
  try {
    const tokenizer = await getTokenizer();
    const morphemes = tokenizer.tokenize(text) as Morph[];
    return buildJpTokens(morphemes);
  } catch (error) {
    console.error("Japanese tokenization failed:", error);
    return [];
  }
};
