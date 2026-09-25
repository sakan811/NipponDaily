/**
 * Curated companion content for the N5 study pages: WORD_CLUSTERS are the
 * word families the lesson path (app/data/lessons.ts, /learn) is built
 * from, and WORD_TYPE_GROUPS drive the vocabulary guide at
 * app/pages/vocab/index.vue and app/pages/vocab/types/[key].vue. None
 * of this is dictionary data — it's editorial grouping/insight text laid
 * on top of the real N5Vocab pool fetched from GET /api/n5-vocab at
 * runtime.
 *
 * WORD_CLUSTERS reference words by their N5Vocab `id` (see WordClusterRow
 * below) from the N5 word list (elzup/jlpt-word-list's n5.csv, the same
 * source scripts/seed-n5-data.mjs reads) so the page can look each one up
 * in the fetched pool and simply skip any that aren't found, rather than
 * hardcoding word data that could drift from what's actually seeded.
 */

/** A single illustrative example sentence shown on a topic's dedicated page. */
export interface TopicExample {
  /** Kanji/kana Japanese sentence. */
  jp: string;
  /** Hepburn rōmaji transliteration. */
  romaji: string;
  /** English translation. */
  en: string;
}

export interface WordTypeGroup {
  key: string;
  label: string;
  insight: string;
  /** A second paragraph of depth shown only on this group's dedicated /vocab/types/[key] page. */
  extendedInsight?: string;
  examples?: TopicExample[];
  /** A single common learner pitfall specific to this group, shown on its dedicated page. */
  commonMistake?: string;
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
    extendedInsight:
      "Verbs fall into three conjugation groups — godan ('five-step', like 飲む), ichidan ('one-step', like 食べる), and two irregulars (する, 来る) — and the dictionary-form ending is usually enough to tell you which group a verb belongs to.",
    examples: [
      {
        jp: "毎日日本語を勉強します。",
        romaji: "Mainichi nihongo o benkyou shimasu.",
        en: "I study Japanese every day.",
      },
      {
        jp: "昨日、映画を見ました。",
        romaji: "Kinou, eiga o mimashita.",
        en: "I watched a movie yesterday.",
      },
    ],
    commonMistake:
      "Not every verb ending in -iru/-eru is ichidan — 帰る ('go home'), 入る ('enter'), and 走る ('run') look like ichidan candidates but conjugate as godan (帰ります, not 帰えます). These are memorized exceptions.",
  },
  {
    key: "i-adjective",
    label: "い-Adjectives",
    insight:
      "These conjugate on their own, no だ/です required in casual speech: 大きい (big) → 大きくない (not big) → 大きかった (was big). Because they inflect like a mini-verb, a single one of these words plus a noun is already a full description.",
    extendedInsight:
      "The one true exception is いい ('good') — its negative and past forms are built from the older form よい instead (よくない, よかった), never いくない or いかった.",
    examples: [
      {
        jp: "この店のラーメンはおいしいです。",
        romaji: "Kono mise no raamen wa oishii desu.",
        en: "This shop's ramen is delicious.",
      },
      {
        jp: "昨日は寒かったです。",
        romaji: "Kinou wa samukatta desu.",
        en: "It was cold yesterday.",
      },
    ],
    commonMistake:
      "いい's negative is よくない, not いくない — いい is a shortened, more modern form of よい, and only the plain dictionary form updated to the shorter spelling.",
  },
  {
    key: "na-adjective",
    label: "な-Adjectives",
    insight:
      "These act grammatically like nouns — insert な before the noun they describe (静かな部屋, 'a quiet room') and だ/です when they end a sentence (静かです, 'it's quiet'). Never attach な when the word ends a sentence.",
    extendedInsight:
      "Some words are true な-adjectives even though they look like they should take い — 有名 ('famous') and きれい ('pretty/clean') are the two classic traps, since きれい ends in い but conjugates as a な-adjective.",
    examples: [
      {
        jp: "この公園はきれいです。",
        romaji: "Kono kouen wa kirei desu.",
        en: "This park is clean/pretty.",
      },
      {
        jp: "彼女は有名な歌手です。",
        romaji: "Kanojo wa yuumei na kashu desu.",
        en: "She is a famous singer.",
      },
    ],
    commonMistake:
      "きれい looks like an い-adjective because it ends in い, but it's actually な-adjective — きれいい is never correct, and the negative is きれいじゃない, not きれくない.",
  },
  {
    key: "noun",
    label: "Nouns (名詞)",
    insight:
      "Nouns get their grammatical role from the particle stapled after them, not from word order: は marks the topic, を marks the direct object, の links two nouns as owner→owned. Many of these also double as suru-verbs — add する to turn 勉強 ('study') into 勉強する ('to study').",
    extendedInsight:
      "This noun+する pattern covers dozens of N5 words borrowed as Chinese compounds (電話する 'to phone', 洗濯する 'to do laundry') — if a noun feels action-like, try appending する before assuming there's a separate verb form.",
    examples: [
      {
        jp: "私は学生です。",
        romaji: "Watashi wa gakusei desu.",
        en: "I am a student.",
      },
      {
        jp: "友達に電話します。",
        romaji: "Tomodachi ni denwa shimasu.",
        en: "I'll call my friend.",
      },
    ],
    commonMistake:
      "Adding する directly onto every noun doesn't work — it only applies to a specific set of 'suru nouns' (勉強, 電話, 洗濯…); ordinary nouns like 猫 or 本 can't take する at all.",
  },
  {
    key: "adverb",
    label: "Adverbs (副詞)",
    insight:
      "Adverbs sit right in front of the verb or adjective they modify, with no particle needed: とても大きい ('very big'), よく食べる ('eat often').",
    extendedInsight:
      "Frequency adverbs like よく ('often') and timing adverbs like すぐ ('right away') behave the same way grammatically — no particle, no conjugation — even though what they describe about the verb differs.",
    examples: [
      {
        jp: "彼はよく図書館に行きます。",
        romaji: "Kare wa yoku toshokan ni ikimasu.",
        en: "He often goes to the library.",
      },
      {
        jp: "すぐ来てください。",
        romaji: "Sugu kite kudasai.",
        en: "Please come right away.",
      },
    ],
    commonMistake:
      "よく can mean both 'often' (frequency) and 'well' (quality, as in よく聞こえる 'can hear well') — sentence context, not the word itself, tells you which.",
  },
  {
    key: "particle",
    label: "Particles (助詞)",
    insight:
      "The connective tissue of every sentence — each one marks a grammatical role rather than translating to a single English word, so learn them by the job they do (topic, object, direction, location) rather than by dictionary meaning.",
    extendedInsight:
      "は and が are the hardest pair for English speakers precisely because English doesn't distinguish topic from subject — は sets up what the sentence is about, while が pinpoints specifically who or what does something.",
    examples: [
      {
        jp: "私は学生です。",
        romaji: "Watashi wa gakusei desu.",
        en: "As for me, I'm a student.",
      },
      {
        jp: "誰が来ましたか。",
        romaji: "Dare ga kimashita ka.",
        en: "Who came?",
      },
    ],
    commonMistake:
      "は and が aren't interchangeable translations of 'is/are' — swapping them changes what's emphasized: 私が学生です implies 'I, specifically, am the student' (not someone else).",
  },
  {
    key: "pronoun",
    label: "Pronouns & Demonstratives",
    insight:
      "Personal pronouns (私, あなた) plus the こそあど demonstrative series — see the こそあど lessons for how the whole この/その/あの/どの pattern fits together.",
    extendedInsight:
      "Japanese drops pronouns constantly once the subject is clear from context — overusing 私 or あなた the way English requires 'I'/'you' in every sentence is one of the clearest markers of a non-native speaker.",
    examples: [
      {
        jp: "あなたの名前は何ですか。",
        romaji: "Anata no namae wa nan desu ka.",
        en: "What is your name?",
      },
      {
        jp: "これは私のかばんです。",
        romaji: "Kore wa watashi no kaban desu.",
        en: "This is my bag.",
      },
    ],
    commonMistake:
      "あなた sounds distant or even rude toward someone you know by name — use their name + さん instead of あなた in most real conversations.",
  },
  {
    key: "counter",
    label: "Counters, Prefixes & Suffixes",
    insight:
      "These never stand alone — they attach to a number or another word (～歳 'years old', ～枚 counter for flat things, お～ honorific prefix) and shift meaning depending on what they're attached to.",
    extendedInsight:
      "Almost every noun you count needs its own counter word matched to its shape or category (枚 for flat things, 匹 for small animals, 人 for people) — 歳 for age is just one member of this same family, not a special case.",
    examples: [
      {
        jp: "切手を三枚買いました。",
        romaji: "Kitte o san-mai kaimashita.",
        en: "I bought three stamps.",
      },
      {
        jp: "今年、二十歳になります。",
        romaji: "Kotoshi, hatachi ni narimasu.",
        en: "I'll turn twenty this year.",
      },
    ],
    commonMistake:
      "二十歳 is irregularly read はたち, not にじゅっさい — one of a handful of counter readings that don't follow the regular number + counter pattern.",
  },
  {
    key: "expression",
    label: "Set Phrases & Connectors",
    insight:
      "Fixed expressions, conjunctions, and interjections that don't inflect — memorize these as whole chunks rather than breaking them into grammar rules.",
    extendedInsight:
      "Many of these double as full sentences on their own — おはよう, すみません, and ありがとう all work standing alone, unlike ordinary words that need a particle and a verb to form a complete thought.",
    examples: [
      {
        jp: "すみません、駅はどこですか。",
        romaji: "Sumimasen, eki wa doko desu ka.",
        en: "Excuse me, where is the station?",
      },
      {
        jp: "また明日。",
        romaji: "Mata ashita.",
        en: "See you tomorrow.",
      },
    ],
    commonMistake:
      "すみません covers both 'excuse me' (getting attention) and 'sorry' (apologizing) — treating it as only an apology means missing half its everyday use.",
  },
  {
    key: "other",
    label: "Other",
    insight:
      "Everything that didn't cleanly fit one of the categories above — still worth knowing, just without a single shared grammar pattern.",
    extendedInsight:
      "Words end up here mainly because their JMdict grammar tag didn't cleanly match one of the categories above — it's a catch-all for classification gaps, not a claim that these words are grammatically unusual.",
  },
];

/**
 * The N5 word list stores counter/prefix/suffix entries with a literal "～"
 * placeholder (～枚, ～歳, …) that never appears in JMdict's own surface
 * forms, so scripts/seed-n5-data.mjs's JMdict lookup always misses for these
 * and leaves partOfSpeech undefined. Recognize the placeholder directly
 * rather than relying on a dictionary match.
 */
const COUNTER_PLACEHOLDER_PREFIX = "～";

/**
 * A handful of N5 terms collide, by exact kana, with a much rarer JMdict
 * entry for a different word (e.g. この also happens to be a valid but
 * obscure reading of 九 "nine") — since scripts/seed-n5-data.mjs's JMdict
 * index keeps whichever entry it meets first per surface, these can end up
 * tagged with that unrelated entry's part of speech. Verified individually
 * against JMdict; keyed by term since the mistagged partOfSpeech string
 * alone isn't a reliable-enough signal to special-case generically.
 */
const POS_TERM_OVERRIDES: Record<string, string> = {
  この: "pronoun", // collided with 九's rare "この" reading (numeric), should be rentaishi
  どの: "pronoun", // collided with 殿's "どの" reading (suffix), should be rentaishi
  頭: "noun", // collided with 頭 as a counter for large animals, should be plain noun ("head")
};

/** Classifies a raw JMdict partOfSpeech string (for a given term) into one of WORD_TYPE_GROUPS' keys. */
export function classifyPartOfSpeech(
  pos: string | undefined,
  term?: string,
): string {
  if (term && POS_TERM_OVERRIDES[term]) return POS_TERM_OVERRIDES[term];
  if (term?.startsWith(COUNTER_PLACEHOLDER_PREFIX)) return "counter";

  const p = (pos ?? "").toLowerCase();
  if (!p) return "other";
  if (/adjectival noun|keiy[oō]d[oō]shi/.test(p)) return "na-adjective";
  // JMdict's actual tag text is "adjective (keiyoushi)" — the "ou" digraph,
  // not the single-o/macron spelling this regex originally assumed — so
  // every plain い-adjective in the pool (大きい, 新しい, …) was silently
  // falling through every rule below to "other" until this was fixed.
  if (/adjective \(keiy(?:ou|ō)shi\)/.test(p)) return "i-adjective";
  if (/aux\.?\s*verb suru|takes suru/.test(p)) return "noun";
  // JMdict's tag for adj-no words (同じ, いろいろ, …) reads "noun or verb
  // acting prenominally" — check this before the generic /verb/ rule below,
  // since these don't conjugate like verbs at all (同じ is invariable).
  if (/noun or (?:verb|participle) acting prenominally/.test(p)) return "noun";
  // These two must run before the generic /verb/ and /noun/ checks below:
  // "adverb" contains "verb" as a substring, and "pronoun"/"pre-noun" both
  // contain "noun" — so every adverb and pronoun in the pool was silently
  // swallowed by the broader verb/noun buckets until this was reordered.
  if (/adverb/.test(p)) return "adverb";
  if (/pronoun|rentaishi|pre-noun/.test(p)) return "pronoun";
  if (/verb/.test(p)) return "verb";
  if (/noun/.test(p)) return "noun";
  if (/particle/.test(p)) return "particle";
  if (/counter|prefix|suffix/.test(p)) return "counter";
  if (/conjunction|interjection|expression/.test(p)) return "expression";
  if (/numeric/.test(p)) return "noun";
  return "other";
}

export interface WordClusterRow {
  label?: string;
  /**
   * N5Vocab `id` values to look up in the fetched pool. Usually identical
   * to the term's own surface form (e.g. "これ"), since slugify() in
   * scripts/seed-n5-data.mjs only touches punctuation — but a handful of
   * terms appear twice in the pool under the same surface form with
   * different readings (e.g. 十 as both じゅう and とお), and those get a
   * disambiguating "-2" suffix that must be referenced explicitly here.
   */
  terms: string[];
}

export interface WordCluster {
  key: string;
  title: string;
  subtitle: string;
  insight: string;
  /** A second paragraph of depth, shown on the first lesson of this cluster. */
  extendedInsight?: string;
  examples?: TopicExample[];
  /** A single common learner pitfall specific to this cluster, shown on its last lesson. */
  commonMistake?: string;
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
    extendedInsight:
      "Because the four rows share this same prefix pattern, once you know one row well (say, 'thing': これ/それ/あれ/どれ) you can often guess the others even before studying them — the ending changes, the underlying logic doesn't.",
    examples: [
      {
        jp: "これは本です。",
        romaji: "Kore wa hon desu.",
        en: "This is a book.",
      },
      {
        jp: "あの人は先生です。",
        romaji: "Ano hito wa sensei desu.",
        en: "That person (over there) is a teacher.",
      },
    ],
    commonMistake:
      "Learners often reach for それ for something physically close to themselves — remember それ is near the listener, not just a generic 'that'.",
    rows: [
      { label: "thing", terms: ["これ", "それ", "あれ", "どれ"] },
      { label: "this/that (+ noun)", terms: ["この", "その", "あの", "どの"] },
      { label: "place", terms: ["ここ", "そこ", "あそこ", "どこ"] },
      {
        label: "direction (polite)",
        terms: ["こちら", "そちら", "あちら", "どちら"],
      },
      {
        label: "direction (casual)",
        terms: ["こっち", "そっち", "あっち", "どっち"],
      },
      { label: "such / what kind of", terms: ["こんな", "どんな"] },
    ],
  },
  {
    key: "time-grid",
    title: "The Time-Word Grid — This, Next, Last",
    subtitle: "Calendar & Relative Time",
    insight:
      "Most time words follow a grid: a prefix for 'this' (今), 'next' (来), or 'last' (先/去) attached to a unit — 週 week, 月 month, 年 year. It's fully regular for week/month/year, but 'day' gets its own irregular roots (今日/明日/昨日) — which is exactly why those are worth memorizing on their own rather than deriving them.",
    extendedInsight:
      "Notice the irregular pieces don't stop at 'day' — 'last year' also breaks the pattern, using 去 instead of the 先 that 先週/先月 use, exactly like English 'yesterday' isn't 'this-day-minus-one'.",
    examples: [
      {
        jp: "来週、日本に行きます。",
        romaji: "Raishuu, Nihon ni ikimasu.",
        en: "Next week, I'm going to Japan.",
      },
      {
        jp: "去年、東京に住んでいました。",
        romaji: "Kyonen, Toukyou ni sunde imashita.",
        en: "Last year, I was living in Tokyo.",
      },
    ],
    commonMistake:
      "先年 is not standard for 'last year' — that slot is irregular (去年), even though 先週 and 先月 both use 先 normally.",
    rows: [
      { label: "day", terms: ["今日", "明日", "明後日", "昨日", "一昨日"] },
      { label: "week", terms: ["今週", "来週", "先週"] },
      { label: "month", terms: ["今月", "来月", "先月"] },
      {
        label: "year",
        terms: ["今年", "来年", "去年", "おととし", "さ来年"],
      },
      {
        label: "every…",
        terms: ["毎日", "毎週", "毎月", "毎年", "毎朝", "毎晩"],
      },
    ],
  },
  {
    key: "weekdays",
    title: "Days of the Week",
    subtitle: "曜日",
    insight:
      "Each weekday name pairs a classical element or celestial body with 曜日 ('day of the week'): 月 moon, 火 fire, 水 water, 木 wood, 金 metal, 土 earth, and 日 sun for Sunday. Swap just the first character to name any day of the week.",
    extendedInsight:
      "The same pattern extends to asking the day itself — 何曜日ですか ('what day of the week is it?') swaps in 何 ('what') exactly where a specific day name would go.",
    examples: [
      {
        jp: "今日は火曜日です。",
        romaji: "Kyou wa kayoubi desu.",
        en: "Today is Tuesday.",
      },
      {
        jp: "土曜日に映画を見ます。",
        romaji: "Doyoubi ni eiga o mimasu.",
        en: "I'll watch a movie on Saturday.",
      },
    ],
    commonMistake:
      "Don't drop 曜日 when naming a specific weekday — 火 alone means 'fire', not 'Tuesday'.",
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
      "Japanese runs two number systems side by side: Sino-Japanese (いち, に, さん…) for math, phone numbers, dates, and prices, and a native counting set (ひとつ, ふたつ, みっつ…) for counting objects generically when there's no specific counter word. The native set stops at とお (ten) — 十 covers both readings, じゅう for the Sino-Japanese set and とお for the native one.",
    extendedInsight:
      "Beyond ten, the native set simply stops — from eleven onward, and for anything you'd count with a specific counter word like 枚 or 匹, Japanese always switches back to the Sino-Japanese set. Numbers 11–99 aren't separate vocabulary at all — they're just Sino-Japanese digits stacked together (十一 'ten-one' = 11, 二十 'two-ten' = 20, 二十三 'two-ten-three' = 23), the same way 百 (hundred), 千 (thousand), and 万 (ten thousand) combine with the digits below to build any larger number.",
    examples: [
      {
        jp: "りんごを三つください。",
        romaji: "Ringo o mittsu kudasai.",
        en: "Three apples, please.",
      },
      {
        jp: "電話番号は三、五、六です。",
        romaji: "Denwa bangou wa san, go, roku desu.",
        en: "The phone number is 3-5-6.",
      },
    ],
    commonMistake:
      "Native counting words (ひとつ, ふたつ…) can't be used for phone numbers, dates, or math — those always take the Sino-Japanese set. And native counting doesn't extend past とお (ten) — from eleven on, always switch to Sino-Japanese (十一 juuichi, not a native word).",
    rows: [
      {
        label: "Sino-Japanese",
        terms: [
          "一",
          "二",
          "三",
          "四",
          "五",
          "六",
          "七",
          "八",
          "九",
          "九-2",
          "十",
        ],
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
          "十-2",
        ],
      },
      { label: "beyond ten", terms: ["百", "千", "万"] },
      { label: "zero", terms: ["ゼロ", "零"] },
      {
        label: "ranking & age",
        terms: ["一番", "番", "番号", "歳", "二十歳", "半分"],
      },
    ],
  },
  {
    key: "family",
    title: "Family — Yours vs. Someone Else's",
    subtitle: "Family & People",
    insight:
      "Japanese uses one humble set of words for your own family and a separate, more polite set for someone else's family (or for addressing your own directly) — the polite forms all take お…さん. Mixing the two up is one of the most common learner slips.",
    extendedInsight:
      "The humble/polite split tracks who the family belongs to, not who you're speaking to — even when talking about your own father to a stranger, the plain form (父) stays correct.",
    examples: [
      {
        jp: "これは私の父です。",
        romaji: "Kore wa watashi no chichi desu.",
        en: "This is my father.",
      },
      {
        jp: "田中さんのお父さんは医者です。",
        romaji: "Tanaka-san no otousan wa isha desu.",
        en: "Tanaka's father is a doctor.",
      },
    ],
    commonMistake:
      "Saying 私のお父さん to a stranger sounds childish — use 父 for your own father in adult conversation with outsiders.",
    pairwise: true,
    rows: [
      { label: "father", terms: ["父", "お父さん"] },
      { label: "mother", terms: ["母", "お母さん"] },
      { label: "older brother", terms: ["兄", "お兄さん"] },
      { label: "older sister", terms: ["姉", "お姉さん"] },
      {
        label: "also useful",
        terms: ["弟", "妹", "家族", "家庭", "兄弟", "両親", "子供"],
      },
      {
        label: "extended family",
        terms: ["おじいさん", "おばあさん", "伯父", "伯母さん"],
      },
    ],
  },
  {
    key: "opposites",
    title: "Common Opposites",
    subtitle: "Adjective Pairs",
    insight:
      "Adjectives are easiest to remember in opposing pairs — and since both halves of a pair are almost always the same word type (both い-adjectives here), learning one tells you exactly how the other conjugates. Note 高い does double duty: it pairs with 安い for 'expensive/cheap' and with 低い for 'tall/short'.",
    extendedInsight:
      "Testing yourself with the opposite instead of the English gloss locks these in faster, since you're producing Japanese both times instead of translating.",
    examples: [
      {
        jp: "この部屋は大きいですが、あの部屋は小さいです。",
        romaji: "Kono heya wa ookii desu ga, ano heya wa chiisai desu.",
        en: "This room is big, but that room is small.",
      },
      {
        jp: "今日は暑いです。",
        romaji: "Kyou wa atsui desu.",
        en: "Today is hot.",
      },
    ],
    commonMistake:
      "熱い (hot to the touch) and 暑い (hot weather) are both read atsui but aren't interchangeable — 熱いお茶 ('hot tea') but 暑い日 ('a hot day').",
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
      { terms: ["早い", "遅い"] },
      { terms: ["速い", "遅い"] },
      { terms: ["太い", "細い"] },
      { terms: ["いい", "悪い"] },
      { terms: ["大きな", "小さな"] },
    ],
  },
  {
    key: "directions",
    title: "Direction & Position",
    subtitle: "Spatial Words",
    insight:
      "These attach to の + a noun to say where something is: 机の上 ('on the desk'), 家の中 ('inside the house'). The compass points and near/far pairs below cover almost every 'where is it' question you'll actually ask.",
    extendedInsight:
      "These words act like nouns, not prepositions — the noun they relate to always comes first, followed by の, then the direction word: テーブルの上 ('on top of the table'), never the reverse order English uses.",
    examples: [
      {
        jp: "猫はテーブルの下にいます。",
        romaji: "Neko wa teeburu no shita ni imasu.",
        en: "The cat is under the table.",
      },
      {
        jp: "銀行は駅の近くです。",
        romaji: "Ginkou wa eki no chikaku desu.",
        en: "The bank is near the station.",
      },
    ],
    commonMistake:
      "Word order reverses from English: 'on the desk' is 机の上, not 上の机 — the location noun always follows の, after the thing it's relative to.",
    rows: [
      {
        terms: [
          "上",
          "下",
          "前",
          "前-2",
          "後ろ",
          "中",
          "中-3",
          "外",
          "角",
          "右",
          "左",
          "隣",
          "近く",
          "そば",
          "向こう",
          "まっすぐ",
          "横",
          "辺",
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
      "赤, 青, 黒, 白, and 黄色 can all take い and inflect directly as adjectives (赤い家, 'a red house'). 緑 is grammatically a noun and needs の instead (緑の木, 'a green tree') — and while 茶色い exists as a word too, this list only carries the noun 茶色, so treat it the same way as 緑 (茶色の靴, 'brown shoes') until you learn 茶色い separately.",
    extendedInsight:
      "When in doubt whether a color takes い, it's safe to fall back to [color]の[noun] — 青の車 is grammatically fine even though 青い車 is more natural, while adding い to 緑 simply isn't a word at all.",
    examples: [
      {
        jp: "空は青いです。",
        romaji: "Sora wa aoi desu.",
        en: "The sky is blue.",
      },
      {
        jp: "緑の葉が好きです。",
        romaji: "Midori no ha ga suki desu.",
        en: "I like green leaves.",
      },
    ],
    commonMistake:
      "緑い is not a word — always say 緑の[noun], never 緑い[noun].",
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
          "色",
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
    extendedInsight:
      "Because Japanese doesn't need a subject pronoun once context is clear, these verbs strung together in て-form (起きて、食べて、行って…) can narrate an entire morning in one breath, without ever saying 私は.",
    examples: [
      {
        jp: "毎朝七時に起きます。",
        romaji: "Maiasa shichi-ji ni okimasu.",
        en: "I wake up at 7 every morning.",
      },
      {
        jp: "仕事の後、家に帰ります。",
        romaji: "Shigoto no ato, ie ni kaerimasu.",
        en: "I go home after work.",
      },
    ],
    commonMistake:
      "帰る means 'return (home / to where you belong)', not just 'go' — use 行く for a one-way trip somewhere new, and 帰る only when heading back.",
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
          "勤める",
          "仕事",
          "勉強",
          "休む",
          "洗う",
          "着る",
          "散歩",
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
    extendedInsight:
      "いくつ asks a count-based 'how many' (using the native counting set from the Numbers topic), while いくら asks 'how much' for a price — mixing the two up is a common early mistake.",
    examples: [
      {
        jp: "これはいくらですか。",
        romaji: "Kore wa ikura desu ka.",
        en: "How much is this?",
      },
      {
        jp: "りんごはいくつありますか。",
        romaji: "Ringo wa ikutsu arimasu ka.",
        en: "How many apples are there?",
      },
    ],
    commonMistake:
      "いくつ can also just mean 'how old' in casual contexts (おいくつですか) — context, not the word alone, tells you whether it's age or count.",
    rows: [
      {
        terms: [
          "何",
          "何-2",
          "誰",
          "いつ",
          "いくつ",
          "いくら",
          "どうして",
          "なぜ",
        ],
      },
    ],
  },
  {
    key: "weather",
    title: "Weather & Seasons",
    subtitle: "Weather",
    insight:
      "Seasonal words pair naturally with temperature adjectives — 夏 goes with 暑い (hot), 冬 with 寒い (cold), and 春/秋 usually get 涼しい or 暖かい (mild/cool/warm).",
    extendedInsight:
      "天気 refers to the weather as a general condition ('the weather is nice' — 天気がいい), not a specific temperature reading — don't reach for 天気 when you mean an exact degree count.",
    examples: [
      {
        jp: "今日はいい天気ですね。",
        romaji: "Kyou wa ii tenki desu ne.",
        en: "It's nice weather today, isn't it.",
      },
      {
        jp: "明日は雨が降るでしょう。",
        romaji: "Ashita wa ame ga furu deshou.",
        en: "It'll probably rain tomorrow.",
      },
    ],
    commonMistake:
      "雨 the noun needs 降る ('to fall') to describe rain actually happening — 雨です alone just states 'it's rain(y)', it doesn't describe the act of raining.",
    rows: [
      {
        terms: [
          "春",
          "夏",
          "秋",
          "冬",
          "天気",
          "雨",
          "雪",
          "曇り",
          "晴れ",
          "風",
        ],
      },
      {
        label: "temperature",
        terms: ["暖かい", "涼しい"],
      },
      {
        label: "weather actions",
        terms: ["晴れる", "曇る", "降る", "吹く"],
      },
    ],
  },
  {
    key: "body",
    title: "Body Parts",
    subtitle: "The Body",
    insight:
      "These combine with が to describe symptoms in real life — 頭が痛い ('my head hurts'), お腹が痛い ('my stomach hurts'). Swap in any body part before 痛い to say where it hurts.",
    extendedInsight:
      "頭 doubles as both 'head' (this everyday sense) and, in a far rarer JMdict entry, a counter for large animals — an unrelated leftover use that has nothing to do with the body-part sense you'll actually use daily.",
    examples: [
      {
        jp: "頭が痛いです。",
        romaji: "Atama ga itai desu.",
        en: "My head hurts.",
      },
      {
        jp: "手を洗ってください。",
        romaji: "Te o aratte kudasai.",
        en: "Please wash your hands.",
      },
    ],
    commonMistake:
      "痛い attaches after the body part with が, not は — 頭が痛い is the neutral, default way to state a symptom.",
    rows: [
      {
        terms: [
          "頭",
          "顔",
          "目",
          "耳",
          "口",
          "鼻",
          "歯",
          "手",
          "足",
          "お腹",
          "背",
          "体",
        ],
      },
      { label: "health", terms: ["病気", "風邪", "薬"] },
    ],
  },
  {
    key: "food-drink",
    title: "Food, Drink & Mealtimes",
    subtitle: "Food & Drink",
    insight:
      "Japanese builds each daily meal's name by fusing a time-of-day word with 御飯 ('cooked rice', also the generic word for 'meal') — 朝ご飯, 昼ご飯, 晩ご飯/夕飯 — because a meal is thought of around its rice, the way English centers a meal around bread or a main dish.",
    extendedInsight:
      "食べ物 ('food') and 飲み物 ('drink') are the general umbrella nouns, while 料理 specifically means a prepared dish or style of cooking (日本料理, 'Japanese cuisine') — reach for 料理 when praising what was cooked, not 食べ物.",
    examples: [
      {
        jp: "朝ご飯にパンと卵を食べます。",
        romaji: "Asagohan ni pan to tamago o tabemasu.",
        en: "I eat bread and eggs for breakfast.",
      },
      {
        jp: "この料理はとても美味しいです。",
        romaji: "Kono ryouri wa totemo oishii desu.",
        en: "This dish is very delicious.",
      },
    ],
    commonMistake:
      "晩ご飯 and 夕飯 both simply mean 'dinner/evening meal' — they're interchangeable everyday words, not a formal/casual pair, so don't overthink which one to use.",
    rows: [
      {
        label: "meals",
        terms: ["朝御飯", "昼御飯", "晩御飯", "夕飯", "御飯", "お弁当"],
      },
      { label: "general", terms: ["食べ物", "飲み物", "料理"] },
      {
        label: "meats & staples",
        terms: [
          "魚",
          "肉",
          "牛肉",
          "豚肉",
          "鶏肉",
          "卵",
          "野菜",
          "果物",
          "パン",
        ],
      },
      {
        label: "drinks & seasonings",
        terms: [
          "お茶",
          "紅茶",
          "コーヒー",
          "お酒",
          "牛乳",
          "砂糖",
          "塩",
          "醤油",
          "お菓子",
          "飴",
          "カレー",
          "バター",
        ],
      },
      {
        label: "tableware & places",
        terms: ["食堂", "茶碗", "お皿", "箸", "カップ", "コップ"],
      },
      {
        label: "taste",
        terms: ["美味しい", "まずい", "辛い", "甘い", "温い"],
      },
    ],
  },
  {
    key: "clothing",
    title: "Getting Dressed — Clothes & the Right Verb",
    subtitle: "Clothing",
    insight:
      "Japanese doesn't have one all-purpose verb for 'to wear' — which one you use depends on where the item goes: 着る for anything on the torso (シャツ, セーター), はく for anything on your legs or feet (ズボン, 靴), かぶる for anything on your head (帽子), and かける or する for small accessories (眼鏡, ネクタイ).",
    extendedInsight:
      "Once something is on, all four verbs describe the resulting state the same way with ～ている (帽子をかぶっている, 'is wearing a hat') — the verb choice only depends on the item, never on the grammar around it.",
    examples: [
      {
        jp: "今日は青いセーターを着ています。",
        romaji: "Kyou wa aoi seetaa o kite imasu.",
        en: "Today I'm wearing a blue sweater.",
      },
      {
        jp: "外は寒いから帽子をかぶってください。",
        romaji: "Soto wa samui kara boushi o kabutte kudasai.",
        en: "It's cold outside, so please wear a hat.",
      },
    ],
    commonMistake:
      "靴をはく is correct, but 靴を着る is not — 着る is reserved for the torso, so shoes, pants, and socks always take はく instead.",
    rows: [
      {
        label: "tops & outerwear",
        terms: [
          "服",
          "洋服",
          "上着",
          "シャツ",
          "ワイシャツ",
          "セーター",
          "コート",
          "背広",
        ],
      },
      {
        label: "bottoms & footwear",
        terms: ["スカート", "ズボン", "靴", "靴下"],
      },
      {
        label: "accessories",
        terms: [
          "帽子",
          "ネクタイ",
          "眼鏡",
          "ボタン",
          "ハンカチ",
          "かばん",
          "傘",
        ],
      },
      {
        label: "the wearing verbs",
        terms: [
          "はく",
          "かぶる",
          "かける",
          "掛ける",
          "する",
          "着る",
          "脱ぐ",
          "差す",
        ],
      },
    ],
  },
  {
    key: "school-supplies",
    title: "At School — People, Supplies & Language",
    subtitle: "School",
    insight:
      "This is the one topic where the vocabulary is entirely about the classroom itself — the people in it (先生, 学生), the supplies on the desk (本, ノート, 辞書), and the words for language and writing (漢字, 平仮名, 片仮名) that everything else in this pool is written in.",
    extendedInsight:
      "辞書 and 字引 both mean 'dictionary' — 辞書 is the standard modern word, while 字引 is an older, more literary synonym you'll mostly meet in reading rather than conversation.",
    examples: [
      {
        jp: "先生は毎日漢字を教えます。",
        romaji: "Sensei wa mainichi kanji o oshiemasu.",
        en: "The teacher teaches kanji every day.",
      },
      {
        jp: "辞書で言葉の意味を調べます。",
        romaji: "Jisho de kotoba no imi o shirabemasu.",
        en: "I look up the meaning of a word in the dictionary.",
      },
    ],
    commonMistake:
      "宿題 ('homework') and 質問 ('a question you ask') aren't interchangeable with 問題 ('a problem/question written down to solve') — 質問 goes to a person, 問題 sits on a page.",
    rows: [
      { label: "people", terms: ["先生", "学生", "生徒", "留学生"] },
      {
        label: "places & classes",
        terms: [
          "学校",
          "教室",
          "大学",
          "クラス",
          "授業",
          "宿題",
          "テスト",
          "練習",
        ],
      },
      {
        label: "supplies",
        terms: [
          "本",
          "ノート",
          "鉛筆",
          "ペン",
          "ボールペン",
          "万年筆",
          "紙",
          "辞書",
          "字引",
          "本棚",
          "雑誌",
          "新聞",
        ],
      },
      {
        label: "language & questions",
        terms: [
          "漢字",
          "平仮名",
          "片仮名",
          "言葉",
          "英語",
          "語",
          "文章",
          "作文",
          "質問",
          "問題",
          "答える",
        ],
      },
    ],
  },
  {
    key: "house-rooms",
    title: "Around the House",
    subtitle: "Home & Housework",
    insight:
      "家 and うち both mean 'house/home', but うち carries a warmer 'my place' feeling and can even stand in for 'my family' — 家 is the more neutral, literal word for the building itself.",
    extendedInsight:
      "The rooms below combine with の the same way the Direction & Position words do (台所の窓, 'the kitchen window') — once you know a handful of rooms, you can locate anything in the house with spatial vocabulary you already have.",
    examples: [
      {
        jp: "毎朝お風呂に入ります。",
        romaji: "Maiasa ofuro ni hairimasu.",
        en: "I take a bath every morning.",
      },
      {
        jp: "週末に洗濯と掃除をします。",
        romaji: "Shuumatsu ni sentaku to souji o shimasu.",
        en: "I do the laundry and cleaning on the weekend.",
      },
    ],
    commonMistake:
      "洗濯 ('laundry') and 掃除 ('cleaning') both pair with する rather than having a dedicated verb of their own — 洗濯する and 掃除する are the whole pattern, just like 勉強する.",
    rows: [
      { label: "home", terms: ["家", "うち", "アパート", "部屋", "住む"] },
      {
        label: "rooms & fixtures",
        terms: [
          "台所",
          "お手洗い",
          "お風呂",
          "玄関",
          "階段",
          "窓",
          "戸",
          "ドア",
          "庭",
          "廊下",
          "鍵",
        ],
      },
      {
        label: "housework & routine",
        terms: ["石鹸", "浴びる", "磨く", "掃除", "洗濯"],
      },
    ],
  },
  {
    key: "gadgets-entertainment",
    title: "Furniture, Gadgets & Entertainment",
    subtitle: "Household Items",
    insight:
      "Many of these are borrowed words that sound close to their English original once you know katakana — テレビ (television), ラジオ (radio), カメラ (camera), ギター (guitar) — so this group is often faster to learn than native vocabulary of the same size.",
    extendedInsight:
      "写真, フィルム, and カメラ form a natural trio around picture-taking (撮る from Giving, Taking & Handling Things is the verb that ties them together: 写真を撮る, 'to take a photo').",
    examples: [
      {
        jp: "居間にテレビと冷蔵庫があります。",
        romaji: "Ima ni terebi to reizouko ga arimasu.",
        en: "There's a TV and a refrigerator in the living room.",
      },
      {
        jp: "暇な時、音楽を聞きます。",
        romaji: "Hima na toki, ongaku o kikimasu.",
        en: "In my free time, I listen to music.",
      },
    ],
    commonMistake:
      "音楽 needs 聞く ('to listen') to describe listening to it, not 見る — 音楽を見る is wrong, even though watching a music video would use 見る for the video part.",
    rows: [
      { label: "furniture", terms: ["椅子", "机", "テーブル", "ベッド", "箱"] },
      {
        label: "electronics",
        terms: [
          "テレビ",
          "ラジオ",
          "ラジオカセ",
          "テープ",
          "テープレコーダー",
          "カメラ",
          "フィルム",
          "電話",
          "電気",
          "時計",
          "カレンダー",
          "写真",
          "花瓶",
          "冷蔵庫",
          "ストーブ",
          "シャワー",
        ],
      },
      {
        label: "hobbies",
        terms: [
          "音楽",
          "スポーツ",
          "ギター",
          "弾く",
          "ニュース",
          "レコード",
          "歌",
          "歌う",
          "絵",
          "映画",
          "映画館",
          "遊ぶ",
        ],
      },
    ],
  },
  {
    key: "places-town",
    title: "Places Around Town",
    subtitle: "Town & Errands",
    insight:
      "This is the everyday-errands map of a town — bank, hospital, post office, library, department store — each one a destination you'd name after に行きます ('I'm going to...'), so learning them as a set makes it easy to describe your whole day out.",
    extendedInsight:
      "The mail-related items (切手, 葉書, 封筒, ポスト) all cluster naturally around 郵便局 ('post office') — remembering the building pulls the smaller vocabulary in with it.",
    examples: [
      {
        jp: "銀行の隣に郵便局があります。",
        romaji: "Ginkou no tonari ni yuubinkyoku ga arimasu.",
        en: "There's a post office next to the bank.",
      },
      {
        jp: "はがきに切手を貼ります。",
        romaji: "Hagaki ni kitte o harimasu.",
        en: "I put a stamp on the postcard.",
      },
    ],
    commonMistake:
      "外国 ('a foreign country') and 外国人 ('a foreigner') are easy to mix up since they share the same first two characters — the second one always refers to a person, never a place.",
    rows: [
      {
        label: "errands & buildings",
        terms: [
          "銀行",
          "病院",
          "郵便局",
          "公園",
          "図書館",
          "デパート",
          "喫茶店",
          "レストラン",
          "ホテル",
          "大使館",
          "交番",
          "会社",
          "店",
          "八百屋",
        ],
      },
      {
        label: "places & geography",
        terms: [
          "町",
          "村",
          "国",
          "外国",
          "建物",
          "入口",
          "出口",
          "所",
          "地図",
          "橋",
          "門",
        ],
      },
      {
        label: "mail",
        terms: ["切手", "葉書", "封筒", "ポスト", "手紙", "貼る"],
      },
    ],
  },
  {
    key: "transportation",
    title: "Getting Around Town",
    subtitle: "Transportation",
    insight:
      "駅 ('station') is the hub this whole group orbits around — 電車, 地下鉄, バス, and タクシー are all things you catch there, while 車, 自動車, and 自転車 are the ones you don't need a station for at all.",
    extendedInsight:
      "自動車 and 車 both mean 'car' — 車 is the everyday word, while 自動車 is the more formal/technical term you'll see in writing (signs, news) more than in casual speech.",
    examples: [
      {
        jp: "毎日電車で学校に行きます。",
        romaji: "Mainichi densha de gakkou ni ikimasu.",
        en: "I go to school by train every day.",
      },
      {
        jp: "旅行のかばんは重いです。",
        romaji: "Ryokou no kaban wa omoi desu.",
        en: "The travel bag is heavy.",
      },
    ],
    commonMistake:
      "The vehicle you travel by takes で ('by means of'), not に or を — 電車で行きます is correct, 電車を行きます is not.",
    rows: [
      {
        label: "vehicles",
        terms: [
          "電車",
          "地下鉄",
          "バス",
          "車",
          "自動車",
          "自転車",
          "タクシー",
          "飛行機",
        ],
      },
      { label: "getting there", terms: ["駅", "切符", "交差点", "道"] },
      { label: "travel", terms: ["荷物", "旅行"] },
    ],
  },
  {
    key: "motion-verbs",
    title: "Motion Verbs — Getting From A to B",
    subtitle: "Movement",
    insight:
      "行く/来る/帰る (from A Day in Verbs) cover the big three directions; these fill in everything in between — how you get there (歩く, 走る, 泳ぐ, 飛ぶ) and what happens at each end (乗る/降りる to board/get off, 出る/入る to leave/enter).",
    extendedInsight:
      "乗る and 降りる are a matched pair for any vehicle — 電車に乗る ('get on the train'), 電車を降りる ('get off the train') — notice the particle itself flips from に to を between the two.",
    examples: [
      {
        jp: "駅まで歩いて、電車に乗ります。",
        romaji: "Eki made aruite, densha ni norimasu.",
        en: "I walk to the station and get on the train.",
      },
      {
        jp: "次の駅で降ります。",
        romaji: "Tsugi no eki de orimasu.",
        en: "I'll get off at the next station.",
      },
    ],
    commonMistake:
      "着く ('to arrive') is not the same as 行く ('to go') — 着く describes reaching the destination, so it pairs with に (駅に着く), where 行く describes the trip itself.",
    rows: [
      {
        terms: [
          "歩く",
          "走る",
          "飛ぶ",
          "泳ぐ",
          "乗る",
          "降りる",
          "渡る",
          "曲る",
          "止まる",
          "着く",
          "出かける",
          "出る",
          "入る",
          "立つ",
          "座る",
          "並ぶ",
        ],
      },
    ],
  },
  {
    key: "handling-verbs",
    title: "Giving, Taking & Handling Things",
    subtitle: "Handling Objects",
    insight:
      "These are the verbs behind almost any transaction involving an object: 持つ (hold/carry it), 取る (take it), 置く (put it down), 貸す/借りる (lend/borrow it), and 渡す (hand it over) — learn them as a set and you can narrate handing anything to anyone.",
    extendedInsight:
      "貸す and 借りる are a mirror pair like 教える/習う — 貸す is what the lender does, 借りる is what the borrower does, and mixing up which side you're on is the single most common slip with this pair.",
    examples: [
      {
        jp: "友達に本を貸しました。",
        romaji: "Tomodachi ni hon o kashimashita.",
        en: "I lent my friend a book.",
      },
      {
        jp: "図書館で本を借ります。",
        romaji: "Toshokan de hon o karimasu.",
        en: "I borrow books at the library.",
      },
    ],
    commonMistake:
      "貸す ('to lend') and 借りる ('to borrow') describe opposite roles in the same exchange — 本を貸します means you're giving it away temporarily, not receiving it.",
    rows: [
      {
        terms: [
          "持つ",
          "取る",
          "撮る",
          "置く",
          "入れる",
          "出す",
          "渡す",
          "貸す",
          "借りる",
          "返す",
          "上げる",
          "やる",
          "使う",
          "作る",
          "並べる",
          "切る",
          "物",
        ],
      },
    ],
  },
  {
    key: "learning-communication",
    title: "Learning & Communicating",
    subtitle: "Speaking & Understanding",
    insight:
      "話す ('to speak') and 言う ('to say') both translate as 'say/speak' in English but aren't interchangeable — 話す is about the act of conversing (日本語を話す, 'to speak Japanese'), while 言う introduces specific words someone said.",
    extendedInsight:
      "分かる ('to understand') describes a state, not an action you do on purpose — you can't 分かる something on command the way you can 見る or 聞く, which is why it's almost always used with が rather than を (日本語が分かります).",
    examples: [
      {
        jp: "彼はゆっくり日本語を話します。",
        romaji: "Kare wa yukkuri nihongo o hanashimasu.",
        en: "He speaks Japanese slowly.",
      },
      {
        jp: "先生の言葉の意味が分かりません。",
        romaji: "Sensei no kotoba no imi ga wakarimasen.",
        en: "I don't understand the meaning of the teacher's words.",
      },
    ],
    commonMistake:
      "覚える means 'to learn/commit to memory' (an ongoing effort), while 分かる means 'to understand' (a state achieved) — you 覚える vocabulary over time, but you either 分かる a sentence or you don't.",
    rows: [
      {
        terms: [
          "言う",
          "話す",
          "聞く",
          "読む",
          "書く",
          "呼ぶ",
          "見る",
          "見せる",
          "知る",
          "分かる",
          "覚える",
          "教える",
          "習う",
          "頼む",
          "忘れる",
          "話",
          "声",
          "意味",
        ],
      },
    ],
  },
  {
    key: "people",
    title: "Talking About People",
    subtitle: "People",
    insight:
      "誰か ('someone') and どなた (the polite form of 'who') work like the question words from Asking Questions — swap in a name or a specific person once you know who you're asking about.",
    extendedInsight:
      "生まれる, 結婚, and 死ぬ are the three big life-event verbs — 結婚 pairs with する (結婚する, 'to get married') the same way any suru-noun does, while 生まれる and 死ぬ are plain verbs on their own.",
    examples: [
      {
        jp: "あの女の子は友達です。",
        romaji: "Ano onna no ko wa tomodachi desu.",
        en: "That girl is my friend.",
      },
      {
        jp: "田中さんは去年結婚しました。",
        romaji: "Tanaka-san wa kyonen kekkon shimashita.",
        en: "Mr./Ms. Tanaka got married last year.",
      },
    ],
    commonMistake:
      "皆さん (addressing a group directly, 'everyone') and みんな (talking about a group, 'everybody') overlap in meaning, but みんな is more casual — use 皆さん when speaking politely to the group itself.",
    rows: [
      {
        label: "general",
        terms: [
          "私",
          "私-2",
          "あなた",
          "人-3",
          "大人",
          "男",
          "女",
          "男の子",
          "女の子",
          "友達",
          "自分",
          "一人",
          "二人",
          "方",
        ],
      },
      {
        label: "who?",
        terms: ["誰か", "どなた", "皆さん", "みんな", "大勢", "外-2"],
      },
      {
        label: "occupations",
        terms: ["警官", "おまわりさん", "医者", "外国人", "奥さん"],
      },
      {
        label: "life events",
        terms: ["名前", "会う", "生まれる", "死ぬ", "結婚"],
      },
    ],
  },
  {
    key: "feelings-states",
    title: "How You're Feeling",
    subtitle: "Feelings & Conditions",
    insight:
      "好き and 嫌い ('like' and 'dislike') are grammatically な-adjectives, not verbs — so 'I like sushi' is 寿司が好きです (literally 'sushi is likeable to me'), with が marking what's liked, not を.",
    extendedInsight:
      "大丈夫 covers a wide range of English — 'okay', 'fine', 'no need to worry', even 'no thank you' when politely declining something — context does most of the work in picking the right translation.",
    examples: [
      {
        jp: "今日はとても忙しいです。",
        romaji: "Kyou wa totemo isogashii desu.",
        en: "Today I'm very busy.",
      },
      {
        jp: "大丈夫です、心配しないでください。",
        romaji: "Daijoubu desu, shinpai shinaide kudasai.",
        en: "It's okay, please don't worry.",
      },
    ],
    commonMistake:
      "好き and 嫌い take が for the thing liked or disliked, not を — 猫が好きです is correct, 猫を好きです is not, even though 'like' feels like it should take a direct object in English.",
    rows: [
      {
        terms: [
          "忙しい",
          "疲れる",
          "元気",
          "大丈夫",
          "結構",
          "大変",
          "暇",
          "楽しい",
          "好き",
          "嫌い",
          "嫌",
          "大好き",
          "欲しい",
          "痛い",
          "危ない",
          "困る",
        ],
      },
    ],
  },
  {
    key: "descriptive-adjectives",
    title: "Describing People, Places & Things",
    subtitle: "Descriptions",
    insight:
      "Most of these are な-adjectives (静か, 便利, 有名, 大切) rather than い-adjectives — insert な before a noun (静かな部屋) and だ/です at the end of a sentence (静かです), the same rule the Word Types section covers for な-adjectives generally.",
    extendedInsight:
      "上手 and 下手 describe someone else's skill politely — describing your own skill as 上手 sounds boastful in Japanese, so speakers downplay their own ability instead, often with 下手 or a modest disclaimer.",
    examples: [
      {
        jp: "この部屋はとても静かです。",
        romaji: "Kono heya wa totemo shizuka desu.",
        en: "This room is very quiet.",
      },
      {
        jp: "田中さんは料理が上手です。",
        romaji: "Tanaka-san wa ryouri ga jouzu desu.",
        en: "Tanaka is good at cooking.",
      },
    ],
    commonMistake:
      "きれい and りっぱ both end in い but conjugate as な-adjectives, not い-adjectives — きれいい and りっぱい are never correct forms.",
    rows: [
      {
        terms: [
          "綺麗",
          "汚い",
          "静か",
          "にぎやか",
          "便利",
          "大切",
          "有名",
          "可愛い",
          "上手",
          "下手",
          "丈夫",
          "りっぱ",
          "同じ",
          "違う",
          "明るい",
          "暗い",
          "厚い",
          "薄い",
          "若い",
          "悪い",
          "うるさい",
          "色々",
          "丸い",
          "たて",
        ],
      },
    ],
  },
  {
    key: "shopping-money",
    title: "Money & Shopping",
    subtitle: "Shopping",
    insight:
      "買う and 売る are a mirror pair — one side of every purchase is 買う ('to buy'), the other is 売る ('to sell') — and 買い物 is the general activity noun for 'shopping', usually paired with する (買い物する) or に行く (買い物に行く, 'to go shopping').",
    extendedInsight:
      "財布 ('wallet') and お金 ('money') are often confused by beginners because both come up in the same sentences about paying — 財布 is the physical object, お金 is what's inside it.",
    examples: [
      {
        jp: "デパートで靴を買いました。",
        romaji: "Depaato de kutsu o kaimashita.",
        en: "I bought shoes at the department store.",
      },
      {
        jp: "財布にお金がありません。",
        romaji: "Saifu ni okane ga arimasen.",
        en: "There's no money in my wallet.",
      },
    ],
    commonMistake:
      "買い物 is the noun for the activity of shopping, not a verb by itself — it always needs する or another verb attached (買い物します, 買い物に行きます).",
    rows: [{ terms: ["お金", "財布", "買い物", "買う", "売る"] }],
  },
  {
    key: "greetings-fillers",
    title: "Conversation Fillers & Connectors",
    subtitle: "Everyday Expressions",
    insight:
      "These don't carry dictionary meaning the way nouns and verbs do — they're the connective tissue that makes spoken Japanese sound natural, signaling agreement, a change of topic, or a transition to what's next.",
    extendedInsight:
      "では, じゃ/じゃあ, and それでは all work as 'well then...' to close one topic and open the next — じゃ/じゃあ is the casual version, では and それでは are more polite/formal, and all three are common ways to end a phone call or wrap up a conversation.",
    examples: [
      {
        jp: "もしもし、田中です。",
        romaji: "Moshi moshi, Tanaka desu.",
        en: "Hello, this is Tanaka (on the phone).",
      },
      {
        jp: "じゃあ、また明日。",
        romaji: "Jaa, mata ashita.",
        en: "Well then, see you tomorrow.",
      },
    ],
    commonMistake:
      "もしもし is only used to answer or start a phone call — using it to get someone's attention in person sounds strange; すみません is the word for that instead.",
    rows: [
      {
        label: "yes / agreement",
        terms: ["はい", "いいえ", "ええ", "そう", "本当"],
      },
      {
        label: "transitions",
        terms: [
          "では",
          "じゃ",
          "それでは",
          "それから",
          "そうして",
          "でも",
          "しかし",
        ],
      },
      {
        label: "phone & attention",
        terms: ["もしもし", "さあ", "どうぞ", "どうも", "ああ", "下さい"],
      },
      { label: "asking politely", terms: ["いかが", "どう"] },
    ],
  },
  {
    key: "sequence-words",
    title: "Before, Next & After — Sequencing Words",
    subtitle: "Sequence & Order",
    insight:
      "These narrate the order of events without needing a specific time — 先 (earlier/ahead), 次 (next), 後 (after/later) — the same way English uses 'first', 'then', 'after that' to string a story together.",
    extendedInsight:
      "初め(始め) marks the beginning of something and 終わる marks its end, while 始まる is what a thing does when it begins on its own (授業が始まる, 'class begins') — the pool doesn't include 始める, the version where someone begins it, but it's worth knowing the pair exists.",
    examples: [
      {
        jp: "授業は九時に始まります。",
        romaji: "Jugyou wa ku-ji ni hajimarimasu.",
        en: "Class begins at 9 o'clock.",
      },
      {
        jp: "先にご飯を食べて、後でシャワーを浴びます。",
        romaji: "Saki ni gohan o tabete, ato de shawaa o abimasu.",
        en: "I'll eat first, and take a shower afterward.",
      },
    ],
    commonMistake:
      "先 can mean both 'ahead/previous' and 'the future/what's next' depending on context — 先に行きます ('I'll go ahead') and 先のことは分かりません ('I don't know about the future') use the same word for near-opposite time directions.",
    rows: [{ terms: ["先", "次", "後", "初め", "終る", "始まる", "初めて"] }],
  },
  {
    key: "time-of-day",
    title: "Parts of the Day",
    subtitle: "Time of Day",
    insight:
      "朝/昼/晩/夜 divide the day into morning/midday/evening/night, and prefixing 今 or 昨 gives you 'this morning' (今朝) or 'last night' (昨夜) — the same irregular-root pattern as 今日/昨日 from the Time-Word Grid, so these are worth learning alongside it.",
    extendedInsight:
      "午前 and 午後 (literally 'before noon' and 'after noon') are what make a 12-hour clock time unambiguous — 午後三時 ('3 PM') versus plain 三時, which could mean 3 AM or 3 PM without them.",
    examples: [
      {
        jp: "今晩、映画を見ます。",
        romaji: "Konban, eiga o mimasu.",
        en: "Tonight, I'll watch a movie.",
      },
      {
        jp: "会議は午後二時半からです。",
        romaji: "Kaigi wa gogo ni-ji han kara desu.",
        en: "The meeting is from 2:30 PM.",
      },
    ],
    commonMistake:
      "今朝 ('this morning') and 毎朝 ('every morning') look similar but aren't interchangeable — 今朝 is one specific morning that already happened or is happening, 毎朝 is a repeated habit.",
    rows: [
      {
        terms: [
          "今",
          "朝",
          "昼",
          "晩",
          "夜",
          "今朝",
          "今晩",
          "午前",
          "午後",
          "半",
          "夕方",
          "昨夜",
        ],
      },
    ],
  },
  {
    key: "degree-frequency",
    title: "How Much & How Often",
    subtitle: "Degree & Frequency Adverbs",
    insight:
      "とても (very), 少し/ちょっと (a little), and 沢山 (a lot) sit on a single scale of amount — swap one in front of any adjective or verb to dial its intensity up or down, no conjugation required.",
    extendedInsight:
      "余り works almost only with a negative verb to mean 'not very' (余り好きじゃない, 'not very fond of it') — used with a positive verb it instead means 'leftover/excess', a very different word.",
    examples: [
      {
        jp: "この本は少し難しいです。",
        romaji: "Kono hon wa sukoshi muzukashii desu.",
        en: "This book is a little difficult.",
      },
      {
        jp: "彼はまだ来ていません。",
        romaji: "Kare wa mada kite imasen.",
        en: "He hasn't come yet.",
      },
    ],
    commonMistake:
      "もう ('already') and まだ ('still/not yet') are opposites easy to swap under pressure — もう食べました ('I already ate') versus まだ食べていません ('I haven't eaten yet') describe opposite situations with the same verb.",
    rows: [
      {
        label: "amount",
        terms: ["とても", "余り", "少し", "ちょっと", "沢山", "もっと"],
      },
      { label: "frequency", terms: ["いつも", "よく", "時々", "全部"] },
      { label: "already / still / again", terms: ["まだ", "もう", "また"] },
      {
        label: "manner",
        terms: ["すぐに", "丁度", "段々", "一緒", "ゆっくりと", "多分"],
      },
    ],
  },
  {
    key: "days-of-month",
    title: "Counting the Days of the Month",
    subtitle: "Calendar Dates",
    insight:
      "The first ten days of the month use old, irregular readings that don't follow number+日 at all — ついたち (1st), ふつか (2nd), みっか (3rd)... とおか (10th) — and the 20th keeps its own irregular reading too, はつか, even though 21st onward goes back to being regular.",
    extendedInsight:
      "一日 is written identically whether it means 'one day' (duration, read いちにち) or 'the 1st of the month' (read ついたち) — only the reading tells them apart, and only context tells you which reading is meant.",
    examples: [
      {
        jp: "誕生日は五月三日です。",
        romaji: "Tanjoubi wa gogatsu mikka desu.",
        en: "My birthday is May 3rd.",
      },
      {
        jp: "夏休みは七月二十日から始まります。",
        romaji: "Natsuyasumi wa shichigatsu hatsuka kara hajimarimasu.",
        en: "Summer vacation starts from July 20th.",
      },
    ],
    commonMistake:
      "二十日 is read はつか, not にじゅうにち — like 二十歳 (はたち) from the Numbers group, this is one of the calendar's own irregular exceptions, not a typo.",
    rows: [
      {
        label: "1st–10th",
        terms: [
          "一日-2",
          "二日",
          "三日",
          "四日",
          "五日",
          "六日",
          "七日",
          "八日",
          "九日",
          "十日",
        ],
      },
      { label: "20th (irregular)", terms: ["二十日"] },
      { label: "calendar words", terms: ["誕生日", "休み", "夏休み"] },
    ],
  },
  {
    key: "nature-animals",
    title: "Nature, Animals & the Outdoors",
    subtitle: "Nature & Animals",
    insight:
      "These are the basic nouns for the natural world and the small set of verbs that go with them — flowers 咲く (bloom), animals 鳴く (cry out), climbers 登る (climb a mountain). None of these conjugate in unusual ways; they're worth learning together simply because any nature scene in Japanese reliably calls on the same dozen or so words.",
    extendedInsight:
      "犬 and 猫 are also the two animals every textbook reaches for first when teaching が for existence (公園に犬がいます, 'there's a dog in the park') — see Existing, Becoming & Being Able To below for how ある/いる split along the same animate/inanimate line these two words sit on either side of.",
    examples: [
      {
        jp: "公園に犬と猫がいます。",
        romaji: "Kouen ni inu to neko ga imasu.",
        en: "There's a dog and a cat in the park.",
      },
      {
        jp: "夏に花が咲きます。",
        romaji: "Natsu ni hana ga sakimasu.",
        en: "Flowers bloom in summer.",
      },
    ],
    commonMistake:
      "動物 ('animal', the general category) isn't reached for the way English says 'the dog is an animal' in casual speech — Japanese usually just names the specific animal (犬, 猫, 鳥) unless the sentence is actually about animals as a category.",
    rows: [
      {
        label: "sky, land & water",
        terms: ["空", "海", "山", "川", "池", "木", "花", "水"],
      },
      { label: "animals", terms: ["犬", "猫", "鳥", "動物"] },
      { label: "nature verbs", terms: ["咲く", "鳴く", "登る"] },
    ],
  },
  {
    key: "state-change-verbs",
    title: "Opening, Closing & Switching",
    subtitle: "State-Change Verbs",
    insight:
      "Japanese frequently pairs an intransitive verb (something happens on its own) with a transitive twin (someone makes it happen) — 開く/開ける ('open by itself' / 'open it') and 閉まる/閉める ('close by itself' / 'close it') are the clearest examples. Learn them as pairs, not as isolated vocabulary, since knowing one tells you the other exists.",
    extendedInsight:
      "締める looks like a third member of the 閉める family but actually means something different — 'to tie/fasten/tighten' (ネクタイを締める, 'to tie a necktie'), not 'to close'. The shared める ending is a conjugation coincidence, not a shared meaning.",
    examples: [
      {
        jp: "ドアが自動的に開きます。",
        romaji: "Doa ga jidouteki ni hirakimasu.",
        en: "The door opens automatically.",
      },
      {
        jp: "窓を閉めてください。",
        romaji: "Mado o shimete kudasai.",
        en: "Please close the window.",
      },
    ],
    commonMistake:
      "ドアが開けます is backwards — a door opening by itself takes the intransitive 開く (ドアが開きます); 開ける needs a person doing the opening (私がドアを開けます).",
    rows: [
      {
        label: "open ⇄ close",
        terms: ["開く", "開ける", "閉まる", "閉める", "締める"],
      },
      { label: "on/off & appear/vanish", terms: ["つける", "消える", "消す"] },
    ],
  },
  {
    key: "existence-state-verbs",
    title: "Existing, Becoming & Being Able To",
    subtitle: "State Verbs",
    insight:
      "ある and いる both mean 'there is/exists', but Japanese splits them by whether the subject is alive — いる (居る) for people and animals, ある (有る/在る, two kanji for the same word) for objects, places, and abstract things. 要る is a same-sounding but unrelated word meaning 'to need', told apart only by its own kanji and by context.",
    extendedInsight:
      "Most everyday writing leaves ある/いる/要る in plain kana rather than their kanji forms (有る, 在る, 居る, 要る) shown here — the kanji are valid, but you'll meet the kana spelling far more often outside of formal writing.",
    examples: [
      {
        jp: "机の上に本があります。",
        romaji: "Tsukue no ue ni hon ga arimasu.",
        en: "There's a book on the desk.",
      },
      {
        jp: "教室に学生がいます。",
        romaji: "Kyoushitsu ni gakusei ga imasu.",
        en: "There are students in the classroom.",
      },
    ],
    commonMistake:
      "猫がある is wrong — animate things (people, animals) always take いる, never ある, no matter how the sentence is phrased.",
    rows: [
      {
        label: "existence (ある/いる)",
        terms: ["在る", "有る", "居る", "要る", "ない"],
      },
      {
        label: "becoming, costing, able to",
        terms: ["なる", "かかる", "できる"],
      },
    ],
  },
  {
    key: "counters",
    title: "Counters — One Suffix, Any Number",
    subtitle: "Counting Objects, People & Occurrences",
    insight:
      "Counters attach directly onto a number to say how many of something there are, and which counter you use depends on the shape or category of what's being counted — ～枚 for flat things, ～匹 for small animals, ～本 for long cylindrical things, ～人 for people. This is the same idea the Counters, Prefixes & Suffixes word type covers grammatically; here they're grouped by what they actually count.",
    extendedInsight:
      "～人 shows up twice in the pool with two different readings — じん (as in 日本人, 'a Japanese person', a nationality suffix) and にん (as in 三人, 'three people', the actual counter) — same kanji, two unrelated jobs.",
    examples: [
      {
        jp: "りんごを二個ください。",
        romaji: "Ringo o ni-ko kudasai.",
        en: "Two apples, please.",
      },
      {
        jp: "この本は三冊あります。",
        romaji: "Kono hon wa san-satsu arimasu.",
        en: "There are three copies of this book.",
      },
    ],
    commonMistake:
      "Swapping counters for the wrong shape category is one of the most common learner slips — 猫が一枚 sounds as odd in Japanese as 'one sheet of cat' does in English; 匹 is the counter for small animals, not 枚.",
    rows: [
      {
        label: "objects",
        terms: ["個", "枚", "本-2", "杯", "匹", "冊", "台"],
      },
      { label: "occurrences & measures", terms: ["回", "度", "階", "円"] },
      { label: "people & titles", terms: ["人", "人-2", "さん", "たち"] },
      {
        label: "attaching to anything",
        terms: ["お", "など", "だけ", "ずつ", "がる", "側", "中-2", "屋"],
      },
    ],
  },
  {
    key: "counting-time",
    title: "Counting Time — Hours, Days & Duration",
    subtitle: "Time & Duration",
    insight:
      "A second, separate set of counters exists just for time: ～時 (o'clock), ～分 (minutes), ～日 (days), ～週間 (weeks), ～か月 (months), ～年 (years) — each stacks onto a number the same way object counters do, just for measuring duration instead of counting items.",
    extendedInsight:
      "～時 is genuinely two different words that happen to share a kanji — ～時 read じ means 'o'clock' (三時, '3 o'clock'), while ～時 read とき means 'at the time of ~' (子供の時, 'when I was a child') — context, not the kanji, tells them apart.",
    examples: [
      {
        jp: "会議は一時間かかります。",
        romaji: "Kaigi wa ichi-jikan kakarimasu.",
        en: "The meeting takes one hour.",
      },
      {
        jp: "日本に三か月住んでいます。",
        romaji: "Nihon ni san-kagetsu sunde imasu.",
        en: "I've lived in Japan for three months.",
      },
    ],
    commonMistake:
      "時間 alone (no number attached) just means 'time' as a noun (時間がありません, 'I don't have time') — it only becomes the duration counter '~ hours' once a number is attached in front of it (三時間, 'three hours').",
    rows: [
      {
        label: "clock & duration",
        terms: ["時", "時間", "時間-2", "分", "時-2"],
      },
      {
        label: "days, weeks, months, years",
        terms: ["日", "週間", "か月", "月", "年", "年-2", "一日", "一月"],
      },
      { label: "approximate time", terms: ["ころ", "すぎ", "くらい"] },
    ],
  },
  {
    key: "loanwords",
    title: "More Katakana Loanwords",
    subtitle: "Borrowed Words",
    insight:
      "Katakana loanwords are often faster to learn than native vocabulary of the same size, since many sound close to their English source once you know the katakana syllabary — スプーン (spoon), フォーク (fork), トイレ (toilet), プール (pool). Reading them aloud is usually the fastest way to recognize the English word hiding inside.",
    extendedInsight:
      "キロ appears twice in the pool with the exact same katakana and reading, because it's short for two different metric units depending on context — キログラム ('kilogram') or キロメートル ('kilometer') — only the surrounding sentence tells you which one is meant.",
    examples: [
      {
        jp: "スプーンとフォークをください。",
        romaji: "Supuun to fooku o kudasai.",
        en: "A spoon and fork, please.",
      },
      {
        jp: "エレベーターで五階に行きます。",
        romaji: "Erebeetaa de go-kai ni ikimasu.",
        en: "I'll go to the 5th floor by elevator.",
      },
    ],
    commonMistake:
      "コピーする is a suru-verb like 勉強する, not a plain verb on its own — コピーします, never a conjugated コピーる form, since that doesn't exist.",
    rows: [
      {
        label: "measurements",
        terms: ["キロ", "キロ-2", "グラム", "メートル"],
      },
      {
        label: "everyday objects",
        terms: [
          "スプーン",
          "フォーク",
          "ナイフ",
          "マッチ",
          "ポケット",
          "ページ",
          "トイレ",
          "エレベーター",
          "プール",
        ],
      },
      { label: "activities", terms: ["パーティー", "ペット", "コピーする"] },
    ],
  },
  {
    key: "everyday-essentials",
    title: "A Few More Essentials",
    subtitle: "Odds & Ends",
    insight:
      "Not every N5 word fits neatly into a bigger pattern — these are genuinely useful, high-frequency words that simply don't share a common thread with each other beyond both being essential and easy to mix up with a similar-sounding neighbor.",
    extendedInsight:
      "引く and 押す are worth learning as a pair even though they landed here rather than in the Common Opposites topic above — most doors and drawers in Japan are labelled with exactly these two characters, 押す (push) and 引く (pull).",
    examples: [
      {
        jp: "このドアを引いてください。",
        romaji: "Kono doa o hiite kudasai.",
        en: "Please pull this door.",
      },
      {
        jp: "バス停で友達を待ちます。",
        romaji: "Basutei de tomodachi o machimasu.",
        en: "I'll wait for my friend at the bus stop.",
      },
    ],
    commonMistake:
      "無くす ('to lose something', an action you did) and ない ('there isn't/doesn't exist', a state) share the same 無 root but aren't interchangeable — 財布を無くした ('I lost my wallet') describes an event, not the current state of not having one.",
    rows: [
      { label: "actions", terms: ["押す", "引く", "待つ", "無くす", "吸う"] },
      { label: "objects", terms: ["たばこ", "灰皿"] },
    ],
  },
];
