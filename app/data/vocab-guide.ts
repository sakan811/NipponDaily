/**
 * Curated companion content for the N5 Vocabulary section: the index at
 * app/pages/vocab/index.vue and its per-topic dedicated pages,
 * app/pages/vocab/families/[key].vue (one per WORD_CLUSTERS entry) and
 * app/pages/vocab/types/[key].vue (one per WORD_TYPE_GROUPS entry). None
 * of this is dictionary data — it's editorial grouping/insight text laid
 * on top of the real N5Vocab pool fetched from GET /api/n5-vocab at
 * runtime.
 *
 * WORD_CLUSTERS reference terms by their exact `term` surface form from
 * the N5 word list (elzup/jlpt-word-list's n5.csv, the same source
 * scripts/seed-n5-data.mjs reads) so the page can look each one up in the
 * fetched pool and simply skip any that aren't found, rather than
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
      "Personal pronouns (私, あなた) plus the こそあど demonstrative series — see the Word Families section above for how the whole この/その/あの/どの pattern fits together.",
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
  /** Exact `term` values to look up in the fetched N5Vocab pool. */
  terms: string[];
}

export interface WordCluster {
  key: string;
  title: string;
  subtitle: string;
  insight: string;
  /** A second paragraph of depth shown only on this cluster's dedicated /vocab/families/[key] page. */
  extendedInsight?: string;
  examples?: TopicExample[];
  /** A single common learner pitfall specific to this cluster, shown on its dedicated page. */
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
      "Japanese runs two number systems side by side: Sino-Japanese (いち, に, さん…) for math, phone numbers, dates, and prices, and a native counting set (ひとつ, ふたつ, みっつ…) for counting objects generically when there's no specific counter word. The native set caps at とお (ten) — not shown in the row below since 十 in the pool resolves to the Sino-Japanese じゅう reading, not とお.",
    extendedInsight:
      "Beyond とお, the native set simply stops — from eleven onward, and for anything you'd count with a specific counter word like 枚 or 匹, Japanese always switches back to the Sino-Japanese set.",
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
      "Native counting words (ひとつ, ふたつ…) can't be used for phone numbers, dates, or math — those always take the Sino-Japanese set.",
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
      { terms: ["何", "誰", "いつ", "いくつ", "いくら", "どうして", "なぜ"] },
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
      { terms: ["頭", "顔", "目", "耳", "口", "歯", "手", "足", "お腹", "背"] },
    ],
  },
];
