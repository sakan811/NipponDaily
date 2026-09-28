/**
 * Curated companion content for the N4 study pages — the N4 counterpart to
 * vocab-guide.ts's N5 WORD_CLUSTERS. N4_WORD_CLUSTERS is what the N4 lesson
 * path (app/data/lessons-n4.ts, /learn?level=N4) is built from. It reuses
 * every shared type/WORD_TYPE_GROUPS/classifyPartOfSpeech from vocab-guide.ts
 * (grammar-category grouping is level-agnostic) rather than duplicating them.
 *
 * N4_WORD_CLUSTERS reference words by their PoolVocab `id` from the N4 word
 * list (elzup/jlpt-word-list's n4.csv, the same source
 * scripts/seed-pool-data.mjs reads) so the page can look each one up in the
 * fetched pool and simply skip any that aren't found. Every id is checked
 * against data/reference/n4-reference.json by test/content/n4/ the same way
 * N5's own content is checked — see CLAUDE.md's Content Accuracy section.
 */
import type { WordCluster } from "./vocab-guide";

export const N4_WORD_CLUSTERS: WordCluster[] = [
  {
    key: "keigo",
    title: "Honorific & Humble Speech — Keigo",
    subtitle: "敬語",
    insight:
      "Japanese layers two special verb sets on top of plain verbs to show respect: sonkeigo (尊敬語, honorific) raises the person you're talking about, and kenjougo (謙譲語, humble) lowers yourself to raise them indirectly. Each maps to a handful of everyday verbs: 行く/来る/いる → いらっしゃる (hon.) / 参る, 伺う, おる (humble); する → なさる (hon.) / 致す (humble); 言う → おっしゃる (hon.) / 申す, 申し上げる (humble); 食べる/飲む → 召し上がる (hon.) / いただく (humble); 見る → 拝見する (humble).",
    extendedInsight:
      "Honorific verbs describe someone else's action (お客様がいらっしゃいます, 'the customer is coming'), while humble verbs describe your own (私が参ります, 'I will go') — using a humble verb for someone else, or an honorific one about yourself, is the single most common keigo mistake. あいさつする ('to greet') and 失礼 ('excuse me; rudeness') round out this group as the everyday politeness words keigo builds on.",
    examples: [
      {
        jp: "先生はもういらっしゃいましたか。",
        romaji: "Sensei wa mou irasshaimashita ka.",
        en: "Has the teacher arrived yet?",
      },
      {
        jp: "明日、こちらに伺います。",
        romaji: "Ashita, kochira ni ukagaimasu.",
        en: "I will come here tomorrow.",
      },
    ],
    commonMistake:
      "A common slip is saying 私がいらっしゃいます for yourself — いらっしゃる only raises someone else; describing your own coming or going takes the humble 参る or 伺う instead.",
    rows: [
      {
        label: "honorific (raises them)",
        terms: [
          "いらっしゃる",
          "なさる",
          "おっしゃる",
          "くださる",
          "召し上がる",
          "おいでになる",
          "よろしい",
          "ございます",
        ],
      },
      {
        label: "humble (lowers you)",
        terms: [
          "致す",
          "申す",
          "申し上げる",
          "うかがう",
          "伺う",
          "参る",
          "いただく",
          "差し上げる",
          "おる",
          "拝見",
          "ご存じ",
        ],
      },
      {
        label: "plain giving & receiving",
        terms: ["くれる", "あげる", "もらう"],
      },
      { label: "everyday politeness", terms: ["失礼", "あいさつする"] },
    ],
  },
  {
    key: "family-titles",
    title: "Family, People & Polite Titles",
    subtitle: "人・敬称",
    insight:
      "Building on N5's family words, N4 adds the people you'll actually talk about most — your own family in humble/plain form (夫, 妻, 息子, 娘, 祖父, 祖母, 家内) versus someone else's in polite form (ご主人, お子さん, お嬢さん), plus the suffix system marking how familiarly you're addressing someone (君・ちゃん for someone close to or below you, 様 for someone you're being formal with).",
    extendedInsight:
      "様 is a genuine homograph: as the suffix ～様 (さま) it's the most formal way to say 'Mr./Ms.' after a name, but written alone and read よう it instead means 'way, manner, kind' (このような, 'of this kind') — unrelated meanings sharing only the character.",
    examples: [
      {
        jp: "田中様、こちらへどうぞ。",
        romaji: "Tanaka-sama, kochira e douzo.",
        en: "Mr./Ms. Tanaka, this way please.",
      },
      {
        jp: "彼女はこのような本が好きです。",
        romaji: "Kanojo wa kono you na hon ga suki desu.",
        en: "She likes this kind of book.",
      },
    ],
    commonMistake:
      "家内 and 妻 both humbly mean 'my wife,' but ご主人 is only ever used for someone else's husband — calling your own husband ご主人 sounds like you're talking about somebody else's.",
    rows: [
      {
        label: "your own family (humble)",
        terms: [
          "夫",
          "妻",
          "家内",
          "息子",
          "娘",
          "祖父",
          "祖母",
          "親",
          "子",
          "彼",
          "彼女",
          "彼ら",
        ],
      },
      {
        label: "someone else's family (polite)",
        terms: ["ご主人", "お子さん", "お嬢さん"],
      },
      {
        label: "people in general",
        terms: ["僕", "客", "皆", "赤ちゃん", "赤ん坊", "お宅"],
      },
      {
        label: "address suffixes",
        terms: ["ちゃん", "君", "君-2", "様", "様-2", "御"],
      },
    ],
  },
  {
    key: "abstract-nouns",
    title: "Abstract & General-Purpose Words",
    subtitle: "抽象語",
    insight:
      "N4 introduces a wave of abstract, non-physical words — for feeling (気, 心), fortune (機会, 理由, 原因), and circumstance (時代, 間, 内, 途中) — that don't describe a physical thing you can point at, but come up constantly once conversation moves past concrete daily life.",
    extendedInsight:
      "気, appearing everywhere from 気分 ('mood') to 天気 ('weather') to 元気 ('energy'), carries a core sense of 'spirit, vital energy' that each compound bends slightly — worth noticing as a recurring building block rather than memorizing each compound separately.",
    examples: [
      {
        jp: "旅行に行く機会がありません。",
        romaji: "Ryokou ni iku kikai ga arimasen.",
        en: "I don't have the chance to go on a trip.",
      },
      {
        jp: "事故の原因はまだ分かりません。",
        romaji: "Jiko no gen'in wa mada wakarimasen.",
        en: "The cause of the accident still isn't known.",
      },
    ],
    commonMistake:
      "理由 ('reason,' why someone did something) and 原因 ('cause,' what produced an event) aren't interchangeable — 遅れた理由 ('the reason I was late') describes a motive, while 事故の原因 ('the cause of the accident') describes what brought it about, not a choice anyone made.",
    rows: [
      { label: "mind, feeling & life", terms: ["気", "心", "生きる", "力"] },
      {
        label: "chance, cause & reason",
        terms: ["機会", "理由", "原因", "反対", "失敗"],
      },
      {
        label: "time & circumstance",
        terms: [
          "時代",
          "昔",
          "間",
          "内",
          "途中",
          "留守",
          "将来",
          "習慣",
          "専門",
          "真中",
        ],
      },
      {
        label: "describing & qualifying",
        terms: [
          "別",
          "点",
          "是非",
          "正しい",
          "普通",
          "自由",
          "仕方",
          "代わり",
          "両方",
          "全然",
          "特別",
        ],
      },
    ],
  },
  {
    key: "saikou-prefix",
    title: "The 最 Prefix — Most, Last, First & Recent",
    subtitle: "最～",
    insight:
      "One prefix, 最 ('most, extremely'), attaches to a handful of fixed words to rank something at an extreme: 最も (most, a formal 'very'), 最後 (last, the end), 最初 (first, the beginning), and 最近 (most recent, i.e. 'recently'). Learn 最 once and all four fall into place as 'the most ~ version of X.'",
    extendedInsight:
      "最も is more formal/written than とても ('very') — in casual speech とても or すごく do the same job, but 最も is what you'll see in writing and formal speech, especially right before an adjective (最も大切な, 'the most important').",
    examples: [
      {
        jp: "最初に名前を書いてください。",
        romaji: "Saisho ni namae o kaite kudasai.",
        en: "Please write your name first.",
      },
      {
        jp: "最近、忙しいです。",
        romaji: "Saikin, isogashii desu.",
        en: "I've been busy recently.",
      },
    ],
    commonMistake:
      "最後 (last, the final one in a sequence) and 最近 (recently, a period of time) are easy to mix up at a glance since both start with 最 — 最後 answers 'which one,' 最近 answers 'when.'",
    rows: [{ terms: ["最も", "最後", "最初", "最近"] }],
  },
  {
    key: "reasons-expectations",
    title: "Formal Nouns — Explaining Reasons & Expectations",
    subtitle: "形式名詞",
    insight:
      "These words attach after a plain verb form to build a grammatical pattern rather than naming a physical thing: 行くつもりです ('I intend to go'), 雨の場合 ('in the case of rain'), 来るはずです ('he should be coming'), 分からない訳 ('the reason it's not understood'). 為 works the same way for purpose: ～ため (in order to).",
    extendedInsight:
      "はず expresses the speaker's confident expectation based on logic or evidence ('it should be the case that...'), which is subtly different from つもり (your own stated intention) — はず can be about anyone, つもり is almost always about yourself or someone whose plan you're reporting.",
    examples: [
      {
        jp: "今週末、京都へ行くつもりです。",
        romaji: "Konshuumatsu, Kyouto e iku tsumori desu.",
        en: "I intend to go to Kyoto this weekend.",
      },
      {
        jp: "彼はもう着いているはずです。",
        romaji: "Kare wa mou tsuite iru hazu desu.",
        en: "He should have already arrived.",
      },
    ],
    commonMistake:
      "つもり states your own intention, not a prediction about someone else — 彼が来るつもりです sounds odd (it claims to know his private intention); はず or 予定 fit better when talking about someone else's plans.",
    rows: [{ terms: ["つもり", "場合", "事", "はず", "為", "訳"] }],
  },
  {
    key: "connectors",
    title: "Connecting Sentences & Ideas",
    subtitle: "接続表現",
    insight:
      "These stitch two sentences together the way English uses 'so,' 'but,' 'if,' and 'according to' — すると/それで/だから all roughly mean 'so, then,' but すると narrates what happened next, それで asks or explains why, and だから gives a blunt reason. けれど is a softer, more conversational 'but' than でも.",
    extendedInsight:
      "について and によると both attach after に and translate near 'about'/'according to,' but aren't interchangeable — について introduces a topic (日本について話す, 'to talk about Japan'), while によると cites a source of information (天気予報によると, 'according to the weather forecast').",
    examples: [
      {
        jp: "天気予報によると、明日は雨だそうです。",
        romaji: "Tenki yohou ni yoru to, ashita wa ame da sou desu.",
        en: "According to the weather forecast, it'll apparently rain tomorrow.",
      },
      {
        jp: "先生のおかげで、試験に合格しました。",
        romaji: "Sensei no okage de, shiken ni goukaku shimashita.",
        en: "Thanks to my teacher, I passed the exam.",
      },
    ],
    commonMistake:
      "いくら～ても means 'no matter how much ~' and always needs its ても partner later in the sentence — いくら alone, without a following ても clause, just asks 'how much' (いくらですか), a completely different, much more common use of the same word.",
    rows: [
      {
        label: "so, then & why",
        terms: ["すると", "それで", "だから", "なるほど"],
      },
      { label: "but, if & moreover", terms: ["けれど", "もし", "それに"] },
      {
        label: "confirming & concluding",
        terms: ["やはり", "とうとう", "やっと", "もちろん", "きっと", "そう"],
      },
      {
        label: "about, according to & thanks to",
        terms: ["について", "によると", "おかげ", "例えば", "いくらても"],
      },
    ],
  },
  {
    key: "degree-manner",
    title: "Degree, Manner & Emphasis Adverbs",
    subtitle: "程度・様態の副詞",
    insight:
      "A second wave of adverbs beyond N5's とても/少し, for describing exactly how much, how carefully, or how completely something happens — from 大抵 ('usually') and ほとんど ('almost') for frequency, to しっかり ('firmly') and はっきり ('clearly') for manner.",
    extendedInsight:
      "できるだけ and なるべく are near-synonyms for 'as much as possible,' but できるだけ leans on your own actual capability (できるだけ早く, 'as fast as I actually can'), while なるべく is a softer, more general request (なるべく静かに, 'please, if you would, quietly').",
    examples: [
      {
        jp: "できるだけ早く来てください。",
        romaji: "Dekiru dake hayaku kite kudasai.",
        en: "Please come as quickly as you can.",
      },
      {
        jp: "彼はほとんど毎日走ります。",
        romaji: "Kare wa hotondo mainichi hashirimasu.",
        en: "He runs almost every day.",
      },
    ],
    commonMistake:
      "ちっとも needs a negative verb to mean 'not at all' — ちっとも好きじゃない is fine, but ちっとも好きです ('I not-at-all like it') is broken; without the negative, ちっとも simply doesn't work.",
    rows: [
      {
        label: "how much",
        terms: [
          "大抵",
          "ほとんど",
          "一生懸命",
          "ちっとも",
          "できるだけ",
          "なるべく",
          "中々",
          "随分",
          "大体",
          "それほど",
          "そんなに",
          "大分",
          "いっぱい",
        ],
      },
      {
        label: "how, exactly & completely",
        terms: [
          "しっかり",
          "はっきり",
          "すっかり",
          "どんどん",
          "すっと",
          "必ず",
          "決して",
          "まず",
          "特に",
          "非常に",
        ],
      },
    ],
  },
  {
    key: "time-recent",
    title: "Time: Recent, Soon & In Sequence",
    subtitle: "時間の表現",
    insight:
      "A set of time words for talking about the near past and near future without naming an exact date — さっき ('a moment ago'), この間 ('the other day'), そろそろ ('soon, it's about time'), もうすぐ ('very soon').",
    extendedInsight:
      "再来週/再来月 extend N5's 来週/来月 pattern one step further — 再 ('again') stacks on top of 来 to mean 'the ~ after next,' so 再来週 is literally 'the week that comes after next week.'",
    examples: [
      {
        jp: "さっき電話がありました。",
        romaji: "Sakki denwa ga arimashita.",
        en: "There was a phone call a moment ago.",
      },
      {
        jp: "そろそろ帰りましょう。",
        romaji: "Sorosoro kaerimashou.",
        en: "Let's head home soon.",
      },
    ],
    commonMistake:
      "この間 ('the other day,' a near past moment) and この頃 ('these days,' an ongoing recent period) look alike but point in different directions — この間 names one specific past moment, この頃 describes an unfinished stretch of time up to now.",
    rows: [
      {
        label: "just now & soon",
        terms: ["さっき", "もうすぐ", "そろそろ", "しばらく", "これから"],
      },
      {
        label: "these days & once",
        terms: ["この間", "この頃", "一度", "たまに", "久しぶり", "昼間"],
      },
      {
        label: "further out",
        terms: ["今度", "今夜", "明日", "再来週", "再来月"],
      },
    ],
  },
  {
    key: "verb-suffixes",
    title: "Verb Suffixes — Starting, Finishing & How Easy",
    subtitle: "複合動詞・～やすい/にくい",
    insight:
      "N4's signature grammar move: attach a short ending directly onto a verb's stem to build a new meaning without a separate word — 食べ始める (start eating), 食べ終わる (finish eating), 食べ続ける (keep eating), 食べ出す (suddenly start eating), 食べやすい (easy to eat), 食べにくい (hard to eat). Each ending is one of these pool words themselves, minus the initial 食べ.",
    extendedInsight:
      "ばかり and まま look like ordinary nouns here but function the same suffix-like way — Vた形 + ばかり ('just did V') and Vた形 + まま ('staying as V left it') both attach directly after a verb's た-form, not before it.",
    examples: [
      {
        jp: "この本は読みやすいです。",
        romaji: "Kono hon wa yomiyasui desu.",
        en: "This book is easy to read.",
      },
      {
        jp: "電気をつけたまま寝てしまいました。",
        romaji: "Denki o tsuketa mama nete shimaimashita.",
        en: "I ended up falling asleep with the light left on.",
      },
    ],
    commonMistake:
      "始める (the plain verb 'to start something') and the suffix ～始める ('to start doing ~') are the same word doing two different jobs — the plain verb needs its own direct object (授業を始める, 'to start class'), while the suffix attaches directly onto another verb's stem (勉強し始める, 'to start studying').",
    rows: [
      {
        label: "plain verbs the suffixes come from",
        terms: ["始める", "終わり", "済む"],
      },
      {
        label: "verb + ～続ける/～始める/～出す/～終わる",
        terms: ["続ける", "始める-2", "だす", "おわる"],
      },
      { label: "verb + ～やすい/～にくい", terms: ["やすい", "にくい"] },
      { label: "verb-た + ～ばかり/～まま", terms: ["ばかり", "まま"] },
      { label: "verb-て + しまう", terms: ["てしまう"] },
    ],
  },
  {
    key: "counters-suffixes",
    title: "Counters, Suffixes & Comparisons",
    subtitle: "接尾語・助数詞",
    insight:
      "More attach-to-a-number-or-word suffixes beyond N5's ～枚/～歳 — ～軒 counts buildings/houses, ～式 names a ceremony or style, ～家 marks someone specialized in a field (専門家, 'expert'), ～員 marks a member (会社員, 'company employee'). 以上/以下/以内/以外 form a tidy set for 'at least / at most / within / other than' around any number or noun.",
    extendedInsight:
      "以上 and 以下 both include the boundary number itself (三日以上 means '3 days or more,' including exactly 3), while 以内 excludes going past the boundary and 以外 means everything outside a category — these four cover almost any English 'more/less/within/except' phrasing you'll need with a number.",
    examples: [
      {
        jp: "テストは九十点以上でした。",
        romaji: "Tesuto wa kyuujuu-ten ijou deshita.",
        en: "The test score was 90 points or above.",
      },
      {
        jp: "一週間以内に返事をください。",
        romaji: "Isshuukan inai ni henji o kudasai.",
        en: "Please reply within a week.",
      },
    ],
    commonMistake:
      "以下 ('or below') is often mistaken to exclude the number itself the way English 'under' does — 十以下 actually includes 十 itself.",
    rows: [
      {
        label: "counting buildings, meetings & versions",
        terms: [
          "区",
          "軒",
          "会",
          "式",
          "製",
          "家",
          "員",
          "代",
          "建て",
          "目",
          "おき",
        ],
      },
      { label: "numbers & ratios", terms: ["億", "倍", "割合", "程"] },
      {
        label: "at least, at most, within & except",
        terms: ["以上", "以下", "以内", "以外"],
      },
      { label: "the month suffix", terms: ["月"] },
    ],
  },
  {
    key: "school",
    title: "School & Academic Subjects",
    subtitle: "学問",
    insight:
      "A tour of school life one level up from N5's 学校/先生/宿題 — the school levels themselves (小学校→中学校→高校→大学), the academic subjects Japanese names almost identically to English (医学, 数学, 科学, 文学, 歴史, 地理, 経済), and the everyday classroom words for how you actually study (予習/復習, 発音, 文法, 辞典).",
    extendedInsight:
      "予習 (preparing before class) and 復習 (reviewing after class) are a matched pair — 予 ('in advance') vs 復 ('repeat, return to') attached to the same second character meaning 'practice, study.'",
    examples: [
      {
        jp: "毎晩、予習と復習をします。",
        romaji: "Maiban, yoshuu to fukushuu o shimasu.",
        en: "I do preparation and review every evening.",
      },
      {
        jp: "来月、大学を卒業します。",
        romaji: "Raigetsu, daigaku o sotsugyou shimasu.",
        en: "I'll graduate university next month.",
      },
    ],
    commonMistake:
      "意見 ('an opinion you hold and can state') and 質問 ('a question you ask') aren't interchangeable — 意見があります means 'I have an opinion (to share),' not 'I have a question.'",
    rows: [
      {
        label: "school levels & places",
        terms: ["小学校", "中学校", "高校", "学部", "講堂"],
      },
      {
        label: "subjects",
        terms: [
          "医学",
          "科学",
          "数学",
          "文学",
          "歴史",
          "地理",
          "経済",
          "文化",
          "教育",
        ],
      },
      {
        label: "studying & class",
        terms: [
          "予習",
          "復習",
          "試験",
          "講義",
          "発音",
          "文法",
          "意見",
          "辞典",
          "字",
          "答",
          "消しゴム",
        ],
      },
      { label: "milestone", terms: ["卒業"] },
    ],
  },
  {
    key: "work-business",
    title: "Work, Business & Making Plans",
    subtitle: "仕事・予定",
    insight:
      "The vocabulary of arranging things with other people — meetings (会議, 会議室), invitations (招待, 案内), and the paperwork of schedules (予定, 予約, 用事) — plus the verbs that turn a plan into something that actually happens (準備する, 説明する, 相談する).",
    extendedInsight:
      "用事 and 用 both mean 'something you need to do,' but 用事 is the everyday word (今日は用事があります, 'I have things to do today'), while 用 alone is more clipped and formal, often in set phrases like ご用は何ですか ('what can I help you with?').",
    examples: [
      {
        jp: "来週の会議の準備をしています。",
        romaji: "Raishuu no kaigi no junbi o shite imasu.",
        en: "I'm preparing for next week's meeting.",
      },
      {
        jp: "都合がよければ、参加してください。",
        romaji: "Tsugou ga yokereba, sanka shite kudasai.",
        en: "If it's convenient, please join.",
      },
    ],
    commonMistake:
      "案内する ('to guide/show around, or to inform of arrangements') and 紹介する ('to introduce a person or thing') get mixed up — 友達を紹介します introduces a friend, while 道を案内します guides someone along a route.",
    rows: [
      {
        label: "meetings & schedules",
        terms: [
          "会議",
          "会議室",
          "予定",
          "用事",
          "用",
          "都合",
          "出席",
          "出発",
          "規則",
        ],
      },
      {
        label: "arranging & informing",
        terms: [
          "準備",
          "用意",
          "案内",
          "連絡",
          "予約",
          "相談",
          "説明",
          "紹介",
          "招待",
        ],
      },
      {
        label: "events & venues",
        terms: ["会場", "展覧会", "見物", "事務所", "パートタイム"],
      },
    ],
  },
  {
    key: "technology",
    title: "Technology & Modern Life",
    subtitle: "機械・電化製品",
    insight:
      "Many everyday modern words are katakana loanwords close enough to their English source to read at sight — パソコン (personal computer, itself a shortening), ワープロ (word processor), ファックス (fax), エスカレーター (escalator).",
    extendedInsight:
      "故障する describes a machine breaking down (故障しています, 'it's out of order') — the mechanical-failure counterpart to N4's own 壊れる, used specifically for equipment rather than everyday objects.",
    examples: [
      {
        jp: "エレベーターが故障しています。",
        romaji: "Erebeetaa ga koshou shite imasu.",
        en: "The elevator is out of order.",
      },
      {
        jp: "パソコンでレポートを書きます。",
        romaji: "Pasokon de repooto o kakimasu.",
        en: "I'll write the report on the computer.",
      },
    ],
    commonMistake:
      "ガソリンスタンド ('gas station') is a wasei-eigo compound — スタンド alone in Japanese usually means a lamp or stand, not a station, so dropping ガソリン doesn't mean what an English speaker might expect.",
    rows: [
      {
        label: "computers & office",
        terms: [
          "パソコン",
          "ワープロ",
          "コンピュータ",
          "テキスト",
          "レポート",
          "ファックス",
          "タイプ",
          "ソフト",
        ],
      },
      {
        label: "around town & buildings",
        terms: ["ビル", "エスカレーター", "レジ", "ベル", "スクリーン"],
      },
      {
        label: "vehicles & fuel",
        terms: ["ガソリン", "ガソリンスタンド", "オートバイ", "ガス"],
      },
      {
        label: "electricity & repair",
        terms: ["電灯", "線", "故障", "ステレオ", "チェックする"],
      },
    ],
  },
  {
    key: "housing",
    title: "Around the House, More",
    subtitle: "家・部屋",
    insight:
      "More house vocabulary beyond N5's rooms — traditional Japanese-style fittings (畳 tatami mats, 布団 futon bedding, 押し入れ the closet they're stored in by day) alongside ordinary furniture (棚, カーテン) and the verbs for keeping a place in order (片付ける, 飾る).",
    extendedInsight:
      "押し入れ is built from 押し (from 押す, 'push') + 入れ (from 入れる, 'put in') — literally 'a push-in space,' the traditional built-in closet where a futon gets folded and pushed away each morning.",
    examples: [
      {
        jp: "部屋を片付けてください。",
        romaji: "Heya o katazukete kudasai.",
        en: "Please tidy up the room.",
      },
      {
        jp: "押し入れに布団をしまいます。",
        romaji: "Oshiire ni futon o shimaimasu.",
        en: "I put the futon away in the closet.",
      },
    ],
    commonMistake:
      "建てる ('to build,' what a person does to a house) is transitive — describing the finished house standing there itself needs its intransitive partner 建つ, not this word.",
    rows: [
      {
        terms: [
          "屋上",
          "建てる",
          "布団",
          "ガラス",
          "畳",
          "飾る",
          "片付ける",
          "押し入れ",
          "引き出し",
          "駐車場",
          "カーテン",
          "棚",
        ],
      },
    ],
  },
  {
    key: "shopping",
    title: "Shopping, Money & Gift-Giving",
    subtitle: "買い物・贈り物",
    insight:
      "Beyond N5's 買う/売る, N4 adds the vocabulary around choosing and exchanging things as gifts — お土産 (a souvenir brought back for someone), プレゼント/贈り物 (a present given for its own sake), and お祝い (a gift or gesture marking a celebration).",
    extendedInsight:
      "お土産, プレゼント and 贈り物 all translate as 'gift/present' but differ by occasion — お土産 specifically comes from a trip, プレゼント is the everyday loanword for any occasion, and 贈り物 is the more formal native word, often seen in writing.",
    examples: [
      {
        jp: "スーパーマーケットで食料品を買いました。",
        romaji: "Suupaamaaketto de shokuryouhin o kaimashita.",
        en: "I bought groceries at the supermarket.",
      },
      {
        jp: "旅行のお土産に、お菓子を選びました。",
        romaji: "Ryokou no omiyage ni, okashi o erabimashita.",
        en: "I chose sweets as a souvenir from the trip.",
      },
    ],
    commonMistake:
      "おつり ('change' returned from a payment) and お礼 ('an expression of thanks, or a thank-you gift') sound similar in role but aren't related — おつりをもらう is getting money back, お礼を言う is saying thank you.",
    rows: [
      {
        terms: [
          "売り場",
          "品物",
          "値段",
          "払う",
          "選ぶ",
          "食料品",
          "スーパーマーケット",
          "お土産",
          "プレゼント",
          "贈り物",
          "お祝い",
          "お礼",
          "おつり",
        ],
      },
    ],
  },
  {
    key: "food-more",
    title: "More Food & Drink",
    subtitle: "食べ物",
    insight:
      "A second wave of food words after N5's meals and staples — Western-style dishes borrowed wholesale as katakana (サンドイッチ, サラダ, ステーキ, ハンバーグ, ケーキ) alongside two essential native words: 米 (uncooked rice, distinct from cooked ご飯) and 味噌 (miso, the fermented soybean paste behind 味噌汁).",
    extendedInsight:
      "ごちそう doesn't just mean 'food' — it specifically means a feast or a treat someone else is providing, which is why ごちそうさまでした ('thank you for the meal') is said to whoever paid or cooked, not as a general comment on taste.",
    examples: [
      {
        jp: "昼ご飯にサンドイッチを食べました。",
        romaji: "Hirugohan ni sandoitchi o tabemashita.",
        en: "I ate a sandwich for lunch.",
      },
      {
        jp: "この味噌汁はいい味です。",
        romaji: "Kono misoshiru wa ii aji desu.",
        en: "This miso soup has a good flavor.",
      },
    ],
    commonMistake:
      "米 (uncooked, raw rice, or rice as a crop) and ご飯 (cooked rice, ready to eat) aren't interchangeable — 米を買う buys rice at the store, but you'd never say 米を食べる for eating a cooked bowl.",
    rows: [
      {
        terms: [
          "サンドイッチ",
          "サラダ",
          "ステーキ",
          "ハンバーグ",
          "ケーキ",
          "ジャム",
          "米",
          "味噌",
          "ぶどう",
          "味",
          "ごちそう",
        ],
      },
    ],
  },
  {
    key: "clothing-more",
    title: "More Clothing, Accessories & Materials",
    subtitle: "衣服・素材",
    insight:
      "Beyond N5's everyday clothes, N4 adds formalwear (スーツ, 着物), accessories (指輪, アクセサリー), and the two most common fabrics by name — 絹 (silk) and 木綿 (cotton) — plus 糸 (thread), the material both are woven from.",
    extendedInsight:
      "着物 literally means 'a thing worn' (着る 'to wear' + 物 'thing') and today specifically refers to traditional Japanese dress, even though the word was once generic enough to mean 'clothing' of any kind — 服 is the everyday word for clothes in general now.",
    examples: [
      {
        jp: "祖母は絹の着物を持っています。",
        romaji: "Sobo wa kinu no kimono o motte imasu.",
        en: "My grandmother has a silk kimono.",
      },
      {
        jp: "旅行にスーツケースを持って行きます。",
        romaji: "Ryokou ni suutsukeesu o motte ikimasu.",
        en: "I'll bring a suitcase on the trip.",
      },
    ],
    commonMistake:
      "ひげ ('beard/moustache') is never used for the hair on your head — 髪 is the word for that; ひげ specifically means facial hair.",
    rows: [
      {
        terms: [
          "スーツ",
          "着物",
          "下着",
          "手袋",
          "サンダル",
          "オーバー",
          "指輪",
          "アクセサリー",
          "スーツケース",
          "ひげ",
          "絹",
          "木綿",
          "糸",
        ],
      },
    ],
  },
  {
    key: "body-health",
    title: "Body & Health, More",
    subtitle: "体・健康",
    insight:
      "N5 covered everyday body-part vocabulary; N4 adds words for how your body is doing (気分, 具合, 熱) and what happens at a hospital when it isn't (けがする, 注射, 入院/退院), plus reaction verbs (泣く, 笑う, 驚く) for how your body shows an emotion.",
    extendedInsight:
      "気分 and 具合 both translate as 'feeling/condition,' but 気分 leans toward your mood or how you subjectively feel right now (気分が悪い, 'I feel sick/off'), while 具合 leans toward a more objective state of health or function (体の具合はどうですか, 'how's your health?').",
    examples: [
      {
        jp: "転んで、足をけがしました。",
        romaji: "Koronde, ashi o kega shimashita.",
        en: "I fell and hurt my leg.",
      },
      {
        jp: "熱があるので、今日は休みます。",
        romaji: "Netsu ga aru node, kyou wa yasumimasu.",
        en: "I have a fever, so I'll rest today.",
      },
    ],
    commonMistake:
      "太る ('to gain weight,' an event/change) and 太い ('thick,' a fixed description) share a root but aren't interchangeable — 太りました reports a change that happened, while 太いです just describes how something already is.",
    rows: [
      {
        label: "how the body feels",
        terms: ["気分", "具合", "熱", "痩せる", "太る"],
      },
      { label: "at the hospital", terms: ["けがする", "注射", "入院", "退院"] },
      {
        label: "body parts",
        terms: ["喉", "血", "毛", "髪", "腕", "首", "指", "背中"],
      },
      {
        label: "showing an emotion",
        terms: ["泣く", "笑う", "驚く", "倒れる", "触る"],
      },
    ],
  },
  {
    key: "feelings-personality",
    title: "Feelings & Describing People",
    subtitle: "気持ち・性格",
    insight:
      "A big wave of adjectives for judging people, situations, and things — from character traits (真面目 diligent, 親切 kind, 熱心 enthusiastic) to how a situation makes you feel (悲しい sad, 恥ずかしい embarrassed, 残念 a shame).",
    extendedInsight:
      "優しい (kind/gentle, describing a person's disposition) and 易しい (easy, describing a task) are written differently but read identically やさしい — context alone tells them apart, exactly like N5's 熱い/暑い pair.",
    examples: [
      {
        jp: "彼女はとても親切な人です。",
        romaji: "Kanojo wa totemo shinsetsu na hito desu.",
        en: "She's a very kind person.",
      },
      {
        jp: "試験に落ちて、残念でした。",
        romaji: "Shiken ni ochite, zannen deshita.",
        en: "It was a shame that I failed the exam.",
      },
    ],
    commonMistake:
      "危険 ('dangerous,' a real hazard) and 怖い ('scary,' a feeling of fear) aren't the same thing — a dark street can be 怖い to walk down even if it isn't actually 危険, and a chemical can be 危険 without being 怖い to look at.",
    rows: [
      {
        label: "kind, careful & diligent",
        terms: [
          "親切",
          "丁寧",
          "熱心",
          "真面目",
          "大事",
          "うまい",
          "優しい",
          "厳しい",
        ],
      },
      {
        label: "sad, embarrassed & regrettable",
        terms: ["悲しい", "恥ずかしい", "残念", "寂しい", "ひどい"],
      },
      {
        label: "strange, odd & inconvenient",
        terms: ["おかしい", "変", "邪魔", "不便", "珍しい"],
      },
      {
        label: "impressive, scary & risky",
        terms: [
          "美しい",
          "素晴らしい",
          "凄い",
          "怖い",
          "危険",
          "眠い",
          "うれしい",
          "確か",
        ],
      },
    ],
  },
  {
    key: "sensory-physical",
    title: "Sensory & Quality Adjectives",
    subtitle: "様子を表す形容詞",
    insight:
      "Words for judging a thing's physical quality (柔らかい soft, 堅い hard, 深い deep, 浅い shallow, 苦い bitter) or how well-suited/complicated it is (簡単 simple, 複雑 complicated, 適当 fitting, 無理 unreasonable).",
    extendedInsight:
      "柔らかい and 堅い are a matched pair, like N5's 大きい/小さい, and pair naturally with texture nouns — 柔らかいパン ('soft bread'), 堅い肉 ('tough meat').",
    examples: [
      {
        jp: "このコーヒーは苦いです。",
        romaji: "Kono koohii wa nigai desu.",
        en: "This coffee is bitter.",
      },
      {
        jp: "この問題は複雑すぎます。",
        romaji: "Kono mondai wa fukuzatsu sugimasu.",
        en: "This problem is too complicated.",
      },
    ],
    commonMistake:
      "適当 has two very different everyday senses — 'suitable/appropriate' (適当な人を選ぶ, 'choose a suitable person') and, casually, 'sloppy/half-hearted' (適当にやる, 'do it halfheartedly') — context alone tells you which is meant.",
    rows: [
      {
        terms: [
          "柔らかい",
          "堅",
          "深い",
          "浅い",
          "苦い",
          "細かい",
          "簡単",
          "複雑",
          "適当",
          "十分",
          "無理",
          "盛ん",
        ],
      },
    ],
  },
  {
    key: "verb-pairs",
    title: "Transitive & Intransitive Verb Pairs",
    subtitle: "自動詞・他動詞",
    insight:
      "N4's central grammar theme: many verbs come in pairs describing the same change from two angles — an intransitive verb for when it just happens (ガラスが割れる, 'the glass breaks') and a transitive verb for when someone makes it happen. Learning them as pairs, like N5's 開く/開ける, means one new verb often comes with its partner already half-learned.",
    extendedInsight:
      "The endings hint at the pattern without being a strict rule — intransitive verbs often end in ～まる/～れる/～きる, their transitive partners in ～める/～す/～ける (決まる/決める, 壊れる/壊す, 見つかる/見つける) — but 増える and a few others break the pattern, so the meaning, not just the ending, is what to memorize.",
    examples: [
      {
        jp: "財布が見つかりました。",
        romaji: "Saifu ga mitsukarimashita.",
        en: "My wallet was found.",
      },
      {
        jp: "弟が財布を見つけました。",
        romaji: "Otouto ga saifu o mitsukemashita.",
        en: "My little brother found the wallet.",
      },
    ],
    commonMistake:
      "空く has two readings in this pool: read あく it means 'to open/become vacant' (席が空く, 'a seat opens up'), but read すく it means 'to become less crowded' (道が空く, 'the road becomes less congested') — same kanji, related but distinct meanings, told apart only by context.",
    rows: [
      {
        label: "breaking & fixing",
        terms: [
          "壊す",
          "壊れる",
          "折る",
          "折れる",
          "割れる",
          "直る",
          "直す",
          "治る",
        ],
      },
      {
        label: "opening, closing & switching on",
        terms: ["開く", "空く", "空く-2", "点く"],
      },
      {
        label: "hot, cold, wet & dry",
        terms: [
          "沸く",
          "沸かす",
          "焼く",
          "焼ける",
          "冷える",
          "濡れる",
          "汚れる",
        ],
      },
      {
        label: "deciding, changing & continuing",
        terms: [
          "決まる",
          "決める",
          "変わる",
          "変える",
          "続く",
          "続ける-2",
          "回る回す",
          "動く",
        ],
      },
      {
        label: "gathering, finding & losing",
        terms: [
          "集まる",
          "集める",
          "見つかる",
          "見つける",
          "無くなる",
          "落る",
          "落す",
          "増える",
        ],
      },
      { label: "up, down & across", terms: ["上がる", "下る", "下げる"] },
    ],
  },
  {
    key: "everyday-actions",
    title: "Everyday Actions — Helping, Searching & Deciding",
    subtitle: "日常の動作",
    insight:
      "General-purpose verbs for actions that don't belong to one narrow topic — searching (探す, 調べる), helping (手伝う, 役に立つ), and getting things right or wrong (間違える, 比べる, 慣れる).",
    extendedInsight:
      "探す ('to search for something you don't yet have') and 調べる ('to look into facts you suspect exist') describe different kinds of looking — 財布を探す is searching for a lost wallet, 言葉の意味を調べる is looking up a word's meaning in a dictionary.",
    examples: [
      {
        jp: "分からない言葉を辞書で調べます。",
        romaji: "Wakaranai kotoba o jisho de shirabemasu.",
        en: "I look up words I don't know in the dictionary.",
      },
      {
        jp: "弟の宿題を手伝いました。",
        romaji: "Otouto no shukudai o tetsudaimashita.",
        en: "I helped my little brother with his homework.",
      },
    ],
    commonMistake:
      "間に合う ('to be in time for,' making a deadline) and 足りる ('to be sufficient,' having enough) both sound like general 'it's okay' phrases but answer different questions — 間に合いました answers 'was I on time?', 足りました answers 'was there enough?'",
    rows: [
      {
        label: "searching, checking & comparing",
        terms: ["探す", "調べる", "比べる", "間違える", "慣れる", "似る"],
      },
      {
        label: "helping & being useful",
        terms: ["手伝う", "役に立つ", "間に合う", "足りる", "取り替える"],
      },
      {
        label: "acting & carrying out",
        terms: [
          "行う",
          "進む",
          "楽む",
          "拾う",
          "包む",
          "受ける",
          "騒ぐ",
          "いじめる",
          "考える",
        ],
      },
      { label: "relationships & life", terms: ["別れる", "関係", "生活"] },
    ],
  },
  {
    key: "more-verbs-1",
    title: "Everyday Verbs II — Thinking, Trying & Reacting",
    subtitle: "動詞（２）",
    insight:
      "A second big batch of common verbs — how you feel about things (思う to think, びっくりする to be surprised), how you try (頑張る to try hard), and how you interact with others (褒める to praise, 叱る to scold, 約束する to promise).",
    extendedInsight:
      "止む (intransitive, 'to cease on its own,' 雨が止む 'the rain stops') and 止める (transitive, 'to make something stop') are yet another pair like N4's verb-pairs cluster — and 止める itself is a genuine homograph, read やめる when it means 'to quit/give up doing something' and read とめる when it means 'to stop something physically' (車を止める, 'to park a car').",
    examples: [
      {
        jp: "雨がやっと止みました。",
        romaji: "Ame ga yatto yamimashita.",
        en: "The rain finally stopped.",
      },
      {
        jp: "先生に褒められて、うれしかったです。",
        romaji: "Sensei ni homerarete, ureshikatta desu.",
        en: "I was happy to be praised by my teacher.",
      },
    ],
    commonMistake:
      "褒める ('to praise') and 叱る ('to scold') are opposites easy to swap under pressure — 褒められました means someone praised you, while 叱られました means you got scolded.",
    rows: [
      {
        label: "thinking & feeling",
        terms: ["思う", "思い出す", "びっくりする", "頑張る", "約束", "眠る"],
      },
      {
        label: "praising, scolding & social",
        terms: ["けんかする", "褒める", "叱る", "承知", "世話"],
      },
      {
        label: "starting, stopping & staying",
        terms: [
          "止む",
          "止める",
          "止める-2",
          "残る",
          "込む",
          "遅れる",
          "下りる",
        ],
      },
      {
        label: "nature & physical actions",
        terms: [
          "揺れる",
          "祈る",
          "噛む",
          "起こす",
          "立てる",
          "漬ける",
          "乾く",
          "塗る",
          "育てる",
          "滑る",
          "合う",
          "過ぎる",
        ],
      },
    ],
  },
  {
    key: "communication",
    title: "Communication — Sound, Speech & Visits",
    subtitle: "伝える",
    insight:
      "How information travels between people (伝える, 知らせる, 返事), what carries it (放送, 番組), and the two verbs read identically たずねる that get confused constantly: 尋ねる ('to ask/inquire') and 訪ねる ('to visit').",
    extendedInsight:
      "鳴る (a sound rings out, 'ベルが鳴る,' 'the bell rings') and 聞こえる (a sound reaches your ears, '音楽が聞こえる,' 'I can hear music') describe two different steps of the same event — the sound happening, and the sound being perceived.",
    examples: [
      {
        jp: "先生に道を尋ねました。",
        romaji: "Sensei ni michi o tazunemashita.",
        en: "I asked the teacher for directions.",
      },
      {
        jp: "来週、先生の家を訪ねます。",
        romaji: "Raishuu, sensei no ie o tazunemasu.",
        en: "Next week, I'll visit my teacher's house.",
      },
    ],
    commonMistake:
      "尋ねる and 訪ねる are both read たずねる but aren't the same word — 道を尋ねる asks a question, 家を訪ねる visits a place; mixing up the kanji is one of N4's classic homophone traps.",
    rows: [
      {
        terms: [
          "伝える",
          "知らせる",
          "返事",
          "会話",
          "うそ",
          "放送",
          "番組",
          "鳴る",
          "聞こえる",
          "尋ねる",
          "訪ねる",
        ],
      },
    ],
  },
  {
    key: "emotion-verbs",
    title: "Verbs of Emotion & Reaction",
    subtitle: "感情",
    insight:
      "Verbs for showing or managing a feeling toward something that happened — getting angry (怒る), worrying (心配する) or being put at ease (安心する), and the social reflexes of apologizing (謝る) and holding back (遠慮する).",
    extendedInsight:
      "心配 and 安心 are natural opposites — 心配する is worrying about an uncertain outcome, 安心する is the relief once you know it turned out fine, and both are suru-nouns like N5's 勉強する rather than plain verbs.",
    examples: [
      {
        jp: "母は私のことをいつも心配しています。",
        romaji: "Haha wa watashi no koto o itsumo shinpai shite imasu.",
        en: "My mother always worries about me.",
      },
      {
        jp: "連絡をもらって、安心しました。",
        romaji: "Renraku o moratte, anshin shimashita.",
        en: "I felt relieved after getting in touch.",
      },
    ],
    commonMistake:
      "遠慮する doesn't just mean 'to hesitate' — used alone as a polite refusal (遠慮します, 'I'll pass, thank you') it's a soft way to decline an offer, not a statement that you're literally feeling shy.",
    rows: [
      { terms: ["怒る", "心配", "喜ぶ", "謝る", "遠慮", "安心", "亡くなる"] },
    ],
  },
  {
    key: "movement-travel",
    title: "Movement, Travel & Errands",
    subtitle: "移動",
    insight:
      "Verbs for getting somewhere and getting things there — commuting and stopping by (通う, 寄る), moving house (引っ越す, 移る), and handling objects and people in transit (運ぶ to carry, 届ける to deliver, 送る to send, 連れる to bring a person along).",
    extendedInsight:
      "通る ('to pass through/by,' a route) and 通う ('to go back and forth regularly,' a habitual commute) share the same first kanji and are easy to conflate — 学校の前を通る passes by the school once, while 学校に通う describes attending it regularly over time.",
    examples: [
      {
        jp: "毎日、電車で会社に通っています。",
        romaji: "Mainichi, densha de kaisha ni kayotte imasu.",
        en: "I commute to work by train every day.",
      },
      {
        jp: "来月、新しい町に引っ越します。",
        romaji: "Raigetsu, atarashii machi ni hikkoshimasu.",
        en: "I'm moving to a new town next month.",
      },
    ],
    commonMistake:
      "盗む ('to steal') takes を for the stolen item (財布を盗む, 'to steal a wallet'), not に — treating it like a verb of motion (which take に for destination) is an easy slip.",
    rows: [
      {
        terms: [
          "通る",
          "通う",
          "寄る",
          "泊まる",
          "引っ越す",
          "移る",
          "戻る",
          "向かう",
          "急ぐ",
          "逃げる",
          "乗り換える",
          "迎える",
          "送る",
          "届ける",
          "運ぶ",
          "連れる",
          "捕まえる",
          "踏む",
          "盗む",
          "帰り",
        ],
      },
    ],
  },
  {
    key: "transportation-places",
    title: "Transportation & Places Around Town",
    subtitle: "町・交通",
    insight:
      "More destinations beyond N5's bank/post office/library — cultural and religious sites (美術館, 神社, 寺, 教会), the levels of a town or city (町, 市, 都, 郊外, 田舎), and faster ways to travel between them (急行, 特急, 汽車).",
    extendedInsight:
      "急行 ('express') and 特急 ('limited express') are ranked speeds on the same train line, not different lines — a 特急 skips more stops than a 急行.",
    examples: [
      {
        jp: "動物園の近くに美術館があります。",
        romaji: "Doubutsuen no chikaku ni bijutsukan ga arimasu.",
        en: "There's an art museum near the zoo.",
      },
      {
        jp: "特急に乗れば、一時間で着きます。",
        romaji: "Tokkyuu ni noreba, ichi-jikan de tsukimasu.",
        en: "If you take the limited express, you'll arrive in one hour.",
      },
    ],
    commonMistake:
      "田舎 ('the countryside/rural area,' a broad description) and 郊外 ('the suburbs,' specifically just outside a city) aren't the same kind of place — describing a suburb as 田舎 sounds like calling it far more remote than it is.",
    rows: [
      {
        label: "town, city & country",
        terms: ["町", "市", "都", "郊外", "田舎", "住所", "場所", "床屋"],
      },
      {
        label: "cultural & religious places",
        terms: ["動物園", "美術館", "教会", "寺", "神社"],
      },
      {
        label: "travel & transit",
        terms: [
          "空港",
          "飛行場",
          "交通",
          "通り",
          "運転",
          "急行",
          "特急",
          "汽車",
        ],
      },
    ],
  },
  {
    key: "occupations",
    title: "Occupations & Social Roles",
    subtitle: "職業",
    insight:
      "Job titles and the rank structure of a Japanese company or school — 社長 (company president) sits above 部長 (division manager), who sits above 課長 (section manager); 校長 (principal) is the equivalent rank at a school.",
    extendedInsight:
      "先輩 has no direct English equivalent — it names anyone senior to you in the same group (school, company, club) by time, not necessarily age or job title, and always implies a certain respect owed to them.",
    examples: [
      {
        jp: "彼女は病院で看護婦として働いています。",
        romaji: "Kanojo wa byouin de kangofu toshite hataraite imasu.",
        en: "She works as a nurse at a hospital.",
      },
      {
        jp: "社長は会議室にいます。",
        romaji: "Shachou wa kaigishitsu ni imasu.",
        en: "The president is in the conference room.",
      },
    ],
    commonMistake:
      "泥棒 ('a thief,' the person) and すり ('a pickpocket,' someone who steals from your person in a crowd) aren't generic synonyms — using すり for a burglar who broke into a house describes the wrong kind of crime.",
    rows: [
      { label: "company ranks", terms: ["社長", "部長", "課長", "先輩"] },
      {
        label: "public & school roles",
        terms: ["校長", "公務員", "市民", "大学生", "高校生"],
      },
      {
        label: "everyday jobs",
        terms: ["運転手", "店員", "歯医者", "看護婦", "アナウンサー"],
      },
      { label: "people & crime", terms: ["男性", "女性", "泥棒", "すり"] },
    ],
  },
  {
    key: "society-economy",
    title: "Society, Economy & the Wider World",
    subtitle: "社会・経済",
    insight:
      "Bigger-picture words for talking about a country or the world rather than your own daily life — industry and trade (産業, 貿易, 輸出, 輸入), the continents/regions those goods move between (アメリカ, アジア, アフリカ, 西洋), and the shared systems a society runs on (法律, 政治, 安全).",
    extendedInsight:
      "輸出 (export, sending goods out) and 輸入 (import, bringing goods in) share the same second character, meaning 'transport' — only the first kanji, 出 ('out') vs 入 ('in'), tells them apart, the same trick as N5's 出口/入口.",
    examples: [
      {
        jp: "日本はたくさんの車を輸出しています。",
        romaji: "Nihon wa takusan no kuruma o yushutsu shite imasu.",
        en: "Japan exports a lot of cars.",
      },
      {
        jp: "世界には色々な文化があります。",
        romaji: "Sekai ni wa iroiro na bunka ga arimasu.",
        en: "There are various cultures in the world.",
      },
    ],
    commonMistake:
      "事故 ('an accident,' unintentional) and 火事 ('a fire,' a specific kind of disaster) aren't interchangeable general-danger words — a traffic 事故 is common, but a building fire is always 火事, never 事故.",
    rows: [
      {
        label: "world & regions",
        terms: ["世界", "アメリカ", "アジア", "アフリカ", "西洋", "国際"],
      },
      {
        label: "industry & trade",
        terms: ["産業", "工業", "貿易", "輸出", "輸入", "生産", "技術", "利用"],
      },
      {
        label: "society & safety",
        terms: [
          "社会",
          "政治",
          "法律",
          "安全",
          "人口",
          "お金持ち",
          "事故",
          "火事",
        ],
      },
    ],
  },
  {
    key: "sports",
    title: "Sports, Games & Competition",
    subtitle: "スポーツ",
    insight:
      "The vocabulary of a match from start to finish — 試合 (the match itself), the actions inside it (投げる to throw, 打つ to hit), and how it ends (勝つ to win, 負ける to lose).",
    extendedInsight:
      "勝つ and 負ける are a matched opposite pair, like N5's adjective pairs, but as verbs — 試合に勝つ ('to win the match') takes に, not を, since you're winning against/over something rather than acting directly on it.",
    examples: [
      {
        jp: "昨日の試合に勝ちました。",
        romaji: "Kinou no shiai ni kachimashita.",
        en: "I won yesterday's match.",
      },
      {
        jp: "毎朝、運動をしています。",
        romaji: "Maiasa, undou o shite imasu.",
        en: "I exercise every morning.",
      },
    ],
    commonMistake:
      "負ける ('to lose a game/contest,' against an opponent) and failing an exam are different kinds of 'losing' — 試験に負ける is not natural Japanese; 試験に落ちる is the word for that instead.",
    rows: [
      {
        terms: [
          "試合",
          "勝つ",
          "負ける",
          "投げる",
          "打つ",
          "運動",
          "水泳",
          "競争",
        ],
      },
    ],
  },
  {
    key: "hobbies-arts",
    title: "Hobbies, Arts & Free Time",
    subtitle: "趣味",
    insight:
      "What people do for fun outside of work or school — reading (漫画, 小説), music and performance (ピアノ, コンサート, 踊る/踊り), and the seasonal outing that's a hobby all its own in Japan, 花見 (cherry-blossom viewing).",
    extendedInsight:
      "興味 and 趣味 both relate to 'interest,' but 興味がある means you find a topic interesting (a feeling), while 趣味 is the actual hobby you spend time on (趣味は写真です, 'my hobby is photography') — you can have 興味 in something without it being your 趣味.",
    examples: [
      {
        jp: "私の趣味はピアノです。",
        romaji: "Watashi no shumi wa piano desu.",
        en: "My hobby is piano.",
      },
      {
        jp: "春に家族で花見に行きます。",
        romaji: "Haru ni kazoku de hanami ni ikimasu.",
        en: "In spring, I go cherry-blossom viewing with my family.",
      },
    ],
    commonMistake:
      "研究 ('research,' the academic activity) and 研究室 ('a research lab/professor's office,' the room) share the same first two kanji but name completely different things — 研究をする is doing research, 研究室に行く is going to the room.",
    rows: [
      {
        label: "reading & writing",
        terms: ["漫画", "小説", "新聞社", "翻訳", "電報"],
      },
      {
        label: "music, dance & performance",
        terms: ["ピアノ", "コンサート", "踊る", "踊り", "柔道", "テニス"],
      },
      {
        label: "study & interest",
        terms: ["興味", "趣味", "楽しみ", "研究", "研究室", "写す"],
      },
      {
        label: "play & everyday fun",
        terms: [
          "人形",
          "おもちゃ",
          "遊び",
          "音",
          "花見",
          "パパ",
          "アルバイト",
          "アルコール",
        ],
      },
    ],
  },
  {
    key: "fillers-events",
    title: "Fillers, Small Talk & Everyday Events",
    subtitle: "会話表現・出来事",
    insight:
      "The small conversational words that don't fit a bigger topic — casual yes/no (うん, だめ), demonstrative-style words for manner (こう 'like this,' あんな/そんな 'that sort of'), and a handful of everyday nouns/events that round out daily conversation (夢, お祭り, 正月, 寝坊).",
    extendedInsight:
      "こう belongs to the same family as N5's この/その/あの demonstrative series, but describes manner rather than a thing — こうしてください ('please do it this way') points at how to do something, the way この/その/あの point at a physical object.",
    examples: [
      {
        jp: "お正月に家族と食事をします。",
        romaji: "Oshougatsu ni kazoku to shokuji o shimasu.",
        en: "On New Year's, I have a meal with my family.",
      },
      {
        jp: "今朝、寝坊してしまいました。",
        romaji: "Kesa, nebou shite shimaimashita.",
        en: "I ended up oversleeping this morning.",
      },
    ],
    commonMistake:
      "だめ ('no good, not allowed') is blunter than すみません or ちょっと… for declining something — telling someone だめです can sound like a flat refusal, appropriate with people you know well but often too direct otherwise.",
    rows: [
      {
        label: "yes, no & manner words",
        terms: ["うん", "だめ", "こう", "あんな", "そんな", "あ", "または"],
      },
      {
        label: "everyday events",
        terms: ["正月", "お祭り", "食事", "戦争", "寝坊", "急"],
      },
      {
        label: "senses & feelings",
        terms: ["匂い", "気持ち", "夢", "見える", "遠く", "周り", "かっこう"],
      },
      { label: "small actions", terms: ["ごみ", "捨てる", "足す", "釣る"] },
    ],
  },
  {
    key: "places-objects",
    title: "Everyday Places, Objects & Necessities",
    subtitle: "身の回りの物",
    insight:
      "A grab-bag of common nouns and verbs for daily necessities and settings — travel and lodging (旅館, 海岸, 景色, 乗り物, 下宿), things you keep or notice around the house (鏡, 道具, 隅, 裏), and the practical business of getting through a day (支度, 計画, 経験, 昼休み).",
    extendedInsight:
      "火 and 日 are both read ひ and easy to mix up in kana-only writing — 火 means 'fire,' 日 means 'sun/day'; only the kanji or context tells them apart, much like N4's own 尋ねる/訪ねる homophone pair.",
    examples: [
      {
        jp: "朝、学校へ行く支度をします。",
        romaji: "Asa, gakkou e iku shitaku o shimasu.",
        en: "In the morning, I get ready to go to school.",
      },
      {
        jp: "海岸から美しい景色が見えます。",
        romaji: "Kaigan kara utsukushii keshiki ga miemasu.",
        en: "A beautiful view can be seen from the coast.",
      },
    ],
    commonMistake:
      "忘れ物 ('a forgotten/left-behind item') describes the object itself, not the act of forgetting — 忘れ物をしました means 'I left something behind,' not 'I forgot' in general (that would just be 忘れました).",
    rows: [
      {
        label: "travel & lodging",
        terms: ["旅館", "下宿", "海岸", "景色", "乗り物", "舟"],
      },
      {
        label: "around the house",
        terms: [
          "壁",
          "裏",
          "隅",
          "鏡",
          "道具",
          "形",
          "水道",
          "冷房",
          "暖房",
          "表",
          "受付",
        ],
      },
      {
        label: "daily necessities & routine",
        terms: [
          "支度",
          "計画",
          "昼休み",
          "忘れ物",
          "日記",
          "注意",
          "必要",
          "お見舞い",
          "入学",
          "席",
          "近所",
          "湯",
        ],
      },
      {
        label: "elements & institutions",
        terms: ["火", "日", "工場", "警察", "経験"],
      },
    ],
  },
  {
    key: "nature",
    title: "Nature & the Outdoors, More",
    subtitle: "自然",
    insight:
      "Beyond N5's basics, N4 fills in the wider landscape — bodies of water and land features (湖, 港, 島, 坂), things that grow (草, 枝, 葉), and the weather events that make the news (台風, 地震, 天気予報).",
    extendedInsight:
      "月 is a genuine homograph in this pool: read つき it's the plain noun 'moon,' but as the suffix ～月 it's the calendar unit 'month' (三月, 'March/three months') — same character, one concrete and one abstract sense, distinguished by whether a number comes before it.",
    examples: [
      {
        jp: "空に星がたくさん見えます。",
        romaji: "Sora ni hoshi ga takusan miemasu.",
        en: "Many stars can be seen in the sky.",
      },
      {
        jp: "台風のニュースを天気予報で見ました。",
        romaji: "Taifuu no nyuusu o tenki yohou de mimashita.",
        en: "I saw news of the typhoon on the weather forecast.",
      },
    ],
    commonMistake:
      "森 and 林 both mean 'forest/woods,' but 森 implies a larger, denser, more natural-growth forest, while 林 is often smaller or planted/managed (a grove) — the distinction is about density and origin, not simply size.",
    rows: [
      {
        label: "land & water",
        terms: ["湖", "港", "島", "坂", "森", "林", "石", "砂"],
      },
      {
        label: "plants & small creatures",
        terms: ["草", "枝", "葉", "小鳥", "虫", "植える"],
      },
      {
        label: "sky & weather",
        terms: ["星", "雲", "光", "光る", "台風", "地震", "天気予報", "空気"],
      },
      { label: "time & season", terms: ["月-2", "季節", "暮れる"] },
    ],
  },
];
