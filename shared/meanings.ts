/**
 * Meaning helpers shared by the reference builders
 * (scripts/build-*-reference.mjs) and the content checks under test/content/,
 * so every place a word's meaning is recorded or verified agrees on what that
 * meaning is.
 */

/**
 * Fuller glosses for N5 words whose source-list meaning (elzup/jlpt-word-list)
 * names only one of several everyday senses — e.g. 早い was only "early",
 * though it's just as often "quick", and 取る only covered "take (a class)".
 * Keyed by `term kana` (like scripts/lib/word-list.mjs's overrides) so a
 * homograph with a different reading is never touched. Applied by
 * servedVocab() when the reference snapshots are built.
 */
export const VOCAB_MEANING_ENRICHMENTS: Record<string, string> = {
  "取る とる": "to take, to pick up; to get (a grade); to take (a class)",
  "早い はやい": "early; quick, soon",
  "鳥 とり": "bird; chicken",
  "口 くち": "mouth; opening; job opening",
  "つける つける": "to turn on (e.g., a light); to attach, to put on",
  "次 つぎ": "next, following",
  "方 かた": "person (polite form of 人); way of doing",
  "出る でる": "to leave, to go out; to appear; to attend",
  "見る みる": "to see, to look at, to watch",
  "立つ たつ": "to stand, to stand up; to rise",
  "止まる とまる": "to stop, to come to a halt",
  "始まる はじまる": "(something) begins, to start",
  "終る おわる": "to finish, to end, to close",
  "降りる おりる": "to get off (a vehicle); to go down, to descend",
  "分かる わかる": "to understand; to know, to find out",
  "吸う すう": "to breathe in, to suck; to smoke",
  "飲む のむ": "to drink; to take (medicine)",
  "忘れる わすれる": "to forget; to leave behind",
  "頭 あたま": "head; mind, brains",
  "手 て": "hand; arm",
  "本当 ほんとう": "truth, reality; real, true",
  "薄い うすい": "thin; weak (e.g., tea); pale (colour)",
  "そちら そちら": "that way, there (near you); you (polite)",
  "そっち そっち": "that way, there (near you)",
  "いかが いかが": "how about…?, how (polite)",
  "暖かい あたたかい": "warm, mild (weather)",
  "上げる あげる": "to raise, to lift; to give",
  "かかる かかる": "to take (time, money); to hang",
};

/**
 * Corrections to a word's written form or reading where the source word list
 * is simply wrong, verified against JMdict (each `reason` cites the entry).
 * Applies across every level — keyed by `term kana` (the list's own raw
 * columns), which never collides across levels since each level has its own
 * word list. test/content/ checks every word — corrected or not — against that
 * level's own committed reference snapshot (currently N5's
 * data/reference/n5-reference.json and N4's data/reference/n4-reference.json
 * — see /docs/authoring), so a wrong form in the list
 * fails CI until it's corrected here.
 */
export interface VocabFormCorrection {
  term?: string;
  kana?: string;
  meaning?: string;
  reason: string;
}

export const VOCAB_FORM_CORRECTIONS: Record<string, VocabFormCorrection> = {
  "伯父 おじさん": {
    term: "伯父さん",
    reason:
      "The list pairs 伯父 (read おじ) with the reading おじさん; the おじさん word ('uncle; middle-aged man') is written 伯父さん (JMdict 2261490).",
  },
  "では では": {
    reason: "The は in では is the topic particle, pronounced わ.",
  },
  "それでは それでは": {
    reason: "The は in それでは is the topic particle, pronounced わ.",
  },
  "ラジオカセ ラジオカセ": {
    term: "ラジカセ",
    kana: "ラジカセ",
    meaning: "radio-cassette player",
    reason:
      "ラジオカセ is not a word; the radio-cassette player is ラジカセ (JMdict 1138960).",
  },
  // N4 (elzup/jlpt-word-list's n4.csv): a run of rows have their term/kana
  // columns swapped (kana holding the kanji form, term holding the kana
  // spelling), wrapped in parenthetical/tilde grammar notation, or missing
  // okurigana — found via `pnpm data:reference:jlpt`'s unresolvedInJmdict
  // list and fixed the same way N5's own corrections were, one discovered
  // issue at a time (see /docs/authoring).
  // The JMdict of 2026-10-08 (the 2021 build the first corrections were checked
  // against is gone) disagrees with two list rows.
  "夕方 ゆうがた": {
    meaning: "early evening (usu. from 3pm to 6pm), dusk",
    reason:
      "The list says 'late afternoon… evening'; JMdict 1542790 glosses 夕方 'early evening (usu. from 3pm to 6pm)' and 'dusk', which are used here.",
  },
  "傾らか なだらか": {
    term: "なだらか",
    reason:
      "JMdict 1632290 writes なだらか in kana alone and no longer lists 傾らか.",
  },
  "うそ 嘘": {
    term: "嘘",
    kana: "うそ",
    reason: "The list swaps term/kana; 嘘 read うそ is JMdict 1172400.",
  },
  "パート (タイム) パート (タイム)": {
    term: "パートタイム",
    kana: "パートタイム",
    reason:
      "The list wraps the term/kana in parenthetical notation; the word is パートタイム (JMdict 1100830).",
  },
  "いくら～ても いくら～ても": {
    term: "いくら",
    kana: "いくら",
    reason:
      "～ても is a grammar collocation, not part of the headword — いくら itself already carries the 'however much, no matter how' sense (JMdict 1219980).",
  },
  "～(て) しまう ～(て) しまう": {
    term: "しまう",
    kana: "しまう",
    reason:
      "The list's ～(て) notation marks the auxiliary's て-form attachment; the headword is the auxiliary verb しまう (JMdict 1305380).",
  },
  "いただく 頂く": {
    term: "頂く",
    kana: "いただく",
    reason: "The list swaps term/kana; 頂く read いただく is JMdict 1587290.",
  },
  "あいさつする 挨拶": {
    term: "挨拶する",
    kana: "あいさつする",
    reason:
      "The list swaps term/kana and drops する from the reading; the suru-verb is 挨拶する read あいさつする (JMdict 1151120).",
  },
  "いっぱい 一杯": {
    term: "一杯",
    kana: "いっぱい",
    reason: "The list swaps term/kana; 一杯 read いっぱい is JMdict 1165670.",
  },
  "お金持ち かねもち": {
    kana: "おかねもち",
    reason:
      "The list's reading drops the leading お; お金持ち is read おかねもち (JMdict 2429350).",
  },
  "～(に) よると ～(に) よると": {
    term: "によると",
    kana: "によると",
    reason:
      "によると is itself a JMdict entry ('according to', 1009670); the list's ～(に) notation isn't part of the headword.",
  },
  "堅 かたい": {
    term: "堅い",
    reason:
      "The list drops the okurigana; the word is 堅い read かたい (JMdict 1257110).",
  },
  "かっこう 格好": {
    term: "格好",
    kana: "かっこう",
    reason: "The list swaps term/kana; 格好 read かっこう is JMdict 1590480.",
  },
  "回る、回す まわる、まわす": {
    term: "回る",
    kana: "まわる",
    meaning: "to turn, to go around, to revolve",
    reason:
      "The list combines two related verbs (回る intransitive, 回す transitive) into one row; kept as 回る, the intransitive base form (JMdict 1604300), since one pool entry can only carry one headword.",
  },
  "スーパー (マーケット) スーパー (マーケット)": {
    term: "スーパーマーケット",
    kana: "スーパーマーケット",
    reason:
      "The list wraps the term/kana in parenthetical notation; the word is スーパーマーケット (JMdict 1066930).",
  },
  "～(に) ついて ～(に) ついて": {
    term: "について",
    kana: "について",
    reason:
      "について is itself a JMdict entry ('concerning, regarding', 1009780); the list's ～(に) notation isn't part of the headword.",
  },
  "真中 まんなか": {
    term: "真ん中",
    reason:
      "The list drops the okurigana ん; the word is 真ん中 read まんなか (JMdict 1604350).",
  },
  "おかげ お陰": {
    term: "お陰",
    kana: "おかげ",
    reason: "The list swaps term/kana; お陰 read おかげ is JMdict 1001640.",
  },
  "うれしい 嬉しい": {
    term: "嬉しい",
    kana: "うれしい",
    reason: "The list swaps term/kana; 嬉しい read うれしい is JMdict 1219510.",
  },
  "または または": {
    reason: "The は in または is the topic particle, pronounced わ.",
  },
  // N3 (elzup/jlpt-word-list's n3.csv): interjections wrapped in a (かん)
  // part-of-speech tag, a term/kana mismatch, and は-particle rōmaji — found
  // via `pnpm data:reference:jlpt`'s unresolvedInJmdict list and test/content/n3.
  "しまった (かん) しまった (かん)": {
    term: "しまった",
    kana: "しまった",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is しまった (JMdict 1005600, written 仕舞った).",
  },
  "すみません (かん) すみません (かん)": {
    term: "すみません",
    kana: "すみません",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is すみません (JMdict 1295060, written 済みません).",
  },
  "よろしく (かん) よろしく (かん)": {
    term: "よろしく",
    kana: "よろしく",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is よろしく (JMdict 1224890, 2835139).",
  },
  "はあ (かん) はあ (かん)": {
    term: "はあ",
    kana: "はあ",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is はあ (JMdict 2069620).",
  },
  "唯 たった": {
    term: "たった",
    kana: "たった",
    reason:
      "The list pairs 唯 (a written form of ただ) with the reading たった; たった ('only, merely') is its own kana-only entry (JMdict 1007230).",
  },
  "実は じつは": {
    reason: "The は in 実は is the topic particle, pronounced わ.",
  },
  "あるいは あるいは": {
    reason: "The は in あるいは is the topic particle, pronounced わ.",
  },
  "こんにちは こんにちは": {
    reason: "The は in こんにちは is the topic particle, pronounced わ.",
  },
  // Meaning corrections — the source list pairs these words' kana with a
  // gloss that belongs to a different word (usually another reading of the
  // same kanji). Found by `pnpm data:audit` and checked against the JMdict
  // entry that has the word's own reading.
  "盛り さかり": {
    meaning: "peak, height (of a season); prime",
    reason:
      "The list gives もり's 'helping, serving'; 盛り read さかり is 'peak, height of the season, prime' (JMdict, さかり entry).",
  },
  "偶 たま": {
    meaning: "occasional, infrequent, rare",
    reason:
      "The list gives 偶 read ぐう's 'even number, couple'; 偶 read たま is 'occasional, rare' (JMdict 偶/適 たま).",
  },
  "反る かえる": {
    meaning: "to return, to come back; to turn over",
    reason:
      "The list gives 反る read そる's 'to warp'; 反る read かえる is 'to return; to turn over' (JMdict 返る/反る かえる).",
  },
  "退く どく": {
    meaning: "to step aside, to make way; to resign, to retire",
    reason:
      "The list gives 退く read しりぞく's 'to retreat'; 退く read どく is 'to step aside, to make way' (JMdict 退く どく/のく).",
  },
  "対 たい": {
    meaning: "versus; opposite, opposition",
    reason:
      "The list gives 対 read つい's 'pair, set'; 対 read たい is 'opposite, versus' (JMdict 対 たい). つい keeps its own entry.",
  },
  "より より": {
    meaning: "than; from, out of, since",
    reason:
      "The list gives 縒り's 'twist, ply'; より as a word in its own right is the particle 'than; from, since' (JMdict より).",
  },
  "湧く わく": {
    meaning: "to well up, to gush forth; to appear suddenly",
    reason:
      "The list gives 沸く's 'to boil'; 湧く is 'to well up, to gush forth' (JMdict 湧く/涌く わく).",
  },
  "素 もと": {
    meaning: "origin, source; basis, foundation",
    reason:
      "The list gives 'prime'; 素 read もと is 'origin, source; basis' (JMdict 元/本/素/基 もと).",
  },
  "辞典 じてん": {
    meaning: "dictionary, lexicon",
    reason:
      "The list gives 事典's 'encyclopedia'; 辞典 is a dictionary of words (JMdict 辞典).",
  },
  "統計 とうけい": {
    meaning: "statistics",
    reason:
      "The list gives 'scattering, dispersion' (a different word); 統計 is 'statistics' (JMdict 統計).",
  },
  "トン トン": {
    meaning: "ton (metric ton, 1,000 kg)",
    reason:
      "The list says '1000 lbs.'; JMdict's トン (屯/噸/瓲) is 'a metric ton, i.e. 1,000kg' — a US short ton is 2,000 lb.",
  },
  "一日 ついたち": {
    meaning: "first day of the month",
    reason:
      "The list also gives 'one day', which is 一日 read いちにち (its own entry); ついたち is only 'the first day of the month' (JMdict 一日 ついたち).",
  },
  "もうすぐ もうすぐ": {
    meaning: "very soon, shortly",
    reason:
      "The list appends 'in a few moments; days'; JMdict gives 'soon, shortly, before long' (もうすぐ).",
  },
  "上 かみ": {
    meaning: "upper reaches (of a river), upper part; first, beginning",
    reason:
      "The list gives 'first volume; superior quality; governmental'; JMdict's 上 かみ is 'upper reaches (of a river); top, upper part; beginning, first'.",
  },
  "便 びん": {
    meaning: "flight, trip, service; mail",
    reason:
      "The list gives 'way, means' (便 read べん); 便 read びん is 'flight, trip, service; mail' (JMdict).",
  },
  "例え たとえ": {
    meaning: "example; simile, metaphor",
    reason:
      "The list adds 'even though', which is たとえ written 仮令 (a different entry); 例え is 'example; simile, metaphor' (JMdict).",
  },
  "生 せい": {
    meaning: "life, living",
    reason:
      "The list gives 'birth'; 生 read せい is 'life, living' (JMdict 生 せい/しょう).",
  },
  "分 ぶ": {
    meaning: "one-tenth, one percent",
    reason:
      "The list gives 'dividing, part'; 分 read ぶ is 'one-tenth, one percent (of a wari)' (JMdict 分 ぶ).",
  },
  "能 のう": {
    meaning: "talent, ability, function; noh theatre",
    reason:
      "The list gives 'being skilled in, nicely, properly'; 能 is 'talent, gift, function; noh theatre' (JMdict 能 のう).",
  },
  "無 ぶ": {
    meaning: "un-, non- (prefix)",
    reason:
      "The list gives 無 read む's 'nothing, zero'; 無 read ぶ is the prefix 'un-, non-' (JMdict 無/不 ぶ).",
  },
  "共に ともに": {
    meaning: "together, jointly; at the same time",
    reason:
      "The list gives 'sharing with, participate in'; JMdict's 共に is 'together, jointly; at the same time'.",
  },
  "下 しも": {
    meaning: "lower reaches (of a river); bottom, lower part",
    reason:
      "The list gives 'under, below, beneath' (the meaning of 下 read した); 下 read しも is 'lower reaches; bottom, lower part' (JMdict).",
  },
  "下 げ": {
    meaning: "lowness, inferiority; second volume (of two)",
    reason:
      "The list gives 'under, below, beneath' (下 read した); 下 read げ is 'lowness, inferiority; second volume' (JMdict).",
  },
  "異 い": {
    meaning: "difference (of opinion); strange, unusual",
    reason:
      "The list gives 'objection'; JMdict's 異 い is 'difference (of opinion); strange, odd, unusual'.",
  },
  "意 い": {
    meaning: "feelings, thoughts; meaning",
    reason:
      "The list gives 'will'; JMdict's 意 い is 'feelings, thoughts; meaning'.",
  },
  "行き いき": {
    meaning: "the way there; bound for",
    reason:
      "The list gives 'going'; JMdict's 行き is 'the way there, outbound trip; bound for …' (a destination, as in 東京行き).",
  },
  "行き ゆき": {
    meaning: "the way there; bound for",
    reason:
      "The list gives 'going'; JMdict's 行き is 'the way there, outbound trip; bound for …' (a destination, as in 東京行き).",
  },
  "出身 しゅっしん": {
    meaning: "person's origin (birthplace, school)",
    reason:
      "The list gives 'come from', a verb phrase; 出身 is a noun, 'person's origin (city, country, parentage, school)' (JMdict).",
  },
  "温暖 おんだん": {
    meaning: "warm, mild, temperate",
    reason:
      "The list gives the noun 'warmth'; 温暖 is the adjectival 'warm, mild, temperate' (JMdict).",
  },
  "交差 こうさ": {
    meaning: "crossing, intersection",
    reason:
      "The list gives 'cross' (a verb/adjective reading); 交差 is the noun 'crossing, intersection' (JMdict).",
  },
  "一段と いちだんと": {
    meaning: "still more, all the more",
    reason:
      "The list gives 'by far, greater'; JMdict's 一段と is 'more, much more, still more, all the more'.",
  },
  "放る ほうる": {
    meaning: "to throw, to fling; to abandon",
    reason:
      "The list gives 'to let go'; JMdict's 放る is 'to throw, to fling; to neglect, to abandon'.",
  },
  "隔てる へだてる": {
    meaning: "to separate, to isolate; to interpose",
    reason:
      "The list gives the passive 'to be shut out'; 隔てる is transitive, 'to separate, to isolate, to interpose' (JMdict).",
  },
  "コンセント コンセント": {
    meaning: "power outlet, wall socket",
    reason:
      "The list adds 'consent', a false friend; コンセント is 'electrical outlet, wall socket' (JMdict) — 'consent' is 同意 / コンセンサス.",
  },
  "潜る もぐる": {
    meaning: "to dive; to get under, to slip into; to hide oneself",
    reason:
      "The list gives 'to drive, to pass through; to evade'; JMdict's 潜る is 'to dive; to get under, get into; to hide oneself'.",
  },
  // N2 word-list rows that bundle a usage note into the term/reading — the
  // same shape N4's (かん) rows had — corrected to the JMdict headword.
  "しわ (かおの～) しわ (かおの～)": {
    term: "しわ",
    kana: "しわ",
    reason:
      "The list bundles a usage hint 'かおの～' into the term and reading; the word is しわ (JMdict 皺 しわ).",
  },
  "だいいち (とりわけ) だいいち (とりわけ)": {
    term: "だいいち",
    kana: "だいいち",
    meaning: "first, foremost; number one",
    reason:
      "The list glues the unrelated word とりわけ into the term and leaves '&nbsp;' junk in the gloss; the word is だいいち (JMdict 第一 だいいち).",
  },
  "かび (～がはえる) かび (～がはえる)": {
    term: "かび",
    kana: "かび",
    reason:
      "The list bundles a usage hint '～がはえる' into the term and reading; the word is かび (JMdict 黴 かび).",
  },
  "(かさを～) さす (かさを～) さす": {
    term: "差す",
    kana: "さす",
    meaning: "to hold up (an umbrella); to shine; to insert",
    reason:
      "The list bundles a usage hint 'かさを～' into the term and reading; the word is 差す (JMdict 差す さす, 'to hold up (an umbrella, etc.)').",
  },
  "〜(日本) 式 ～(にほん) しき": {
    term: "日本式",
    kana: "にほんしき",
    meaning: "Japanese style",
    reason:
      "The list writes the compound as an affix with '(日本)' and truncates the gloss to 'custom,'; the word is 日本式 (JMdict 日本式 にほんしき).",
  },
  "しつれいしました (かん) しつれいしました (かん)": {
    term: "しつれいしました",
    kana: "しつれいしました",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is しつれいしました (JMdict 失礼しました).",
  },
  "～おしまい (おわり) ～おしまい (おわり)": {
    term: "おしまい",
    kana: "おしまい",
    meaning: "the end, closing",
    reason:
      "The list glues a note 'おわり' into an affix-shaped term and glosses it 'end up ~'; the word is おしまい, 'the end, closing' (JMdict お仕舞い).",
  },
  "しめた (かん) しめた (かん)": {
    term: "しめた",
    kana: "しめた",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is しめた (JMdict 占めた).",
  },
  "じゅうたん (カーペット) じゅうたん (カーペット)": {
    term: "じゅうたん",
    kana: "じゅうたん",
    reason:
      "The list bundles the synonym 'カーペット' into the term and reading; the word is じゅうたん (JMdict 絨毯).",
  },
  "～いち (にほんいち) ～いち (にほんいち)": {
    term: "日本一",
    kana: "にほんいち",
    meaning: "number one in Japan",
    reason:
      "The list bundles the example 'にほんいち' into an affix-shaped term; the word is 日本一 (JMdict 日本一 にほんいち/にっぽんいち).",
  },
  "行っていらっしゃい いっていらっしゃい": {
    term: "行ってらっしゃい",
    kana: "いってらっしゃい",
    reason:
      "JMdict has no 行っていらっしゃい; the set phrase is 行ってらっしゃい / いってらっしゃい, 'have a good day, take care'.",
  },
  "どういたしまして (かん) どういたしまして (かん)": {
    term: "どういたしまして",
    kana: "どういたしまして",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is どういたしまして (JMdict どう致しまして).",
  },
  "はい (かん) はい (かん)": {
    term: "はい",
    kana: "はい",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is はい (JMdict はい).",
  },
  "～ほう (ひかく) ～ほう (ひかく)": {
    term: "方",
    kana: "ほう",
    meaning: "the side that ... (in comparison); direction, way",
    reason:
      "The list bundles the note 'ひかく' into an affix-shaped term; the word is 方 read ほう, 'indicates one side of a comparison; direction, way' (JMdict 方 ほう).",
  },
  "ミリ (メートル) ミリ (メートル)": {
    term: "ミリ",
    kana: "ミリ",
    reason:
      "The list bundles 'メートル' into the term and reading; the word is the prefix ミリ, 'milli-' (JMdict ミリ).",
  },
  "それはいけませんね (かん) それはいけませんね (かん)": {
    term: "それはいけませんね",
    kana: "それはいけませんね",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the phrase is それはいけませんね (は is the topic particle, pronounced わ).",
  },
  "〜 (まる) ごと 〜 (まる) ごと": {
    term: "まるごと",
    kana: "まるごと",
    reason:
      "The list splits the word around a '(まる)' note in an affix-shaped term; the word is まるごと, 'whole, in its entirety' (JMdict 丸ごと).",
  },
  "しいんと (する) しいんと (する)": {
    term: "しいんと",
    kana: "しいんと",
    reason:
      "The list bundles the verb 'する' into the term and reading; the adverb is しいんと (JMdict しーん/しいん, an adverb taking と).",
  },
  "留まる とまる": {
    meaning: "to stop, to come to a halt",
    reason:
      "The list gives 留まる read とどまる's 'to be fixed; to abide, to stay'; 留まる read とまる is 'to stop, to come to a halt' (JMdict 止まる/留まる/停まる とまる).",
  },
  "留まる とどまる": {
    meaning: "to remain, to stay; to be limited to",
    reason:
      "The list adds 'to be fixed' (a sense of とまる); 留まる read とどまる is 'to remain, to abide, to stay; to be limited to' (JMdict 留まる とどまる).",
  },
  "こんばんは こんばんは": {
    reason: "The は in こんばんは is the topic particle, pronounced わ.",
  },
  "目下 めした": {
    kana: "もっか",
    reason:
      "The list pairs 目下 read めした ('subordinate, inferior') with the meaning 'at present, now', which belongs to the reading もっか (JMdict 目下 もっか).",
  },
  "給う たまう": {
    meaning: "to give; to do ... (suffix)",
    reason:
      "The list gives 'to receive, to grant', which reverses the direction; 給う read たまう is 'to give' and, as a suffix, 'to do ...' (JMdict 1230220 給う/賜う).",
  },
  // N1 (elzup/jlpt-word-list's n1.csv): the same bundled-note and swapped
  // term/kana rows N4 and N2 had, found by `pnpm data:reference:jlpt`.
  "ございます (かん) ございます (かん)": {
    term: "ございます",
    kana: "ございます",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is ございます (JMdict 1612690 御座います).",
  },
  "こす (みずを～) こす (みずを～)": {
    term: "濾す",
    kana: "こす",
    reason:
      "The list bundles the usage hint 'みずを～' into the term and reading; 'to strain, to filter' is 濾す read こす (JMdict 1288330 漉す/濾す), not 越す.",
  },
  "こつ (をつかむ) こつ (をつかむ)": {
    term: "こつ",
    kana: "こつ",
    reason:
      "The list bundles the collocation 'をつかむ' into the term and reading; the word is こつ, 'knack, trick' (JMdict 1288540 骨 こつ/コツ).",
  },
  "ごらんなさい (かん) ごらんなさい (かん)": {
    term: "ごらんなさい",
    kana: "ごらんなさい",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is ごらんなさい (JMdict 1270770 ご覧なさい).",
  },
  "コンタクト (レンズ) コンタクト (レンズ)": {
    term: "コンタクト",
    kana: "コンタクト",
    reason:
      "The list bundles 'レンズ' into the term and reading; the word is コンタクト, 'contact; contact lens' (JMdict 1052410).",
  },
  "さきに (いぜん) さきに (いぜん)": {
    term: "先に",
    kana: "さきに",
    reason:
      "The list glues the synonym 'いぜん' into the term and reading; the adverb is 先に read さきに, 'previously, before, earlier' (JMdict 1387280).",
  },
  "摩する さする": {
    term: "摩る",
    kana: "さする",
    reason:
      "摩する is not a JMdict headword; 'to rub, to stroke' is 摩る read さする (JMdict 1523790 摩る/擦る).",
  },
  "さぞ (さぞや。さぞかし) さぞ (さぞや。さぞかし)": {
    term: "さぞ",
    kana: "さぞ",
    reason:
      "The list bundles the variants 'さぞや。さぞかし' into the term and reading; the word is さぞ (JMdict 1565620 嘸).",
  },
  "さらう (こどもを～) さらう (こどもを～)": {
    term: "攫う",
    kana: "さらう",
    meaning: "to carry off, to kidnap",
    reason:
      "The list bundles the usage hint 'こどもを～' into the term and reading; 'to carry off, to run away with' is 攫う read さらう (JMdict 1593870 攫う/掠う/拐う), not 浚う (to dredge).",
  },
  "とげ (をさす) とげ (をさす)": {
    term: "とげ",
    kana: "とげ",
    reason:
      "The list bundles the collocation 'をさす' into the term and reading; the word is とげ, 'thorn' (JMdict 1598710 刺/棘).",
  },
  "副 とりわけ": {
    term: "とりわけ",
    kana: "とりわけ",
    reason:
      "副 is not a way to write とりわけ; the adverb is とりわけ, 'especially, above all' (JMdict 1599150 取り分け).",
  },
  "おおい (かん) おおい (かん)": {
    term: "おおい",
    kana: "おおい",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is おおい, 'hey!' (JMdict 1001200 おい/おおい).",
  },
  "おごる (ゆうしょくを～) おごる (ゆうしょくを～)": {
    term: "奢る",
    kana: "おごる",
    reason:
      "The list bundles the usage hint 'ゆうしょくを～' into the term and reading; the verb is 奢る read おごる, 'to give (someone) a treat' (JMdict 1565940).",
  },
  "かく (はじを) かく (はじを)": {
    term: "恥をかく",
    kana: "はじをかく",
    meaning: "to be embarrassed, to lose face",
    reason:
      "The list bundles the collocation 'はじを' into the term and reading, and かく alone has 18 JMdict entries (掻く かく is already N3); the idiom is 恥をかく read はじをかく, 'to be embarrassed, to lose face' (JMdict 2088800).",
  },
  "兆 きざし": {
    term: "兆し",
    kana: "きざし",
    reason:
      "兆 read きざし is not a JMdict form; the noun is 兆し read きざし, 'signs, omen' (JMdict 1591160 兆し/萌し).",
  },
  "くじ (～をひく) くじ (～をひく)": {
    term: "籤",
    kana: "くじ",
    reason:
      "The list bundles the collocation '～をひく' into the term and reading; the noun is 籤 read くじ, 'lottery, lot' (JMdict 1570360).",
  },
  "あせる (こえが～) あせる (こえが～)": {
    term: "褪せる",
    kana: "あせる",
    reason:
      "The list bundles the usage hint 'こえが～' into the term and reading; 'to fade, to discolor' is 褪せる read あせる (JMdict 1572410), not 焦る (to be impatient).",
  },
  "～合せ ～あわせ": {
    term: "合わせて",
    kana: "あわせて",
    meaning: "in all, in total",
    reason:
      "The list writes an affix-shaped term; 'in all' is 合わせて read あわせて, 'in all, in total, collectively' (JMdict 1506010).",
  },
  "(花を〜) 生ける, 活ける (はなを～) いける": {
    term: "活ける",
    kana: "いける",
    reason:
      "The list bundles the usage hint 'はなを～' and two spellings into the term and reading; the verb is 活ける read いける, 'to arrange (flowers)' (JMdict 1587190 生ける/活ける).",
  },
  "すくう (みずを～) すくう (みずを～)": {
    term: "掬う",
    kana: "すくう",
    reason:
      "The list bundles the usage hint 'みずを～' into the term and reading; 'to scoop' is 掬う read すくう (JMdict 1226200 掬う/抄う), not 救う (to rescue).",
  },
  "そり (～にのる) そり (～にのる)": {
    term: "橇",
    kana: "そり",
    reason:
      "The list bundles the collocation '～にのる' into the term and reading; 'sleigh, sled' is 橇 read そり (JMdict 1573500 橇/轌).",
  },
  "つじつま (はなしの～) つじつま (はなしの～)": {
    term: "つじつま",
    kana: "つじつま",
    reason:
      "The list bundles the usage hint 'はなしの～' into the term and reading; the word is つじつま (JMdict 1433730 辻褄).",
  },
  "つぶる (めを～) つぶる (めを～)": {
    term: "瞑る",
    kana: "つぶる",
    reason:
      "The list bundles the collocation 'めを～' into the term and reading; the verb is 瞑る read つぶる, 'to close (one's eyes)' (JMdict 1585820 瞑る/暝る).",
  },
  "～増し ～増し": {
    term: "増し",
    kana: "まし",
    meaning: "increase, extra; better",
    reason:
      "The list writes an affix-shaped term; the word is 増し read まし, 'increase, extra; better' (JMdict 1611600 増し/マシ).",
  },
  "またがる (うまを～) またがる (うまを～)": {
    term: "またがる",
    kana: "またがる",
    reason:
      "The list bundles the usage hint 'うまを～' into the term and reading; the verb is またがる, 'to straddle' (JMdict 1603970 跨る/跨がる).",
  },
  "よし (かん) よし (かん)": {
    term: "よし",
    kana: "よし",
    reason:
      "The list appends its (かん) interjection tag to the term and reading; the word is よし, 'all right!' (JMdict 2607690 よし/よーし).",
  },
  "よって (よりどころ) よって (よりどころ)": {
    term: "よって",
    kana: "よって",
    reason:
      "The list glues the unrelated word 'よりどころ' into the term and reading; the conjunction is よって, 'therefore, consequently' (JMdict 1605970 因って).",
  },
  "ひび (かべの～) ひび (かべの～)": {
    term: "罅",
    kana: "ひび",
    reason:
      "The list bundles the usage hint 'かべの～' into the term and reading; 'crack, fissure' is 罅 read ひび (JMdict 1010590 罅/皹/皸), not 日々.",
  },
};

/** A pool vocab entry with form corrections and meaning enrichments applied,
 *  as the reference snapshots record it. */
export function servedVocab<
  T extends { term: string; kana: string; meaning: string },
>(vocab: T): T {
  const key = `${vocab.term} ${vocab.kana}`;
  const { reason: _reason, ...fix } = VOCAB_FORM_CORRECTIONS[key] ?? {
    reason: "",
  };
  return { ...vocab, meaning: enrichedVocabMeaning(vocab), ...fix };
}

/** A vocab entry's meaning with VOCAB_MEANING_ENRICHMENTS applied. */
export function enrichedVocabMeaning(vocab: {
  term: string;
  kana: string;
  meaning: string;
}): string {
  return (
    VOCAB_MEANING_ENRICHMENTS[`${vocab.term} ${vocab.kana}`] ?? vocab.meaning
  );
}

// Words too generic to say two glosses mean the same thing.
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "at",
  "is",
  "be",
  "and",
  "or",
  "for",
  "as",
  "by",
  "with",
  "from",
  "one",
  "ones",
  "etc",
  "abbr",
  "lit",
  "polite",
  "humble",
  "formal",
  "casual",
  "honorific",
  "hon",
  "counter",
  "something",
  "someone",
  "thing",
  "things",
  "very",
  "not",
  "e.g",
  "eg",
  "v.t",
  "v.i",
  "my",
  "your",
  "number",
  "day",
  "days",
]);

/** The content words of a gloss, lower-cased, with a trailing plural "s"
 *  folded so "shoe"/"shoes" count as the same word. */
export function meaningWords(text: string): Set<string> {
  const words = new Set<string>();
  for (const raw of text
    .toLowerCase()
    .replace(/[()~～,;:./!?'"…\-–—]/g, " ")
    .split(/\s+/)) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue;
    words.add(raw.length > 3 && raw.endsWith("s") ? raw.slice(0, -1) : raw);
  }
  return words;
}

/**
 * True when two glosses could describe the same sense — identical text, or a
 * shared content word ("hot (objects)" vs "hot (weather), warm"; "to be,
 * to have" for both 在る and 有る). Used to check a hand-written meaning
 * against JMdict's glosses and to spot reversed meanings.
 */
export function meaningsOverlap(a: string, b: string): boolean {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return true;
  const wordsA = meaningWords(a);
  for (const word of meaningWords(b)) {
    if (wordsA.has(word)) return true;
  }
  return false;
}
