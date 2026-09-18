/**
 * Static content for the /kana learning page: the 46-symbol gojūon for both
 * scripts, grouped by row, each paired with a short shape mnemonic. Purely
 * editorial content (not the persisted N5 pool) — nothing here is read by
 * the daily game or the MCP server.
 */

export interface KanaEntry {
  romaji: string;
  hiragana: string;
  hiraganaMnemonic: string;
  katakana: string;
  katakanaMnemonic: string;
}

export interface KanaRow {
  row: string;
  entries: KanaEntry[];
}

export const KANA_ROWS: KanaRow[] = [
  {
    row: "a",
    entries: [
      {
        romaji: "a",
        hiragana: "あ",
        hiraganaMnemonic:
          "The loop looks like an open mouth saying \"ah\" — the same shape as the sound.",
        katakana: "ア",
        katakanaMnemonic:
          "A sharp roof-and-post shape — think of the letter A stripped down to two strokes.",
      },
      {
        romaji: "i",
        hiragana: "い",
        hiraganaMnemonic:
          "Two curved strokes standing side by side, like a pair of \"ii\" (good) friends leaning together.",
        katakana: "イ",
        katakanaMnemonic:
          "A stick figure standing at attention — one straight leg, one kicked back.",
      },
      {
        romaji: "u",
        hiragana: "う",
        hiraganaMnemonic:
          "A head ducking under something, brim first — \"u\" for \"under\".",
        katakana: "ウ",
        katakanaMnemonic:
          "A satellite dish or roof with an antenna poking up through it.",
      },
      {
        romaji: "e",
        hiragana: "え",
        hiraganaMnemonic:
          "Looks like a little easel on legs — \"e\" for \"easel\".",
        katakana: "エ",
        katakanaMnemonic:
          "A capital \"H\" tipped on its side, like a steel girder.",
      },
      {
        romaji: "o",
        hiragana: "お",
        hiraganaMnemonic:
          "A spinning top with a loop of string trailing off it, mid-spin.",
        katakana: "オ",
        katakanaMnemonic:
          "A person mid karate-chop, arm slicing down and out.",
      },
    ],
  },
  {
    row: "ka",
    entries: [
      {
        romaji: "ka",
        hiragana: "か",
        hiraganaMnemonic:
          "A sickle swinging down through grass, with a little seed flying off the tip.",
        katakana: "カ",
        katakanaMnemonic:
          "The same sickle, but straightened into two hard, angular strokes.",
      },
      {
        romaji: "ki",
        hiragana: "き",
        hiraganaMnemonic:
          "A key, with two little teeth cut into the shaft.",
        katakana: "キ",
        katakanaMnemonic:
          "The same key shape, drawn with sharp corners instead of curves.",
      },
      {
        romaji: "ku",
        hiragana: "く",
        hiraganaMnemonic: "A single curled claw or boomerang, tucked inward.",
        katakana: "ク",
        katakanaMnemonic:
          "A claw again, but bent at a hard angle like a folded arm.",
      },
      {
        romaji: "ke",
        hiragana: "け",
        hiraganaMnemonic: "A leg mid-kick, knee raised, foot flicking out.",
        katakana: "ケ",
        katakanaMnemonic: "The same kicking leg, stiffened into straight lines.",
      },
      {
        romaji: "ko",
        hiragana: "こ",
        hiraganaMnemonic:
          "Two curved rail segments laid one above the other, clacking \"ko-ko\".",
        katakana: "コ",
        katakanaMnemonic: "An open box, missing its right-hand wall.",
      },
    ],
  },
  {
    row: "sa",
    entries: [
      {
        romaji: "sa",
        hiragana: "さ",
        hiraganaMnemonic: "A hand saw, teeth down, mid-stroke through wood.",
        katakana: "サ",
        katakanaMnemonic: "A TV antenna bolted to a rooftop pole.",
      },
      {
        romaji: "shi",
        hiragana: "し",
        hiraganaMnemonic:
          "One calm, curved stroke — like a finger held up for \"shh\".",
        katakana: "シ",
        katakanaMnemonic:
          "Three short sparks flying off in the same direction — sharper than its hiragana twin.",
      },
      {
        romaji: "su",
        hiragana: "す",
        hiraganaMnemonic: "A straw's swirl, sucking a drop up and around.",
        katakana: "ス",
        katakanaMnemonic: "A ski slope with a jump ramp at the bottom.",
      },
      {
        romaji: "se",
        hiragana: "せ",
        hiraganaMnemonic: "A low stool or seesaw, seen from the side.",
        katakana: "セ",
        katakanaMnemonic: "A box with its lid propped half open.",
      },
      {
        romaji: "so",
        hiragana: "そ",
        hiraganaMnemonic:
          "A thread zigzagging through cloth — \"so\" as in \"sewn\".",
        katakana: "ソ",
        katakanaMnemonic: "A single raindrop caught falling at an angle.",
      },
    ],
  },
  {
    row: "ta",
    entries: [
      {
        romaji: "ta",
        hiragana: "た",
        hiraganaMnemonic: "A person taking a bow, arms crossed — \"ta-da\".",
        katakana: "タ",
        katakanaMnemonic: "A table, seen from the side with one leg forward.",
      },
      {
        romaji: "chi",
        hiragana: "ち",
        hiraganaMnemonic: "A single curled loop, like a cereal ring.",
        katakana: "チ",
        katakanaMnemonic: "A golf club mid swing, following through.",
      },
      {
        romaji: "tsu",
        hiragana: "つ",
        hiraganaMnemonic: "One wave, cresting and about to break — a tsunami in miniature.",
        katakana: "ツ",
        katakanaMnemonic: "Three sharp wave-crests in a row, breaking together.",
      },
      {
        romaji: "te",
        hiragana: "て",
        hiraganaMnemonic:
          "A hand reaching out and bending at the wrist — fittingly, 手 (te) means \"hand\".",
        katakana: "テ",
        katakanaMnemonic: "A television antenna crossed by a signal bar.",
      },
      {
        romaji: "to",
        hiragana: "と",
        hiraganaMnemonic: "A toe kicking a door open at the hinge.",
        katakana: "ト",
        katakanaMnemonic: "A single post with one branch — a signpost by the road.",
      },
    ],
  },
  {
    row: "na",
    entries: [
      {
        romaji: "na",
        hiragana: "な",
        hiraganaMnemonic: "A knot, tied and pulled tight — \"na\" as in \"knot\".",
        katakana: "ナ",
        katakanaMnemonic: "A plus sign crossed by one extra diagonal stroke.",
      },
      {
        romaji: "ni",
        hiragana: "に",
        hiraganaMnemonic: "Two horizontal strokes with a hook — close to the kanji 二 (two).",
        katakana: "ニ",
        katakanaMnemonic: "Two flat strokes stacked, exactly like the kanji for \"two\".",
      },
      {
        romaji: "nu",
        hiragana: "ぬ",
        hiraganaMnemonic: "Noodles twisted around a fork, looping back on themselves.",
        katakana: "ヌ",
        katakanaMnemonic: "The same noodle twist, pulled taut into a sharper loop.",
      },
      {
        romaji: "ne",
        hiragana: "ね",
        hiraganaMnemonic:
          "A cat curling its tail around its paws — ねこ (neko, \"cat\") starts with ne.",
        katakana: "ネ",
        katakanaMnemonic: "A knitting needle threading through a loop of yarn.",
      },
      {
        romaji: "no",
        hiragana: "の",
        hiraganaMnemonic: "One continuous swirl, like tracing a \"no-entry\" circle.",
        katakana: "ノ",
        katakanaMnemonic: "A single downward slash — the simplest stroke in either script.",
      },
    ],
  },
  {
    row: "ha",
    entries: [
      {
        romaji: "ha",
        hiragana: "は",
        hiraganaMnemonic: "A stick figure laughing, legs kicked open — \"ha ha\".",
        katakana: "ハ",
        katakanaMnemonic: "The same open legs, straightened into two sharp strokes.",
      },
      {
        romaji: "hi",
        hiragana: "ひ",
        hiraganaMnemonic: "A single curved smile, mid \"hee\" laugh.",
        katakana: "ヒ",
        katakanaMnemonic: "A can opener's hooked blade.",
      },
      {
        romaji: "fu",
        hiragana: "ふ",
        hiraganaMnemonic:
          "Mount Fuji's silhouette, two slopes and a summit — fu for Fuji.",
        katakana: "フ",
        katakanaMnemonic: "A single fishhook, angled sharply at the tip.",
      },
      {
        romaji: "he",
        hiragana: "へ",
        hiraganaMnemonic: "A small mountain peak, one clean upward stroke.",
        katakana: "ヘ",
        katakanaMnemonic: "The identical peak shape — hiragana and katakana share this one.",
      },
      {
        romaji: "ho",
        hiragana: "ほ",
        hiraganaMnemonic: "A signpost with a little flag flying off the crossbar.",
        katakana: "ホ",
        katakanaMnemonic: "The same signpost, drawn as a bare pole with two side struts.",
      },
    ],
  },
  {
    row: "ma",
    entries: [
      {
        romaji: "ma",
        hiragana: "ま",
        hiraganaMnemonic: "A mother's apron, tied with a loop at the waist.",
        katakana: "マ",
        katakanaMnemonic: "A fishhook with a small flag caught on the line.",
      },
      {
        romaji: "mi",
        hiragana: "み",
        hiraganaMnemonic: "A fishhook curling into a spiral, like a mirrored \"3\".",
        katakana: "ミ",
        katakanaMnemonic: "Three short parallel waves, side by side.",
      },
      {
        romaji: "mu",
        hiragana: "む",
        hiraganaMnemonic: "A cow's face, mid \"moo\", with a curled tail at the end.",
        katakana: "ム",
        katakanaMnemonic: "A cow's horns, seen head-on as an upside-down V.",
      },
      {
        romaji: "me",
        hiragana: "め",
        hiraganaMnemonic:
          "A slanted eye mid-blink — fittingly, 目 (me) means \"eye\".",
        katakana: "メ",
        katakanaMnemonic: "An eye squeezed shut into a sharp \"X\".",
      },
      {
        romaji: "mo",
        hiragana: "も",
        hiraganaMnemonic: "Seaweed swaying on a line — 藻 (mo) means \"algae\".",
        katakana: "モ",
        katakanaMnemonic: "A sprout pushing up through two crossbars of soil.",
      },
    ],
  },
  {
    row: "ya",
    entries: [
      {
        romaji: "ya",
        hiragana: "や",
        hiraganaMnemonic: "A slingshot, pulled back and loaded.",
        katakana: "ヤ",
        katakanaMnemonic: "The same slingshot, straightened into a sharp \"Y\".",
      },
      {
        romaji: "yu",
        hiragana: "ゆ",
        hiraganaMnemonic:
          "Steam curling off a hot spring — 湯 (yu) means \"hot water\".",
        katakana: "ユ",
        katakanaMnemonic: "The same hot-spring curl, drawn with two straight strokes.",
      },
      {
        romaji: "yo",
        hiragana: "よ",
        hiraganaMnemonic: "A person waving one arm high — \"yo!\".",
        katakana: "ヨ",
        katakanaMnemonic: "A ladder with three even rungs.",
      },
    ],
  },
  {
    row: "ra",
    entries: [
      {
        romaji: "ra",
        hiragana: "ら",
        hiraganaMnemonic: "A rabbit's ear, flopped over at the tip.",
        katakana: "ラ",
        katakanaMnemonic: "A coat hanger, hook and crossbar.",
      },
      {
        romaji: "ri",
        hiragana: "り",
        hiraganaMnemonic: "Two chopsticks leaning together, about to fall.",
        katakana: "リ",
        katakanaMnemonic: "The same two chopsticks, standing straight and separate.",
      },
      {
        romaji: "ru",
        hiragana: "る",
        hiraganaMnemonic: "A loop tied off at the bottom, like a treble clef.",
        katakana: "ル",
        katakanaMnemonic: "A small hook with a short tail curling under it.",
      },
      {
        romaji: "re",
        hiragana: "れ",
        hiraganaMnemonic: "A person leaning back in a chair, relaxed.",
        katakana: "レ",
        katakanaMnemonic: "A single check mark, flicked upward.",
      },
      {
        romaji: "ro",
        hiragana: "ろ",
        hiraganaMnemonic: "A winding corridor, folding back on itself like a maze.",
        katakana: "ロ",
        katakanaMnemonic: "A square box — the same shape as the kanji 口 (\"mouth\").",
      },
    ],
  },
  {
    row: "wa / n",
    entries: [
      {
        romaji: "wa",
        hiragana: "わ",
        hiraganaMnemonic: "A person waving both arms overhead — \"wa!\".",
        katakana: "ワ",
        katakanaMnemonic: "A head with a curl of hair flopping over one eye.",
      },
      {
        romaji: "wo",
        hiragana: "を",
        hiraganaMnemonic:
          "A figure bending into a bow — today used almost only as the を object particle.",
        katakana: "ヲ",
        katakanaMnemonic:
          "The rare katakana counterpart — you'll mostly meet を, not this, in normal reading.",
      },
      {
        romaji: "n",
        hiragana: "ん",
        hiraganaMnemonic:
          "A single trailing hook — the only kana that's a consonant with no vowel, and it can end a word.",
        katakana: "ン",
        katakanaMnemonic:
          "Two short strokes, easy to confuse with シ/ツ — context (and which script) tells them apart.",
      },
    ],
  },
];

export interface KanaVariantGroup {
  title: string;
  description: string;
  example: string;
}

export const DAKUTEN_GROUPS: KanaVariantGroup[] = [
  {
    title: "Dakuten ( ゙ → か゛ = が )",
    description:
      "Two small strokes in the upper-right corner voice an unvoiced consonant: k→g, s→z, t→d, h→b. か (ka) becomes が (ga), さ (sa) becomes ざ (za), は (ha) becomes ば (ba).",
    example: "かぎ (kagi, \"key\") — か stays unvoiced, ぎ (gi) is き (ki) voiced.",
  },
  {
    title: "Handakuten ( ゚ → ほ゜ = ぽ )",
    description:
      "A small circle, used only on the h-row, turns h into p instead of b: は (ha) → ぱ (pa), ひ (hi) → ぴ (pi), ふ (fu) → ぷ (pu).",
    example: "てんぷら (tempura) — ぷ (pu) is ふ (fu) with a handakuten.",
  },
];

export const DIGRAPH_GROUPS: KanaVariantGroup[] = [
  {
    title: "Small ゃ/ゅ/ょ (ya/yu/yo) — palatalized sounds",
    description:
      "A full-size i-row kana followed by a small ゃ, ゅ, or ょ glides the two together into one syllable: き + small ゃ = きゃ (kya), し + small ゅ = しゅ (shu).",
    example: "きょう (kyou, \"today\") — き + small ょ, not \"ki-yo-u\".",
  },
  {
    title: "Small っ/ッ (sokuon) — doubled consonants",
    description:
      "A small tsu inserts a brief pause that doubles the next consonant. It never has its own sound — it's a beat of silence written into the word.",
    example: "きっぷ (kippu, \"ticket\") vs きぷ — the small っ is what makes the \"pp\" stop.",
  },
  {
    title: "Long vowel mark ー (katakana only)",
    description:
      "Katakana stretches a vowel with a dash instead of repeating a kana, which is how English loanwords keep their long vowels legible.",
    example: "コーヒー (koohii, \"coffee\") — each ー holds the vowel before it for an extra beat.",
  },
];
