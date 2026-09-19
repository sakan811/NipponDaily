/**
 * Curated companion content for app/pages/vocab.vue. None of this is
 * dictionary data — it's editorial grouping/insight text laid on top of
 * the real N5Vocab pool fetched from GET /api/n5-vocab at runtime.
 *
 * WORD_CLUSTERS reference terms by their exact `term` surface form from
 * the N5 word list (elzup/jlpt-word-list's n5.csv, the same source
 * scripts/seed-n5-data.mjs reads) so the page can look each one up in the
 * fetched pool and simply skip any that aren't found, rather than
 * hardcoding word data that could drift from what's actually seeded.
 */

export interface WordTypeGroup {
  key: string;
  label: string;
  insight: string;
}

/**
 * Buckets for classifyPartOfSpeech() below. Order matters — classify
 * checks these key names in the order they're referenced there, not the
 * order of this array, but the array order drives display order on the
 * page.
 */
export const WORD_TYPE_GROUPS: WordTypeGroup[] = [
  {
    key: "verb",
    label: "Verbs (動詞)",
    insight:
      "Japanese verbs don't change for person or number — one form covers I/you/he/she/we/they. What changes is the ending, based on tense, politeness, and negation: 食べる (dictionary form) → 食べます (polite) → 食べない (negative) → 食べた (past). Learn the dictionary form shown here, then layer the endings on top.",
  },
  {
    key: "i-adjective",
    label: "い-Adjectives",
    insight:
      "These conjugate on their own, no だ/です required in casual speech: 大きい (big) → 大きくない (not big) → 大きかった (was big). Because they inflect like a mini-verb, a single one of these words plus a noun is already a full description.",
  },
  {
    key: "na-adjective",
    label: "な-Adjectives",
    insight:
      "These act grammatically like nouns — insert な before the noun they describe (静かな部屋, 'a quiet room') and だ/です when they end a sentence (静かです, 'it's quiet'). Never attach な when the word ends a sentence.",
  },
  {
    key: "noun",
    label: "Nouns (名詞)",
    insight:
      "Nouns get their grammatical role from the particle stapled after them, not from word order: は marks the topic, を marks the direct object, の links two nouns as owner→owned. Many of these also double as suru-verbs — add する to turn 勉強 ('study') into 勉強する ('to study').",
  },
  {
    key: "adverb",
    label: "Adverbs (副詞)",
    insight:
      "Adverbs sit right in front of the verb or adjective they modify, with no particle needed: とても大きい ('very big'), よく食べる ('eat often').",
  },
  {
    key: "particle",
    label: "Particles (助詞)",
    insight:
      "The connective tissue of every sentence — each one marks a grammatical role rather than translating to a single English word, so learn them by the job they do (topic, object, direction, location) rather than by dictionary meaning.",
  },
  {
    key: "pronoun",
    label: "Pronouns & Demonstratives",
    insight:
      "Personal pronouns (私, あなた) plus the こそあど demonstrative series — see the Word Families section above for how the whole この/その/あの/どの pattern fits together.",
  },
  {
    key: "counter",
    label: "Counters, Prefixes & Suffixes",
    insight:
      "These never stand alone — they attach to a number or another word (～歳 'years old', ～枚 counter for flat things, お～ honorific prefix) and shift meaning depending on what they're attached to.",
  },
  {
    key: "expression",
    label: "Set Phrases & Connectors",
    insight:
      "Fixed expressions, conjunctions, and interjections that don't inflect — memorize these as whole chunks rather than breaking them into grammar rules.",
  },
  {
    key: "other",
    label: "Other",
    insight:
      "Everything that didn't cleanly fit one of the categories above — still worth knowing, just without a single shared grammar pattern.",
  },
];

/** Classifies a raw JMdict partOfSpeech string into one of WORD_TYPE_GROUPS' keys. */
export function classifyPartOfSpeech(pos: string | undefined): string {
  const p = (pos ?? "").toLowerCase();
  if (!p) return "other";
  if (/adjectival noun|keiy[oō]d[oō]shi/.test(p)) return "na-adjective";
  if (/adjective \(keiy[oō]shi\)/.test(p)) return "i-adjective";
  if (/aux\.?\s*verb suru|takes suru/.test(p)) return "noun";
  if (/verb/.test(p)) return "verb";
  if (/noun/.test(p)) return "noun";
  if (/adverb/.test(p)) return "adverb";
  if (/particle/.test(p)) return "particle";
  if (/pronoun|rentaishi|pre-noun/.test(p)) return "pronoun";
  if (/counter|prefix|suffix/.test(p)) return "counter";
  if (/conjunction|interjection|expression/.test(p)) return "expression";
  return "other";
}

export interface WordClusterRow {
  label?: string;
  /** Exact `term` values to look up in the fetched N5Vocab pool. */
  terms: string[];
}

export interface WordCluster {
  key: string;
  title: string;
  subtitle: string;
  insight: string;
  /** When true, a row of exactly 2 terms renders as an opposing pair. */
  pairwise?: boolean;
  rows: WordClusterRow[];
}

export const WORD_CLUSTERS: WordCluster[] = [
  {
    key: "kosoado",
    title: "The こそあど Series — This / That / Which",
    subtitle: "Demonstratives",
    insight:
      "Every demonstrative is built from the same four prefixes — こ (near me), そ (near you), あ (far from both), ど (question) — combined with a fixed set of endings for 'thing' (れ/の), 'place' (こ), and 'direction' (ちら/っち). Learn the pattern once and all four rows fall into place.",
    rows: [
      { label: "thing", terms: ["これ", "それ", "あれ", "どれ"] },
      { label: "which kind of", terms: ["この", "その", "あの", "どの"] },
      { label: "place", terms: ["ここ", "そこ", "あそこ", "どこ"] },
      {
        label: "direction (polite)",
        terms: ["こちら", "そちら", "あちら", "どちら"],
      },
      { label: "direction (casual)", terms: ["こっち", "そっち", "あっち", "どっち"] },
    ],
  },
  {
    key: "time-grid",
    title: "The Time-Word Grid — This, Next, Last",
    subtitle: "Calendar & Relative Time",
    insight:
      "Most time words follow a grid: a prefix for 'this' (今), 'next' (来), or 'last' (先/去) attached to a unit — 週 week, 月 month, 年 year. It's fully regular for week/month/year, but 'day' gets its own irregular roots (今日/明日/昨日) — which is exactly why those are worth memorizing on their own rather than deriving them.",
    rows: [
      { label: "day", terms: ["今日", "明日", "明後日", "昨日", "一昨日"] },
      { label: "week", terms: ["今週", "来週", "先週"] },
      { label: "month", terms: ["今月", "来月", "先月"] },
      { label: "year", terms: ["今年", "来年", "去年"] },
      { label: "every…", terms: ["毎日", "毎週", "毎月", "毎年"] },
    ],
  },
  {
    key: "weekdays",
    title: "Days of the Week",
    subtitle: "曜日",
    insight:
      "Each weekday name pairs a classical element or celestial body with 曜日 ('day of the week'): 月 moon, 火 fire, 水 water, 木 wood, 金 metal, 土 earth, and 日 sun for Sunday. Swap just the first character to name any day of the week.",
    rows: [
      {
        terms: [
          "月曜日",
          "火曜日",
          "水曜日",
          "木曜日",
          "金曜日",
          "土曜日",
          "日曜日",
        ],
      },
    ],
  },
  {
    key: "numbers",
    title: "Numbers, Two Ways",
    subtitle: "Counting",
    insight:
      "Japanese runs two number systems side by side: Sino-Japanese (いち, に, さん…) for math, phone numbers, dates, and prices, and a native counting set (ひとつ, ふたつ, みっつ…) for counting objects generically when there's no specific counter word — but the native set stops at ten.",
    rows: [
      {
        label: "Sino-Japanese",
        terms: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
      },
      {
        label: "native counting",
        terms: [
          "一つ",
          "二つ",
          "三つ",
          "四つ",
          "五つ",
          "六つ",
          "七つ",
          "八つ",
          "九つ",
        ],
      },
    ],
  },
  {
    key: "family",
    title: "Family — Yours vs. Someone Else's",
    subtitle: "Family & People",
    insight:
      "Japanese uses one humble set of words for your own family and a separate, more polite set for someone else's family (or for addressing your own directly) — the polite forms all take お…さん. Mixing the two up is one of the most common learner slips.",
    pairwise: true,
    rows: [
      { label: "father", terms: ["父", "お父さん"] },
      { label: "mother", terms: ["母", "お母さん"] },
      { label: "older brother", terms: ["兄", "お兄さん"] },
      { label: "older sister", terms: ["姉", "お姉さん"] },
      {
        label: "also useful",
        terms: ["弟", "妹", "家族", "兄弟", "両親", "子供"],
      },
    ],
  },
  {
    key: "opposites",
    title: "Common Opposites",
    subtitle: "Adjective Pairs",
    insight:
      "Adjectives are easiest to remember in opposing pairs — and since both halves of a pair are almost always the same word type (both い-adjectives here), learning one tells you exactly how the other conjugates. Note 高い does double duty: it pairs with 安い for 'expensive/cheap' and with 低い for 'tall/short'.",
    pairwise: true,
    rows: [
      { terms: ["大きい", "小さい"] },
      { terms: ["新しい", "古い"] },
      { terms: ["暑い", "寒い"] },
      { terms: ["熱い", "冷たい"] },
      { terms: ["長い", "短い"] },
      { terms: ["高い", "安い"] },
      { terms: ["高い", "低い"] },
      { terms: ["重い", "軽い"] },
      { terms: ["難しい", "易しい"] },
      { terms: ["強い", "弱い"] },
      { terms: ["広い", "狭い"] },
      { terms: ["近い", "遠い"] },
      { terms: ["多い", "少ない"] },
      { terms: ["面白い", "つまらない"] },
    ],
  },
  {
    key: "directions",
    title: "Direction & Position",
    subtitle: "Spatial Words",
    insight:
      "These attach to の + a noun to say where something is: 机の上 ('on the desk'), 家の中 ('inside the house'). The compass points and near/far pairs below cover almost every 'where is it' question you'll actually ask.",
    rows: [
      {
        terms: [
          "上",
          "下",
          "前",
          "後ろ",
          "中",
          "外",
          "右",
          "左",
          "隣",
          "近く",
          "そば",
          "向こう",
        ],
      },
      { label: "compass", terms: ["東", "西", "南", "北"] },
    ],
  },
  {
    key: "colors",
    title: "Colors — Adjective or Noun?",
    subtitle: "Colors",
    insight:
      "赤, 青, 黒, 白, and 黄色 can all take い and inflect directly as adjectives (赤い家, 'a red house'), but 茶色 and 緑 behave as nouns and need の instead (緑の木, 'a green tree') — a small irregularity worth knowing before you build a sentence.",
    rows: [
      {
        terms: [
          "赤",
          "赤い",
          "青",
          "青い",
          "黒",
          "黒い",
          "白",
          "白い",
          "黄色",
          "黄色い",
          "茶色",
          "緑",
        ],
      },
    ],
  },
  {
    key: "daily-verbs",
    title: "A Day in Verbs",
    subtitle: "Everyday Actions",
    insight:
      "String these together in order and you've narrated an entire day: 起きる (wake up) → 食べる (eat) → 行く (go) → 働く/勉強 (work/study) → 帰る (go home) → 寝る (sleep). Notice 行く/来る/帰る form a directional set — 'go', 'come', and 'go back' each assume a different starting point.",
    rows: [
      {
        terms: [
          "起きる",
          "寝る",
          "食べる",
          "飲む",
          "行く",
          "来る",
          "帰る",
          "働く",
          "勉強",
          "休む",
          "洗う",
          "着る",
        ],
      },
    ],
  },
  {
    key: "question-words",
    title: "Asking Questions",
    subtitle: "5W1H",
    insight:
      "何 asks 'what' and 誰 asks 'who'; the ど-series in the demonstratives group above covers 'where/which/how'. Put one at the front of a plain statement and raise your pitch at the end — no other grammar change is needed to form a question.",
    rows: [
      { terms: ["何", "誰", "いつ", "いくつ", "いくら", "どうして", "なぜ"] },
    ],
  },
  {
    key: "weather",
    title: "Weather & Seasons",
    subtitle: "Weather",
    insight:
      "Seasonal words pair naturally with temperature adjectives — 夏 goes with 暑い (hot), 冬 with 寒い (cold), and 春/秋 usually get 涼しい or 暖かい (mild/cool/warm).",
    rows: [
      {
        terms: ["春", "夏", "秋", "冬", "天気", "雨", "雪", "曇り", "晴れ", "風"],
      },
    ],
  },
  {
    key: "body",
    title: "Body Parts",
    subtitle: "The Body",
    insight:
      "These combine with が to describe symptoms in real life — 頭が痛い ('my head hurts'), お腹が痛い ('my stomach hurts'). Swap in any body part before 痛い to say where it hurts.",
    rows: [
      { terms: ["頭", "顔", "目", "耳", "口", "歯", "手", "足", "お腹", "背"] },
    ],
  },
];
