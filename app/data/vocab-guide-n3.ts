/**
 * Curated companion content for the N3 study pages — the N3 counterpart to
 * vocab-guide.ts's N5 WORD_CLUSTERS and vocab-guide-n4.ts's N4 counterpart.
 * N3_WORD_CLUSTERS is what the N3 lesson path (app/data/lessons-n3.ts,
 * /learn?level=N3) is built from. It reuses every shared type/
 * WORD_TYPE_GROUPS/classifyPartOfSpeech from vocab-guide.ts (grammar-category
 * grouping is level-agnostic) rather than duplicating them.
 *
 * N3_WORD_CLUSTERS reference words by their PoolVocab `id` from the N3 word
 * list (elzup/jlpt-word-list's n3.csv, the same source
 * scripts/seed-pool-data.mjs reads) so the page can look each one up in the
 * fetched pool and simply skip any that aren't found. Every id is checked
 * against data/reference/n3-reference.json by test/content/n3/ the same way
 * N5's and N4's own content is checked — see CLAUDE.md's Content Accuracy
 * section.
 */
import type { WordCluster } from "./vocab-guide";

export const N3_WORD_CLUSTERS: WordCluster[] = [
  {
    key: "n3-b01-homophones",
    title: "Homophones — Same Reading, Different Kanji",
    subtitle: "同音異義語",
    insight:
      "日本語には同じ発音でも漢字と意味が違う言葉がたくさんあります。「さます」には温度を下げる冷ますと、眠りから起こす覚ますの二つの意味があり、「さめる」も同じように冷めると目が覚めるに分かれます。「さる」には立ち去るという意味の去ると、動物の猿という二つの言葉があり、「しめる」にも場所を占めるという意味と、水分で湿るという意味の二つがあります。",
    extendedInsight:
      "「しゅう」と読む週と州も同じ関係です。週は七日間を指し、州はアメリカなどの国の一部を表す地方の単位で、意味は全く違います。文脈と漢字を見て初めて正しい意味が分かります。",
    examples: [
      {
        jp: "お茶が冷めましたね。",
        romaji: "Ocha ga samemashita ne.",
        en: "The tea has gone cold, hasn't it.",
      },
      {
        jp: "夜中に目が覚めました。",
        romaji: "Yonaka ni me ga samemashita.",
        en: "I woke up in the middle of the night.",
      },
    ],
    commonMistake:
      "冷ます/冷めると覚ます/覚めるは発音が同じでも漢字が違うので、文章を書くときは意味に合わせて正しい漢字を選ぶ必要があります。お茶が覚めましたと書くと、お茶に意識があるような不自然な文になってしまいます。",
    rows: [
      {
        label: "さます/さめる — cooling",
        terms: ["冷ます", "冷める"],
      },
      {
        label: "さます/さめる — waking",
        terms: ["覚ます", "覚める"],
      },
      {
        label: "さる — leaving vs monkey",
        terms: ["去る", "猿"],
      },
      {
        label: "しめる — occupying vs damp",
        terms: ["占める", "湿る"],
      },
      {
        label: "しも — below vs frost",
        terms: ["下", "霜"],
      },
      {
        label: "しゅう — week vs state",
        terms: ["週", "州"],
      },
    ],
  },
  {
    key: "n3-b01-adverbs-connectors",
    title: "Formal Adverbs & Connectors",
    subtitle: "副詞・接続表現",
    insight:
      "N3では書き言葉的な副詞や接続表現が増えます。更にとしかもはどちらも「その上」という意味を持ち、情報を付け加えるときに使います。したがっては前の文から導かれる結論を表す言葉です。様々な問題が更に大きくなり、しかも時間もないので、したがって早く決める必要がある、というように文をつなげます。",
    extendedInsight:
      "直に(じかに)と直(じき)はどちらも「すぐに」に近い意味を持ちますが、直には「間に何も挟まずに」という直接的なニュアンスもあります。先生に直に話すと言えば、誰かを通さずに直接話すという意味になります。",
    examples: [
      {
        jp: "問題は更に難しくなりました。",
        romaji: "Mondai wa sarani muzukashiku narimashita.",
        en: "The problem became even more difficult.",
      },
      {
        jp: "彼はしきりに時計を見ていました。",
        romaji: "Kare wa shikirini tokei o mite imashita.",
        en: "He kept looking at the clock repeatedly.",
      },
    ],
    commonMistake:
      "実には「本当に、確かに」という驚きや強調を表す副詞で、実は「本当のことを言うと」という意味で新しい情報を切り出すときに使います。実は忙しいですと実に忙しいですでは、文の働きが全く違うので注意が必要です。",
    rows: [
      {
        label: "adding & connecting",
        terms: ["更に", "しかも", "したがって", "次第"],
      },
      {
        label: "manner & degree",
        terms: ["じっと", "しきりに", "しばしば", "徐々に", "少々", "様々"],
      },
      {
        label: "truth & timing",
        terms: ["実に", "実は", "直に", "直"],
      },
    ],
  },
  {
    key: "n3-b01-science-nature",
    title: "Science, Nature & Physical Change",
    subtitle: "自然科学",
    insight:
      "理科の授業でよく出てくる言葉です。酸性は水溶液の性質の一つで、酸素は私たちが呼吸するために必要な気体です。資源には石油や水など自然から得られるものが含まれ、実験によって新しい知識が生じることもあります。",
    extendedInsight:
      "湿気と湿度は似ていますが、湿気は空気中の水分そのものを指す感覚的な言葉で、湿度はその水分の量を数字で表す気象用語です。日本の四季の中では梅雨の時期に湿気が最も強く感じられます。",
    examples: [
      {
        jp: "今日は湿度が高いです。",
        romaji: "Kyou wa shitsudo ga takai desu.",
        en: "Today the humidity is high.",
      },
      {
        jp: "この植物は水の中に沈みました。",
        romaji: "Kono shokubutsu wa mizu no naka ni shizumimashita.",
        en: "This plant sank into the water.",
      },
    ],
    commonMistake:
      "自然は「人の手が加わっていない、ありのままの状態」を表す言葉で、資源のように人間が利用する対象を指す言葉とは意味が違います。自然を資源と同じ意味で使うと不自然な文になります。",
    rows: [
      {
        label: "chemistry & elements",
        terms: ["酸性", "酸素", "資源", "刺激"],
      },
      {
        label: "research & causation",
        terms: ["実験", "生じる"],
      },
      {
        label: "climate & moisture",
        terms: ["湿気", "湿度", "四季"],
      },
      {
        label: "nature & change",
        terms: ["自然", "植物", "沈む"],
      },
    ],
  },
  {
    key: "n3-b01-money-business",
    title: "Money, Trade & Employment",
    subtitle: "お金・商売",
    insight:
      "お金の出入りに関する言葉です。収入は入ってくるお金、支出は出ていくお金で、支払と支払うはお金を払うことを表します。会社から支給される給料が主な収入源になる人が多く、需要が増えれば商品の消費も増えます。",
    extendedInsight:
      "職と職業はどちらも仕事を表しますが、職業は「医者」や「教師」のように仕事の種類を具体的に示す言葉で、職はもっと広く「仕事、働き口」全体を指します。就職はその職を新しく得ることを意味します。",
    examples: [
      {
        jp: "来月から新しい支店で働きます。",
        romaji: "Raigetsu kara atarashii shiten de hatarakimasu.",
        en: "I'll work at a new branch starting next month.",
      },
      {
        jp: "毎月、家賃を支払います。",
        romaji: "Maitsuki, yachin o shiharaimasu.",
        en: "I pay rent every month.",
      },
    ],
    commonMistake:
      "資本は会社や事業を始めるための元手となるお金を指し、収入のように毎月得られる日常的なお金とは違います。資本を給料の意味で使うのは誤りです。",
    rows: [
      {
        label: "income & payment",
        terms: ["収入", "支出", "支給", "支払", "支払う", "借金"],
      },
      {
        label: "trade & commerce",
        terms: ["需要", "消費", "商品", "商売", "資本"],
      },
      {
        label: "work & employment",
        terms: ["職", "就職", "職業", "支店"],
      },
    ],
  },
  {
    key: "n3-b01-reality-execution",
    title: "Reality, Execution & Proof",
    subtitle: "事実・実行",
    insight:
      "計画が本当に行われることを表す言葉のグループです。実行は計画を実際に行うこと、実施は制度や試験などを行うことを表し、実現は夢や希望が本当のものになることを意味します。事実と実際はどちらも「本当のこと」を表しますが、事実は動かない真実そのものを指します。",
    extendedInsight:
      "実力は勉強や練習によって身についた本当の能力を指す言葉で、証明はそれが本当であることを他の人に示すことです。使用や処理のように何かを実際に使ったり片付けたりする動作も、この「実」に通じる現実的な行動です。",
    examples: [
      {
        jp: "新しい制度が来年実施されます。",
        romaji: "Atarashii seido ga rainen jisshi saremasu.",
        en: "The new system will be implemented next year.",
      },
      {
        jp: "彼は自分の実力を証明しました。",
        romaji: "Kare wa jibun no jitsuryoku o shoumei shimashita.",
        en: "He proved his own ability.",
      },
    ],
    commonMistake:
      "実行は自分で計画したことを行う場合に使い、実施は制度や検査などを公的に行う場合に使うことが多いので、個人の行動には実施ではなく実行を使う方が自然です。",
    rows: [
      {
        label: "making real",
        terms: ["実現", "実行", "実施"],
      },
      {
        label: "fact & truth",
        terms: ["事実", "実際", "実力", "証明"],
      },
      {
        label: "using & handling",
        terms: ["使用", "処理"],
      },
    ],
  },
  {
    key: "n3-b01-agreement-participation",
    title: "Agreement, Opinions & Taking Part",
    subtitle: "賛成・参加",
    insight:
      "話し合いや行事に関わるときの言葉です。参加は会や活動に加わること、出場は試合や大会に出ることを表します。誰かの意見に賛成することもあれば、会議で承認を得ることもあります。自分の考えをはっきり言うことは主張と呼ばれます。",
    extendedInsight:
      "参考は他の人の意見や資料を自分の考えの助けにすることを表し、賛成や承認とは違って、必ずしも同じ意見になるとは限りません。正直な意見を主張することが大切ですが、時には冗談で場を和ませることも人間関係には必要です。",
    examples: [
      {
        jp: "私はその意見に賛成です。",
        romaji: "Watashi wa sono iken ni sansei desu.",
        en: "I agree with that opinion.",
      },
      {
        jp: "彼は大会に出場しました。",
        romaji: "Kare wa taikai ni shutsujou shimashita.",
        en: "He took part in the competition.",
      },
    ],
    commonMistake:
      "賛成(意見に同意すること)と承認(正式に認めること)は似ていますが、承認はより公式な場面、例えば会議で計画が承認されるというように使われ、日常の意見の一致には賛成の方が自然です。",
    rows: [
      {
        label: "joining & competing",
        terms: ["参加", "出場"],
      },
      {
        label: "opinions & agreement",
        terms: ["参考", "賛成", "承認", "主張"],
      },
      {
        label: "honesty & humor",
        terms: ["正直", "冗談"],
      },
    ],
  },
  {
    key: "n3-b01-people-roles",
    title: "People, Family & Social Roles",
    subtitle: "人・役割",
    insight:
      "人を表す言葉が増えます。児童は小学生くらいの子供、少年と少女はそれぞれ若い男の子と女の子を指します。女子は女性を広く表し、女王や女優のように特定の立場を表す言葉もあります。主婦は家庭を守る女性、助手は誰かの仕事を手伝う人です。",
    extendedInsight:
      "出身は生まれた場所や卒業した学校を表す言葉で、田中氏の出身は大阪ですというように使います。氏は名前の後に付けて敬意を表す言い方で、様や君よりも書き言葉的で改まった印象を与えます。",
    examples: [
      {
        jp: "田中氏は東京の出身です。",
        romaji: "Tanaka-shi wa Toukyou no shusshin desu.",
        en: "Mr. Tanaka is from Tokyo.",
      },
      {
        jp: "電車の乗客は少なかったです。",
        romaji: "Densha no joukyaku wa sukunakatta desu.",
        en: "There were few passengers on the train.",
      },
    ],
    commonMistake:
      "集団は人が集まった大きなまとまりを表す言葉で、姉妹のように決まった人数の関係を表す言葉とは違い、何人集まっているかは決まっていません。集団を姉妹のような個人的な関係の意味で使うことはできません。",
    rows: [
      {
        label: "children & family",
        terms: ["児童", "姉妹", "少女", "少年"],
      },
      {
        label: "women's roles",
        terms: ["女子", "女王", "女優", "主婦"],
      },
      {
        label: "work & travel",
        terms: ["助手", "乗客", "商人", "出身"],
      },
      {
        label: "formal address & groups",
        terms: ["氏", "集団"],
      },
    ],
  },
  {
    key: "n3-b01-feelings-character",
    title: "Feelings, Self & Character",
    subtitle: "気持ち・性格",
    insight:
      "自分の気持ちや性格を表す言葉です。幸せは満足した気持ち、失望はその反対で期待が外れたときの気持ちを表します。自慢は自分の良いところを誇ること、地味は派手ではなく控えめな様子を表します。",
    extendedInsight:
      "自身は「自分自身」のように、自分そのものを強調するときに使う言葉です。親しい友人に対しては、失敗したときにしまったと素直な気持ちを表すこともよくあります。思想は人が持つ考え方や信念の全体を指す、少し硬い言葉です。",
    examples: [
      {
        jp: "試験に落ちて、失望しました。",
        romaji: "Shiken ni ochite, shitsubou shimashita.",
        en: "I failed the exam and was disappointed.",
      },
      {
        jp: "彼女は親しい友人です。",
        romaji: "Kanojo wa shitashii yuujin desu.",
        en: "She is a close friend.",
      },
    ],
    commonMistake:
      "自慢(自分の良さを誇ること)は良い意味で使われることもありますが、相手の前で使いすぎると嫌味に聞こえることがあります。地味な人という表現は服装や性格が控えめなことを表すだけで、悪い意味とは限りません。",
    rows: [
      {
        label: "happiness & disappointment",
        terms: ["幸せ", "失望"],
      },
      {
        label: "self & closeness",
        terms: ["自身", "親しい"],
      },
      {
        label: "character & thought",
        terms: ["自慢", "地味", "思想"],
      },
      {
        label: "reactions",
        terms: ["しまったかん"],
      },
    ],
  },
  {
    key: "n3-b01-society-importance",
    title: "Society, Government & Importance",
    subtitle: "社会・重要",
    insight:
      "国や社会の仕組みを表す言葉です。首相は国のリーダー、首都はその国の中心となる都市を指します。住宅は人が住む建物、住民はそこに住む人々です。ある国を支配することや、ある主義を国全体に広めることも社会の大きな出来事です。",
    extendedInsight:
      "重要、主要、重視、重大はすべて「重」という漢字を含み、物事の大切さに関係します。重要は一般的に大切なこと、主要は多くの中で中心となること、重視は特に大切に扱うこと、重大は結果が大きく深刻なことを表します。集中はその大切なことに意識を向けることです。",
    examples: [
      {
        jp: "首相は首都で会議に出席しました。",
        romaji: "Shushou wa shuto de kaigi ni shusseki shimashita.",
        en: "The Prime Minister attended a meeting in the capital.",
      },
      {
        jp: "この問題はとても重要です。",
        romaji: "Kono mondai wa totemo juuyou desu.",
        en: "This problem is very important.",
      },
    ],
    commonMistake:
      "重大(結果が深刻であること)と重体(病気やけがで命に関わるほど重いこと)は同じ「重」を使いますが意味の範囲が違い、重体は人の健康状態だけに使う言葉なので、事故や事件の深刻さには重大を使います。",
    rows: [
      {
        label: "government & place",
        terms: ["首相", "首都", "主義", "支配"],
      },
      {
        label: "housing & residents",
        terms: ["住宅", "住民", "常識"],
      },
      {
        label: "importance & focus",
        terms: ["重要", "主要", "重視", "重大", "重体", "集中"],
      },
    ],
  },
  {
    key: "n3-b01-incidents-conditions",
    title: "Incidents, Safety & Conditions",
    subtitle: "事件・状況",
    insight:
      "事故や事件のニュースでよく使われる言葉です。事件や衝突が起きると、消防が駆けつけることもあります。事情や状況はその出来事の背景を説明する言葉で、条件が整っていたかどうかも重要な点です。",
    extendedInsight:
      "状態と症状は似ていますが、状態は物事や人の様子全体を広く表し、症状は病気やけがによって体に現れる具体的なしるしを表します。順調はすべてが問題なく進んでいる状態、渋滞や騒ぎは反対に物事がスムーズに進まないことを表します。",
    examples: [
      {
        jp: "道路が渋滞しています。",
        romaji: "Douro ga juutai shite imasu.",
        en: "The road is congested.",
      },
      {
        jp: "彼の病気の状態は順調です。",
        romaji: "Kare no byouki no joutai wa junchou desu.",
        en: "His illness is progressing well.",
      },
    ],
    commonMistake:
      "事故は意図しない出来事を広く指しますが、自殺は自分の意志で命を絶つことを指すため、事件のニュースでは原因が事故か自殺かをはっきり区別して伝えることが大切です。",
    rows: [
      {
        label: "serious incidents",
        terms: ["事件", "自殺", "死亡", "銃", "消防"],
      },
      {
        label: "background & conditions",
        terms: ["事情", "状況", "条件", "障害", "状態", "症状", "順調"],
      },
      {
        label: "disruptions",
        terms: ["渋滞", "衝突", "騒ぎ"],
      },
    ],
  },
  {
    key: "n3-b01-food",
    title: "Food, Appetite & Provisions",
    subtitle: "食べ物",
    insight:
      "食に関する言葉が「食」という漢字を中心にまとまっています。食卓は家族が食事をするテーブル、食品と食物はどちらも食べる物を指しますが、食品は店で売られる加工された物を指すことが多いです。食欲はご飯を食べたいという気持ちです。",
    extendedInsight:
      "食料と食糧は似ていますが、食料は野菜や肉など食べ物全般を広く指し、食糧は特に米や小麦などの主食となる穀物を指すことが多い、少し硬い言葉です。",
    examples: [
      {
        jp: "今日は食欲がありません。",
        romaji: "Kyou wa shokuyoku ga arimasen.",
        en: "I don't have an appetite today.",
      },
      {
        jp: "家族で食卓を囲みました。",
        romaji: "Kazoku de shokutaku o kakomimashita.",
        en: "We gathered around the dining table as a family.",
      },
    ],
    commonMistake:
      "食品(店で売られる加工された食べ物)と食物(食べる物全般)は似ていますが、食品はスーパーの商品のような具体的な物を指すことが多く、抽象的に「食べられる物全体」を言うときは食物の方が自然です。",
    rows: [
      {
        terms: ["食卓", "食品", "食物", "食欲", "食料", "食糧"],
      },
    ],
  },
  {
    key: "n3-b01-writing-documents",
    title: "Writing, Documents & Information",
    subtitle: "文書・情報",
    insight:
      "文章や本に関係する言葉です。詩人は詩を書く人で、書斎は本を読んだり書いたりするための部屋です。書物と書類はどちらも紙に書かれた物ですが、書物は本を、書類は仕事の文書を指します。",
    extendedInsight:
      "出版は本や雑誌を作って世の中に出すことを表し、署名はその文書に自分の名前を書くことです。省略は文章の一部をわざと書かないことで、情報や知らせを短く伝えるときによく使われます。",
    examples: [
      {
        jp: "その詩人は新しい本を出版しました。",
        romaji: "Sono shijin wa atarashii hon o shuppan shimashita.",
        en: "That poet published a new book.",
      },
      {
        jp: "書類に署名をお願いします。",
        romaji: "Shorui ni shomei o onegai shimasu.",
        en: "Please sign the document.",
      },
    ],
    commonMistake:
      "知らせ(誰かから届く連絡や通知)と情報(物事についての詳しい内容)は似ていますが、知らせは「届く」もので、情報は「持っている、集める」ものという使い方の違いがあります。良い知らせと言いますが、良い情報とはあまり言いません。",
    rows: [
      {
        label: "literature",
        terms: ["詩", "詩人", "書斎", "書物"],
      },
      {
        label: "documents & publishing",
        terms: ["署名", "書類", "出版", "省略"],
      },
      {
        label: "news & information",
        terms: ["情報", "知らせ"],
      },
    ],
  },
  {
    key: "n3-b01-prizes-order",
    title: "Prizes, Rank & Sequence",
    subtitle: "賞・順序",
    insight:
      "賞は良い成績や功績に与えられる名誉で、賞品はその時にもらう実際の品物です。奨学金は勉強を続けるための助けとして支給されるお金で、章は本の中のまとまりや、賞と一緒に贈られるメダルの意味もあります。",
    extendedInsight:
      "順、順番はどちらも並ぶ順序を表しますが、順番は「私の順番です」のように一人ひとりの番を指すことが多いです。上等は質が高いこと、上達は練習によって技術が良くなることを表し、どちらも「上」という漢字が持つ「高い、良い」という意味とつながっています。",
    examples: [
      {
        jp: "彼女は作文の賞をもらいました。",
        romaji: "Kanojo wa sakubun no shou o moraimashita.",
        en: "She received a prize for her essay.",
      },
      {
        jp: "順番に並んでください。",
        romaji: "Junban ni narande kudasai.",
        en: "Please line up in order.",
      },
    ],
    commonMistake:
      "瞬間(一瞬の短い時)は順や順番のような「並び」を表す言葉ではなく、時間の一点を表す言葉なので、順番の意味で瞬間を使うことはできません。",
    rows: [
      {
        label: "prizes & scholarship",
        terms: ["賞", "賞品", "章", "奨学金"],
      },
      {
        label: "order & sequence",
        terms: ["順", "順番", "瞬間"],
      },
      {
        label: "quality & progress",
        terms: ["上", "上等", "上達"],
      },
    ],
  },
  {
    key: "n3-b01-guidance-repair",
    title: "Guidance, Correction & Repair",
    subtitle: "指導・修理",
    insight:
      "誰かを導いたり、悪いところを直したりすることに関わる言葉です。指導は経験のある人が方法を示すこと、従うはその指導や規則に合わせて行動することを表します。手段は目的を達成するための方法、質は物事の良さの程度です。",
    extendedInsight:
      "修正、修理、手術はどれも「悪いところを直す」という意味でつながっています。修正は文章や計画の間違いを直すこと、修理は壊れた機械を直すこと、手術は医者が体を直接治療することを表し、対象が違うだけで根本の考え方は同じです。",
    examples: [
      {
        jp: "壊れた機械を修理しました。",
        romaji: "Kowareta kikai o shuuri shimashita.",
        en: "I repaired the broken machine.",
      },
      {
        jp: "先生の指導に従います。",
        romaji: "Sensei no shidou ni shitagaimasu.",
        en: "I will follow my teacher's guidance.",
      },
    ],
    commonMistake:
      "質は「質が良い」のように物事の内容の良さを表す言葉で、量(数や大きさ)とは反対の意味を持ちます。質を量の意味で使うと、伝えたい内容が逆になってしまいます。",
    rows: [
      {
        label: "leading & following",
        terms: ["指導", "従う", "示す"],
      },
      {
        label: "method & quality",
        terms: ["手段", "質"],
      },
      {
        label: "fixing & automation",
        terms: ["自動", "修正", "修理", "手術"],
      },
      {
        label: "employment status",
        terms: ["失業"],
      },
    ],
  },
  {
    key: "n3-b01-time-travel",
    title: "Time, Timing & Travel",
    subtitle: "時間・旅行",
    insight:
      "旅行や予定を立てるときによく使う時間の言葉です。時刻は電車の出発などの正確な時間、時期はもっと広い期間やタイミングを表します。正午は昼の十二時のことです。",
    extendedInsight:
      "至急は「とても急いで」という意味で、至急の連絡というようにビジネスの場面でよく使われます。上京は地方から東京へ行くことを表す言葉で、宿泊はその旅先で泊まることを意味します。",
    examples: [
      {
        jp: "電車の時刻を確認してください。",
        romaji: "Densha no jikoku o kakunin shite kudasai.",
        en: "Please check the train's departure time.",
      },
      {
        jp: "来月、上京する予定です。",
        romaji: "Raigetsu, joukyou suru yotei desu.",
        en: "I plan to go up to Tokyo next month.",
      },
    ],
    commonMistake:
      "時期(期間やタイミング)と時刻(正確な時間)は混同されやすいですが、桜が咲く時期とは言っても、桜が咲く時刻とは言わないように、時期は幅のある期間、時刻は一点の時間を表します。",
    rows: [
      {
        terms: ["時期", "至急", "時刻", "正午", "上京", "宿泊"],
      },
    ],
  },
  {
    key: "n3-b01-culture-objects",
    title: "Culture, Surroundings & Everyday Objects",
    subtitle: "文化・身の回りの物",
    insight:
      "文化や日常の環境、身の回りの物を表す幅広い言葉のグループです。作法は食事などの正しいやり方、宗教は信仰の体系、芝居は舞台で演じられる劇を指します。周囲は自分の回りの環境、収穫は農作物を取り入れることです。",
    extendedInsight:
      "種類は物を分けたときのグループを表し、左右は「左と右」という方向のほかに「結果を左右する」のように「影響を与える」という意味でも使われます。皿や品のような身近な名詞、ジーンズやジュースのような外来語も、この時期に語彙を広げる大切な材料です。",
    examples: [
      {
        jp: "皿の上に果物を置きました。",
        romaji: "Sara no ue ni kudamono o okimashita.",
        en: "I put fruit on the plate.",
      },
      {
        jp: "彼女は友達とよくしゃべります。",
        romaji: "Kanojo wa tomodachi to yoku shaberimasu.",
        en: "She often chats with her friends.",
      },
    ],
    commonMistake:
      "左右は名詞として「左右を確認する」のように使う一方、「結果を左右する」のように動詞的に「影響を与える」という意味でも使われるため、文脈によって意味を正しく読み取る必要があります。",
    rows: [
      {
        label: "culture & customs",
        terms: ["作法", "宗教", "芝居", "収穫"],
      },
      {
        label: "space & classification",
        terms: ["周囲", "左右", "種類", "小"],
      },
      {
        label: "body & speech",
        terms: ["舌", "しゃべる"],
      },
      {
        label: "everyday objects & loanwords",
        terms: [
          "ジーンズ",
          "ジェット機",
          "ジュース",
          "皿",
          "品",
          "四角",
          "芝生",
        ],
      },
    ],
  },
  {
    key: "n3-b02-mind-trust-personality",
    title: "Mind, Trust & Personality",
    subtitle: "心理・信頼・性格",
    insight:
      "信 ('to trust, believe') is the common thread behind four words here: 信仰 is religious faith, 信じる is the everyday verb 'to believe,' 信用 is the confidence you place in someone's honesty (often financial, as in credit), and 信頼 is a deeper reliance built over time. Around them sit words for describing a mind or character — 性格 ('personality'), 精神 ('spirit, mind'), 積極的 ('proactive'), and 性質 ('nature, disposition').",
    extendedInsight:
      "性格 (personality) and 正確 (accurate) are both read せいかく and are a classic listening trap — 彼の性格 ('his personality') and 彼の答えは正確だ ('his answer is accurate') sound identical in speech, so only the kanji or surrounding context sets them apart.",
    examples: [
      {
        jp: "彼女はいつも真剣に仕事をします。",
        romaji: "Kanojo wa itsumo shinken ni shigoto o shimasu.",
        en: "She always works seriously.",
      },
      {
        jp: "彼の性格をよく知っています。",
        romaji: "Kare no seikaku o yoku shitte imasu.",
        en: "I know his personality well.",
      },
    ],
    commonMistake:
      "信用 and 信頼 are close but not identical — 信用 is the more transactional trust you extend based on track record (お金を貸すほど信用している, 'I trust them enough to lend money'), while 信頼 is a broader, more personal reliance (友達を信頼している, 'I rely on my friend').",
    rows: [
      {
        label: "the 信 family — trust & belief",
        terms: ["信仰", "信じる", "信用", "信頼"],
      },
      {
        label: "character & personality",
        terms: ["性格", "正確", "性質", "精神", "積極的"],
      },
      {
        label: "seriousness & sharpness",
        terms: ["真剣", "慎重", "鋭い", "優れる", "心理"],
      },
    ],
  },
  {
    key: "n3-b02-people-relationships",
    title: "People, Life Stages & Relationships",
    subtitle: "人間関係",
    insight:
      "人 ('person') anchors a cluster of words about people and life stages: 人生 is one's life story from birth to death, 人類 is humanity as a whole, and 人種 is race or ethnicity. 知合い is a casual acquaintance, 親戚 is a relative by blood or marriage, and 親友 is a close, trusted friend — all built differently from the same idea of connection.",
    extendedInsight:
      "成人 (an adult, someone who has reached adulthood) and 青年 (a youth, a young man or woman) describe overlapping but different life stages — 成人 marks a legal and social threshold, while 青年 describes the broader stretch of young adulthood around it.",
    examples: [
      {
        jp: "彼女は私の親友です。",
        romaji: "Kanojo wa watashi no shin'yuu desu.",
        en: "She is my close friend.",
      },
      {
        jp: "相手の意見をよく聞きます。",
        romaji: "Aite no iken o yoku kikimasu.",
        en: "I listen carefully to my counterpart's opinion.",
      },
    ],
    commonMistake:
      "親戚 (a relative) and 知合い (an acquaintance) both name someone you know, but they aren't interchangeable — 親戚 always implies family ties, while 知合い is anyone you merely know, family or not.",
    rows: [
      {
        label: "life & humanity",
        terms: ["人生", "人類", "人種", "成人", "青年", "生年月日"],
      },
      {
        label: "the people around you",
        terms: ["知合い", "親戚", "親友", "人物", "相手"],
      },
    ],
  },
  {
    key: "n3-b02-health-body",
    title: "Body, Health & Medical Checkups",
    subtitle: "体・健康",
    insight:
      "A trip to the doctor's vocabulary: 診察 is the medical examination itself, and the words around it name what's being checked — 心臓 (heart), 神経 (nerve), 身体 (the body as a whole), and symptoms like 頭痛 (headache) and 咳 (cough).",
    extendedInsight:
      "神経 literally combines 神 ('spirit, god') with 経 ('pass through, thread') — an old image of nerves as the pathways a person's vital spirit travels through the body, which is also why 神経質 ('nervous, sensitive') extends the word into personality territory.",
    examples: [
      {
        jp: "毎日、睡眠を十分に取っています。",
        romaji: "Mainichi, suimin o juubun ni totte imasu.",
        en: "I get enough sleep every day.",
      },
      {
        jp: "頭痛がひどくて、病院で診察を受けました。",
        romaji: "Zutsuu ga hidokute, byouin de shinsatsu o ukemashita.",
        en: "My headache was bad, so I got examined at the hospital.",
      },
    ],
    commonMistake:
      "身体 (the physical body) and 身長 (one's height) share the kanji 身 but answer different questions — 身体が大きい describes someone's overall build, while 身長が高い specifically means 'tall.'",
    rows: [
      {
        label: "at the checkup",
        terms: ["診察", "神経", "心臓", "身体", "身長"],
      },
      {
        label: "symptoms & everyday body words",
        terms: ["頭痛", "咳", "汗", "睡眠", "尻"],
      },
    ],
  },
  {
    key: "n3-b02-sei-homograph",
    title: "One Sound, Many Kanji — せい",
    subtitle: "同じ読み方「せい」",
    insight:
      "せい is one of Japanese's busiest sounds: 正 means 'correct, right,' 生 means 'birth, life,' 性 means 'sex, gender, nature,' and 姓 means 'surname.' 所為, unusually, is also read せい and means 'cause, fault' — most often seen in the everyday phrase 〜のせい (kanji rarely written), meaning 'because of 〜' or 'it's 〜's fault.'",
    extendedInsight:
      "税 (ぜい, 'tax') and 税金 (ぜいきん, 'tax money') aren't quite the same word — 税 names the tax itself as a category (消費税, 'consumption tax'), while 税金 is the actual money paid, the way 金 turns an abstract category into cash in hand.",
    examples: [
      {
        jp: "雨のせいで、試合が中止になりました。",
        romaji: "Ame no sei de, shiai ga chuushi ni narimashita.",
        en: "Because of the rain, the match was cancelled.",
      },
      {
        jp: "毎月、税金を払います。",
        romaji: "Maitsuki, zeikin o haraimasu.",
        en: "I pay tax every month.",
      },
    ],
    commonMistake:
      "所為 is almost never written in kanji in modern Japanese — writing 彼の所為だ instead of 彼のせいだ looks stiff and old-fashioned; the hiragana せい is the natural everyday choice even though 所為 is the historical kanji behind it.",
    rows: [
      {
        terms: ["正", "生", "性", "姓", "所為", "税", "税金"],
      },
    ],
  },
  {
    key: "n3-b02-growth-progress-study",
    title: "Growth, Progress & Academic Milestones",
    subtitle: "成長・進歩",
    insight:
      "進 ('advance') and 成 ('become, accomplish') both describe forward motion — 進学 is moving on to the next stage of school, 進歩 is general progress or improvement, and 成功 is the moment an effort pays off. 成績 is the grade that measures it, and 暗記 is the memorization that earns it.",
    extendedInsight:
      "成長 and 生長 are both read せいちょう and both mean 'growth,' but they aren't fully interchangeable — 成長 is the everyday word for growth of any kind, from children to companies, while 生長 is a more specialized, often written term for the biological growth of plants.",
    examples: [
      {
        jp: "来年、大学に進学します。",
        romaji: "Rainen, daigaku ni shingaku shimasu.",
        en: "Next year, I'll go on to university.",
      },
      {
        jp: "単語を暗記するのは大変です。",
        romaji: "Tango o anki suru no wa taihen desu.",
        en: "Memorizing vocabulary is hard.",
      },
    ],
    commonMistake:
      "成功 ('success,' the outcome) is often confused with 成績 ('a grade or academic record,' the measurement) — 試験に成功しました sounds odd in Japanese; 試験でいい成績を取りました ('I got a good grade on the exam') is the natural way to talk about exam results.",
    rows: [
      {
        label: "advancing & achieving",
        terms: ["進学", "進歩", "成功", "正式"],
      },
      {
        label: "measuring growth",
        terms: ["世紀", "成績", "成長", "生長", "暗記"],
      },
    ],
  },
  {
    key: "n3-b02-business-admin",
    title: "Business, Rules & Getting Organized",
    subtitle: "仕事・制度",
    insight:
      "The paperwork side of work and institutions — 制度 is a system or institution itself, 制限 is a restriction placed on it, and 水準 is the standard or level something is measured against. 案 is a plan or proposal still being discussed, and 設計 is the concrete design once it's decided.",
    extendedInsight:
      "責任 (responsibility) is almost always paired with 取る ('to take') or 持つ ('to hold') — 責任を取る means 'to take responsibility' (often after something goes wrong), while 責任を持つ means 'to be responsible for' something ongoing.",
    examples: [
      {
        jp: "新しい制度について説明します。",
        romaji: "Atarashii seido ni tsuite setsumei shimasu.",
        en: "I'll explain the new system.",
      },
      {
        jp: "彼はその仕事に責任を持っています。",
        romaji: "Kare wa sono shigoto ni sekinin o motte imasu.",
        en: "He is responsible for that work.",
      },
    ],
    commonMistake:
      "推薦 ('recommendation,' vouching for someone or something's quality) and 請求 ('a claim or demand,' asking for something owed, like a bill) both involve formally asking for something but for opposite reasons — 推薦する speaks well of someone, 請求する demands payment or action.",
    rows: [
      {
        label: "systems & standards",
        terms: ["水準", "制度", "制限", "安定"],
      },
      {
        label: "plans & paperwork",
        terms: ["案", "設計", "整理", "責任"],
      },
      {
        label: "asking formally",
        terms: ["推薦", "請求"],
      },
    ],
  },
  {
    key: "n3-b02-industry-society",
    title: "Industry, Government & Society",
    subtitle: "産業・社会",
    insight:
      "Bigger-picture words for talking about industry and the wider world — fuel and raw materials (石炭 coal, 石油 oil) that get 製造 ('manufactured') into 製品 ('finished products'), and the institutions that govern a country, from 政府 ('government') down to 世間 ('society, the public').",
    extendedInsight:
      "人工 ('artificial, man-made') is the opposite of anything natural — 人工的 describes something built by people rather than grown or occurring on its own, the same contrast behind 生物 ('a living thing') and 生命 ('life itself') on the natural side.",
    examples: [
      {
        jp: "この製品は日本で製造されました。",
        romaji: "Kono seihin wa Nihon de seizou saremashita.",
        en: "This product was manufactured in Japan.",
      },
      {
        jp: "世間の意見を気にしています。",
        romaji: "Seken no iken o ki ni shite imasu.",
        en: "I'm concerned about public opinion.",
      },
    ],
    commonMistake:
      "誤り ('an error, a mistake,' usually in facts or judgment) and 粗 ('a defect or flaw,' usually in quality or workmanship) both translate loosely as 'fault,' but 誤り fits a wrong answer or wrong decision, while 粗 fits a flawed product or rough patch of work.",
    rows: [
      {
        label: "industry & materials",
        terms: ["石炭", "石油", "製造", "製品", "人工"],
      },
      {
        label: "government & society",
        terms: ["政府", "世間", "生物", "生命"],
      },
      {
        label: "judging right & wrong",
        terms: ["説", "誤り", "粗", "審判", "印"],
      },
    ],
  },
  {
    key: "n3-b02-adjectives-state",
    title: "Describing Quality, Taste & Condition",
    subtitle: "様子を表す言葉",
    insight:
      "A set of adjectives for judging how something is — from taste (すっぱい 'sour') and hygiene (清潔 'clean') to seriousness (深刻 'serious, grave') and how obvious something is (明らか 'clear, obvious'; 当たり前 'natural, to be expected').",
    extendedInsight:
      "新鮮 ('fresh,' usually of food or air) and 新た ('new, fresh,' usually of an idea or start) share the kanji 新 but describe different kinds of freshness — 新鮮な魚 is a fresh fish, while 新たな出発 is a fresh start.",
    examples: [
      {
        jp: "この問題は深刻です。",
        romaji: "Kono mondai wa shinkoku desu.",
        en: "This problem is serious.",
      },
      {
        jp: "新鮮な野菜を買いました。",
        romaji: "Shinsen na yasai o kaimashita.",
        en: "I bought fresh vegetables.",
      },
    ],
    commonMistake:
      "当たり前 ('natural, obvious, to be expected') can sound blunt if used carelessly — それは当たり前です can come across as dismissive ('that's obvious') rather than the softer 'that makes sense' it's often meant as, so tone matters more than with a plain description like 明らか.",
    rows: [
      {
        label: "taste & cleanliness",
        terms: ["すっぱい", "清潔", "贅沢", "すてき"],
      },
      {
        label: "seriousness & obviousness",
        terms: ["深刻", "明らか", "当たり前", "新た", "新鮮", "哀れ"],
      },
    ],
  },
  {
    key: "n3-b02-adverbs-connectors",
    title: "Degree, Certainty & Connecting Words",
    subtitle: "副詞・接続表現",
    insight:
      "Adverbs for measuring how much or how certain something is — すくなくとも ('at least'), 精々 ('at most, at best'), 全て ('all, everything'), あらゆる ('every kind of'). Others connect or qualify a sentence: すなわち ('that is to say'), あるいは ('or, perhaps'), and 絶対 ('absolutely, without fail').",
    extendedInsight:
      "少しも means 'not at all,' but it requires a negative verb to work — 少しも分からない ('I don't understand at all') is fine, but 少しも分かる, without the negative, is broken Japanese.",
    examples: [
      {
        jp: "すくなくとも一週間は待ってください。",
        romaji: "Sukunakutomo isshuukan wa matte kudasai.",
        en: "Please wait at least a week.",
      },
      {
        jp: "あいにく、今日は忙しいです。",
        romaji: "Ainiku, kyou wa isogashii desu.",
        en: "Unfortunately, I'm busy today.",
      },
    ],
    commonMistake:
      "或 (ある, 'a certain...') and あるいは ('or, perhaps') look related but work differently — 或る日 ('a certain day') introduces an unspecified example, while あるいは connects two alternative options (りんごあるいはみかん, 'apples or mandarins'); 或 alone never means 'or.'",
    rows: [
      {
        label: "how much & how certain",
        terms: [
          "すくなくとも",
          "少しも",
          "精々",
          "全て",
          "あらゆる",
          "絶対",
          "案外",
        ],
      },
      {
        label: "connecting & qualifying",
        terms: [
          "すなわち",
          "あるいは",
          "或",
          "ずっと",
          "既に",
          "相変わらず",
          "あちこち",
          "あいにく",
        ],
      },
    ],
  },
  {
    key: "n3-b02-katakana-loanwords",
    title: "Katakana Loanwords — Sports, Style & Everyday Objects",
    subtitle: "カタカナ語",
    insight:
      "Many everyday words are katakana loanwords close enough to English to read at sight — winter sports (スキー, スケート), everyday objects (スイッチ, スタンド, セット), and the vocabulary of a busy schedule (スケジュール, スピーチ).",
    extendedInsight:
      "スタイル can describe a person's fashion sense, a writing style, or even a body shape depending on context — a broader word than its English cousin 'style' might suggest, closer to a general sense of 'how something is done or looks.'",
    examples: [
      {
        jp: "冬はよくスキーをします。",
        romaji: "Fuyu wa yoku sukii o shimasu.",
        en: "In winter, I often ski.",
      },
      {
        jp: "明日のスケジュールを確認しました。",
        romaji: "Ashita no sukejuuru o kakunin shimashita.",
        en: "I checked tomorrow's schedule.",
      },
    ],
    commonMistake:
      "アウト is borrowed from English 'out' but is mostly heard in sports and games (野球でアウトになる, 'to be out in baseball') — treating it as a general everyday adjective for 'unacceptable' is far less common than in casual English slang.",
    rows: [
      {
        label: "sports & style",
        terms: ["スキー", "スケート", "スタイル", "スター"],
      },
      {
        label: "everyday objects & schedule",
        terms: [
          "スイッチ",
          "スタンド",
          "セット",
          "スケジュール",
          "スピーチ",
          "アイスクリーム",
          "アウト",
          "アルバム",
          "スープ",
        ],
      },
    ],
  },
  {
    key: "n3-b02-everyday-verbs",
    title: "Everyday Verbs — Helping, Handling & Moving Past",
    subtitle: "日常の動詞",
    insight:
      "General-purpose verbs for daily life — spending time (過ごす), handling things carefully (扱う), and the giving-and-keeping pair 預かる ('to keep something for someone') / 預ける ('to leave something in someone's care').",
    extendedInsight:
      "進める ('to advance, move something forward,' e.g. 話を進める, 'to move the conversation along') and 勧める ('to recommend, urge someone to do something,' e.g. 本を勧める, 'to recommend a book') are both read すすめる and are a classic homophone pair told apart only by kanji and context.",
    examples: [
      {
        jp: "夏休みをゆっくり過ごしました。",
        romaji: "Natsuyasumi o yukkuri sugoshimashita.",
        en: "I spent the summer vacation relaxing.",
      },
      {
        jp: "友達に荷物を預けました。",
        romaji: "Tomodachi ni nimotsu o azukemashita.",
        en: "I left my luggage in my friend's care.",
      },
    ],
    commonMistake:
      "遭う ('to meet or encounter,' almost always something unpleasant, like 事故に遭う 'to be in an accident') and 会う ('to meet,' the everyday neutral word for meeting a person) look similar but carry opposite moods — using 遭う for meeting a friend sounds like something bad happened.",
    rows: [
      {
        label: "handling & helping",
        terms: [
          "過ごす",
          "扱う",
          "救う",
          "与える",
          "済ませる",
          "合わせる",
          "預かる",
          "預ける",
        ],
      },
      {
        label: "advancing & recommending",
        terms: ["進める", "勧める"],
      },
      {
        label: "passing, meeting & missing",
        terms: [
          "すれ違う",
          "ずれる",
          "当たる",
          "当てる",
          "争う",
          "合図",
          "遭う",
        ],
      },
    ],
  },
  {
    key: "n3-b02-reading-puzzles-verbs",
    title: "Same Sound, Different Kanji — Verb Homophones",
    subtitle: "同音異字の動詞",
    insight:
      "Japanese has plenty of verbs that sound identical but are written with entirely different kanji — する can be 刷る ('to print') or the formal 為る, すむ can be 澄む or 清む (both 'to become clear, transparent'), and あげる can be 揚げる ('to fry, to lift') or 挙げる ('to raise a hand, to list, to cite').",
    extendedInsight:
      "表す, 現す, and 著す are all read あらわす but express different kinds of 'showing' — 表す expresses an abstract feeling or meaning (感情を表す, 'to express an emotion'), 現す reveals something that was hidden and now appears (姿を現す, 'to reveal oneself'), and 著す is specifically 'to write and publish' a book.",
    examples: [
      {
        jp: "質問がある人は手を挙げてください。",
        romaji: "Shitsumon ga aru hito wa te o agete kudasai.",
        en: "Those who have a question, please raise your hand.",
      },
      {
        jp: "この言葉は感謝の気持ちを表します。",
        romaji: "Kono kotoba wa kansha no kimochi o arawashimasu.",
        en: "This word expresses a feeling of gratitude.",
      },
    ],
    commonMistake:
      "現れ (a noun, 'an expression, a sign of something') and 現れる (the verb, 'to appear') share the same root but aren't interchangeable — 努力の現れ ('a sign of effort') is a thing, while 彼が現れた ('he appeared') is an event.",
    rows: [
      {
        label: "する & すむ, in disguise",
        terms: ["刷る", "為る", "澄む", "清む"],
      },
      {
        label: "あげる, in disguise",
        terms: ["揚げる", "挙げる"],
      },
      {
        label: "あらわす family",
        terms: ["表す", "現す", "著す", "現れ", "現れる"],
      },
    ],
  },
  {
    key: "n3-b02-warm-temperature-verbs",
    title: "Warming Up — A Transitive/Intransitive Pair",
    subtitle: "温める・温まる",
    insight:
      "暖める/温める ('to warm something up,' transitive) and 暖まる/温まる ('to warm up on its own,' intransitive) are a textbook transitive/intransitive pair, each written two ways depending on whether the warmth is about weather and air (暖) or a person, object, or feeling (温).",
    extendedInsight:
      "温かい ('warm,' the everyday adjective) is the description; 温める and 温まる are the verbs that get you there — スープを温める ('to warm up soup,' something you do to it) versus スープが温まる ('the soup warms up,' something that happens to it).",
    examples: [
      {
        jp: "スープを温めてください。",
        romaji: "Suupu o atatamete kudasai.",
        en: "Please warm up the soup.",
      },
      {
        jp: "お風呂に入って、体が温まりました。",
        romaji: "Ofuro ni haitte, karada ga atatamarimashita.",
        en: "I got in the bath and warmed up.",
      },
    ],
    commonMistake:
      "暖める/暖まる (weather, rooms, the air) and 温める/温まる (food, drinks, a person's body) use different kanji for the same reading あたためる/あたたまる — 部屋を暖める warms a room, but スープを温める warms soup; mixing the kanji is a common slip even for advanced learners.",
    rows: [
      {
        terms: ["温かい", "暖める", "温める", "暖まる", "温まる"],
      },
    ],
  },
  {
    key: "n3-b02-feelings-social",
    title: "Love, Feelings & Social Expressions",
    subtitle: "愛情・気持ち",
    insight:
      "愛 ('love') anchors this cluster along with 愛する (the verb, 'to love') and 愛情 ('affection, love as a feeling'). Around it are everyday social gestures (握手 'handshake,' ありがとう 'thank you') and verbs for how a feeling changes over time — 諦める ('to give up on something'), 飽きる ('to get tired of something'), 慌てる ('to panic, get flustered').",
    extendedInsight:
      "愛する (to love, a full verb) is more formal and deliberate than casually saying 好き ('to like, to love'); 愛する tends to appear in writing and serious declarations rather than everyday chit-chat, where 好き does almost all the work.",
    examples: [
      {
        jp: "彼は家族を心から愛しています。",
        romaji: "Kare wa kazoku o kokoro kara aishite imasu.",
        en: "He loves his family from the heart.",
      },
      {
        jp: "初対面で握手をしました。",
        romaji: "Shotaimen de akushu o shimashita.",
        en: "We shook hands when we first met.",
      },
    ],
    commonMistake:
      "諦める ('to give up,' a decision you make) and 飽きる ('to get tired of something,' a feeling that creeps up on you) both describe losing interest, but 諦める is active and deliberate (夢を諦める, 'to give up on a dream'), while 飽きる just happens to you over time (この曲に飽きた, 'I got tired of this song').",
    rows: [
      {
        label: "love & affection",
        terms: ["愛", "愛情", "愛する"],
      },
      {
        label: "social gestures",
        terms: ["握手", "ありがとう", "すみませんかん"],
      },
      {
        label: "losing interest & composure",
        terms: ["諦める", "飽きる", "慌てる"],
      },
    ],
  },
  {
    key: "n3-b02-everyday-objects-places",
    title: "Everyday Objects, Numbers & Places",
    subtitle: "身の回りの物",
    insight:
      "A grab-bag of concrete nouns for everyday life — a 信号 ('traffic light') at a 角 ('corner'), the 数 and 数字 ('number, numeral') printed on things, and words with a clear shape or figure: 図 ('a diagram'), 姿 ('a person's figure or appearance'), and 筋 ('a line, or a muscle').",
    extendedInsight:
      "角 here is read かど, the everyday 'street corner' word — a different reading from the かく used in words like 三角 ('triangle'), even though both share the same kanji.",
    examples: [
      {
        jp: "その角を右に曲がってください。",
        romaji: "Sono kado o migi ni magatte kudasai.",
        en: "Please turn right at that corner.",
      },
      {
        jp: "地図に道を書いてください。",
        romaji: "Chizu ni michi o kaite kudasai.",
        en: "Please draw the road on the map.",
      },
    ],
    commonMistake:
      "数 (すう, an abstract or general 'number, quantity,' as in 数が多い 'the quantity is large') and 数字 (すうじ, a written numeral like 1 or 2) aren't the same thing — 数字を書く means writing a digit down, while 数が増える means the quantity itself grows.",
    rows: [
      {
        label: "town & signals",
        terms: ["信号", "角", "城"],
      },
      {
        label: "shape, figure & line",
        terms: ["図", "姿", "筋", "末"],
      },
      {
        label: "counting & everyday objects",
        terms: ["数", "数字", "巣", "酢", "墨"],
      },
    ],
  },
  {
    key: "n3-b02-nature-textures-misc",
    title: "Nature, Light & Everyday Occurrences",
    subtitle: "自然・出来事",
    insight:
      "Nature and light words round out this batch — 明かり ('lamplight, light in general') and 明ける ('to dawn, to become daylight') both start from the idea of brightness, while 嵐 ('storm') and 泡 ('bubble, foam') describe nature at its more dramatic and delicate extremes.",
    extendedInsight:
      "油 and 脂 are both read あぶら and both mean 'oil, fat,' but 油 is the everyday word for oil you'd cook with or put in a car, while 脂 specifically names the fat found in meat, skin, or a person's body — different kanji for the same sound marking a real distinction in kind.",
    examples: [
      {
        jp: "夜が明けて、明るくなりました。",
        romaji: "Yoru ga akete, akaruku narimashita.",
        en: "The night ended and it became bright.",
      },
      {
        jp: "台風の後、大きな穴ができました。",
        romaji: "Taifuu no ato, ookina ana ga dekimashita.",
        en: "After the typhoon, a large hole was made.",
      },
    ],
    commonMistake:
      "空き ('a vacancy, an empty space,' a noun) and 明ける/明かり (both built on the idea of brightness) sound similar but trace back to an entirely different root word, 空く ('to become empty') — kana similarity alone doesn't mean two words share a root.",
    rows: [
      {
        label: "light & the sky",
        terms: ["明かり", "明ける", "嵐", "泡"],
      },
      {
        label: "traces & spaces",
        terms: ["跡", "穴", "空き", "辺り", "集まり"],
      },
      {
        label: "oil, fat & the uncanny",
        terms: ["油", "脂", "悪魔"],
      },
    ],
  },
  {
    key: "n3-b03-degree-time-adverbs",
    title: "Degree, Vague Time & Extent Adverbs",
    subtitle: "程度・時を表す副詞",
    insight:
      "These words describe how much or how vaguely something happens rather than naming an exact figure — あんなに and あんまり both intensify ('to that extent,' 'not so much'), while いつか、いつでも、いつまでも、いつのまにか sketch a moment in time without pinning it down: someday, any time, forever, before you noticed. いずれ leans the same way ('sooner or later, in any case'), and およそ rounds a number instead of naming it exactly (およそ十人, 'about ten people').",
    extendedInsight:
      "言わば and いわゆる both soften a claim, but do different jobs: 言わば introduces the speaker's own comparison ('so to speak, it's like...'), while いわゆる marks a term as one other people commonly use (いわゆる天才, 'a so-called genius') rather than the speaker's personal judgment.",
    examples: [
      {
        jp: "いつか日本へ行きたいです。",
        romaji: "Itsuka Nihon e ikitai desu.",
        en: "I want to go to Japan someday.",
      },
      {
        jp: "彼はいわゆる天才です。",
        romaji: "Kare wa iwayuru tensai desu.",
        en: "He is a so-called genius.",
      },
    ],
    commonMistake:
      "あんまり needs a negative verb to mean 'not very' (あんまり好きじゃない) — used with a positive verb it instead means 'excessively' (あんまり食べると, 'if you eat too much'), a different sense that trips learners moving on from N4's とても/あまり pair.",
    rows: [
      {
        terms: [
          "あんなに",
          "あんまり",
          "いずれ",
          "いつか",
          "いつでも",
          "いつのまにか",
          "いつまでも",
          "言わば",
          "いわゆる",
          "およそ",
          "大いに",
        ],
      },
    ],
  },
  {
    key: "n3-b03-ishi-homophones",
    title: "The いし Homophones & Words of Mind",
    subtitle: "同音異義語「いし」",
    insight:
      "医師, 意思, and 意志 are all pronounced いし but mean completely different things — 医師 is a doctor (the person), 意思 is your intention in a given moment (意思を伝える, 'to convey one's intention'), and 意志 is willpower or resolve as a character trait (強い意志, 'strong will'). 意識 (consciousness, awareness) and 意外 (unexpected) share the same first kanji 意 ('mind, thought') without sharing the same reading.",
    extendedInsight:
      "意地悪 literally combines 意地 ('disposition, stubbornness') with 悪い ('bad') to mean being deliberately unkind or teasing — a personality judgment, not simply 'bad,' which is why it always describes behavior toward someone else rather than an object.",
    examples: [
      {
        jp: "彼女は強い意志を持っています。",
        romaji: "Kanojo wa tsuyoi ishi o motte imasu.",
        en: "She has a strong will.",
      },
      {
        jp: "その結果は意外でした。",
        romaji: "Sono kekka wa igai deshita.",
        en: "That result was unexpected.",
      },
    ],
    commonMistake:
      "意思 and 意志 are the single easiest いし pair to confuse — 意思 is what you currently intend to do (意思表示, 'expression of intent'), while 意志 is your underlying willpower to keep doing it (意志が強い, 'strong-willed'); mixing them up is natural since both concern the mind's decisions.",
    rows: [
      {
        terms: [
          "医師",
          "意思",
          "意志",
          "意識",
          "意外",
          "意地悪",
          "イメージ",
          "印象",
        ],
      },
    ],
  },
  {
    key: "n3-b03-people-royalty-family",
    title: "People, Royalty & Family Terms",
    subtitle: "人・家族",
    insight:
      "Beyond N4's immediate family, N3 adds cousins (従兄弟 for a male cousin, 従姉妹 for a female one — both read いとこ), a landlord (大家), and the language of formal address (委員, a committee member; お前, a blunt 'you' used only with people you're close to or looking down on). 王, 王様, and 王子 round out the classic 'king, king (polite), prince' set.",
    extendedInsight:
      "王様 adds 様 to 王 the same way N4's 様 suffix formalizes any name — the plain 王 is what you'd use talking about kings in general or in history, while 王様 is how a child, or anyone speaking politely, refers to a specific living king.",
    examples: [
      {
        jp: "従兄弟と一緒に映画を見ました。",
        romaji: "Itoko to issho ni eiga o mimashita.",
        en: "I watched a movie with my cousin.",
      },
      {
        jp: "大家に家賃を払いました。",
        romaji: "Ooya ni yachin o haraimashita.",
        en: "I paid the rent to my landlord.",
      },
    ],
    commonMistake:
      "お前 sounds friendly or even affectionate between close male friends, but is rude and confrontational toward a stranger or someone senior to you — unlike あなた, it isn't a safe default 'you' in polite conversation.",
    rows: [
      {
        terms: [
          "委員",
          "従兄弟",
          "従姉妹",
          "大家",
          "男の人",
          "お前",
          "王",
          "王様",
          "王子",
        ],
      },
    ],
  },
  {
    key: "n3-b03-reading-variants",
    title: "One Word, Many Readings — Homophones & Reading Variants",
    subtitle: "同じ言葉、違う読み方",
    insight:
      "N3 is full of words that share a kanji or a sound with a completely different meaning attached. 行き reads いき in casual Kanto speech but ゆき in more traditionally 'correct' usage (東京行き, 'bound for Tokyo') — same word, same meaning, just two accepted readings. 得る is usually える in plain speech, but appears as うる in set compounds like ありうる ('possible, could happen'). 上 read うわ (rather than うえ or じょう) becomes a prefix meaning 'upper, outer, surface,' as in 上着 ('jacket,' literally the 'upper' garment).",
    extendedInsight:
      "収める, 納める, and 治める are all read おさめる but are three different verbs: 収める means to store away or achieve a result (成功を収める, 'to achieve success'), 納める means to pay or submit something owed (税金を納める, 'to pay taxes'), and 治める means to govern or bring order to something (国を治める, 'to govern a country'). Likewise 討つ and 撃つ are both うつ but not interchangeable — 討つ is to strike down an enemy, while 撃つ is to shoot with a weapon.",
    examples: [
      {
        jp: "税金を納めました。",
        romaji: "Zeikin o osamemashita.",
        en: "I paid my taxes.",
      },
      {
        jp: "鏡に自分の顔が映りました。",
        romaji: "Kagami ni jibun no kao ga utsurimashita.",
        en: "My own face was reflected in the mirror.",
      },
    ],
    commonMistake:
      "写る (to be photographed or copied, 写真に写る) and 映る (to be reflected or displayed, テレビに映る) are both read うつる and both describe an image appearing somewhere, so it's easy to reach for the wrong one — 写る is specifically about a photograph or copy, 映る about a reflection or screen.",
    rows: [
      {
        terms: [
          "行き",
          "行き-2",
          "得る",
          "得る-2",
          "上-2",
          "収める",
          "納める",
          "治める",
          "討つ",
          "撃つ",
          "写る",
          "映る",
        ],
      },
    ],
  },
  {
    key: "n3-b03-character-emotion",
    title: "Character & Emotional Qualities",
    subtitle: "性格・感情の形容詞",
    insight:
      "A set of adjectives for judging a person's character or an event's emotional weight — 偉大 ('great,' admiringly, for a person's achievements), 大人しい ('docile, well-behaved'), 幼い ('very young, childish'), and 穏やか ('calm, gentle') describe temperament, while 恐ろしい ('terrible, dreadful'), 恐れる ('to fear'), and 恐らく ('perhaps,' softened from fearing something might be so) share the root 恐 for fear.",
    extendedInsight:
      "羨ましい describes envying someone else's good fortune without necessarily wanting to take it from them (彼が羨ましい, 'I envy him') — a lighter, more acceptable feeling than jealousy that begrudges someone what they have.",
    examples: [
      {
        jp: "彼女はいつも穏やかです。",
        romaji: "Kanojo wa itsumo odayaka desu.",
        en: "She is always calm.",
      },
      {
        jp: "友達の成功が羨ましいです。",
        romaji: "Tomodachi no seikou ga urayamashii desu.",
        en: "I envy my friend's success.",
      },
    ],
    commonMistake:
      "劣る ('to be inferior, to fall behind') needs に for what something is inferior to (他の製品に劣る, 'inferior to other products') — treating it like a plain descriptive adjective and dropping the に is a common slip, since it's actually a verb.",
    rows: [
      {
        terms: [
          "偉大",
          "羨ましい",
          "恐ろしい",
          "恐れる",
          "恐らく",
          "幼い",
          "大人しい",
          "穏やか",
          "劣る",
        ],
      },
    ],
  },
  {
    key: "n3-b03-body-health",
    title: "Body, Health & Care",
    subtitle: "体・健康",
    insight:
      "N3 fills in more of the body and its upkeep — 胃 (the stomach itself), 息 (breath, as in 息をする, 'to breathe'), and 命 (life, in the broad sense of being alive) sit alongside the professionals and routines around health: 医療 (medical care as a system), 老い (old age, the noun form of 老いる), and 居眠り (dozing off, often somewhere you shouldn't, like 電車で居眠りする).",
    extendedInsight:
      "痛み is the noun form of the adjective 痛い ('painful'), built the same way many Japanese い-adjectives become nouns by dropping い and adding み — a pattern worth noticing since it turns a description into a thing you can point to (頭の痛み, 'a headache,' literally 'the head's pain').",
    examples: [
      {
        jp: "深く息を吸いました。",
        romaji: "Fukaku iki o suimashita.",
        en: "I took a deep breath.",
      },
      {
        jp: "電車の中で居眠りをしました。",
        romaji: "Densha no naka de inemuri o shimashita.",
        en: "I dozed off on the train.",
      },
    ],
    commonMistake:
      "溺れる ('to drown, or to indulge excessively in something') is often assumed to only describe water accidents, but it's just as commonly used figuratively for losing yourself in something (ゲームに溺れる, 'to be absorbed in a game to an unhealthy degree').",
    rows: [
      {
        terms: [
          "胃",
          "息",
          "命",
          "痛み",
          "医療",
          "居眠り",
          "うがい",
          "老い",
          "溺れる",
        ],
      },
    ],
  },
  {
    key: "n3-b03-nature-animals",
    title: "Nature, Animals & Creatures",
    subtitle: "自然・生き物",
    insight:
      "The natural landscape beyond N4's basics — a spring or fountain (泉), a rice plant still in the field (稲, distinct from cooked or uncooked rice), a hill (丘), and the open sea past the shore (沖) — alongside familiar farm and wild animals: 兎 (rabbit), 牛 (cattle), 馬 (horse), and 生き物, the general word for any living creature.",
    extendedInsight:
      "梅 (plum) is deeply tied to the Japanese calendar — 梅の花 (plum blossoms) bloom in late winter before cherry blossoms, and 梅雨 ('the plum rains') names the early-summer rainy season, so the character shows up in seasonal vocabulary well beyond the fruit itself.",
    examples: [
      {
        jp: "丘の上から海が見えました。",
        romaji: "Oka no ue kara umi ga miemashita.",
        en: "The sea could be seen from atop the hill.",
      },
      {
        jp: "牛が草を食べています。",
        romaji: "Ushi ga kusa o tabete imasu.",
        en: "The cow is eating grass.",
      },
    ],
    commonMistake:
      "鬼 ('ogre, demon') isn't only a scary monster from folktales — it's also used casually to describe someone being unreasonably strict or harsh (鬼のような先生, 'a teacher who's a real ogre about the rules'), a figurative sense easy to miss if you only learn the literal meaning.",
    rows: [
      {
        terms: [
          "泉",
          "稲",
          "岩",
          "丘",
          "沖",
          "魚",
          "兎",
          "牛",
          "馬",
          "梅",
          "生き物",
          "鬼",
        ],
      },
    ],
  },
  {
    key: "n3-b03-media-performance",
    title: "Performance, Media & Public Life",
    subtitle: "芸能・報道",
    insight:
      "The vocabulary of putting something in front of an audience — 演技 (acting, a performance itself), 演説 (a public speech), 演奏 (a musical performance), all sharing 演 ('to perform, to present'). 印刷 (printing) and 引用 (quotation, citation) are the mechanics of publishing, while インタビュー (an interview) and 引退 (retirement, stepping down from a career) round out the language of public figures. 笑顔 (a smiling face) and 描く (to draw, depict, or describe) are the more personal side of presenting yourself or an idea to others.",
    extendedInsight:
      "演技, 演説, and 演奏 all share 演 but specialize by their second kanji — 技 ('skill, technique') for acting, 説 ('speak, explain') for a speech, and 奏 ('play music') for a musical performance — so the second character alone tells you what kind of performance is meant.",
    examples: [
      {
        jp: "彼女の演技は素晴らしかったです。",
        romaji: "Kanojo no engi wa subarashikatta desu.",
        en: "Her acting was wonderful.",
      },
      {
        jp: "有名な歌手の演奏を聞きました。",
        romaji: "Yuumei na kashu no ensou o kikimashita.",
        en: "I listened to a famous singer's performance.",
      },
    ],
    commonMistake:
      "引用 ('to quote or cite') requires crediting where the words came from — using someone else's exact words without marking them as a quotation is treated as a serious problem in writing, not a minor style choice.",
    rows: [
      {
        terms: [
          "印刷",
          "引用",
          "インタビュー",
          "引退",
          "演技",
          "演説",
          "演奏",
          "笑顔",
          "描く",
        ],
      },
    ],
  },
  {
    key: "n3-b03-business-science",
    title: "Business, Science & the Modern World",
    subtitle: "仕事・科学",
    insight:
      "Formal, often written-register nouns for how organizations and modern life operate — 営業 (business/sales activity), 依頼 (a formal request), 援助 (assistance or aid, often institutional), 維持 (maintaining something as it is), and 延期 (postponing an event) describe how work and plans move forward. 移動 (relocating or moving) and 異常 (an abnormality or malfunction) apply just as easily to a person's schedule as to a machine. 宇宙 (the universe), 衛星 (a satellite), エネルギー (energy), and エンジン (an engine) describe the science powering modern life, while 汚染 (pollution) names one of its costs and 影響 (influence, effect) ties it all together.",
    extendedInsight:
      "衛星 literally means a 'guard star' (衛 'to guard' + 星 'star'), reflecting the older astronomical sense of a moon guarding its planet, before the word was extended to artificial satellites (人工衛星, 'artificial satellite').",
    examples: [
      {
        jp: "工場の機械に異常がありました。",
        romaji: "Koujou no kikai ni ijou ga arimashita.",
        en: "There was an abnormality in the factory machine.",
      },
      {
        jp: "会議は来週まで延期されました。",
        romaji: "Kaigi wa raishuu made enki saremashita.",
        en: "The meeting was postponed until next week.",
      },
    ],
    commonMistake:
      "維持する ('to maintain, keep as-is') is often confused with 準備する ('to prepare') — 維持する describes keeping an existing state going (健康を維持する, 'to maintain one's health'), not getting ready for something new.",
    rows: [
      {
        terms: [
          "営業",
          "依頼",
          "援助",
          "維持",
          "延期",
          "移動",
          "異常",
          "宇宙",
          "衛星",
          "エネルギー",
          "エンジン",
          "汚染",
          "影響",
        ],
      },
    ],
  },
  {
    key: "n3-b03-trust-conflict-law",
    title: "Trust, Conflict & the Law",
    subtitle: "信頼・争い",
    insight:
      "Verbs for when trust breaks down — 疑う (to doubt, to suspect), 裏切る (to betray), 奪う (to rob, to take by force), 失う (to lose, whether an object, a chance, or someone's trust), and 訴える (to appeal, complain, or formally sue). 違反 (a violation, of a law or rule) names the more official version of breaking trust with a system rather than a person.",
    extendedInsight:
      "訴える has two related but distinct uses: informally, it means to voice a complaint or appeal to someone's feelings (痛みを訴える, 'to complain of pain'), while formally it means to sue or bring legal action (裁判所に訴える, 'to take a matter to court') — context decides which is meant.",
    examples: [
      {
        jp: "彼を疑ったことを後悔しています。",
        romaji: "Kare o utagatta koto o koukai shite imasu.",
        en: "I regret having doubted him.",
      },
      {
        jp: "友達に裏切られました。",
        romaji: "Tomodachi ni uragiraremashita.",
        en: "I was betrayed by my friend.",
      },
    ],
    commonMistake:
      "失う ('to lose,' an abstract or valuable thing like trust, a chance, or a loved one) is not used for misplacing an everyday object — dropping your umbrella somewhere is 忘れる or なくす, not 失う, which carries more emotional or lasting weight.",
    rows: [
      {
        terms: ["疑う", "裏切る", "奪う", "失う", "訴える", "違反"],
      },
    ],
  },
  {
    key: "n3-b03-time-and-ichi",
    title: "Time, Duration & 一 Compounds",
    subtitle: "時間・「一」の表現",
    insight:
      "One group of words marks a point or stretch of time without a specific date — 以前 ('before, previously'), 一時 ('temporarily, for a time'), 一瞬 ('an instant'), 一生 ('one's whole life'), 一度に ('all at once'), 今に and 今にも ('before long' / 'at any moment'), and 以来 ('ever since'). A second, related group builds on the character 一 ('one') to mean not a literal single thing but a whole category or stance: 一家 ('a household'), 一種 ('a kind, a sort of'), 一般 ('general, in general'), 一方 ('on the other hand'), 一体 ('what on earth; overall'), 一層 ('all the more'), and 一致 ('agreement, matching').",
    extendedInsight:
      "一体 is a genuine double duty word — attached to a question it adds emphatic bewilderment (一体何ですか, 'what on earth is it?'), but used plainly it just means 'overall, generally' (一体に, 'generally speaking') — the emphatic sense is by far the more common one in conversation.",
    examples: [
      {
        jp: "以前、この町に住んでいました。",
        romaji: "Izen, kono machi ni sunde imashita.",
        en: "I used to live in this town before.",
      },
      {
        jp: "二つの意見が一致しました。",
        romaji: "Futatsu no iken ga itchi shimashita.",
        en: "The two opinions matched.",
      },
    ],
    commonMistake:
      "一瞬 ('an instant, a moment') and 一時 ('temporarily, a short while') both describe short spans of time but aren't interchangeable in length — 一瞬 is essentially instantaneous (一瞬で消えた, 'it vanished in an instant'), while 一時 can stretch to minutes or longer (一時的な問題, 'a temporary problem').",
    rows: [
      {
        label: "time & duration",
        terms: [
          "以前",
          "一時",
          "一瞬",
          "一生",
          "一度に",
          "今に",
          "今にも",
          "以来",
        ],
      },
      {
        label: "「一」compounds — kind, degree & stance",
        terms: ["一家", "一種", "一層", "一体", "一致", "一般", "一方"],
      },
    ],
  },
  {
    key: "n3-b03-everyday-objects-places",
    title: "Everyday Objects, Places & Provisions",
    subtitle: "身の回りの物・場所",
    insight:
      "A grab-bag of concrete nouns for daily life — furniture and hardware (板 a board or plank, 柄 a handle, 帯 a sash), places you go (市 and 市場, both meaning 'market,' 居間 the living room, オフィス an office), and things you keep on hand (インク ink, ウイスキー whiskey, 餌 pet food or bait, 栄養 nutrition). 位置 (a position or location), 円 (a circle, or the yen currency), and 奥 (the inner or back part of a space) describe where things sit relative to each other, while 衣服 (clothing, in general) and お昼 (noon, or a midday meal) round out the everyday essentials.",
    extendedInsight:
      "市 alone (as in 市に住む, 'to live in the city') and 市場 (a marketplace, the place where goods are bought and sold) share the same first kanji but describe different things — a city as an administrative area versus a place of trade.",
    examples: [
      {
        jp: "机の上に猫の餌を置きました。",
        romaji: "Tsukue no ue ni neko no esa o okimashita.",
        en: "I put the cat's food on the desk.",
      },
      {
        jp: "部屋の奥に古い箱がありました。",
        romaji: "Heya no oku ni furui hako ga arimashita.",
        en: "There was an old box in the back of the room.",
      },
    ],
    commonMistake:
      "位置 ('position, location,' where something is) is easy to reach for when you actually mean 場所 ('place, spot,' a location as a general concept) — 位置 is more precise and often technical (物の位置を確認する, 'to check the position of an object'), while 場所 fits everyday conversation better.",
    rows: [
      {
        terms: [
          "板",
          "柄",
          "帯",
          "市",
          "市場",
          "位置",
          "居間",
          "衣服",
          "オフィス",
          "円",
          "奥",
          "インク",
          "ウイスキー",
          "餌",
          "お昼",
          "栄養",
        ],
      },
    ],
  },
  {
    key: "n3-b03-manners-feelings",
    title: "Manners, Greetings & Small Feelings",
    subtitle: "礼儀・気持ち",
    insight:
      "The everyday texture of politeness and small emotional reactions — fixed greetings (いただきます before a meal, いらっしゃい welcoming someone, おめでとう for congratulations, お辞儀 a bow), the mild social friction of うっかり (a careless slip) and いたずら (a prank), and small negative feelings like いらいら (irritation). 否 is the plain, almost literary word for 'no,' while お互い ('each other, mutually'), お洒落 ('fashionable, stylish'), and お喋り ('chatting, chattiness') describe how people present themselves and relate to one another.",
    extendedInsight:
      "いけない has two related everyday uses — as a plain warning it means 'you mustn't' (行ってはいけない, 'you mustn't go'), but said about a situation on its own it just means 'bad, no good' (それはいけませんね, 'that's too bad'), a softer, sympathetic sense rather than a prohibition.",
    examples: [
      {
        jp: "お客様にお辞儀をしました。",
        romaji: "Okyakusama ni ojigi o shimashita.",
        en: "I bowed to the customer.",
      },
      {
        jp: "彼はいつもお洒落です。",
        romaji: "Kare wa itsumo oshare desu.",
        en: "He is always fashionable.",
      },
    ],
    commonMistake:
      "いただきます is said before eating, not after — the closing counterpart is ごちそうさまでした, and mixing the two up is a common beginner error, since both involve gratitude but at different moments.",
    rows: [
      {
        terms: [
          "いけない",
          "いたずら",
          "いただきます",
          "否",
          "いらいら",
          "いらっしゃい",
          "おめでとう",
          "お辞儀",
          "お互い",
          "うっかり",
          "お喋り",
          "お洒落",
        ],
      },
    ],
  },
  {
    key: "n3-b03-verbs-motion-action",
    title: "Verbs of Motion & Physical Action",
    subtitle: "動作を表す動詞",
    insight:
      "Verbs for acting on or moving through the physical world — 追う (to chase) and its close cousin 追い付く (to catch up), 動かす (to move something), 受け取る (to receive), 覆う (to cover or conceal), 埋める (to bury or fill in), and 抱く (to hold or embrace, more written/formal than 持つ). 起こる (for something to occur), 押える (to press down or restrain), 至る (to arrive at, often figuratively — a conclusion or a point in time), 終える (to finish something), 横断 (to cross, as a street or a continent), and 下す (to hand down, as a decision or an order) round out the set.",
    extendedInsight:
      "至る is more formal and often more abstract than N5's 着く — 結論に至る ('to arrive at a conclusion') describes reaching a state or outcome through a process, not simply arriving at a physical destination.",
    examples: [
      {
        jp: "道を横断する前に、左右を見ます。",
        romaji: "Michi o oudan suru mae ni, sayuu o mimasu.",
        en: "Before crossing the street, I look left and right.",
      },
      {
        jp: "子供を優しく抱きしめました。",
        romaji: "Kodomo o yasashiku dakishimemashita.",
        en: "I gently hugged the child.",
      },
    ],
    commonMistake:
      "抱く is markedly more formal and literary than the everyday 持つ ('to hold') — using 抱く for holding an object like a bag sounds oddly poetic; it's reserved for embracing a person, an animal, or an abstract feeling (夢を抱く, 'to hold a dream').",
    rows: [
      {
        terms: [
          "追い付く",
          "追う",
          "動かす",
          "受け取る",
          "覆う",
          "埋める",
          "起こる",
          "押える",
          "至る",
          "終える",
          "横断",
          "下す",
          "抱く",
        ],
      },
    ],
  },
  {
    key: "n3-b03-verbs-giving-responding",
    title: "Verbs of Giving, Responding & Reflection",
    subtitle: "働きかけ・振り返り",
    insight:
      "Verbs for reaching out to others and looking back on things — 贈る (to present or award something formally, more ceremonial than N5's あげる), 応じる (to respond to or comply with a request), 応援 (to cheer someone on or back them), and 教わる (to be taught, the receiving counterpart of 教える). 祝い and 祝う (a celebration, and the verb to celebrate) mark happy occasions, while お目に掛かる is the humble way to say 'to meet' someone you respect. 思い付く (to hit upon an idea), 思い出 (a memory), 主に (mainly), and 思わず (unintentionally, before you could stop yourself) round out how thoughts and reactions surface.",
    extendedInsight:
      "思い付く and 思い出 share the root 思う ('to think') but point in opposite directions in time — 思い付く is a new idea occurring to you now, while 思い出 is an old memory resurfacing from the past.",
    examples: [
      {
        jp: "先生に日本語を教わりました。",
        romaji: "Sensei ni nihongo o osowarimashita.",
        en: "I was taught Japanese by my teacher.",
      },
      {
        jp: "彼女の誕生日にプレゼントを贈りました。",
        romaji: "Kanojo no tanjoubi ni purezento o okurimashita.",
        en: "I gave a present for her birthday.",
      },
    ],
    commonMistake:
      "思わず ('unintentionally, reflexively') describes an action that slipped out before you could think, not a deliberate choice made without much thought — 思わず笑ってしまった ('I couldn't help but laugh') is natural, but using it for a planned decision misrepresents it as involuntary.",
    rows: [
      {
        terms: [
          "贈る",
          "応じる",
          "応援",
          "教わる",
          "祝い",
          "祝う",
          "お目に掛かる",
          "思い付く",
          "思い出",
          "主に",
          "思わず",
        ],
      },
    ],
  },
  {
    key: "n3-b03-fortune-sound-misc",
    title: "Fortune, Sound & Everyday Verbs",
    subtitle: "運・音・その他の動詞",
    insight:
      "A mixed set of common verbs and nouns rounding out daily life — 運 (luck, fortune) and the related word 運転 (driving, i.e. operating a vehicle), 生まれ (birth, or where you were born), and 有無 (whether something exists or not, presence or absence, often in formal writing). 売れる (for something to sell well) and 噂 (rumor, gossip) describe how things and information spread, while 永遠 and 永久 both mean 'eternity' and can usually be swapped for each other. 泳ぎ (swimming, the noun), うなる (to groan or growl), 映す (to project or reflect an image), 及ぼす (to exert an effect on something), and 勢い (momentum, force, the energy behind a trend or a person's push) fill out the rest.",
    extendedInsight:
      "永遠 and 永久 are near-synonyms, but 永遠 leans poetic and emotional (永遠の愛, 'eternal love'), while 永久 leans practical and legal (永久に禁止する, 'to ban permanently') — both mean 'forever,' but the register differs.",
    examples: [
      {
        jp: "その歌手のアルバムはよく売れています。",
        romaji: "Sono kashu no arubamu wa yoku urete imasu.",
        en: "That singer's album sells well.",
      },
      {
        jp: "変な音がして、犬がうなりました。",
        romaji: "Hen na oto ga shite, inu ga unarimashita.",
        en: "There was a strange sound, and the dog growled.",
      },
    ],
    commonMistake:
      "運転 needs a vehicle or machine as its object — 運転する describes driving a car or operating equipment, not general 'operating' in the abstract sense English sometimes uses the word for; running a business or a project uses 経営する or 運営する instead.",
    rows: [
      {
        terms: [
          "うなる",
          "生まれ",
          "有無",
          "売れる",
          "噂",
          "運",
          "運転",
          "永遠",
          "永久",
          "泳ぎ",
          "及ぼす",
          "映す",
          "勢い",
        ],
      },
    ],
  },
  {
    key: "n3-b04-homophones",
    title: "Homophones — Same Sound, Different Kanji",
    subtitle: "同音異義語",
    insight:
      "N3 keeps turning up words that sound identical but share nothing else — 音 ('sound') and 恩 ('a favor, a debt of gratitude') are both read おん, 堅い and 硬い are both かたい ('hard,' with different nuances), and 感覚 ('sense, sensation') and 間隔 ('an interval, a gap') are both かんかく. 感心 ('admiration') and 関心 ('interest, concern') round out the same trap, both read かんしん.",
    extendedInsight:
      "過程, 課程, and 仮定 are all かてい but name different things — 過程 is the 'process' something goes through, 課程 is a 'course/curriculum' of study, and 仮定 is a 'hypothesis, an assumption.' 上 read かみ (as in 上等, 'top-grade') and 神 ('god') share only their sound too, the same pattern as 音/恩 above.",
    examples: [
      {
        jp: "彼は意志が堅い人です。",
        romaji: "Kare wa ishi ga katai hito desu.",
        en: "He is a person with a firm will.",
      },
      {
        jp: "この石はとても硬いです。",
        romaji: "Kono ishi wa totemo katai desu.",
        en: "This stone is very hard.",
      },
    ],
    commonMistake:
      "硬い describes something physically rigid (石は硬い, 'the stone is hard'), while 堅い describes something reliably firm or a person's steady character (意志が堅い, 'having a firm will') — using 硬い for someone's character, or 堅い for a literal rock, sounds off even though both are read かたい.",
    rows: [
      {
        label: "おん: sound & gratitude",
        terms: ["音", "恩"],
      },
      {
        label: "かんかく/かんしん: sense, interval, admiration & interest",
        terms: ["感覚", "間隔", "感心", "関心"],
      },
      {
        label: "かたい: two ways to write 'hard'",
        terms: ["堅い", "硬い"],
      },
      {
        label: "かげ: shade or shadow",
        terms: ["影", "陰"],
      },
      {
        label: "かん: can & intuition",
        terms: ["缶", "勘"],
      },
      {
        label: "かち: value & victory",
        terms: ["価値", "勝ち"],
      },
      {
        label: "かてい: process, course & assumption",
        terms: ["過程", "課程", "仮定"],
      },
      {
        label: "かみ: rank & god",
        terms: ["上-3", "神"],
      },
    ],
  },
  {
    key: "n3-b04-weather",
    title: "Weather & Temperature Vocabulary",
    subtitle: "気候・気温",
    insight:
      "These four words build out N3's weather vocabulary — 気候 names a region's overall climate pattern, 気温 the actual temperature of the air right now, 温度 the general word for temperature of anything (not just weather), and 温暖 a formal adjective for 'mild and warm.'",
    extendedInsight:
      "気温 and 温度 are easy to conflate — 気温 always refers to the temperature of the air/weather (今日の気温, 'today's air temperature'), while 温度 is the general-purpose word usable for anything measurable.",
    examples: [
      {
        jp: "今日の気温は三十度です。",
        romaji: "Kyou no kion wa sanjuu-do desu.",
        en: "Today's temperature is 30 degrees.",
      },
      {
        jp: "この地域は気候が温暖です。",
        romaji: "Kono chiiki wa kikou ga ondan desu.",
        en: "This region's climate is mild.",
      },
    ],
    commonMistake:
      "気候 describes a long-term pattern, not a single day's condition — saying 今日は気候がいい to mean 'the weather is nice today' sounds odd; 天気 is the word for that.",
    rows: [
      {
        terms: ["温暖", "温度", "気温", "気候"],
      },
    ],
  },
  {
    key: "n3-b04-formal-meetings",
    title: "Meetings, Resolutions & Going Abroad",
    subtitle: "会議・改善・海外",
    insight:
      "A cluster of formal 会/解/改/快/回/外 compounds common in news and business Japanese — 会合 is a general meeting/gathering, 解決 is 'resolving' a problem, 解釈 is 'interpreting' a text or situation, and 改善 ('improvement') pairs naturally with 回復 ('recovery') and 拡大 ('expansion').",
    extendedInsight:
      "外 words share the same first kanji but move at different scales: 外出 is simply 'going out' of the house, 外交 is a country's formal 'diplomacy,' and 海外 names anywhere 'overseas' — all three mean something like 'outside,' just for a person, a country, or a border.",
    examples: [
      {
        jp: "問題はもう解決しました。",
        romaji: "Mondai wa mou kaiketsu shimashita.",
        en: "The problem has already been resolved.",
      },
      {
        jp: "病気から回復しました。",
        romaji: "Byouki kara kaifuku shimashita.",
        en: "I recovered from my illness.",
      },
    ],
    commonMistake:
      "会合 (a general meeting/gathering) and 会員 (a member of a group) share the character 会 but aren't interchangeable — 会合に出る is 'to attend a meeting,' while 会員になる is 'to become a member,' describing a status, not an event.",
    rows: [
      {
        label: "meetings & resolving things",
        terms: ["会員", "会合", "解決", "解釈", "開始"],
      },
      {
        label: "improvement, recovery & growth",
        terms: ["改善", "快適", "回復", "拡大"],
      },
      {
        label: "outward & abroad",
        terms: ["海外", "外交", "外出"],
      },
    ],
  },
  {
    key: "n3-b04-education",
    title: "Academic Life — Study, Subjects & Science",
    subtitle: "学問",
    insight:
      "学 ('learning') anchors several of N3's academic words: 学習 is the neutral word for 'study/learning,' 学問 is 'scholarship' as a field, and 学者 is the person who has devoted their life to it. 科目 names a specific 'subject' taught within a 学期 ('school term').",
    extendedInsight:
      "化学 ('chemistry') is one of the academic 科目 taught in every 学期, and its own vocabulary brings in words like 気体 ('gas, vapor') — a scientific register of Japanese distinct from most of this level's everyday words.",
    examples: [
      {
        jp: "彼女は有名な学者です。",
        romaji: "Kanojo wa yuumei na gakusha desu.",
        en: "She is a famous scholar.",
      },
      {
        jp: "この学期に化学を勉強します。",
        romaji: "Kono gakki ni kagaku o benkyou shimasu.",
        en: "This term, I will study chemistry.",
      },
    ],
    commonMistake:
      "学 ('learning,' がく) and 額 ('an amount; a frame,' also がく) share nothing but their sound — 額 shows up in unrelated contexts like 金額 ('amount of money') or a picture's 額 ('frame'), never as a shortened form of 学.",
    rows: [
      {
        label: "study & scholarship",
        terms: ["学", "学者", "学習", "学問", "科目", "学期"],
      },
      {
        label: "science subjects",
        terms: ["化学", "気体"],
      },
      {
        label: "a homophone to watch for",
        terms: ["額"],
      },
    ],
  },
  {
    key: "n3-b04-occupations-politics",
    title: "Occupations, Politics & the Press",
    subtitle: "職業・政治・新聞",
    insight:
      "議 ('deliberation') is the shared kanji behind 議会 ('the Diet/parliament' as an institution), 議員 ('a member' of it), and 議長 ('its chairman'). 記者 ('a reporter') writes the 記事 ('news article') that lets someone 語る ('recount, tell') what happened, while 方々 is simply the polite plural for 'people' in general.",
    extendedInsight:
      "議員 and 議長 both describe people who sit in a 議会, but at different ranks — every 議長 was once (and usually still is) a 議員, while the reverse isn't true; 議長 specifically chairs the proceedings.",
    examples: [
      {
        jp: "その議員は会議で意見を語りました。",
        romaji: "Sono giin wa kaigi de iken o katarimashita.",
        en: "That Diet member spoke his opinion at the meeting.",
      },
      {
        jp: "記者が新しい記事を書きました。",
        romaji: "Kisha ga atarashii kiji o kakimashita.",
        en: "The reporter wrote a new article.",
      },
    ],
    commonMistake:
      "語る ('to narrate/tell at some length') is more formal and literary than the everyday 話す ('to speak') — dropping it into small talk sounds oddly dramatic; 語る fits recounting a story or a formal opinion.",
    rows: [
      {
        label: "the Diet & political roles",
        terms: ["議員", "議長", "議会"],
      },
      {
        label: "everyday professions",
        terms: ["歌手", "記者", "技師"],
      },
      {
        label: "reporting & people",
        terms: ["語る", "記事", "方々"],
      },
    ],
  },
  {
    key: "n3-b04-money-finance",
    title: "Money, Value & Finance",
    subtitle: "お金・価値",
    insight:
      "可 ('permissible, passable') is a small but productive kanji, showing up inside 可能 ('possible'). 価格 is the formal word for 'price,' and pairs with the verbs that move money around: 稼ぐ ('to earn') and 貸し ('a loan,' what you have out when you lend someone money).",
    extendedInsight:
      "株 originally meant a tree 'stump,' and the 'stock' sense (shares in a company) is a later, figurative extension of that same word — a root you can't see that still supports something much larger, the way a company's shares support its worth.",
    examples: [
      {
        jp: "この商品の価格は高いです。",
        romaji: "Kono shouhin no kakaku wa takai desu.",
        en: "This product's price is high.",
      },
      {
        jp: "彼は毎日一生懸命稼いでいます。",
        romaji: "Kare wa mainichi isshoukenmei kaseide imasu.",
        en: "He earns money diligently every day.",
      },
    ],
    commonMistake:
      "可能 ('possible,' an abstract quality) needs the right grammar to attach to a verb — 行くことができる or a potential-form verb expresses 'can go,' but 行く可能 alone isn't natural; 可能 pairs with a noun or with ～性 (可能性, 'possibility') instead.",
    rows: [
      {
        label: "price, worth & possibility",
        terms: ["可", "価格", "可能"],
      },
      {
        label: "earning & lending",
        terms: ["貸し", "稼ぐ"],
      },
      {
        label: "money itself & a homophone",
        terms: ["金", "鐘"],
      },
      {
        label: "the stock market",
        terms: ["株"],
      },
    ],
  },
  {
    key: "n3-b04-process-management",
    title: "Process, Completion & Management",
    subtitle: "過程・完成・管理",
    insight:
      "完 ('complete') anchors three related words for finishing something — 完成 ('completion,' a project becoming finished), 完全 ('perfection,' a state with nothing missing), and 完了 ('conclusion,' a formal ending) — while 管理 ('management') and 監督 ('supervision,' or a movie's 'director') describe watching over a process rather than finishing it.",
    extendedInsight:
      "加減 literally means 'addition and subtraction,' and that arithmetic sense stretches into everyday 'adjustment' — 塩加減 ('the amount of salt') asks how much, not whether, something was added, the same logic behind 数える ('to count') elsewhere in this cluster.",
    examples: [
      {
        jp: "このビルは来年完成します。",
        romaji: "Kono biru wa rainen kansei shimasu.",
        en: "This building will be completed next year.",
      },
      {
        jp: "味の加減はちょうどいいです。",
        romaji: "Aji no kagen wa choudo ii desu.",
        en: "The seasoning is just right.",
      },
    ],
    commonMistake:
      "完成 (a thing becoming 'complete,' an event) and 完全 ('perfect,' a description of quality) aren't interchangeable — 家が完成しました reports the house being finished, while 完全な家 describes a house with nothing wrong with it.",
    rows: [
      {
        label: "connection & relation",
        terms: ["関する", "関連"],
      },
      {
        label: "completion",
        terms: ["完成", "完全", "完了"],
      },
      {
        label: "overseeing & control",
        terms: ["監督", "管理"],
      },
      {
        label: "the past, degree & counting",
        terms: ["過去", "加減", "数-2", "数える"],
      },
    ],
  },
  {
    key: "n3-b04-feelings-thoughts",
    title: "Feelings, Thoughts & Resolve",
    subtitle: "感情・気持ち",
    insight:
      "感 ('to feel') is one of N3's most productive kanji — 感じ/感じる give the plain verb 'to feel,' 感情 the abstract noun 'emotion(s),' 感想 your 'impressions' after experiencing something, 感動 the feeling of 'being moved,' and 感謝 'gratitude.' がっかり ('disappointment') and 悲しむ ('to grieve') describe the feeling itself, while 期待 ('expectation, hope') looks forward to one.",
    extendedInsight:
      "勘定 ('calculation, the bill at a restaurant') is read かんじょう — the exact same sound as 感情 ('emotion') above, a classic N3 homophone: お勘定をお願いします ('check, please') has nothing to do with feelings at all, despite sharing every syllable with 感情.",
    examples: [
      {
        jp: "彼の話に感動しました。",
        romaji: "Kare no hanashi ni kandou shimashita.",
        en: "I was moved by his story.",
      },
      {
        jp: "試験の結果を期待しています。",
        romaji: "Shiken no kekka o kitai shite imasu.",
        en: "I'm hoping for the exam results.",
      },
    ],
    commonMistake:
      "覚悟 ('resolve, mental readiness for something hard') and 我慢 ('patience, enduring something unpleasant') both sound like plain toughness but describe different moments — 覚悟する happens before something difficult begins, while 我慢する happens during it.",
    rows: [
      {
        label: "feeling & impression",
        terms: ["感じ", "感じる", "感情", "感想", "感動", "感謝"],
      },
      {
        label: "a homophone: calculating the bill",
        terms: ["勘定"],
      },
      {
        label: "disappointment, sadness & hope",
        terms: ["がっかり", "悲しむ", "期待"],
      },
      {
        label: "mindset, patience & memory",
        terms: ["覚悟", "我慢", "考え", "記憶"],
      },
    ],
  },
  {
    key: "n3-b04-viewing-surroundings",
    title: "Viewing, Welcoming & Surroundings",
    subtitle: "観光・環境",
    insight:
      "観 ('to view, observe') builds 観光 ('sightseeing'), 観察 ('close observation,' more scientific than 観光's casual looking), and 観客 ('an audience,' someone doing the viewing at an event). 歓迎 ('welcome') is what a visitor typically receives, and 環境 ('environment') is the wider space everything happens within.",
    extendedInsight:
      "観察 differs from 観光 by intent, not just formality — 観光 is done for enjoyment (観光地, 'a tourist spot'), while 観察 implies a purpose beyond looking, like watching how a plant grows in science class.",
    examples: [
      {
        jp: "夏休みに京都を観光しました。",
        romaji: "Natsuyasumi ni Kyouto o kankou shimashita.",
        en: "I went sightseeing in Kyoto during summer vacation.",
      },
      {
        jp: "たくさんの観客が試合を見ていました。",
        romaji: "Takusan no kankyaku ga shiai o mite imashita.",
        en: "Many spectators were watching the match.",
      },
    ],
    commonMistake:
      "環境 ('environment,' the surrounding conditions themselves) is often confused with 天気 ('weather') — 環境がいい describes the general conditions of a place, not simply whether it's sunny that day.",
    rows: [
      {
        terms: ["観客", "観光", "観察", "歓迎", "環境"],
      },
    ],
  },
  {
    key: "n3-b04-home-household",
    title: "Home, Housework & Coming Home",
    subtitle: "家事・帰宅",
    insight:
      "家事 ('housework') is what keeps a home running — putting 家具 ('furniture') in its place, making sure things 片付く ('get tidied up'), and hanging a 飾り ('decoration') here and there — all waiting for the moment you finally 帰宅 ('return home') each day.",
    extendedInsight:
      "片付く is intransitive — things 'get put in order' on their own or as a result of someone's effort — describing the resulting state rather than the act of tidying itself.",
    examples: [
      {
        jp: "掃除をしたら、部屋がすっかり片付きました。",
        romaji: "Souji o shitara, heya ga sukkari katazukimashita.",
        en: "After cleaning, the room was completely tidied.",
      },
      {
        jp: "仕事のあと、まっすぐ帰宅しました。",
        romaji: "Shigoto no ato, massugu kitaku shimashita.",
        en: "After work, I went straight home.",
      },
    ],
    commonMistake:
      "家事 ('housework' in general) is a wider category than any single chore — 家事をする can mean cooking, cleaning, or laundry all at once, so it's rarely paired with a specific object the way 料理をする ('to cook') is.",
    rows: [
      {
        terms: ["家具", "家事", "片付く", "飾り", "籠", "菓子", "帰宅"],
      },
    ],
  },
  {
    key: "n3-b04-body-senses",
    title: "Body, Appearance & the Senses",
    subtitle: "体・感覚",
    insight:
      "肩 ('shoulder') and 髪の毛 ('hair') describe the body directly, while 型 ('mold, style') and 柄 ('pattern; build') describe how something is shaped or patterned. 傷 ('a wound') marks damage to any of them. Two verbs round it out: 抱える ('to hold something in your arms') and 被る ('to wear on your head, or to be covered with').",
    extendedInsight:
      "香り ('a pleasant aroma') is the noun you notice; 嗅ぐ ('to sniff, smell') is the deliberate act of smelling, and かゆい ('itchy') describes the sensation that makes you 掻く ('to scratch') — a small chain of cause and effect worth learning together.",
    examples: [
      {
        jp: "重い荷物を肩に抱えました。",
        romaji: "Omoi nimotsu o kata ni kakaemashita.",
        en: "I held the heavy luggage against my shoulder.",
      },
      {
        jp: "背中がかゆくて、掻きました。",
        romaji: "Senaka ga kayukute, kakimashita.",
        en: "My back was itchy, so I scratched it.",
      },
    ],
    commonMistake:
      "被る has two very different everyday senses — 帽子を被る ('to put on a hat') describes deliberately wearing something, while ほこりを被る ('to be covered in dust') describes something happening to you passively; same verb, opposite levels of control.",
    rows: [
      {
        label: "body & appearance",
        terms: ["肩", "髪の毛", "型", "柄-2", "傷"],
      },
      {
        label: "carrying & wearing",
        terms: ["抱える", "被る"],
      },
      {
        label: "smell & itch",
        terms: ["香り", "嗅ぐ", "掻く", "かゆい"],
      },
    ],
  },
  {
    key: "n3-b04-nature-materials",
    title: "Nature, Animals & Natural Materials",
    subtitle: "自然・材料",
    insight:
      "河 ('a river') runs between its two 岸 ('banks'), home to 貝 ('shellfish') and, in summer, plenty of 蚊 ('mosquitoes'), while 雷 ('thunder') rolls in with a storm. Two verbs describe how people work with nature: 飼う ('to keep/raise an animal') and 刈る ('to cut/mow/harvest').",
    extendedInsight:
      "空 ('empty') and 殻 ('a shell, husk') are true homophones, both から — a 殻 is quite literally what's left once something has been emptied out, so the two meanings share more than just their reading. 皮 ('skin, peel') and 革 ('leather,' processed skin) are a related pair, both read かわ.",
    examples: [
      {
        jp: "河の岸で貝を拾いました。",
        romaji: "Kawa no kishi de kai o hiroimashita.",
        en: "I picked up shellfish on the riverbank.",
      },
      {
        jp: "犬を飼っています。",
        romaji: "Inu o katte imasu.",
        en: "I keep a dog.",
      },
    ],
    commonMistake:
      "皮 (skin/peel still attached to something natural) and 革 (leather, a processed material) are both read かわ but describe different stages — りんごの皮をむく ('to peel an apple') uses 皮, while 革のかばん ('a leather bag') uses 革.",
    rows: [
      {
        label: "animals & water",
        terms: ["貝", "蚊", "河", "岸", "雷"],
      },
      {
        label: "raising & harvesting",
        terms: ["飼う", "刈る"],
      },
      {
        label: "skins, shells & fabric",
        terms: ["皮", "革", "殻", "空", "生地"],
      },
    ],
  },
  {
    key: "n3-b04-describing-qualifying",
    title: "Describing People & Qualifying How Certain You Are",
    subtitle: "様子・確かさ",
    insight:
      "The first half of this cluster judges people and things — 賢い ('wise, clever'), 可愛らしい ('lovely'), 可愛そう ('pitiable'), and きつい ('tight; intense, harsh'). The second half hedges how sure you are of something — かなり ('considerably'), かもしれない ('might be'), and 必ずしも ('not necessarily,' always paired with a negative later in the sentence).",
    extendedInsight:
      "限る ('to limit, restrict') and 確実 ('certainty') sit at opposite ends of the same idea: 限る narrows a set of possibilities down, while 確実 states how solid the one remaining possibility is — 確認 ('confirmation') is the act that gets you from uncertain to 確実.",
    examples: [
      {
        jp: "彼女はとても賢い学生です。",
        romaji: "Kanojo wa totemo kashikoi gakusei desu.",
        en: "She is a very clever student.",
      },
      {
        jp: "明日、雨が降るかもしれません。",
        romaji: "Ashita, ame ga furu kamoshiremasen.",
        en: "It might rain tomorrow.",
      },
    ],
    commonMistake:
      "必ずしも always needs a negative verb to its right — 必ずしも正しいとは限らない ('isn't necessarily correct') works, but 必ずしも正しいです alone is broken without that negative partner later in the sentence.",
    rows: [
      {
        label: "describing people & things",
        terms: ["賢い", "可愛そう", "可愛らしい", "きつい", "貴重", "きちんと"],
      },
      {
        label: "how sure, how much & how limited",
        terms: ["限る", "必ずしも", "かなり", "かもしれない", "確認", "確実"],
      },
    ],
  },
  {
    key: "n3-b04-business-institutions",
    title: "Business, Institutions & Everyday Vitality",
    subtitle: "企業・活動",
    insight:
      "企業 ('a company') and 機関 ('an institution, or an engine') are both organizations bigger than a single person, each divided into a 課 ('a department'). Every organization runs on a 期間 ('a period of time') bounded by some 期限 ('a deadline'), tracked by whoever handles 会計 ('accounting') and whichever 係 ('person in charge') owns that task.",
    extendedInsight:
      "機械 ('a machine') and 器械 ('an instrument, apparatus') are both read きかい and describe mechanical things, but at different scales — 機械 usually means larger, powered machinery, while 器械 leans toward a smaller hand-operated instrument.",
    examples: [
      {
        jp: "その企業は新しい機械を買いました。",
        romaji: "Sono kigyou wa atarashii kikai o kaimashita.",
        en: "That company bought a new machine.",
      },
      {
        jp: "レポートの期限は来週です。",
        romaji: "Repooto no kigen wa raishuu desu.",
        en: "The deadline for the report is next week.",
      },
    ],
    commonMistake:
      "活躍 ('to flourish, be active and successful,' said of a person's achievements) and 活動 ('activity' in the neutral sense) aren't interchangeable — 彼はスポーツで活躍しています praises someone's success, while 活動 alone just names an ongoing activity, with no judgment about how well it's going.",
    rows: [
      {
        label: "companies, departments & institutions",
        terms: ["課", "企業", "機関"],
      },
      {
        label: "time limits",
        terms: ["期間", "期限"],
      },
      {
        label: "machines: a homophone pair",
        terms: ["機械", "器械"],
      },
      {
        label: "accounts, roles & mood",
        terms: ["会計", "係", "機嫌"],
      },
      {
        label: "vitality & activity",
        terms: ["活気", "活動", "活躍", "活用"],
      },
      {
        label: "everyday loanwords",
        terms: ["カー", "カード"],
      },
    ],
  },
  {
    key: "n3-b04-arts-culture",
    title: "Traditional Arts & Culture",
    subtitle: "絵画・楽器",
    insight:
      "A 画家 ('painter') 描く ('draws') 絵画 ('paintings'), a 楽器 ('musical instrument') accompanies 歌謡 ('a song, ballad'), and a 刀 ('sword') stands as one of Japan's oldest crafted objects — several very different art forms sharing one cluster.",
    extendedInsight:
      "描く is a genuine homograph beyond even its reading here — the same kanji can mean 'to draw/paint' a picture or, more abstractly, 'to depict' a scene in writing, the way an author 'draws' a character in words rather than pigment.",
    examples: [
      {
        jp: "画家が美しい絵画を描きました。",
        romaji: "Gaka ga utsukushii kaiga o egakimashita.",
        en: "The painter drew a beautiful painting.",
      },
      {
        jp: "彼はピアノという楽器が好きです。",
        romaji: "Kare wa piano to iu gakki ga suki desu.",
        en: "He likes the instrument called the piano.",
      },
    ],
    commonMistake:
      "描く read かく (as tagged for this word) sounds identical to 書く ('to write') — context is the only way to tell 'to draw a picture' from 'to write characters,' since both verbs are pronounced exactly the same way.",
    rows: [
      {
        terms: ["絵画", "画家", "楽器", "描く-2", "歌謡", "刀"],
      },
    ],
  },
  {
    key: "n3-b04-change-verbs",
    title: "Verbs of Change — Shape, Drying & Hiding",
    subtitle: "変化を表す動詞",
    insight:
      "Several verb pairs here split the same event into 'it happens' and 'someone makes it happen' — 重なる ('things pile up on their own') versus 重ねる ('to pile things up' deliberately), and 隠れる ('to become hidden') versus 隠す ('to hide something'). 反る ('to warp') and 囲む ('to surround') describe shape changing or forming a boundary, while 輝く ('to shine') describes light.",
    extendedInsight:
      "乾かす ('to dry something') shares a root with 渇く ('to be thirsty') — both read with the same core かわ sound, since thirst is, at heart, your body running dry; 乾燥 ('dryness, aridity') is the more formal, abstract noun version of the same idea.",
    examples: [
      {
        jp: "洗濯物を庭で乾かしました。",
        romaji: "Sentakumono o niwa de kawakashimashita.",
        en: "I dried the laundry in the yard.",
      },
      {
        jp: "秘密を友達から隠しました。",
        romaji: "Himitsu o tomodachi kara kakushimashita.",
        en: "I hid the secret from my friend.",
      },
    ],
    commonMistake:
      "隠す (transitive, 'to hide something,' takes を) and 隠れる (intransitive, 'to become hidden,' takes が) are easy to swap — 子供が隠れました describes the child's own action of hiding, while 子供を隠しました describes hiding someone else.",
    rows: [
      {
        label: "warping & piling up",
        terms: ["反る", "重なる", "重ねる"],
      },
      {
        label: "surrounding & shining",
        terms: ["囲む", "輝く"],
      },
      {
        label: "hiding — transitive & intransitive",
        terms: ["隠す", "隠れる"],
      },
      {
        label: "drying & thirst",
        terms: ["乾かす", "渇く", "乾燥"],
      },
    ],
  },
  {
    key: "n3-b04-transactional-verbs",
    title: "Exchanging, Lowering & Sending Back",
    subtitle: "交換・往来の動詞",
    insight:
      "代える, 替える, and 換える are all read かえる and all mean 'to exchange/substitute,' but lean on slightly different senses — 代える is a substitution (席を代える, 'to change seats'), 替える leans toward switching one thing for another (お金を替える, 'to exchange money'), and 換える leans toward converting. 代る is their intransitive partner — the change happening rather than someone doing it.",
    extendedInsight:
      "降ろす ('to take something down, to drop someone off') and 卸す ('to sell wholesale, to grate') are true homophones, both read おろす — a reminder that even deep into N3, new same-sound pairs keep turning up.",
    examples: [
      {
        jp: "円をドルに替えました。",
        romaji: "En o doru ni kaemashita.",
        en: "I exchanged yen for dollars.",
      },
      {
        jp: "駅で友達を降ろしました。",
        romaji: "Eki de tomodachi o oroshimashita.",
        en: "I dropped my friend off at the station.",
      },
    ],
    commonMistake:
      "帰す ('to send someone back/home') is transitive and needs another person as its object — 子供を家に帰しました ('I sent the child home') — it's easy to confuse with the far more common intransitive 帰る ('to go home' yourself), which never takes を.",
    rows: [
      {
        label: "three ways to say 'exchange'",
        terms: ["代える", "替える", "換える"],
      },
      {
        label: "the intransitive partner",
        terms: ["代る"],
      },
      {
        label: "taking down & selling",
        terms: ["降ろす", "卸す"],
      },
      {
        label: "sending back",
        terms: ["帰す"],
      },
    ],
  },
  {
    key: "n3-b04-harm-illness",
    title: "Harm, Illness & Whether Something Works",
    subtitle: "害・病気・効く",
    insight:
      "害 ('harm, damage') and 火災 ('a fire') name two kinds of damage — one general, one a specific disaster. 罹る ('to suffer from,' almost always an illness) is what turns someone into a 患者 ('a patient'), and 欠ける ('to be lacking, chipped') describes something missing a piece it should have. 効く ('to be effective') is the hopeful counterpart — what a treatment does when it works.",
    extendedInsight:
      "罹る is a narrow, almost exclusively medical verb — 病気に罹る ('to catch an illness') — unlike the more general-purpose かかる, which shares the same reading but a far wider range of uses; only the kanji 罹 signals the illness-specific sense.",
    examples: [
      {
        jp: "この薬はよく効きます。",
        romaji: "Kono kusuri wa yoku kikimasu.",
        en: "This medicine works well.",
      },
      {
        jp: "火災で建物が壊れました。",
        romaji: "Kasai de tatemono ga kowaremashita.",
        en: "The building was damaged by the fire.",
      },
    ],
    commonMistake:
      "欠ける ('to be lacking, chipped, missing a piece') is intransitive and describes an existing flaw — お皿が欠けている ('the plate is chipped') — it doesn't mean 'to lack' in the sense of not having something at all, which is closer to 足りない ('not enough').",
    rows: [
      {
        terms: ["害", "火災", "欠ける", "罹る", "患者", "効く"],
      },
    ],
  },
  {
    key: "n3-b05-noticing-impressions",
    title: "Noticing, Habits & Strange Impressions",
    subtitle: "気づき・印象",
    insight:
      "Many words here grow out of 気 ('spirit, feeling'). 気付く (to notice) is realizing something, 気に入る (to come to like) is finding something to your taste, and 気の毒 (a pity) is feeling sympathy for someone. 気味 (a touch/feeling of ~) softens a description, the way 風邪気味 means 'a bit like I'm catching a cold.' 奇妙 (strange) and 偶然 (by chance) describe odd coincidences, and 臭い (smelly) and 癖 (a habit) round out this set of everyday impressions.",
    extendedInsight:
      "偶然 (by chance, a coincidence) and 癖 (a habit) sit at opposite ends of the same idea — something 偶然 happens once, unplanned, while a 癖 is the same small action repeated so often it becomes automatic. An 奇妙な偶然 ('a strange coincidence') stands out precisely because it isn't someone's 癖.",
    examples: [
      {
        jp: "彼の奇妙な癖に気付きました。",
        romaji: "Kare no kimyou na kuse ni kizukimashita.",
        en: "I noticed his strange habit.",
      },
      {
        jp: "偶然、駅で先生に会いました。",
        romaji: "Guuzen, eki de sensei ni aimashita.",
        en: "By chance, I met my teacher at the station.",
      },
    ],
    commonMistake:
      "気に入る (to come to like something) and 気の毒 (to feel pity for someone) both start with 気 but point in opposite emotional directions — お気に入り means a favorite thing, while 気の毒に思う means feeling sorry for someone; mixing them up reverses the emotion entirely.",
    rows: [
      {
        label: "気 feelings & reactions",
        terms: ["気付く", "気に入る", "気の毒", "気味"],
      },
      {
        label: "strange & by chance",
        terms: ["奇妙", "偶然", "臭い", "癖"],
      },
    ],
  },
  {
    key: "n3-b05-rules-rights",
    title: "Hope, Duty, Rights & Permission",
    subtitle: "希望・義務・権利",
    insight:
      "義務 (duty, what you must do) and 権利 (a right, what you may do) are the basic (基本) vocabulary of formal obligation. 許可 (permission) lets you do something, while 禁止 (prohibition) and 禁煙 (no smoking) forbid it. 契約 (a contract) and 憲法 (a constitution) are the kinds of 決まり (rules) that spell out both sides — and 希望 (hope) is simply what you want, before any rule gets involved.",
    extendedInsight:
      "義務 (duty, what you must do) and 権利 (right, what you may do) form a natural pair in formal Japanese — 働く義務 ('the duty to work') and 休む権利 ('the right to rest') describe two sides of the same relationship between a person and society, and the two words often appear together in the same sentence.",
    examples: [
      {
        jp: "契約書に希望の条件を書きました。",
        romaji: "Keiyakusho ni kibou no jouken o kakimashita.",
        en: "I wrote my hoped-for conditions in the contract.",
      },
      {
        jp: "この部屋は禁煙です。",
        romaji: "Kono heya wa kin'en desu.",
        en: "This room is non-smoking.",
      },
    ],
    commonMistake:
      "禁煙 (no smoking) and 禁止 (prohibition in general) aren't interchangeable — 禁煙 names one specific banned act, while 禁止 is the general word for 'forbidden' and needs to say what's forbidden (撮影禁止, 'photography prohibited') to mean anything on its own.",
    rows: [
      {
        label: "hope & the basics",
        terms: ["希望", "基本", "決まり"],
      },
      {
        label: "duty & permission",
        terms: ["義務", "許可", "禁止", "禁煙"],
      },
      {
        label: "contracts & rights",
        terms: ["契約", "憲法", "権利"],
      },
    ],
  },
  {
    key: "n3-b05-discussion-conclusion",
    title: "Doubt, Discussion & Reaching a Conclusion",
    subtitle: "議論・結論",
    insight:
      "疑問 (a doubt/question) starts a 議論 (discussion), where people share their 見解 (opinions). 検討 (careful consideration) and 見当 (a rough estimate/guess) describe how you weigh a question before a 決定 (decision) or 決心 (determination) is reached. 結局 (in the end), the 結果 (result) — what actually happened — and the 結論 (conclusion) — the judgment people reach — may point to the 後者 (the latter) rather than the former.",
    extendedInsight:
      "結果 (result, what actually happened) and 結論 (conclusion, a judgment someone reaches) aren't the same kind of ending — 試験の結果 ('the exam result') is simply what occurred, while 話し合いの結論 ('the conclusion of the discussion') is a decision people arrived at through reasoning.",
    examples: [
      {
        jp: "会議で議論した結果、結論が出ました。",
        romaji: "Kaigi de giron shita kekka, ketsuron ga demashita.",
        en: "As a result of discussing it at the meeting, we reached a conclusion.",
      },
      {
        jp: "彼の見解にはまだ疑問があります。",
        romaji: "Kare no kenkai ni wa mada gimon ga arimasu.",
        en: "There are still doubts about his opinion.",
      },
    ],
    commonMistake:
      "見当 (a rough guess or estimate) and 検討 (careful, thorough consideration) are exact homophones, both read けんとう — 見当がつかない means 'I have no idea,' while 検討します means 'I'll look into it carefully'; only the kanji tells them apart.",
    rows: [
      {
        label: "questioning & discussing",
        terms: ["疑問", "議論", "見解"],
      },
      {
        label: "considering & estimating",
        terms: ["検討", "見当"],
      },
      {
        label: "deciding & concluding",
        terms: ["結論", "結果", "決定", "決心", "結局", "後者"],
      },
    ],
  },
  {
    key: "n3-b05-gen-prefix",
    title: "The 現 Words — Present, Actual & Real",
    subtitle: "現～",
    insight:
      "現 ('present, actual') attaches to a handful of fixed words describing what's true right now: 現在 (now, the present moment), 現実 (reality), 現状 (the present condition), 現代 (the present era), and 現場 (the actual site/scene). 現象 (a phenomenon) rounds out the set — something that 現れる ('appears') and can be observed. Learn 現 once and each word reads as 'the actual/present version of X.'",
    extendedInsight:
      "現実 (reality, what actually is) and 現状 (the present condition, a situation that could still change) point at different scales — 現状を変える ('to change the current situation') describes something you can act on, while 現代 (the present era) describes the broad span of history you're currently living through.",
    examples: [
      {
        jp: "現在、日本に住んでいます。",
        romaji: "Genzai, Nihon ni sunde imasu.",
        en: "I currently live in Japan.",
      },
      {
        jp: "事故の現場に警察が来ました。",
        romaji: "Jiko no genba ni keisatsu ga kimashita.",
        en: "The police came to the scene of the accident.",
      },
    ],
    commonMistake:
      "現状 (the present condition, a situation you can change) is sometimes confused with 現実 (reality, a broader fact you must accept) — 現状を変える ('to change the current situation') is natural, but 現実を変える sounds odd, since reality itself isn't something you directly alter.",
    rows: [
      {
        terms: ["現在", "現実", "現状", "現代", "現場", "現象"],
      },
    ],
  },
  {
    key: "n3-b05-money-cash",
    title: "Cash, Salary & Currency",
    subtitle: "お金",
    insight:
      "Everyday money vocabulary at a more concrete level — 給料 (salary) is what you earn, 現金 (cash) and 硬貨 (a coin) are how you pay, and 金額 (the amount of money), 金銭 (money in the abstract), and 金庫 (a safe) round out how money is counted, discussed, and kept secure. 金融 (finance) is the wider system all of this belongs to, and 高価 (expensive) describes what costs a lot of it.",
    extendedInsight:
      "金銭 (money, a formal/written word) and 現金 (cash, physical money in hand) overlap in meaning but differ in register — 金銭問題 ('a money problem') sounds natural in writing, while 現金で払う ('to pay in cash') is the everyday phrase you'd actually say at a shop.",
    examples: [
      {
        jp: "給料はすべて現金でもらいます。",
        romaji: "Kyuuryou wa subete genkin de moraimasu.",
        en: "I receive my whole salary in cash.",
      },
      {
        jp: "自動販売機は硬貨しか使えません。",
        romaji: "Jidouhanbaiki wa kouka shika tsukaemasen.",
        en: "The vending machine only accepts coins.",
      },
    ],
    commonMistake:
      "高価 (expensive, describing an item's price) is a na-adjective used more formally than 高い, and it's always about price — 高価な時計 ('an expensive watch') is natural, while describing a tall building as 高価 would be wrong; that's simply 高い建物.",
    rows: [
      {
        label: "salary & cash",
        terms: ["給料", "現金", "硬貨"],
      },
      {
        label: "amounts & security",
        terms: ["金額", "金庫", "金銭"],
      },
      {
        label: "finance & price",
        terms: ["金融", "高価"],
      },
    ],
  },
  {
    key: "n3-b05-business-trade",
    title: "Business, Trade & Giving Back",
    subtitle: "経営・貢献",
    insight:
      "To 経営 (manage/run) a company, you read the 景気 (business conditions) and 供給 (supply) goods to meet demand. A 広告 (advertisement) raises its 効果 (effect), lifting the 合計 (total) of sales — and a 豪華 (luxurious) product can sell for more. Some companies also 寄付 (donate) part of their profit and 貢献 (contribute) to society, or 交換 (exchange) goods with their customers.",
    extendedInsight:
      "供給 (supply, providing something needed) and 交換 (exchange, trading one thing for another) both involve giving something, but only 交換 expects something back in return — 商品を供給する ('to supply goods') just means providing them, while 商品を交換する ('to exchange goods') means swapping them for something else.",
    examples: [
      {
        jp: "会社の景気がよくなりました。",
        romaji: "Kaisha no keiki ga yoku narimashita.",
        en: "The company's business conditions improved.",
      },
      {
        jp: "広告の効果で売上が増えました。",
        romaji: "Koukoku no kouka de uriage ga fuemashita.",
        en: "Thanks to the advertisement's effect, sales increased.",
      },
    ],
    commonMistake:
      "効果 (effect, a result of some influence) and 結果 (a result in general) sound similar but aren't the same — 広告の効果 specifically credits the advertisement as the cause, while 結果 alone just names what happened without attributing a cause.",
    rows: [
      {
        label: "running a business",
        terms: ["経営", "景気", "合計", "豪華"],
      },
      {
        label: "supplying & exchanging",
        terms: ["供給", "交換"],
      },
      {
        label: "giving back & advertising",
        terms: ["寄付", "貢献", "広告", "効果"],
      },
    ],
  },
  {
    key: "n3-b05-materials-sensory",
    title: "Metal, Materials & Sensory Qualities",
    subtitle: "金属・霧",
    insight:
      "金属 (metal) and 銀 (silver) are the substances behind everyday objects like 管 (a pipe/tube) and 鎖 (a chain). 切れ (a piece/cut of cloth) and its verb 切れる (to cut well; to snap/run out) describe how such materials are worked or fail. 濃い (thick, dense) then describes the intensity of a color, a liquid, or even 霧 (fog) or 煙 (smoke).",
    extendedInsight:
      "濃い describes density along more than one axis — 濃いコーヒー ('strong coffee'), 濃い色 ('a deep color'), and 濃い霧 ('thick fog') all use the same word for how packed or intense something is, whether liquid, color, or air.",
    examples: [
      {
        jp: "今朝は霧が濃かったです。",
        romaji: "Kesa wa kiri ga kokatta desu.",
        en: "The fog was thick this morning.",
      },
      {
        jp: "工場から煙が出ています。",
        romaji: "Koujou kara kemuri ga dete imasu.",
        en: "Smoke is coming out from the factory.",
      },
    ],
    commonMistake:
      "切れる has two very different everyday senses — 'to be sharp/cut well' (このナイフはよく切れる, 'this knife cuts well') and 'to run out/snap' (電池が切れる, 'the battery has died') — context alone tells you which is meant.",
    rows: [
      {
        label: "metal & materials",
        terms: ["金属", "銀", "管", "鎖"],
      },
      {
        label: "cutting & breaking",
        terms: ["切れ", "切れる"],
      },
      {
        label: "fog, smoke & density",
        terms: ["霧", "煙", "濃い"],
      },
    ],
  },
  {
    key: "n3-b05-kyuu-homophones",
    title: "旧/級/球/休/急 — Homophones Read きゅう",
    subtitle: "きゅう の同音異義語",
    insight:
      "旧 (former), 級 (class/rank), and 球 (a ball/sphere) are three unrelated kanji that all share the on'yomi きゅう, told apart only by their very different meanings. The same reading carries into 休 (rest) and 急 (urgent/sudden) too, giving a run of everyday words — 休暇/休憩/休息 for different kinds of rest, and 急激/急速/急に for different kinds of suddenness — that all start きゅう even though none of the underlying kanji are related to each other.",
    extendedInsight:
      "休憩 (a short break/intermission, e.g. during a meeting) and 休息 (rest in the broader sense of recovering) both mean 'rest' but differ in scale — 十分間の休憩 ('a ten-minute break') is brief and specific, while 十分な休息 ('sufficient rest') describes recovering from tiredness over time.",
    examples: [
      {
        jp: "急に雨が降り出しました。",
        romaji: "Kyuu ni ame ga furidashimashita.",
        en: "It suddenly started raining.",
      },
      {
        jp: "会議の後、少し休憩しましょう。",
        romaji: "Kaigi no ato, sukoshi kyuukei shimashou.",
        en: "Let's take a short break after the meeting.",
      },
    ],
    commonMistake:
      "急激 (sudden and drastic, often about a change) and 急速 (rapid, about speed/pace) both describe fast change but emphasize different things — 急激な変化 ('a drastic sudden change') stresses how abrupt it was, while 急速な発展 ('rapid development') stresses how fast it progressed.",
    rows: [
      {
        label: "旧・級・球 — unrelated homophones",
        terms: ["旧", "級", "球"],
      },
      {
        label: "休 — kinds of rest",
        terms: ["休暇", "休憩", "休息"],
      },
      {
        label: "急 — kinds of suddenness",
        terms: ["急激", "急速", "急に"],
      },
    ],
  },
  {
    key: "n3-b05-loanwords",
    title: "Katakana Loanwords — Leisure & Everyday Life",
    subtitle: "外来語",
    insight:
      "A batch of katakana words close enough to their English source to read at sight — キャプテン (captain), キャンプ (camp), クリスマス (Christmas), and グループ (group) — plus a few worth knowing individually: グラス (a drinking glass) and クリーム (cream) name things, while クラシック (classical, as in music) and ケース (a case) describe or contain them.",
    extendedInsight:
      "グランド is a genuine trap — it can mean 'ground' (a sports ground, グランドで練習する) or 'grand,' and is even used for an electrical ground; only the surrounding sentence tells you which sense is meant.",
    examples: [
      {
        jp: "チームのキャプテンはグランドで練習しています。",
        romaji: "Chiimu no kyaputen wa gurando de renshuu shite imasu.",
        en: "The team's captain is practicing on the ground.",
      },
      {
        jp: "夏休みにキャンプに行きました。",
        romaji: "Natsuyasumi ni kyanpu ni ikimashita.",
        en: "I went camping during summer vacation.",
      },
    ],
    commonMistake:
      "クラシック usually means 'classical music' in everyday conversation, not just 'a classic' in the broad English sense — クラシックが好きです most naturally means 'I like classical music,' not 'I like classics' in general.",
    rows: [
      {
        label: "people & events",
        terms: ["キャプテン", "キャンプ", "クリスマス", "グループ"],
      },
      {
        label: "objects & containers",
        terms: ["グラス", "クリーム", "ケース"],
      },
      {
        label: "style & place",
        terms: ["クラシック", "グランド", "ゲーム"],
      },
    ],
  },
  {
    key: "n3-b05-social-manners-romance",
    title: "Social Life — Manners, Romance & the Stage",
    subtitle: "恋愛・行儀",
    insight:
      "行儀 (manners) and 器用 (skillful, dexterous) describe how gracefully someone carries themselves, while 交際 (a relationship, romantic or otherwise) and 恋/恋人 (love and a lover) describe the relationships people build. 化粧 (makeup) prepares someone for a 劇 (a play) at the 劇場 (theater), where a dramatic 光景 (scene/spectacle) might unfold onstage — and 合格 (success/passing) is the reward for effort in any of these pursuits.",
    extendedInsight:
      "恋 (romantic love, an emotion) and 恋人 (a lover, the person) share the same first kanji but aren't interchangeable — 恋をする means 'to fall in love,' while 恋人がいます means 'I have a partner'; one names a feeling, the other a person.",
    examples: [
      {
        jp: "二人は長い間、交際しています。",
        romaji: "Futari wa nagai aida, kousai shite imasu.",
        en: "The two of them have been dating for a long time.",
      },
      {
        jp: "試験に合格して、うれしかったです。",
        romaji: "Shiken ni goukaku shite, ureshikatta desu.",
        en: "I was happy to pass the exam.",
      },
    ],
    commonMistake:
      "けち (stingy, unwilling to spend money or give) is a blunt criticism, not a neutral description — calling someone けち to their face is genuinely rude, closer to 'cheapskate' than a gentle 'thrifty.'",
    rows: [
      {
        label: "romance & relationships",
        terms: ["恋", "恋人", "交際"],
      },
      {
        label: "manners & skill",
        terms: ["行儀", "器用", "けち"],
      },
      {
        label: "drama & success",
        terms: ["劇", "劇場", "化粧", "光景", "合格"],
      },
    ],
  },
  {
    key: "n3-b05-homophone-readings",
    title: "Tricky Homophones & Multiple Readings",
    subtitle: "同音異義語・複数の読み方",
    insight:
      "A cluster of small but important reading traps. 組む/汲む/酌む are all read くむ but mean completely different things — 組む is to put together or team up, 汲む is to draw or scoop (water), and 酌む is to pour/serve alcohol. 加える (to add) and 咥える (to hold in the mouth) are, confusingly, both read くわえる despite having nothing to do with each other. 下 itself carries several readings, from 下る (くだる, to descend) to 下り (くだり, a down-train).",
    extendedInsight:
      "暮らし (a lifestyle/living), 暮らす (to live, the verb), and 暮れ (dusk, or the year's end) all share the same 暮 kanji and reading family — 年の暮れ ('the end of the year') uses the same root as 一人で暮らす ('to live alone'), both pointing at how a period of time comes to a close.",
    examples: [
      {
        jp: "友達とチームを組みました。",
        romaji: "Tomodachi to chiimu o kumimashita.",
        en: "I teamed up with my friend.",
      },
      {
        jp: "田舎で静かに暮らしています。",
        romaji: "Inaka de shizuka ni kurashite imasu.",
        en: "I live quietly in the countryside.",
      },
    ],
    commonMistake:
      "加える (to add something, くわえる) and 咥える (to hold something in your mouth, also くわえる) are pure homophones with unrelated meanings — 意見を加える ('to add an opinion') and タバコを咥える ('to hold a cigarette in your mouth') sound identical but share nothing but pronunciation.",
    rows: [
      {
        label: "組む・汲む・酌む — くむ homophones",
        terms: ["組", "組合", "組む", "汲む", "酌む"],
      },
      {
        label: "加える・咥える — くわえる homophones",
        terms: ["加える", "加わる", "咥える"],
      },
      {
        label: "下 — descending & the down-train",
        terms: ["下る", "下り", "下-2"],
      },
      {
        label: "暮 — living & dusk",
        terms: ["暮らし", "暮らす", "暮れ"],
      },
    ],
  },
  {
    key: "n3-b05-everyday-verbs-hardship",
    title: "Everyday Verbs — Dislike, Hardship & Repetition",
    subtitle: "日常の動詞・苦労",
    insight:
      "A wide-ranging set of everyday verbs and expressions — disliking something (嫌う), sleeping soundly (ぐっすり), and doing something again (繰り返す) — alongside the vocabulary of struggle: 苦しい (tough/painful), 苦しむ (to suffer), and 苦労 (hardship) all share the same 苦 ('bitter, suffering') root.",
    extendedInsight:
      "苦しい (an adjective describing a state, 'this is tough') and 苦しむ (a verb describing the ongoing act of suffering, 'to suffer') are built from the same root but work differently in a sentence — 生活が苦しいです describes a hard situation, while 病気で苦しんでいます describes actively suffering through illness.",
    examples: [
      {
        jp: "同じ間違いを繰り返さないでください。",
        romaji: "Onaji machigai o kurikaesanaide kudasai.",
        en: "Please don't repeat the same mistake.",
      },
      {
        jp: "試験に落ちて、悔しかったです。",
        romaji: "Shiken ni ochite, kuyashikatta desu.",
        en: "I was frustrated after failing the exam.",
      },
    ],
    commonMistake:
      "腐る (to rot/spoil, about food) and 狂う (to go mad, or for a plan/machine to go out of order) both describe something going wrong, but only 腐る is about literal decay — 計画が狂う ('the plan goes awry') never means the plan physically rotted.",
    rows: [
      {
        label: "liking, disliking & repeating",
        terms: ["嫌う", "食う", "ぐっすり", "繰り返す", "区別", "位", "詳しい"],
      },
      {
        label: "苦 — hardship & suffering",
        terms: ["苦しい", "苦しむ", "苦労", "悔しい"],
      },
      {
        label: "going wrong",
        terms: ["腐る", "狂う"],
      },
    ],
  },
  {
    key: "n3-b05-institutions-construction",
    title: "Institutions, Construction & the Military",
    subtitle: "組織・建築",
    insight:
      "軍 (the military) and 軍隊 (troops) describe a nation's armed forces, trained through 訓練 (practice/training); 郡 (a county/district) is a different, unrelated word that happens to share the reading ぐん. 局 (an office/bureau/broadcast station) and 校舎 (a school building) name institutional places, while 建設 (construction) and 建築 (architecture) describe how such buildings come to be, and 航空 (aviation) names another way people and goods get around.",
    extendedInsight:
      "建設 (construction, the act of building something — a bridge, a system) and 建築 (architecture, the field or the resulting structure) overlap heavily but differ in scope — 建設工事 ('construction work') is about the physical process, while 建築家 ('architect') is about designing buildings as a discipline.",
    examples: [
      {
        jp: "新しい校舎が建設されています。",
        romaji: "Atarashii kousha ga kensetsu sarete imasu.",
        en: "A new school building is being constructed.",
      },
      {
        jp: "兵士たちは厳しい訓練を受けました。",
        romaji: "Heishitachi wa kibishii kunren o ukemashita.",
        en: "The soldiers underwent strict training.",
      },
    ],
    commonMistake:
      "軍 (the military as an institution) and 郡 (a county/administrative district) are exact homophones, both read ぐん — completely unrelated meanings sharing only their sound, so context (soldiers versus geography) alone tells them apart.",
    rows: [
      {
        label: "military",
        terms: ["軍", "軍隊", "訓練"],
      },
      {
        label: "places & administration",
        terms: ["郡", "局", "航空"],
      },
      {
        label: "construction",
        terms: ["建設", "建築", "校舎"],
      },
    ],
  },
  {
    key: "n3-b05-records-law-extras",
    title: "Records, Rules & Everyday Extras",
    subtitle: "記録・規則・雑多な言葉",
    insight:
      "A grab-bag of practical nouns worth knowing individually — 記入 (filling in a form), 記念 (a keepsake/commemoration), and 記録 (a record) all build on 記 ('to note down'); 機能 (function), 計算 (calculation), and 掲示 (a posted notice) describe how systems and information are organized; and 刑事 (a detective), 警告 (a warning), and 券 (a ticket) round out the vocabulary of everyday bureaucracy and caution.",
    extendedInsight:
      "記念 (a commemoration, marking something meaningful) and 記録 (a record, a factual log of what happened) both derive from 記 ('to write/note'), but 記念日 ('an anniversary') celebrates a memory while 記録を取る ('to keep a record') simply logs data — one is emotional, the other is factual.",
    examples: [
      {
        jp: "この用紙に名前を記入してください。",
        romaji: "Kono youshi ni namae o kinyuu shite kudasai.",
        en: "Please fill in your name on this form.",
      },
      {
        jp: "警察は運転手に警告しました。",
        romaji: "Keisatsu wa untenshu ni keikoku shimashita.",
        en: "The police gave the driver a warning.",
      },
    ],
    commonMistake:
      "具体 (concrete/tangible, describing a level of detail) is easy to misuse — 具体的な例 ('a concrete example') is natural, but 具体 alone as a noun for a physical object (rather than a description of detail) isn't how the word is actually used.",
    rows: [
      {
        label: "記 — noting & recording",
        terms: ["記入", "記念", "記録"],
      },
      {
        label: "function, calculation & notices",
        terms: ["機能", "計", "計算", "掲示", "経由"],
      },
      {
        label: "money & games",
        terms: ["金-2", "碁"],
      },
      {
        label: "law, caution & tickets",
        terms: ["刑事", "警告", "券", "県"],
      },
      {
        label: "time & fortune",
        terms: ["後", "近代", "幸運"],
      },
      {
        label: "concrete & physical action",
        terms: ["具体", "蹴る"],
      },
    ],
  },
  {
    key: "n3-b05-language-arts",
    title: "Language, Teaching & the Arts",
    subtitle: "言語・学問・芸術",
    insight:
      "言語 (language) is built from 句 (phrases), and 訓 (kun'yomi, the native Japanese reading of a kanji) is itself one of these pool words — naming the very reading system a learner studies. A 教授 (professor) gives a 講演 (lecture), often with 強調 (emphasis) on a point deserving 敬意 (respect), in fields ranging from language to 芸術 (the arts) — all built on a 教科書 (textbook).",
    extendedInsight:
      "教授 is a genuine double meaning — as a noun it means 'professor,' but as 教授する it's a formal verb meaning 'to instruct,' closer in register to 教える but used mostly in writing about academic subjects.",
    examples: [
      {
        jp: "有名な教授の講演を聞きました。",
        romaji: "Yuumei na kyouju no kouen o kikimashita.",
        en: "I listened to a famous professor's lecture.",
      },
      {
        jp: "先生に敬意を表します。",
        romaji: "Sensei ni keii o arawashimasu.",
        en: "I show respect to my teacher.",
      },
    ],
    commonMistake:
      "訓 (kun'yomi, the native Japanese reading of a kanji) is easy to confuse with 訓練 (training) from an unrelated set of words — despite sharing the character 訓, this 訓 alone is a linguistic term used when discussing how kanji are read, not physical practice or drilling.",
    rows: [
      {
        label: "language",
        terms: ["言語", "句", "訓"],
      },
      {
        label: "teaching & lectures",
        terms: ["教授", "教科書", "講演", "強調"],
      },
      {
        label: "respect & the arts",
        terms: ["敬意", "芸術"],
      },
    ],
  },
  {
    key: "n3-b05-cooperation-danger-extremes",
    title: "Cooperation, Danger & Going to Extremes",
    subtitle: "協力・危険・限界",
    insight:
      "強力 (powerful) and 協力 (cooperation) both begin with a character for strength but describe different kinds of it — one is about a single force, the other about combined effort. That combined effort matters most in a 競技 (a match/contest) built on 共通 (shared) goals and 共同 (joint) work — the opposite of an 攻撃 (an attack) that provokes 恐怖 (fear) and calls for 救助 (rescue).",
    extendedInsight:
      "欠陥 (a defect, a flaw built into something) and 欠点 (a fault/weakness, often about a person or plan) are close cousins, both from 欠 ('lacking') — 製品の欠陥 ('a product defect') is a design problem, while 性格の欠点 ('a personality flaw') is a weakness in someone's character; only 欠席 (absence) breaks the pattern, naming not being present at all.",
    examples: [
      {
        jp: "台風の被害者を救助しました。",
        romaji: "Taifuu no higaisha o kyuujo shimashita.",
        en: "We rescued the typhoon's victims.",
      },
      {
        jp: "この計画には大きな欠陥があります。",
        romaji: "Kono keikaku ni wa ookina kekkan ga arimasu.",
        en: "This plan has a major defect.",
      },
    ],
    commonMistake:
      "限界 (a limit, the point beyond which something can't continue) is unrelated to 逆 (the reverse/opposite) despite both sometimes describing an endpoint — 限界に達する ('to reach one's limit') describes exhaustion, while 逆に言えば ('conversely speaking') introduces an opposite viewpoint.",
    rows: [
      {
        label: "cooperation & strength",
        terms: ["協力", "強力", "共通", "共同", "競技"],
      },
      {
        label: "conflict & rescue",
        terms: ["攻撃", "恐怖", "救助"],
      },
      {
        label: "defects & absence",
        terms: ["欠陥", "欠点", "欠席"],
      },
      {
        label: "extremes & tendencies",
        terms: ["逆", "傾向", "限界", "巨大"],
      },
    ],
  },
  {
    key: "n3-b05-body-health",
    title: "Body, Health & Nervous Tension",
    subtitle: "体・健康",
    insight:
      "健康 (health) depends on the body working as it should — 筋肉 (muscle) and 血液 (blood) are the basics, 吸収 (absorption) describes how the body takes in nutrients, and 検査 (a medical examination) checks that everything's in order. 苦痛 (pain/agony) and 緊張 (nervous tension) describe when it isn't.",
    extendedInsight:
      "緊張 (nervous tension, a mental/emotional state before something stressful) and 苦痛 (physical or emotional pain, an ongoing suffering) both describe discomfort but at different moments — 面接の前に緊張します ('I get nervous before an interview') is anticipatory, while 苦痛を感じる ('to feel pain') describes something already happening.",
    examples: [
      {
        jp: "毎年、健康診断で血液検査を受けます。",
        romaji: "Maitoshi, kenkou shindan de ketsueki kensa o ukemasu.",
        en: "Every year, I get a blood test at my health checkup.",
      },
      {
        jp: "面接の前はいつも緊張します。",
        romaji: "Mensetsu no mae wa itsumo kinchou shimasu.",
        en: "I always get nervous before an interview.",
      },
    ],
    commonMistake:
      "検査 (an examination/inspection, a deliberate check) is more formal and thorough than a casual glance — 健康診断で検査を受ける ('to undergo an examination at a checkup') implies a proper medical process, not simply looking something over.",
    rows: [
      {
        label: "the body",
        terms: ["筋肉", "血液", "吸収"],
      },
      {
        label: "health & checkups",
        terms: ["健康", "検査"],
      },
      {
        label: "pain & tension",
        terms: ["苦痛", "緊張"],
      },
    ],
  },
  {
    key: "n3-b06-nation-justice",
    title: "Nation, Border & Justice",
    subtitle: "国家・公正",
    insight:
      "国 attaches to a cluster of civic nouns: 国家 (a state/nation as a political entity), 国会 (the National Diet, Japan's parliament), 国境 (the line between two countries), 国籍 (legal nationality), 国語 (a country's national language), and 国民 (its citizens). 公正 and 公平 both mean 'fair,' but 公正 leans toward 'correct by a standard' while 公平 leans toward 'even-handed, no favoritism' — 裁判 (a trial) is where that fairness is formally tested.",
    extendedInsight:
      "境 (a border/boundary in general — a mountain ridge, a line between neighborhoods) is the everyday word 国境 is built from; 差 (a difference/gap) and 異なる (to differ) describe smaller-scale variation, while 差別 (discrimination) is what happens when a difference in 国籍 or background is treated unfairly rather than neutrally.",
    examples: [
      {
        jp: "この国には多くの国籍の国民が住んでいます。",
        romaji: "Kono kuni ni wa ooku no kokuseki no kokumin ga sunde imasu.",
        en: "Many nationalities of citizens live in this country.",
      },
      {
        jp: "二つの案の差はそれほど大きくありません。",
        romaji: "Futatsu no an no sa wa sorehodo ookiku arimasen.",
        en: "The difference between the two proposals isn't that big.",
      },
    ],
    commonMistake:
      "公正 and 公平 both translate as 'fair' and are easy to swap, but 公正な裁判 ('a fair/just trial') calls for 公正's sense of correctness by a standard, while splitting something evenly between people (公平に分ける, 'to divide fairly') calls for 公平's sense of equal treatment.",
    rows: [
      {
        label: "nation & civic institutions",
        terms: ["国家", "国会", "国境", "国籍", "国語", "国民"],
      },
      {
        label: "fairness, difference & justice",
        terms: ["公正", "公平", "裁判", "差", "境", "差別", "異なる"],
      },
    ],
  },
  {
    key: "n3-b06-homophone-verbs",
    title: "Same Reading, Different Kanji — こえる/こす and さす Verbs",
    subtitle: "同音異字の動詞",
    insight:
      "Two pairs of verbs share a reading but split their meaning across different kanji. 越える/越す both mean 'to cross over' a physical or temporal boundary, while 超える/超す mean 'to exceed' a number or limit. Separately, さす has at least five common kanji: 刺す (to stab/sting), 指す (to point at/indicate), 挿す (to insert/stick in), 注す (to pour, e.g. a drink), and 射す (light to shine/strike) — with 刺さる as the intransitive partner of 刺す, 'to be stuck/embedded.'",
    extendedInsight:
      "越える/越す and 超える/超す aren't always interchangeable in practice — a border or mountain almost always takes 越える (国境を越える), while a number or expectation almost always takes 超える (予想を超える, 'to exceed expectations') — so it helps to memorize each by the kind of noun it pairs with rather than the two kanji as pure synonyms.",
    examples: [
      {
        jp: "山を越えると、海が見えます。",
        romaji: "Yama o koeru to, umi ga miemasu.",
        en: "When you cross the mountain, you can see the sea.",
      },
      {
        jp: "予算を超える買い物はできません。",
        romaji: "Yosan o koeru kaimono wa dekimasen.",
        en: "You can't shop beyond the budget.",
      },
    ],
    commonMistake:
      "指す (to point at, indicating direction or an intended meaning) is often confused with 刺す (to stab/sting) since both are さす — 「これを指します」points at something, while 「これを刺します」would mean stabbing it, a very different claim.",
    rows: [
      {
        label: "越える/超える/越す/超す — crossing vs. exceeding",
        terms: ["越える", "超える", "越す", "超す"],
      },
      {
        label: "さす — five kanji, one sound",
        terms: ["刺す", "指す", "挿す", "注す", "射す", "刺さる"],
      },
    ],
  },
  {
    key: "n3-b06-crime-danger",
    title: "Crime, Accidents & Reacting to Trouble",
    subtitle: "事件と事故",
    insight:
      "強盗 (robbery/burglary) and 殺す (to kill) name serious crimes, while 転ぶ (to fall down) names an everyday accident — all three describe something going wrong. 避ける (to avoid, to dodge, to ward off) and 逆らう (to go against, to oppose, to disobey) describe how a person responds to danger or authority, and 叫ぶ (to shout/cry out) is the instinctive reaction when something goes wrong.",
    extendedInsight:
      "避ける covers both literal dodging (車を避ける, 'to dodge a car') and abstract avoidance (人を避ける, 'to avoid a person'), while 逆らう is specifically about going against a direction, current, or someone's will (親に逆らう, 'to defy one's parents') — the two aren't interchangeable even though both can sound like 'avoiding conflict.'",
    examples: [
      {
        jp: "危ないと思って、大きな声で叫びました。",
        romaji: "Abunai to omotte, ookina koe de sakebimashita.",
        en: "I thought it was dangerous, so I shouted loudly.",
      },
      {
        jp: "道で転ばないように気をつけてください。",
        romaji: "Michi de korobanai you ni ki o tsukete kudasai.",
        en: "Please be careful not to fall down in the street.",
      },
    ],
    commonMistake:
      "避ける takes を for the thing being avoided (車を避ける, 'to dodge the car'), not に — learners used to 逆らう's pattern (人に逆らう, 'to defy someone,' which does take に) sometimes carry that に over to 避ける by mistake.",
    rows: [
      {
        label: "crime & accident",
        terms: ["強盗", "殺す", "転ぶ"],
      },
      {
        label: "reacting",
        terms: ["叫ぶ", "避ける", "逆らう"],
      },
    ],
  },
  {
    key: "n3-b06-daily-objects",
    title: "Everyday Objects, Tears & Spills",
    subtitle: "日用品",
    insight:
      "A handful of concrete nouns — 黒板 (blackboard), 小包 (a parcel/package), 琴 (the koto, a traditional Japanese harp), 小屋 (a hut/shed), 座席 (a seat), and 札 (a bill/note, or a written tag) — describe common objects, while 裂く (to tear/split), こぼす (to spill something), こぼれる (for something to spill/overflow on its own), and 塵 (garbage/litter/dust) describe the small messes and mishaps that happen around them.",
    extendedInsight:
      "こぼす and こぼれる form a transitive/intransitive pair, the same kind of distinction that 開ける/開く and similar pairs make elsewhere in the language: 水をこぼす ('to spill water,' you did it) versus 水がこぼれる ('the water spills/overflows,' it just happens).",
    examples: [
      {
        jp: "コップの水をこぼしてしまいました。",
        romaji: "Koppu no mizu o koboshite shimaimashita.",
        en: "I accidentally spilled the water from the cup.",
      },
      {
        jp: "座席の下に小包が置いてありました。",
        romaji: "Zaseki no shita ni kozutsumi ga oite arimashita.",
        en: "A parcel had been placed under the seat.",
      },
    ],
    commonMistake:
      "こぼす needs を and a person doing the spilling (私がジュースをこぼした, 'I spilled the juice'), while こぼれる needs が and no one doing it on purpose (ジュースがこぼれた, 'the juice spilled') — using こぼす when nobody actually caused the spill sounds like a confession.",
    rows: [
      {
        label: "objects",
        terms: ["黒板", "小包", "琴", "小屋", "座席", "札"],
      },
      {
        label: "tears, spills & litter",
        terms: ["裂く", "こぼす", "こぼれる", "塵"],
      },
    ],
  },
  {
    key: "n3-b06-work-production",
    title: "Work, Production & Taking Action",
    subtitle: "仕事と制作",
    insight:
      "作 attaches to the vocabulary of making things: 作業 (a work task/operation), 作品 (a finished work, e.g. of art), 作家 (a writer/author), 作曲 (composing music), and 作物 (a crop, something grown) all build around production, while 工場 (a factory/plant) and 材料 (raw materials/ingredients) name where and what that production happens with. 構成 (composition/organization), 候補 (a candidate, for a job or position), and 考慮 (consideration, weighing something before deciding) describe the planning that comes before 行動 (taking action) — and 克服 (to overcome a difficulty) describes pushing through when the plan meets resistance.",
    extendedInsight:
      "高速 ('high speed') is most often met as part of a compound like 高速道路 ('highway,' literally 'high-speed road') rather than standing alone — worth learning together with 工場/材料 since factories and their supply chains are exactly the everyday context where 'high-speed' transport comes up.",
    examples: [
      {
        jp: "新しい候補についてよく考慮してください。",
        romaji: "Atarashii kouho ni tsuite yoku kouryo shite kudasai.",
        en: "Please give careful consideration to the new candidate.",
      },
      {
        jp: "この作品の材料はすべて工場から届きました。",
        romaji: "Kono sakuhin no zairyou wa subete kouba kara todokimashita.",
        en: "All the materials for this work arrived from the workshop.",
      },
    ],
    commonMistake:
      "作業 (a concrete work task, like assembly-line work) and 行動 (any action or conduct, not necessarily work) are easy to blur — 工場での作業 ('factory work') is a specific job, while 彼の行動 ('his conduct') could describe anything he does, work or not.",
    rows: [
      {
        label: "making & producing",
        terms: ["工場", "作業", "作品", "作家", "作曲", "作物", "材料"],
      },
      {
        label: "planning & acting",
        terms: ["構成", "候補", "考慮", "行動", "克服", "高速"],
      },
    ],
  },
  {
    key: "n3-b06-personal-fulfillment",
    title: "Satisfaction, Struggle & Growing Into Something",
    subtitle: "満足と成長",
    insight:
      "幸福 (happiness) and 幸い (fortunate/lucky) share the character 幸, while 満足 (satisfaction) and 満ちる (to become full/fully mature) share 満 — both pairs describe a sense of things going well, alongside 才能 (talent) and 財産 (property/fortune) as things a 個人 (an individual) might be lucky enough to have, with a 後輩 (a junior colleague) perhaps looking up to them. On the other side, 混雑 (congestion/crowding), 混乱 (chaos/confusion), and 困難 (difficulty/hardship) name the obstacles that stand between someone and that satisfaction.",
    extendedInsight:
      "芽 (a sprout) and 結ぶ (which can mean 'to tie/bind' but also 'to bear fruit,' 実を結ぶ) form a small growth metaphor together with 満ちる ('to become full/mature') — a plan that 実を結ぶ ('bears fruit') has 満ちる's sense of reaching completion, and 夢中 ('absorbed, crazy about something') describes being so focused on that growth that nothing else registers.",
    examples: [
      {
        jp: "長い努力がついに実を結びました。",
        romaji: "Nagai doryoku ga tsuini mi o musubimashita.",
        en: "The long effort finally bore fruit.",
      },
      {
        jp: "彼は今、新しい趣味に夢中です。",
        romaji: "Kare wa ima, atarashii shumi ni muchuu desu.",
        en: "He's absorbed in a new hobby right now.",
      },
    ],
    commonMistake:
      "混雑 (congestion — too many people/things in one place, like a crowded train) and 混乱 (chaos — a breakdown of order) both start with 混 but describe different problems; a crowded station is 混雑 even if everyone is calm, while 混乱 implies people don't know what's going on.",
    rows: [
      {
        label: "satisfaction, talent & fortune",
        terms: ["幸福", "幸い", "満足", "才能", "財産", "個人", "後輩"],
      },
      {
        label: "difficulty & disorder",
        terms: ["混雑", "混乱", "困難"],
      },
      {
        label: "growth & fulfillment",
        terms: ["結ぶ", "満ちる", "芽", "夢中"],
      },
    ],
  },
  {
    key: "n3-b06-nature-food",
    title: "Nature, Crops & the Kitchen",
    subtitle: "自然と食材",
    insight:
      "氷 (ice) and 凍る (to freeze) describe cold turning water solid, the opposite of 燃える (to burn). 砂漠 (desert) and 桜 (cherry blossom) are two very different faces of nature, while 小麦 (wheat), 穀物 (grain/cereal), 豆 (beans), 胡椒 (pepper), and 酒 (alcohol/sake) are things grown or made from that nature and eaten or drunk. 粉 (flour/powder), 蒸す (to steam), and 剥く (to peel) describe preparing them in the kitchen, and 盛り (a helping/serving, or the peak of something in season) ties food and season together.",
    extendedInsight:
      "盛り's core meaning is 'a peak' — a full serving on a plate and the height of cherry-blossom season (桜が盛りです, 'the cherry blossoms are at their peak') are the same word applied to two very different kinds of fullness.",
    examples: [
      {
        jp: "氷が溶ける前に飲んでください。",
        romaji: "Koori ga tokeru mae ni nonde kudasai.",
        en: "Please drink it before the ice melts.",
      },
      {
        jp: "桜は今、盛りです。",
        romaji: "Sakura wa ima, sakari desu.",
        en: "The cherry blossoms are at their peak right now.",
      },
    ],
    commonMistake:
      "凍る (for something to freeze on its own, intransitive) is sometimes used where a transitive verb is needed — 'to freeze food' is 凍らせる, not 凍る; 湖が凍る ('the lake freezes') is correct exactly because nobody is doing the freezing.",
    rows: [
      {
        label: "hot & cold nature",
        terms: ["氷", "凍る", "燃える", "砂漠", "桜"],
      },
      {
        label: "crops & ingredients",
        terms: ["小麦", "穀物", "豆", "胡椒", "酒", "粉"],
      },
      {
        label: "preparing food",
        terms: ["盛り", "蒸す", "剥く"],
      },
    ],
  },
  {
    key: "n3-b06-body-health",
    title: "Body & Health",
    subtitle: "体と健康",
    insight:
      "腰 (the hip/lower back) and 胸 (the chest) name body parts, while 呼吸 (breathing/respiration) describes what the chest does, and 骨折 (a bone fracture) and 虫歯 (a cavity/tooth decay) name two common injuries. 診る (to examine a patient — a different verb from 見る, 'to see,' even though both are read みる) is what a doctor does about them, and 蒸し暑い (hot and humid) is a common everyday condition that still affects how the body feels.",
    extendedInsight:
      "診る and 見る are true homophones that split by context: 見る is any kind of looking, but 診る is reserved specifically for a doctor examining a patient (医者に診てもらう, 'to be examined by a doctor') — using 見る there isn't wrong grammatically, but it loses the specifically medical nuance.",
    examples: [
      {
        jp: "呼吸が苦しいときは、すぐ医者に診てもらいましょう。",
        romaji: "Kokyuu ga kurushii toki wa, sugu isha ni mite moraimashou.",
        en: "When breathing is difficult, let's see a doctor right away.",
      },
      {
        jp: "蒸し暑い日は腰が痛くなります。",
        romaji: "Mushiatsui hi wa koshi ga itaku narimasu.",
        en: "On humid days, my lower back starts to hurt.",
      },
    ],
    commonMistake:
      "診る and 見る share a reading but aren't interchangeable — 診る is reserved for a doctor's examination (医者が患者を診る), while ordinary looking at anything else, even a body part, always stays 見る (自分の手を見る, 'to look at one's own hand').",
    rows: [
      {
        label: "body & breathing",
        terms: ["腰", "呼吸", "胸", "蒸し暑い"],
      },
      {
        label: "injury & examination",
        terms: ["虫歯", "骨折", "診る"],
      },
    ],
  },
  {
    key: "n3-b06-time-superlatives",
    title: "This Time, From Now On & the 最 Superlatives",
    subtitle: "今回と最",
    insight:
      "今回 ('this time,' the current instance of something recurring), 今後 ('from now on'), and 今日 ('today,' or in formal writing 'the present day') anchor a statement in time, while 昨 ('last ~,' as in 昨年 'last year') looks backward. 最 ('most') attaches to a further set of extremes here: 最高 (highest/best), 最低 (lowest/worst), 最終 (last/final), and 最中 (in the very middle of something) — and 際 ('on the occasion of,' or simply 'when/at the time of') is the formal connector that often introduces the moment these superlatives describe.",
    extendedInsight:
      "最中 is unusual among the 最 words because it doesn't rank something at an extreme — it means 'right in the middle,' as in 食事の最中に ('in the middle of a meal') — so while 最高/最低/最終 all answer 'how extreme,' 最中 answers 'when, relative to the middle.'",
    examples: [
      {
        jp: "今後はもっと注意します。",
        romaji: "Kongo wa motto chuui shimasu.",
        en: "From now on, I'll be more careful.",
      },
      {
        jp: "電話をした際、彼は食事の最中でした。",
        romaji: "Denwa o shita sai, kare wa shokuji no saichuu deshita.",
        en: "When I called, he was in the middle of a meal.",
      },
    ],
    commonMistake:
      "最終 (last in a sequence, like 最終電車 'the last train') and 最低 (worst/lowest, a value judgment) both sound negative in English translation but aren't related — the last train isn't a bad train, so don't reach for 最低 when 最終 is what's meant.",
    rows: [
      {
        label: "anchoring in time",
        terms: ["今回", "今後", "今日", "昨", "際"],
      },
      {
        label: "最 superlatives",
        terms: ["最高", "最終", "最中", "最低"],
      },
    ],
  },
  {
    key: "n3-b06-communication-relationships",
    title: "Misunderstandings, Preferences & Invitations",
    subtitle: "誤解と好み",
    insight:
      "誤解 (a misunderstanding) is what 語学 (language study) tries to prevent, and 諺 (a proverb/saying) is language distilled into a fixed, shared meaning — get one wrong and you risk exactly the 誤解 this cluster starts with. 好み (a liking/taste) and 好む (to like/prefer, the verb form) describe personal preference, 誘う (to invite someone along, or to tempt) is how you act on shared preferences with other people, and 断る (to refuse/decline) is the other side of that invitation. 故郷 (one's hometown), 婚約 (an engagement), 支える (to support, to hold up), and 味方 (an ally/supporter) round out the people and places someone stays connected to.",
    extendedInsight:
      "断る isn't rude by default — declining an invitation with 断る plus a reason is the normal, polite way to say no in Japanese; the rudeness comes from refusing without any softening, not from the verb itself.",
    examples: [
      {
        jp: "田中さんを国語の授業に誘いましたが、断られました。",
        romaji:
          "Tanaka-san o kokugo no jugyou ni sasoimashita ga, kotowararemashita.",
        en: "I invited Tanaka to the Japanese-language class, but I was turned down.",
      },
      {
        jp: "友達はいつも私の味方で、支えてくれます。",
        romaji: "Tomodachi wa itsumo watashi no mikata de, sasaete kuremasu.",
        en: "My friend is always on my side and supports me.",
      },
    ],
    commonMistake:
      "好み (a noun, 'one's taste,' as in これは私の好みです 'this suits my taste') and 好む (the verb 'to prefer,' as in 甘いものを好む 'to prefer sweet things') are easy to mix up in a sentence — 好み never takes an object with を, while 好む always does.",
    rows: [
      {
        label: "misunderstanding & language",
        terms: ["誤解", "語学", "諺", "断る"],
      },
      {
        label: "preference & invitation",
        terms: ["好み", "好む", "誘う"],
      },
      {
        label: "connections",
        terms: ["故郷", "婚約", "支える", "味方"],
      },
    ],
  },
  {
    key: "n3-b06-expressions-hypothetical",
    title: "Everyday Expressions, Degree Words & 'If'",
    subtitle: "表現と仮定",
    insight:
      "A grab-bag of function words that show up constantly in conversation: greetings (こんにちは, ごめんなさい), degree words (極 'extremely,' こんなに 'to this extent,' ざっと 'roughly,' さっぱり 'completely, refreshingly'), the topic-switching さて ('now then…') and the plural これら ('these'), and a family of hypothetical words — 万一 ('in the unlikely event that'), もしも and もしかすると (both softer versions of 'if/perhaps') — plus 寧ろ ('rather, instead') and 滅多に ('rarely,' almost always with a negative verb).",
    extendedInsight:
      "もしも, もしかすると, and 万一 all soften a claim, but by different degrees — もしも is a plain, neutral 'if'; もしかすると leans toward 'perhaps, there's a chance that…'; and 万一 specifically flags a low-probability, often unwelcome possibility, so it pairs naturally with cautionary sentences.",
    examples: [
      {
        jp: "万一雨が降ったら、試合は中止です。",
        romaji: "Man'ichi ame ga futtara, shiai wa chuushi desu.",
        en: "If it happens to rain, the match is cancelled.",
      },
      {
        jp: "掃除をしたら、部屋がさっぱりしました。",
        romaji: "Souji o shitara, heya ga sappari shimashita.",
        en: "After cleaning, the room felt completely refreshed.",
      },
    ],
    commonMistake:
      "滅多に almost always needs a negative verb at the end of the sentence (滅多に行きません, 'I rarely go') — dropping the negative and saying 滅多に行きます sounds wrong to a native speaker's ear, even though nothing else in the sentence is off.",
    rows: [
      {
        label: "greetings & everyday words",
        terms: ["こんにちは", "ごめんなさい", "さて", "これら"],
      },
      {
        label: "degree",
        terms: ["極", "こんなに", "ざっと", "さっぱり", "寧ろ", "滅多に"],
      },
      {
        label: "hypothetical",
        terms: ["万一", "もしも", "もしかすると"],
      },
    ],
  },
  {
    key: "n3-b06-katakana-loanwords",
    title: "Everyday Loanwords",
    subtitle: "外来語",
    insight:
      "A set of everyday katakana loanwords borrowed from English: コーチ (coach), ゴール (goal), メンバー (member), and サービス (service) come from sports and organizations; コード (code, cord, or a musical chord — one loanword covering three unrelated English words), サイン (a signature/autograph, or a mathematical sine), メモ (a memo/note), ミス (a mistake, or 'Miss'), and ミルク (milk) round out words you'll see written in katakana far more often than with any kanji equivalent.",
    extendedInsight:
      "コード and サイン are each true homographs in Japanese the way they are in English — コード could mean an electrical cord, a musical chord, or a code, and サイン could mean a signature or the trigonometric sine — context alone decides which, so it's worth learning them the same way you'd learn an English homograph, by the situation rather than a single fixed meaning.",
    examples: [
      {
        jp: "新しいコーチがチームのメンバーにメモを渡しました。",
        romaji:
          "Atarashii koochi ga chiimu no menbaa ni memo o watashimashita.",
        en: "The new coach handed the team members a memo.",
      },
      {
        jp: "サインをするときにミスをしてしまいました。",
        romaji: "Sain o suru toki ni misu o shite shimaimashita.",
        en: "I made a mistake while signing.",
      },
    ],
    commonMistake:
      "ミス (a mistake/error, from English 'miss') is common in casual speech, but a formal written report usually prefers a plain kanji word for 'mistake' instead — ミス reads as slightly casual, closer to how 'miss' sounds in spoken English.",
    rows: [
      {
        label: "sports & organizations",
        terms: ["コーチ", "ゴール", "メンバー", "サービス"],
      },
      {
        label: "everyday objects & homographs",
        terms: ["コード", "サイン", "メモ", "ミス", "ミルク"],
      },
    ],
  },
  {
    key: "n3-b06-word-patterns",
    title: "Word-Building Patterns — 無, Homographs & Double Readings",
    subtitle: "語の仕組み",
    insight:
      "無 ('nothing, zero') is both a standalone word and a productive prefix: 無視 (to disregard, literally 'no looking'), 無駄 (futility/uselessness, 'no gain'), and 無料 (free of charge, 'no fee') all build outward from the same idea of absence. Separately, 丸 and 円 are two different kanji that can both be read まる and both mean 'circle' — and まるで ('just like, as if') grew out of 丸 plus で. 身 and 実, and 文字 (read もじ) and its formal counterpart (read もんじ), are further pairs where either the kanji or the reading repeats but the word doesn't stay fixed.",
    extendedInsight:
      "身 (the body, or 'oneself,' as in 身を守る 'to protect oneself') and 実 (a fruit, seed, or 'the real substance' of something) are unrelated words that simply happen to share the reading み — a reminder that in Japanese, matching sound never guarantees matching meaning.",
    examples: [
      {
        jp: "このサービスは無料です。",
        romaji: "Kono saabisu wa muryou desu.",
        en: "This service is free of charge.",
      },
      {
        jp: "丸いテーブルはまるで太陽のようです。",
        romaji: "Marui teeburu wa marude taiyou no you desu.",
        en: "The round table looks just like the sun.",
      },
    ],
    commonMistake:
      "文字 (もじ) and its more formal reading (もんじ, used in set phrases like 文字通り 'literally') aren't different words — they're the same word with two readings, so don't treat the formal reading as a separate vocabulary item to memorize a new meaning for; the meaning is identical, only the register changes.",
    rows: [
      {
        label: "無 — the prefix of absence",
        terms: ["無", "無視", "無駄", "無料"],
      },
      {
        label: "circle & 'just like'",
        terms: ["丸", "円-2", "まるで"],
      },
      {
        label: "shared readings, different words",
        terms: ["身", "実", "文字", "文字-2"],
      },
    ],
  },
  {
    key: "n3-b06-meeting-facing-applying",
    title: "Facing, Meeting & Applying",
    subtitle: "向くと面接",
    insight:
      "向かい (across from/opposite), 向く (to face), and 向ける (to turn something toward/point it at) all build on the idea of direction, and 迎え (going to meet/pick someone up) and 見送り (seeing someone off) are the two bookends of a visit — the greeting and the farewell. That same idea of facing someone formally continues into 面接 (a job interview, literally 'meeting face to face') — built on 面 (face/surface), which also gives 面倒 (trouble, bother) — and 申し込む (to apply for something) and 免許 (a license/permit) are the paperwork side of that same process, with 申し訳 (an apology/excuse) covering what you say if it goes wrong.",
    extendedInsight:
      "面 (face, surface) and 綿 (cotton) are unrelated words that both read めん — 面 shows up constantly in compounds (面接, 面倒), while 綿 stays mostly literal, describing the plant or the fabric, so context makes the two easy to tell apart despite the shared sound.",
    examples: [
      {
        jp: "来週、面接のために会社に申し込みました。",
        romaji: "Raishuu, mensetsu no tame ni kaisha ni moushikomimashita.",
        en: "Next week, I applied to the company for an interview.",
      },
      {
        jp: "空港まで迎えに行って、帰りは見送りました。",
        romaji: "Kuukou made mukae ni itte, kaeri wa miokurimashita.",
        en: "I went to the airport to meet them, and saw them off on their return.",
      },
    ],
    commonMistake:
      "面倒 (trouble/bother) has nothing to do with 面接 (an interview) beyond sharing the character 面 — learners sometimes assume a compound relationship between the two that doesn't actually exist; each word's meaning has to be learned on its own.",
    rows: [
      {
        label: "direction & visits",
        terms: ["向かい", "向く", "向ける", "迎え", "見送り"],
      },
      {
        label: "meeting formally",
        terms: ["面", "面接", "面倒", "綿"],
      },
      {
        label: "applying",
        terms: ["申し込む", "申し訳", "免許"],
      },
    ],
  },
  {
    key: "n3-b06-mei-title",
    title: "Name, Command & Purpose — the 名/命/目 Words",
    subtitle: "名前と命令と目的",
    insight:
      "名 (name) and 命 (life, also read めい in these compounds) both contribute to a small cluster of 'status' words: 名刺 (a business card), 名詞 (a noun, grammatically), and 名人 (a master/expert) come from 名, while 命じる (to order/command, the verb) and 命令 (an order/command, the noun) come from 命. 目的 (a purpose/goal) and 目標 (an objective/target, more concrete than 目的) share 目 ('eye,' extended to 'aim'), and 目上 (a person of higher status, a senior) uses that same character in a completely different, social sense.",
    extendedInsight:
      "目的 and 目標 are often taught as synonyms but differ in concreteness — 目的 is the underlying purpose or reason ('why'), while 目標 is the measurable target you set on the way there ('how much') — a plan usually has one 目的 and several 目標 along the way.",
    examples: [
      {
        jp: "上司が新しい目標を命じました。",
        romaji: "Joushi ga atarashii mokuhyou o meijimashita.",
        en: "My boss ordered a new target.",
      },
      {
        jp: "彼は料理の名人です。",
        romaji: "Kare wa ryouri no meijin desu.",
        en: "He's a master of cooking.",
      },
    ],
    commonMistake:
      "目上 (a senior/person of higher status) describes a relationship, not a location — it doesn't mean 'above the eyes' or anything literal; learners parsing it kanji-by-kanji sometimes miss that the whole compound is a fixed social term, best memorized as a single word.",
    rows: [
      {
        label: "name & status",
        terms: ["名刺", "名詞", "名人"],
      },
      {
        label: "command",
        terms: ["命じる", "命令"],
      },
      {
        label: "aim & seniority",
        terms: ["目的", "目標", "目上"],
      },
    ],
  },
  {
    key: "n3-b06-judgment-quality",
    title: "Judging People & Things — Protecting, Admitting & Praising",
    subtitle: "判断と評価",
    insight:
      "守る (to protect, or to abide by rules) and 認める (to recognize/admit, or to approve) describe two ways of responding to a situation with judgment, while 迷う (to be perplexed, to lose one's way) and 迷惑 (trouble/annoyance caused to someone) share 迷 and describe the opposite — confusion and its cost to others. 見事 (splendid, impressively well done), 魅力 (charm, appeal), 明確 (clear, definite), 密 (dense, close/thick), and 妙 (strange, unusual) are all ways of describing a quality once you've made up your mind about it.",
    extendedInsight:
      "迷う describes your own confusion (道に迷う, 'to lose one's way'), while 迷惑 describes confusion or trouble you cause someone else (迷惑をかける, 'to cause someone trouble') — the shared 迷 kanji marks both as forms of 'going astray,' but one is about you and the other is about your effect on others.",
    examples: [
      {
        jp: "彼女のダンスは見事でした。",
        romaji: "Kanojo no dansu wa migoto deshita.",
        en: "Her dance was splendid.",
      },
      {
        jp: "どちらを選ぶべきか迷っています。",
        romaji: "Dochira o erabu beki ka mayotte imasu.",
        en: "I'm torn about which one to choose.",
      },
    ],
    commonMistake:
      "認める can mean both 'to notice/recognize' (存在を認める, 'to acknowledge the existence of') and 'to approve' (許可を認める, 'to grant permission') — in a sentence about permission, make sure context makes clear which sense is meant, since the two are easy to conflate in translation.",
    rows: [
      {
        label: "responding with judgment",
        terms: ["守る", "認める", "迷う", "迷惑"],
      },
      {
        label: "describing a quality",
        terms: ["見事", "魅力", "明確", "密", "妙"],
      },
    ],
  },
  {
    key: "n3-b06-places-casual",
    title: "Places, Visits & Casual Everyday Words",
    subtitle: "場所と日常",
    insight:
      "都 (a capital city, or 'city' more generally) and 未来 (the future) both describe somewhere you might be heading — one in space, one in time — while 明後日 (the day after tomorrow) pins down a specific near-future date. 見舞い (a sympathy visit, checking on someone who's sick or in trouble) and 土産 (a souvenir, traditionally brought back for others after a trip) are two customs built around visiting people. ママ (an informal 'mom'), 毛布 (a blanket), 飯 (a casual word for 'meal, food'), and 持ち上げる (to lift/raise, or to flatter someone) round out a set of everyday, informal words.",
    extendedInsight:
      "飯 is markedly more casual than the polite ご飯 — both mean 'meal/rice,' but bare 飯 shows up in casual speech among family or friends, while ご飯 is the neutral, polite default suitable anywhere; using bare 飯 in a formal setting can sound blunt.",
    examples: [
      {
        jp: "友達のお見舞いに行って、お土産を渡しました。",
        romaji: "Tomodachi no omimai ni itte, omiyage o watashimashita.",
        en: "I went to visit my sick friend and gave them a souvenir.",
      },
      {
        jp: "明後日、未来の仕事について話します。",
        romaji: "Myougonichi, mirai no shigoto ni tsuite hanashimasu.",
        en: "The day after tomorrow, I'll talk about future work.",
      },
    ],
    commonMistake:
      "土産 is almost always said with the polite お土産 in everyday speech (bare 土産 sounds abrupt) — the same pattern as 飯/ご飯, where the お・ご prefix isn't optional politeness so much as the version people actually say out loud.",
    rows: [
      {
        label: "place & time",
        terms: ["都", "未来", "明後日"],
      },
      {
        label: "visiting customs",
        terms: ["見舞い", "土産"],
      },
      {
        label: "casual everyday words",
        terms: ["ママ", "毛布", "飯", "持ち上げる"],
      },
    ],
  },
  {
    key: "n3-b07-people-society",
    title: "People, Society & Everyday Communication",
    subtitle: "人・社会",
    insight:
      "者 (もの, 'a person') and 物事 (ものごと, 'things in general') share the もの root that also gives 物語 ('a tale, story') and 物音 ('a sound, noise') — もの is the great catch-all noun for anything concrete, whether a person, a thing, or a sound. Zoomed out to the group, 世の中 ('society, the world') and 我々 ('we', a formal register) describe people collectively, while 話題 ('a topic') and 悪口 ('an insult, bad-mouthing') describe what people do when they talk about each other.",
    extendedInsight:
      "老人 ('an old person') and 縁 ('a bond, tie, connection') round out this set as two more words for how people relate to a wider community — 縁 in particular carries a sense of fate, as in 縁がある ('to have a connection, to be fated to meet'), not just a neutral relationship. Written communication gets its own small vocabulary too: 郵便 ('mail, the postal service') is what carries a letter, 宛てる ('to address a letter to someone') is how you mark who it's for, and 文句 ('a complaint') is often what ends up inside one.",
    examples: [
      {
        jp: "彼は世の中のことをよく知っている。",
        romaji: "Kare wa yononaka no koto o yoku shitte iru.",
        en: "He knows a lot about the world.",
      },
      {
        jp: "手紙を彼に宛てて出した。",
        romaji: "Tegami o kare ni atete dashita.",
        en: "I addressed the letter to him and sent it.",
      },
    ],
    commonMistake:
      "悪口 is read わるくち, not あくこう — even though 悪 alone ('evil, vice') is read あく, 口 keeps its native-Japanese reading here rather than switching to a Sino-Japanese compound reading.",
    rows: [
      {
        label: "people & things (もの)",
        terms: ["者", "物音", "物語", "物事"],
      },
      {
        label: "society & relationships",
        terms: ["世の中", "話題", "悪口", "我々", "老人", "縁"],
      },
      {
        label: "mail & complaints",
        terms: ["郵便", "文句", "宛てる", "よろしくかん", "読み"],
      },
    ],
  },
  {
    key: "n3-b07-homophone-families",
    title: "Homophone Kanji Families — One Reading, Several Kanji",
    subtitle: "同音異字",
    insight:
      "N3 vocabulary is full of short, single-kanji words that share exactly the same reading but come from different kanji with unrelated meanings — a trap for anyone reading by ear alone. もと covers three separate ideas: 元 ('origin, formerly'), 基 ('a basis, foundation'), and 素 ('a raw, prime element'), and all three combine in 基づく ('to be based on') once a verb ending is attached.",
    extendedInsight:
      "The same pattern repeats with かく (欠く 'to lack', 角 'an angle', 核 'a nucleus, core', 格 'status, a grammatical case'), い (異 'a difference, objection', 意 'will, intention', 医院 'a clinic', 粋 'refined style', 一帯 'a whole area', 衣料 'clothing'), and やく (役 'a role', 約 'approximately', 訳 'a translation', with 訳す 'to translate' and 役割 'an assigned role or duty' built from the first two). Reading Japanese fluently means learning to tell these apart by kanji shape, not by sound.",
    examples: [
      {
        jp: "この計画は事実に基づいている。",
        romaji: "Kono keikaku wa jijitsu ni motozuite iru.",
        en: "This plan is based on facts.",
      },
      {
        jp: "彼は医院で働いている。",
        romaji: "Kare wa iin de hataraite iru.",
        en: "He works at a clinic.",
      },
    ],
    commonMistake:
      "訳 (やく, 'a translation') and 約 (やく, 'approximately') are easy to mix up in speech since they sound identical — 訳がわからない ('I don't understand the reason') has nothing to do with 約100人 ('about 100 people'), even though both start with やく.",
    rows: [
      {
        label: "もと — origin & basis",
        terms: ["元", "基", "素", "基づく"],
      },
      {
        label: "かく — angle, lack & status",
        terms: ["欠く", "角-2", "核", "格"],
      },
      {
        label: "い — will, difference & clinic",
        terms: ["異", "意", "医院", "粋", "一帯", "衣料"],
      },
      {
        label: "やく — role, translation & approximation",
        terms: ["役", "約", "訳", "訳す", "役割"],
      },
    ],
  },
  {
    key: "n3-b07-housing-money",
    title: "Housing, Rent & Money Matters",
    subtitle: "住まい・お金",
    insight:
      "家賃 ('rent') is what you pay to live somewhere, whether a private room, a 宿 ('inn, lodging') for travelers, or a 寮 ('dormitory') for students — each with its own 屋根 ('roof') overhead and 床 ('floor') underfoot. Paying for anything beyond housing brings in 料金 ('a fee, a fare') and, when you're abroad, 両替 ('currency exchange').",
    extendedInsight:
      "余分 and 余裕 both describe 'extra' but point in different directions: 余分 is unwanted excess, as in 余分な物 ('unnecessary extra stuff'), while 余裕 is comfortable room to spare, whether of time, money, or patience, as in 時間に余裕がある ('to have time to spare'). 豊か ('abundant, wealthy') describes a state with plenty of that kind of room built in.",
    examples: [
      {
        jp: "この部屋の家賃は高い。",
        romaji: "Kono heya no yachin wa takai.",
        en: "This room's rent is high.",
      },
      {
        jp: "時間に余裕があるので、ゆっくり行きましょう。",
        romaji: "Jikan ni yoyuu ga aru node, yukkuri ikimashou.",
        en: "Since we have plenty of time, let's go slowly.",
      },
    ],
    commonMistake:
      "余裕 sounds positive and 余分 sounds neutral to negative, so calling someone's plan 余分がある ('there's excess') instead of 余裕がある ('there's comfortable room to spare') can come across as criticism instead of a compliment.",
    rows: [
      {
        label: "housing & lodging",
        terms: ["家賃", "宿", "屋根", "床", "寮"],
      },
      {
        label: "money, fees & margin",
        terms: ["両替", "料金", "豊か", "余分", "余裕"],
      },
    ],
  },
  {
    key: "n3-b07-work-career",
    title: "Work, Career & Advancement",
    subtitle: "仕事",
    insight:
      "学歴 ('academic background') and time spent abroad via 留学 ('studying abroad') both shape a career before it even starts; once someone is hired — 雇う ('to employ') is what a company does — 異動 ('a transfer') can move them to a new post, and 労働 ('labor, work') is the broader word for the work itself, separate from any one 課題 ('task, assignment') on their desk.",
    extendedInsight:
      "辞める specifically means 'to retire from, to resign from' a job or position, distinct from やめる written in kana for stopping an activity in general — 会社を辞める ('to quit the company') always uses this kanji, while 勉強をやめる ('to stop studying') usually doesn't.",
    examples: [
      {
        jp: "彼は先月、会社を辞めた。",
        romaji: "Kare wa sengetsu, kaisha o yameta.",
        en: "He quit his company last month.",
      },
      {
        jp: "来年、アメリカに留学するつもりです。",
        romaji: "Rainen, Amerika ni ryuugaku suru tsumori desu.",
        en: "I plan to study abroad in America next year.",
      },
    ],
    commonMistake:
      "異動 ('a job transfer within a company') is often confused with the unrelated word for physical movement — both are read いどう, but 異動 only ever describes a change in someone's job assignment, never a train or a suitcase moving.",
    rows: [
      {
        terms: ["雇う", "辞める", "異動", "学歴", "労働", "留学", "課題"],
      },
    ],
  },
  {
    key: "n3-b07-masu-stem-nouns",
    title: "Verb to Noun: The ます-Stem Pattern",
    subtitle: "動詞から名詞へ",
    insight:
      "Drop the ます off many verbs and what's left often stands alone as a noun: 怒る ('to get angry') becomes 怒り ('anger'), 驚く ('to be surprised') becomes 驚き ('surprise'), 喜ぶ ('to rejoice') becomes 喜び ('joy'), 別れる ('to part') becomes 別れ ('a parting'), 笑う ('to laugh') becomes 笑い ('a laugh'), and 教える ('to teach') becomes 教え ('a teaching'). It's one of the most productive noun-forming patterns in Japanese — once you know the verb, you often already know the noun.",
    extendedInsight:
      "遅れる ('to be late, to be delayed') becomes 遅れ ('a delay') and 当たる ('to hit, to be correct') becomes 当り ('a hit, a success') the same way, and the pattern even produces homophone pairs: 借りる ('to borrow') becomes 借り ('a debt, a loan'), which sounds exactly like 狩る ('to hunt') becoming 狩り ('hunting') — two completely unrelated words that just happen to share the reading かり.",
    examples: [
      {
        jp: "彼の怒りはすぐに収まった。",
        romaji: "Kare no ikari wa sugu ni osamatta.",
        en: "His anger settled down quickly.",
      },
      {
        jp: "電車の遅れで会議に遅刻した。",
        romaji: "Densha no okure de kaigi ni chikoku shita.",
        en: "I was late to the meeting because of the train delay.",
      },
    ],
    commonMistake:
      "借り ('a debt owed to someone') and 狩り ('hunting') are pronounced identically as かり — only context, like 借りがある ('I owe someone a favor') versus 狩りに行く ('to go hunting'), tells them apart.",
    rows: [
      {
        terms: [
          "怒り",
          "驚き",
          "喜び",
          "別れ",
          "笑い",
          "教え",
          "遅れ",
          "当り",
          "借り",
          "狩り",
        ],
      },
    ],
  },
  {
    key: "n3-b07-personality-mood",
    title: "Personality, Mood & Attitude",
    subtitle: "性格・気分",
    insight:
      "勇気 ('courage') and 意地 ('stubbornness, willpower') describe inner drive, while 陽気 ('cheerfulness') and 愉快 ('pleasant, delightful') describe how a mood shows on the outside — both are common ways to say someone is fun to be around. わがまま ('selfish, willful') sits at the opposite end, describing someone who won't compromise.",
    extendedInsight:
      "冷静 ('calm, composed') is the useful opposite of losing one's temper — 冷静になる ('to calm down, to regain composure') is a common set phrase. 厄介 ('a bother, a nuisance') describes a person or situation that's troublesome rather than a mood itself, and もったいない ('wasteful, a shame to waste') is unique among these as a word about resources or opportunities, not people, as in 時間がもったいない ('what a waste of time').",
    examples: [
      {
        jp: "彼はわがままな性格だ。",
        romaji: "Kare wa wagamama na seikaku da.",
        en: "He has a selfish personality.",
      },
      {
        jp: "冷静になって、もう一度考えよう。",
        romaji: "Reisei ni natte, mou ichido kangaeyou.",
        en: "Let's calm down and think about it once more.",
      },
    ],
    commonMistake:
      "もったいない doesn't simply mean 'unfortunate' — it specifically expresses regret over something valuable going to waste, so it fits 食べ物を捨てるのはもったいない ('it's wasteful to throw food away') but not a plain accident with nothing wasted.",
    rows: [
      {
        terms: [
          "わがまま",
          "意地",
          "厄介",
          "冷静",
          "陽気",
          "愉快",
          "勇気",
          "もったいない",
        ],
      },
    ],
  },
  {
    key: "n3-b07-yuu-reading",
    title: "友・有・優 — Friendship, Having & Excelling",
    subtitle: "友・有・優",
    insight:
      "Three different kanji share the reading ゆう and build a cluster of positive, sociable vocabulary: 友 ('friend') gives 友好 ('friendship, amity'), 友情 ('friendship as a bond'), and 友人 ('a friend', a formal word); 有 ('to have, to exist') gives 有効 ('valid, effective'), 有能 ('capable'), and 有利 ('advantageous'); and 優 ('superior, excelling') gives 優秀 ('excellent') and 優勝 ('overall victory, a championship').",
    extendedInsight:
      "唯一 ('the only one, sole') is the odd one out in this group by meaning but shares the same opening ゆう sound — a reminder that a shared sound is a memory hook, not proof of a shared meaning. 友好 and 有効 are the pair most likely to be confused, since both are read ゆうこう, but 友好 is about goodwill between people or nations while 有効 is about something being valid or working as intended.",
    examples: [
      {
        jp: "この契約はまだ有効です。",
        romaji: "Kono keiyaku wa mada yuukou desu.",
        en: "This contract is still valid.",
      },
      {
        jp: "両国の友好関係が続いている。",
        romaji: "Ryoukoku no yuukou kankei ga tsuzuite iru.",
        en: "The friendly relationship between the two countries continues.",
      },
    ],
    commonMistake:
      "有効 ('valid') and 友好 ('friendship, amity') are both read ゆうこう — mixing them up turns 有効な関係 ('a valid relationship', an odd phrase) into what should have been 友好な関係 ('a friendly relationship').",
    rows: [
      {
        label: "友 — friendship",
        terms: ["友好", "友情", "友人"],
      },
      {
        label: "有 — having, existing",
        terms: ["有効", "有能", "有利"],
      },
      {
        label: "優 — excelling",
        terms: ["優秀", "優勝"],
      },
      {
        label: "related ゆう word",
        terms: ["唯一"],
      },
    ],
  },
  {
    key: "n3-b07-everyday-verbs",
    title: "Everyday Verbs: Motion, Division & Cooking",
    subtitle: "動作・料理",
    insight:
      "N3 rounds out everyday verb vocabulary with words for splitting things apart — 分ける ('to divide'), 分かれる ('to branch off'), 割る ('to break, to divide') — and for moving through space — 駆ける ('to run'), 横切る ('to cross'), 埋まる ('to be buried, to be filled in'). A second group covers taking on risk or responsibility, 負う ('to bear, to owe') and 賭ける ('to bet, to gamble'), alongside more physical acts like 寄せる ('to gather together'), 織る ('to weave'), and 産む ('to give birth to').",
    extendedInsight:
      "傷める and 炒める are a classic homophone trap: both are read いためる, but 傷める means 'to damage, to hurt', as in 腰を傷める ('to hurt one's back'), while 炒める means 'to stir-fry', as in 野菜を炒める ('to stir-fry vegetables') — completely different kanji and meanings hiding behind an identical sound. 湧く ('to well up, to boil up') and 茹でる ('to boil something in water') both involve boiling, but only 茹でる is transitive and used for cooking.",
    examples: [
      {
        jp: "野菜を油で炒めた。",
        romaji: "Yasai o abura de itameta.",
        en: "I stir-fried the vegetables in oil.",
      },
      {
        jp: "彼は責任を負っている。",
        romaji: "Kare wa sekinin o otte iru.",
        en: "He bears the responsibility.",
      },
    ],
    commonMistake:
      "腰を傷めた ('I hurt my back') and 野菜を炒めた ('I stir-fried the vegetables') are both read いためた in the past tense — writing the wrong kanji swaps an injury for a cooking method.",
    rows: [
      {
        label: "dividing & separating",
        terms: ["分ける", "分かれる", "割る"],
      },
      {
        label: "movement & space",
        terms: ["駆ける", "横切る", "埋まる"],
      },
      {
        label: "risk, burden & gathering",
        terms: ["負う", "賭ける", "寄せる", "織る", "産む"],
      },
      {
        label: "cooking & heat",
        terms: ["茹でる", "炒める", "傷める", "燃やす", "湧く"],
      },
    ],
  },
  {
    key: "n3-b07-time-night-yo-prefix",
    title: "Night, Duration & Planning Ahead",
    subtitle: "夜・予定",
    insight:
      "夜 ('night') anchors a small family of time words — 夜明け ('dawn, daybreak') is when it ends, and 夜中 ('the middle of the night') is its deepest point. やがて ('before long') and 依然 ('still, as yet') both describe how a situation unfolds over time, one looking forward and one looking back.",
    extendedInsight:
      "予 ('in advance') is one of the most productive prefixes in N3: attach it to a base meaning and you get 予期 ('to anticipate'), 予算 ('a budget', money planned in advance), 予測 ('a prediction'), 予報 ('a forecast', as in 天気予報, 'weather forecast'), and 予防 ('prevention', acting in advance against something bad). Once 予 is recognized as 'beforehand', each of these becomes 'beforehand plus expect, calculate, measure, announce, or guard'.",
    examples: [
      {
        jp: "明日の天気予報を見た。",
        romaji: "Ashita no tenki yohou o mita.",
        en: "I checked tomorrow's weather forecast.",
      },
      {
        jp: "夜中に電話が鳴った。",
        romaji: "Yonaka ni denwa ga natta.",
        en: "The phone rang in the middle of the night.",
      },
    ],
    commonMistake:
      "予測 ('a prediction based on calculation, such as of numbers or trends') and 予期 ('to anticipate or expect something in general') aren't interchangeable — 地震を予測する ('to predict an earthquake', a calculated forecast) reads oddly if swapped for 予期する, which fits an expectation like 予期しない出来事 ('an unexpected event') better.",
    rows: [
      {
        label: "night & time of day",
        terms: ["夜", "夜明け", "夜中"],
      },
      {
        label: "duration & continuity",
        terms: ["やがて", "依然", "来", "曜日"],
      },
      {
        label: "予 — planning in advance",
        terms: ["予期", "予算", "予測", "予報", "予防"],
      },
    ],
  },
  {
    key: "n3-b07-you-reading",
    title: "容・要・用 — Contain, Need & Use",
    subtitle: "容・要・用",
    insight:
      "Three kanji share the reading よう and each contributes its own family of words: 容 ('to contain') gives 容易 ('easy', something managed with little effort) and 容器 ('a container'); 要 ('to need, essential') gives 要求 ('a demand'), 要素 ('an element'), and 要点 ('the main point', literally the essential point); and 用 ('to use, business') gives 用心 ('caution, being on guard').",
    extendedInsight:
      "様子 ('the state or appearance of something') and 要するに ('in short, in a word', used to summarize) round out the group as two everyday discourse words built on よう — 様子 describes how something looks from the outside, while 要するに signals that a summary is coming, often after a long explanation.",
    examples: [
      {
        jp: "この問題は容易ではない。",
        romaji: "Kono mondai wa youi de wa nai.",
        en: "This problem isn't easy.",
      },
      {
        jp: "要するに、時間が足りないということです。",
        romaji: "You suru ni, jikan ga tarinai to iu koto desu.",
        en: "In short, it means there isn't enough time.",
      },
    ],
    commonMistake:
      "要求 ('a demand', something insisted on) is stronger than a simple request — using it for a small, polite ask can sound unexpectedly forceful, since 要求 implies the other side has little choice but to comply.",
    rows: [
      {
        terms: [
          "容易",
          "容器",
          "要求",
          "用心",
          "様子",
          "要するに",
          "要素",
          "要点",
        ],
      },
    ],
  },
  {
    key: "n3-b07-katakana-loanwords",
    title: "Katakana Loanwords",
    subtitle: "外来語",
    insight:
      "N3 keeps adding everyday loanwords from English (and, for アンケート, French) that don't have a natural native equivalent: ユーモア ('humor'), レベル ('a level, degree'), アップ ('up, an increase'), and アンケート ('a questionnaire, a survey') all show up constantly in casual conversation and business Japanese alike.",
    extendedInsight:
      "Some katakana words narrow their meaning compared to the English original — ライター means both 'a lighter' (for a cigarette) and 'a writer', distinguished only by context, while ヨーロッパ ('Europe'), ヨット ('a yacht'), ラケット ('a racket'), ロケット ('a rocket'), and ワイン ('wine') keep meanings close to their source words.",
    examples: [
      {
        jp: "彼はいつもユーモアがある。",
        romaji: "Kare wa itsumo yuumoa ga aru.",
        en: "He always has a sense of humor.",
      },
      {
        jp: "夏にヨーロッパを旅行したい。",
        romaji: "Natsu ni Yooroppa o ryokou shitai.",
        en: "I want to travel to Europe in the summer.",
      },
    ],
    commonMistake:
      "レベルアップ ('level up, to improve') combines two of these words into one common set phrase — treating レベル and アップ as always separate can make a learner miss this everyday compound.",
    rows: [
      {
        terms: [
          "ユーモア",
          "ヨーロッパ",
          "ヨット",
          "ライター",
          "ラケット",
          "レベル",
          "ロケット",
          "ワイン",
          "アップ",
          "アンケート",
        ],
      },
    ],
  },
  {
    key: "n3-b07-ri-reading",
    title: "利・理・離・率・流・量 — The り Family",
    subtitle: "利・理・離",
    insight:
      "利 ('benefit, advantage') gives 利益 ('profit') and 利口 ('clever, shrewd', literally 'sharp-mouthed'); 理 ('reason, logic') gives 理解 ('understanding') and 理想 ('an ideal'); and 離 ('to separate') gives 離婚 ('divorce'). Two more kanji round out the family with related but distinct readings: 率 (りつ, 'a rate, a ratio') and 流 (as in 流行, りゅうこう, 'a fad, a trend', literally something that flows through society).",
    extendedInsight:
      "量 ('quantity, amount') is the most general word in this group — it measures how much of anything there is, unlike 率, which measures a proportion or rate between two quantities rather than a raw amount.",
    examples: [
      {
        jp: "この本は理解しやすい。",
        romaji: "Kono hon wa rikai shiyasui.",
        en: "This book is easy to understand.",
      },
      {
        jp: "今年はこの色が流行している。",
        romaji: "Kotoshi wa kono iro ga ryuukou shite iru.",
        en: "This color is trending this year.",
      },
    ],
    commonMistake:
      "理解 ('understanding', a mental grasp of something) and 理想 ('an ideal', a picture of perfection) both start with 理 but aren't related in meaning — confusing them turns 理解がある人 ('an understanding person') into something closer to 'a person with high ideals'.",
    rows: [
      {
        terms: ["利益", "理解", "利口", "離婚", "理想", "率", "流行", "量"],
      },
    ],
  },
  {
    key: "n3-b07-formal-discourse",
    title: "Formal & Academic Language",
    subtitle: "例・礼・論",
    insight:
      "例 ('an example, an instance') and 礼 ('a bow, a show of gratitude') are unrelated words that happen to share the reading れい — 例 builds 例外 ('an exception', literally 'outside the example') while 礼 builds 礼儀 ('manners, etiquette'). 列 ('a line, a queue') extends into 列車 ('a train', literally a line of train cars), and 連 ('to link, to connect') gives 連想 ('association of ideas') and 連続 ('continuity, a row of consecutive things').",
    extendedInsight:
      "論じる ('to argue, to discuss formally'), 論争 ('a dispute, a controversy'), and 論文 ('a thesis, an academic paper') all build on 論 ('a theory, an argument') — this is the vocabulary of formal debate and academic writing, distinct from casual disagreement.",
    examples: [
      {
        jp: "彼女はその問題について論じた。",
        romaji: "Kanojo wa sono mondai ni tsuite ronjita.",
        en: "She discussed that issue.",
      },
      {
        jp: "この規則には例外がある。",
        romaji: "Kono kisoku ni wa reigai ga aru.",
        en: "There is an exception to this rule.",
      },
    ],
    commonMistake:
      "論じる ('to discuss or argue a topic formally, in writing or debate') is a much more formal register than ordinary talking or consulting — using it for an everyday chat about dinner plans sounds oddly academic.",
    rows: [
      {
        label: "example & courtesy (れい)",
        terms: ["例", "礼", "例外", "礼儀"],
      },
      {
        label: "lines & trains (れつ)",
        terms: ["列", "列車"],
      },
      {
        label: "connection & association (れん)",
        terms: ["連想", "連続"],
      },
      {
        label: "argument & discussion (ろん)",
        terms: ["論じる", "論争", "論文"],
      },
    ],
  },
  {
    key: "n3-b07-nature-shapes",
    title: "Nature, Shapes & the わん Homophones",
    subtitle: "自然・形",
    insight:
      "陸 ('land, dry ground', the opposite of the sea) and 湾 ('a bay, a gulf') describe where land meets water, while 渦 ('a swirl, a whirlpool') describes water in motion. 尾 ('a tail') and 輪 ('a ring, a hoop') round out this group as two more words for physical shape.",
    extendedInsight:
      "湾 ('a bay') has two homophones that mean something completely different: 椀 and 碗 both also read わん and both mean 'a bowl' — traditionally 椀 for a wooden or lacquer bowl and 碗 for a ceramic one — so all three characters share one sound across essentially unrelated ideas.",
    examples: [
      {
        jp: "船は湾の中に入った。",
        romaji: "Fune wa wan no naka ni haitta.",
        en: "The ship entered the bay.",
      },
      {
        jp: "お茶を椀に入れた。",
        romaji: "Ocha o wan ni ireta.",
        en: "I poured the tea into the bowl.",
      },
    ],
    commonMistake:
      "湾 ('a bay'), 椀 ('a wooden bowl'), and 碗 ('a ceramic bowl') are all pronounced わん — without the kanji in front of you, 湾に入れる ('to put into the bay') and 椀に入れる ('to put into a bowl') are indistinguishable by ear.",
    rows: [
      {
        terms: ["陸", "湾", "椀", "碗", "渦", "尾", "輪"],
      },
    ],
  },
  {
    key: "n3-b07-formal-verbs",
    title: "Formal Verbs: Using, Restoring & Stopping",
    subtitle: "用いる・止す",
    insight:
      "用いる is a more formal, written equivalent of the everyday verb for 'to use' — it shows up in instructions and formal writing more than in casual speech. 止す is a lesser-used, more literary way to say 'to stop, to quit', most often seen in the negative imperative form よしなさい ('stop it').",
    extendedInsight:
      "破る and 破れる form a transitive and intransitive pair like many N3 verbs: 破る ('to tear something, to break a rule or a record') takes a direct object, while 破れる ('to get torn, to be defeated') describes something happening to the subject on its own — 紙を破る ('to tear paper', something you do) versus 紙が破れる ('the paper tears', something that happens to it).",
    examples: [
      {
        jp: "この道具は料理に用いる。",
        romaji: "Kono dougu wa ryouri ni mochiiru.",
        en: "This tool is used for cooking.",
      },
      {
        jp: "約束を破ってはいけない。",
        romaji: "Yakusoku o yabutte wa ikenai.",
        en: "You mustn't break a promise.",
      },
    ],
    commonMistake:
      "求める ('to request, to seek') is more formal and abstract than an ordinary favor-asking word — 助けを求める ('to seek help') fits a serious situation, while asking a friend to pass the salt calls for something much lighter.",
    rows: [
      {
        label: "formal equivalents of common verbs",
        terms: ["用いる", "止す"],
      },
      {
        label: "transitive & intransitive: 破る / 破れる",
        terms: ["破る", "破れる"],
      },
      {
        label: "giving, permitting & returning",
        terms: ["求める", "譲る", "許す", "戻す"],
      },
    ],
  },
  {
    key: "n3-b07-everyday-misc",
    title: "Everyday Life: Adverbs, Household Words & Standalone Kanji",
    subtitle: "副詞・日常",
    insight:
      "A handful of adverbs shade a sentence's degree or intent: やや ('slightly') and 僅か ('merely, a little') both soften an amount, while わざと ('on purpose') and 因る ('to be due to, to be caused by') describe intent and cause. 尤も works two ways — as 'quite right, reasonable' on its own, and as a formal connective meaning 'however' at the start of a sentence, qualifying what was just said.",
    extendedInsight:
      "Several single kanji stand alone as full words carrying an abstract concept many learners already know from compounds: 楽 ('comfort, ease', the base of 音楽 'music' and the adjective for 'fun'), 悪 ('evil, vice', the base of 悪口 'an insult'), and 観 ('a view, an outlook', seen as the suffix ～観 in words like 人生観 'one's outlook on life'). 管 ('a pipe, a tube') and 癌 ('cancer') are more concrete, everyday technical and medical nouns that also stand alone this way.",
    examples: [
      {
        jp: "彼はわざと窓を割った。",
        romaji: "Kare wa wazato mado o watta.",
        en: "He broke the window on purpose.",
      },
      {
        jp: "部屋の片付けを終えた。",
        romaji: "Heya no katazuke o oeta.",
        en: "I finished tidying the room.",
      },
    ],
    commonMistake:
      "尤も can look at a glance like a form of the unrelated word for 'more', but they aren't connected — 尤もな理由 means 'a reasonable, valid reason', a completely different idea from something being bigger or more numerous.",
    rows: [
      {
        label: "degree, manner & cause",
        terms: ["尤も", "やや", "わざと", "僅か", "因る"],
      },
      {
        label: "household & body",
        terms: [
          "片付け",
          "加味",
          "綿-2",
          "模様",
          "脇",
          "酔う",
          "汚す",
          "嫁",
          "より",
        ],
      },
      {
        label: "standalone kanji nouns",
        terms: ["楽", "悪", "観", "管-2", "癌", "四"],
      },
    ],
  },
  {
    key: "n3-b08-homophones",
    title: "Same Sound, Different Kanji — Homophones",
    subtitle: "同音異義語",
    insight:
      "N3 vocabulary starts to pile up words that sound completely identical but are written with different kanji and mean something else entirely — こうかい alone could be 後悔 ('regret') or 航海 ('a sea voyage'), and けいたい could be 携帯 ('a mobile phone, or carrying something') or 形態 ('a form or shape'). Spoken Japanese relies entirely on context to tell these apart, since the sound gives no clue; written Japanese uses the kanji itself to remove the ambiguity.",
    extendedInsight:
      "This is why kanji literacy actually matters for listening comprehension too: once you've seen 対象 ('a target, an object of study') and 対照 ('a contrast, a comparison') written out, your brain starts predicting which one fits a sentence even when you only hear たいしょう.",
    examples: [
      {
        jp: "昔のことを後悔しています。",
        romaji: "Mukashi no koto o koukai shite imasu.",
        en: "I regret something from the past.",
      },
      {
        jp: "船で航海する。",
        romaji: "Fune de koukai suru.",
        en: "To go on a sea voyage by ship.",
      },
    ],
    commonMistake:
      "後悔 and 航海 are pronounced exactly the same (こうかい) but share no meaning at all — mixing them up in writing, or assuming you know which one is meant from sound alone, is a classic N3 listening trap, so always confirm the kanji when the word matters.",
    rows: [
      {
        label: "こうかい: regret / a voyage",
        terms: ["後悔", "航海"],
      },
      {
        label: "たいしょう: a target / a contrast",
        terms: ["対象", "対照"],
      },
      {
        label: "けいたい: a mobile phone / a form",
        terms: ["携帯", "形態"],
      },
      {
        label: "たつ: to be built / time passes",
        terms: ["建つ", "経つ"],
      },
      {
        label: "きかん: an organ / quarterly",
        terms: ["器官", "季刊"],
      },
      {
        label: "けいき: a gauge / an opportunity",
        terms: ["計器", "契機"],
      },
      {
        label: "かんこう: publication / a custom",
        terms: ["刊行", "慣行"],
      },
      {
        label: "さく: a work / a policy",
        terms: ["作", "策"],
      },
    ],
  },
  {
    key: "n3-b08-government",
    title: "Government, Officials & Public Institutions",
    subtitle: "政治・行政",
    insight:
      "N3 brings the vocabulary of government and formal institutions: 官僚 ('a bureaucrat') work inside a 機構 ('an organization, a mechanism') that operates under 規制 ('regulations'), while 大臣 ('a cabinet minister') and 大統領 ('a president') represent a country, and a 大使 ('an ambassador') represents it abroad. 協議 ('a conference, a negotiation') is how these people reach a decision together.",
    extendedInsight:
      "代表 and 代理 both involve standing in for someone, but differently: 代表 means representing a group as its chosen face (会社を代表する, 'to represent the company'), while 代理 means acting in someone's specific stead, often temporarily (社長の代理, 'acting on behalf of the president').",
    examples: [
      {
        jp: "大統領は大使と協議した。",
        romaji: "Daitouryou wa taishi to kyougi shita.",
        en: "The president held talks with the ambassador.",
      },
      {
        jp: "新しい規制が決まった。",
        romaji: "Atarashii kisei ga kimatta.",
        en: "New regulations were decided.",
      },
    ],
    commonMistake:
      "拘束 means to physically or legally restrain someone's freedom (身柄を拘束する, 'to take someone into custody') — it's much stronger than 規制, which just means a rule, so the two aren't interchangeable even though both involve limits.",
    rows: [
      {
        label: "officials & leaders",
        terms: ["官僚", "大臣", "大統領", "大使"],
      },
      {
        label: "representing someone",
        terms: ["代表", "代理"],
      },
      {
        label: "institutions & rules",
        terms: ["機構", "規制", "協議", "拘束"],
      },
    ],
  },
  {
    key: "n3-b08-publishing-events",
    title: "Publishing, Media & Public Events",
    subtitle: "出版・行事",
    insight:
      "This small group covers how information and performances reach the public: 宣伝 ('advertisement, publicity') announces a 公演 ('a public performance') or a コンテスト ('a contest'), and any written or spoken piece needs a 題 ('a title, a theme') — its full written form is 題名 ('a title'). 語句 ('words and phrases') is the raw material any of these are built from, and a 大会 ('a convention, a big tournament') is simply a public event on a larger scale than 公演.",
    extendedInsight:
      "題 alone is the abstract idea of a topic (話の題, 'the topic of the conversation'), while 題名 is specifically the name printed on a book, film, or song — one is the concept, the other is the label.",
    examples: [
      {
        jp: "この本の題名は何ですか。",
        romaji: "Kono hon no daimei wa nan desu ka.",
        en: "What is the title of this book?",
      },
      {
        jp: "来月、大きい大会があります。",
        romaji: "Raigetsu, ookii taikai ga arimasu.",
        en: "Next month, there is a big tournament.",
      },
    ],
    commonMistake:
      "語句 refers to words and set phrases in general (辞書で語句を調べる, 'to look up words in a dictionary'), not a single word — for one individual word, 単語 is the natural choice instead.",
    rows: [
      {
        label: "public events",
        terms: ["公演", "大会", "コンテスト", "宣伝"],
      },
      {
        label: "titles & wording",
        terms: ["語句", "題", "題名"],
      },
    ],
  },
  {
    key: "n3-b08-conflict-law",
    title: "Conflict, Force & the Law",
    subtitle: "争い・法",
    insight:
      "戦い ('a battle, a fight') is the noun and 戦う ('to fight, to compete') is the verb describing armies, teams, or even ideas in conflict — a country that loses badly may see 降伏 ('surrender, capitulation'), and the biggest conflicts in history are called a 大戦 ('a great war'). On a smaller scale, 攻める ('to attack') describes going on the offensive, 叩く ('to strike, to hit') and 倒す ('to knock down, to defeat') describe the fight itself, and on the legal side, someone who breaks the law faces 逮捕 ('arrest') and, if convicted, a 刑 ('a sentence, a penalty').",
    extendedInsight:
      "攻める and 責める are both read semeru but mean very different things: 攻める is to attack physically or strategically (敵を攻める, 'to attack the enemy'), while 責める is to blame or criticize someone verbally (失敗を責める, 'to blame someone for a failure') — no physical force involved at all.",
    examples: [
      {
        jp: "警察は犯人を逮捕した。",
        romaji: "Keisatsu wa hannin o taiho shita.",
        en: "The police arrested the criminal.",
      },
      {
        jp: "彼は最後まで戦った。",
        romaji: "Kare wa saigo made tatakatta.",
        en: "He fought until the end.",
      },
    ],
    commonMistake:
      "Don't confuse 責める ('to blame,' criticism with words) with 攻める ('to attack,' an offensive action) just because they share the same sound semeru — using the wrong one changes a scolding into a military assault.",
    rows: [
      {
        label: "battle & war",
        terms: ["戦い", "戦う", "大戦", "降伏"],
      },
      {
        label: "attacking & striking",
        terms: ["攻める", "叩く", "倒す"],
      },
      {
        label: "blame & the law",
        terms: ["責める", "逮捕", "刑"],
      },
    ],
  },
  {
    key: "n3-b08-quantity-scale",
    title: "Increase, Decrease, Degree & 全-Compounds",
    subtitle: "増減・程度",
    insight:
      "N3 needs precise words for describing how much of something there is and how it's changing: 増加 ('increase') and 減少 ('decrease') are the plain opposite verbs for a number going up or down, while 大半 and 大部分 both mean 'most of' something and 相当 means 'considerably, fairly.' 多少 is the opposite extreme — 'a little, somewhat' — and 高める ('to raise, to boost') is what you do to a quality or level. 全 ('whole, entire') is the building block behind everyday compounds like 全員 ('all members'), 全国 ('the whole country'), and 全体 ('the whole, the entirety').",
    extendedInsight:
      "速度 ('speed') and 前進 ('advance, moving forward') often appear together describing progress — 前進の速度を高める, 'to increase the speed of progress' — showing how these abstract measurement words combine productively rather than staying isolated vocabulary.",
    examples: [
      {
        jp: "人口が増加している。",
        romaji: "Jinkou ga zouka shite iru.",
        en: "The population is increasing.",
      },
      {
        jp: "全員がその意見に賛成した。",
        romaji: "Zen'in ga sono iken ni sansei shita.",
        en: "All the members agreed with that opinion.",
      },
    ],
    commonMistake:
      "大半 and 大部分 are near-synonyms for 'most of,' but 相当 is not — 相当 means the amount is considerable or fairly large, not literally 'more than half,' so don't swap it in where you mean 'most.'",
    rows: [
      {
        label: "up & down",
        terms: ["増加", "減少", "前進", "速度", "高める"],
      },
      {
        label: "how much",
        terms: ["大半", "大部分", "相当", "多少"],
      },
      {
        label: "全 compounds",
        terms: ["全", "全員", "全国", "全体"],
      },
    ],
  },
  {
    key: "n3-b08-body-health",
    title: "The Body & Health",
    subtitle: "身体・健康",
    insight:
      "A handful of everyday medical words: 血管 ('a blood vessel') carries blood through the 全身 ('the whole body'), while 体温 ('body temperature') and 体重 ('body weight') are the two numbers a checkup measures first. 近視 ('nearsightedness') describes an eye that can't focus on distant things, and 菌 ('a germ, a bacterium') is what a checkup is often trying to rule out.",
    extendedInsight:
      "体 ('body') is the shared building block here — 体温, 体重, and 全身 all use it, so once you recognize the character, guessing the rough meaning of a new 体-compound gets much easier.",
    examples: [
      {
        jp: "体温を測ります。",
        romaji: "Taion o hakarimasu.",
        en: "I'll take my temperature.",
      },
      {
        jp: "彼は近視です。",
        romaji: "Kare wa kinshi desu.",
        en: "He is nearsighted.",
      },
    ],
    commonMistake:
      "体重 (body weight) and 体温 (body temperature) look similar and are easy to mix up when reading quickly — remember 重 is the same kanji as 重い ('heavy'), which anchors 体重 to weight, not heat.",
    rows: [
      {
        terms: ["血管", "近視", "体温", "体重", "全身", "菌"],
      },
    ],
  },
  {
    key: "n3-b08-nature-geography",
    title: "Nature, Geography & the Environment",
    subtitle: "自然・地理",
    insight:
      "Geography words describe the physical world at a large scale: 大陸 ('a continent') sits under a 大気 ('the atmosphere') warmed by the 太陽 ('the sun'), and its surface rises into 丘陵 ('hills') and dips into 谷 ('valleys'), with 田 ('a rice field') cultivated wherever the land allows. 起源 ('the origin, the beginning') asks where something first came from — a question increasingly urgent for species facing 絶滅 ('extinction') on land left in 荒廃 ('ruin').",
    extendedInsight:
      "絶滅 literally combines 絶 ('to cut off, to sever') with 滅 ('to be destroyed'), so it describes an ending with no possibility of return — stronger than simply 'disappearing,' which is why it's the standard word for a species going extinct rather than just becoming rare.",
    examples: [
      {
        jp: "その動物は絶滅した。",
        romaji: "Sono doubutsu wa zetsumetsu shita.",
        en: "That animal went extinct.",
      },
      {
        jp: "太陽が谷を照らす。",
        romaji: "Taiyou ga tani o terasu.",
        en: "The sun shines on the valley.",
      },
    ],
    commonMistake:
      "起源 (origin, where something began) is often confused with 原因 (cause, why something happened) — 起源 answers 'where did this come from historically,' while 原因 answers 'what made this happen.'",
    rows: [
      {
        label: "landforms & sky",
        terms: ["丘陵", "大気", "大陸", "太陽", "谷", "田"],
      },
      {
        label: "life & its ending",
        terms: ["象", "絶滅", "荒廃", "起源"],
      },
    ],
  },
  {
    key: "n3-b08-connectives",
    title: "Connecting Ideas — Discourse Connectives",
    subtitle: "接続表現",
    insight:
      "N3 connectors link whole sentences together rather than words within one. そして simply adds a next step ('and then'), そのうえ piles on an extra point ('moreover'), and そこで marks a natural turning point ('so, at that point'). だが and だけど both mean 'but,' with だが sounding more formal or written and だけど more casual or spoken, while それでも pushes back harder — 'even so, nevertheless' — against what was just said.",
    extendedInsight:
      "だって has two jobs: as a connector it explains a reason with a slightly defensive tone ('because, you see...'), but it can also mean 'even' when attached to a noun (子供だって分かる, 'even a child understands') — the surrounding sentence tells you which one is meant.",
    examples: [
      {
        jp: "雨が降った。そこで、家にいた。",
        romaji: "Ame ga futta. Sokode, ie ni ita.",
        en: "It rained. So, I stayed home.",
      },
      {
        jp: "行きたい。だが、時間がない。",
        romaji: "Ikitai. Daga, jikan ga nai.",
        en: "I want to go. But I don't have time.",
      },
    ],
    commonMistake:
      "それとも is only for choosing between two options inside one question (コーヒーですか、それとも紅茶ですか, 'Coffee, or tea?') — it can't replace それと, which just adds one more item to a list ('and, also').",
    rows: [
      {
        label: "adding & sequencing",
        terms: ["そして", "そのうえ", "そこで", "それと"],
      },
      {
        label: "contrast & reasoning",
        terms: ["だが", "だけど", "それでも", "だって", "たとえ", "それとも"],
      },
    ],
  },
  {
    key: "n3-b08-manner-time-adverbs",
    title: "Manner, Time & 'Only' Adverbs",
    subtitle: "様態・時・限定",
    insight:
      "These adverbs describe how and when something happens. そっと means 'softly, gently' (そっとドアを閉める, 'to close the door gently'), while そのまま means 'as it is, without changing anything.' そのうち ('before long') and たびたび ('often, repeatedly') describe time loosely, and 直ちに ('immediately, at once') is the sharpest, most formal way to say 'right now.' たっぷり describes a generous amount ('plenty, fully'), そっくり means an exact match ('the spitting image; entirely'), and たしか hedges a memory ('if I remember correctly'), close in feeling to ことによると ('depending on the circumstances, possibly').",
    extendedInsight:
      "ただ, 只, and 唯 all share the reading tada and the core sense of 'nothing more than' — ただ (usually written in kana) covers both 'free of charge' and 'just, only,' while 只 and 唯 are more formal written variants leaning toward 'mere, only.' The same character 唯 is also read tatta, used specifically in front of a number, as in たった一人 ('just one person').",
    examples: [
      {
        jp: "彼はそっとドアを閉めた。",
        romaji: "Kare wa sotto doa o shimeta.",
        en: "He gently closed the door.",
      },
      {
        jp: "そのうち慣れますよ。",
        romaji: "Sonouchi naremasu yo.",
        en: "You'll get used to it before long.",
      },
    ],
    commonMistake:
      "ただ meaning 'free of charge' (このアプリはただです, 'this app is free') is easy to confuse with ただ meaning 'only, merely' — context, whether money is being discussed, is the only way to tell them apart, since both are usually written the same way in kana.",
    rows: [
      {
        label: "manner",
        terms: ["そっと", "そのまま", "そっくり", "たっぷり"],
      },
      {
        label: "time",
        terms: ["そのうち", "たびたび", "直ちに"],
      },
      {
        label: "hedging & confirming",
        terms: ["たしか", "ことによると"],
      },
      {
        label: "only / just / free — ただ family",
        terms: ["ただ", "只", "唯", "唯-2"],
      },
    ],
  },
  {
    key: "n3-b08-verb-pairs",
    title: "Getting Ready, Confirming & Reaching a Goal",
    subtitle: "確認・準備",
    insight:
      "This group of verbs covers preparing for something and making sure it's right: 助かる ('to be saved, to be helped out') pairs with 助ける ('to help, to save'), and 揃う ('to become complete, to come together') pairs with 揃える ('to arrange, to put in order'). 備える ('to prepare for, to furnish with') gets you ready ahead of time, 確かめる ('to make sure, to check') removes any doubt afterward, and 達する ('to reach, to arrive at') describes finally getting to a goal or a certain level.",
    extendedInsight:
      "具える is an alternate way of writing much the same そなえる as 備える, more often used for something built-in or inherent (才能を具える, 'to be endowed with talent') rather than something you actively prepare — a subtle distinction most dictionaries treat as near-interchangeable.",
    examples: [
      {
        jp: "みんなで意見を揃えた。",
        romaji: "Minna de iken o soroeta.",
        en: "Everyone got their opinions in agreement.",
      },
      {
        jp: "地震に備えることが大切です。",
        romaji: "Jishin ni sonaeru koto ga taisetsu desu.",
        en: "It's important to prepare for earthquakes.",
      },
    ],
    commonMistake:
      "助かる describes what happens to you ('I was saved, it helped me out'), not what you do — saying 私は助かりました after someone helps you is correct, but using 助ける the same way would wrongly claim you did the helping.",
    rows: [
      {
        label: "helping (intr./tr. pair)",
        terms: ["助かる", "助ける"],
      },
      {
        label: "gathering (intr./tr. pair)",
        terms: ["揃う", "揃える"],
      },
      {
        label: "preparing & confirming",
        terms: ["備える", "具える", "確かめる", "達する"],
      },
    ],
  },
  {
    key: "n3-b08-daily-actions",
    title: "Building, Cooking & Everyday Physical Actions",
    subtitle: "日常の動作",
    insight:
      "A set of concrete, physical verbs: 築く means 'to build up' something lasting, often figuratively (信頼を築く, 'to build trust'), while 炊く is specifically 'to cook rice' and 焚く is 'to burn or kindle' something like firewood — both share the reading taku but describe very different fires. 注ぐ ('to pour') fills a cup, 畳む ('to fold') puts clothes away, and 立ち上がる ('to stand up') and 育つ ('to grow up') describe a person's own body changing position or maturing over time.",
    extendedInsight:
      "抱く, here read daku, means 'to embrace, to hug' someone physically — the same kanji is also read idaku with a more abstract sense ('to hold a feeling,' 疑問を抱く, 'to harbor a doubt'), so the reading itself signals whether the hug is literal or emotional.",
    examples: [
      {
        jp: "母がご飯を炊いた。",
        romaji: "Haha ga gohan o taita.",
        en: "My mother cooked rice.",
      },
      {
        jp: "赤ちゃんを抱いた。",
        romaji: "Akachan o daita.",
        en: "I held the baby.",
      },
    ],
    commonMistake:
      "炊く (to cook rice specifically) and 焚く (to burn wood or start a fire) are both read taku and both involve heat, but confusing them describes either burning your rice or cooking your firewood — check which kanji is used.",
    rows: [
      {
        label: "building & pouring",
        terms: ["築く", "注ぐ", "畳む"],
      },
      {
        label: "たく: cooking vs. burning",
        terms: ["炊く", "焚く"],
      },
      {
        label: "the body in motion",
        terms: ["抱く-2", "立ち上がる", "育つ"],
      },
    ],
  },
  {
    key: "n3-b08-home-travel-objects",
    title: "Home, Travel & Everyday Objects",
    subtitle: "生活・旅",
    insight:
      "A grab-bag of everyday nouns you'll meet while living somewhere or traveling: furniture and household items like ソファー ('a sofa'), タオル ('a towel'), and 洗剤 ('detergent') fill a 宅 ('a house, a home'), while 小銭 ('small change') and 束 ('a bundle') describe how things come in quantity. 旅 ('a trip, a journey') might mean a 滞在 ('a stay, a sojourn') somewhere, perhaps enjoying local food like 蕎麦 ('soba noodles') or doing some 採集 ('collecting, gathering') along the way.",
    extendedInsight:
      "玉 and 球, both read tama, mean essentially the same thing — 'a ball, a sphere' — with 玉 the more everyday kanji, also used for jewels and coins, and 球 the more technical one, favored in words about literal spheres like 地球 ('the earth, literally the ball of the earth').",
    examples: [
      {
        jp: "彼は長い旅から帰った。",
        romaji: "Kare wa nagai tabi kara kaetta.",
        en: "He returned from a long journey.",
      },
      {
        jp: "新しいソファーを買った。",
        romaji: "Atarashii sofaa o katta.",
        en: "I bought a new sofa.",
      },
    ],
    commonMistake:
      "宅 alone is a fairly formal, written way to say 'home' (帰宅する, 'to return home') — in ordinary spoken conversation, 家 is far more natural, so reach for 宅 mainly in set compounds rather than plain sentences.",
    rows: [
      {
        label: "household & everyday loanwords",
        terms: [
          "ソファー",
          "タオル",
          "タイプライター",
          "洗剤",
          "ダイヤ",
          "センター",
        ],
      },
      {
        label: "small things & bundles",
        terms: ["小銭", "束", "玉", "球-2", "足袋", "袖"],
      },
      {
        label: "home & travel",
        terms: ["宅", "宝", "旅", "滞在", "採集", "大した", "蕎麦"],
      },
    ],
  },
  {
    key: "n3-b08-emotions-values",
    title: "Emotions, Respect, Value & Loss",
    subtitle: "感情・価値",
    insight:
      "Inner states and how we judge things: a crowd might let out 歓声 ('a cheer, a shout of joy') in 興奮 ('excitement'), while a dull class instead brings 退屈 ('boredom') and maybe 苦 ('hardship, trouble'). Your 態度 ('attitude, manner') toward someone often shows whether you feel 尊敬 ('respect,' toward a person) or 尊重 ('respect,' toward an idea or a wish) — the two overlap but point in slightly different directions. 善 ('good, virtue') is what's worth preserving, 損 and 損害 both mean 'a loss,' and 粗末 ('crude, of poor quality') describes something not worth much; 享受 ('to enjoy, to be given the benefit of') is receiving something good, and 存在 ('existence, being') is simply the fact that something is there at all.",
    extendedInsight:
      "尊敬 is specifically respect for a person, usually someone above you (先生を尊敬する, 'to respect one's teacher'), while 尊重 is respecting an abstraction — an opinion, a decision, a right (意見を尊重する, 'to respect someone's opinion') — you can 尊重 a decision you disagree with, but you can't quite 尊敬 it.",
    examples: [
      {
        jp: "彼女はその意見を尊重した。",
        romaji: "Kanojo wa sono iken o sonchou shita.",
        en: "She respected that opinion.",
      },
      {
        jp: "観客は興奮して歓声を上げた。",
        romaji: "Kankyaku wa koufun shite kansei o ageta.",
        en: "The audience got excited and let out a cheer.",
      },
    ],
    commonMistake:
      "損 and 損害 both mean 'loss,' but 損 is the general, everyday word (損をする, 'to lose out, to take a loss') while 損害 is the more formal word used for damages — a business reports 損害, not casual 損, in a formal document.",
    rows: [
      {
        label: "feelings",
        terms: ["歓声", "興奮", "退屈", "苦", "想像", "態度"],
      },
      {
        label: "respect & existence",
        terms: ["尊敬", "尊重", "存在", "善", "享受"],
      },
      {
        label: "loss & poor quality",
        terms: ["損", "損害", "粗末"],
      },
    ],
  },
  {
    key: "n3-b08-work-org-situations",
    title: "Work, Organization & Talking About Situations",
    subtitle: "仕事・状況",
    insight:
      "Formal, work-and-report vocabulary: a company is a 組織 ('an organization') with 設備 ('equipment, facilities') and 装置 ('an apparatus, a device') that someone needs to 操作 ('operate, handle'), while a student picks a 専攻 ('a major subject') by 選択 ('choice, selection') and everyone practices 協調 ('cooperation') and 節約 ('economizing, saving') along the way. When describing what happened, 経緯 ('the course of events') explains how a 件 ('a matter, a case') came about, and stating your own 立場 ('standpoint, position') means saying how you 対する ('face, relate to') the issue — often contrasted with 前者 ('the former, of two'), which was mentioned 先日 ('the other day').",
    extendedInsight:
      "決行 ('carrying out a plan with resolve') specifically implies going ahead despite obstacles or bad conditions (雨天決行, 'to be held rain or shine') — it's a stronger word than a plain 'to do,' reserved for plans that needed a firm decision to push through.",
    examples: [
      {
        jp: "彼女はその件について自分の立場を説明した。",
        romaji:
          "Kanojo wa sono ken ni tsuite jibun no tachiba o setsumei shita.",
        en: "She explained her own position regarding that matter.",
      },
      {
        jp: "会社の設備を操作する。",
        romaji: "Kaisha no setsubi o sousa suru.",
        en: "To operate the company's equipment.",
      },
    ],
    commonMistake:
      "代金 specifically means the price paid for goods or services (商品の代金, 'the payment for merchandise'), not money or price in general — for a broader sense of 'cost,' 値段 or 費用 fits better, so don't reach for 代金 outside a transaction.",
    rows: [
      {
        label: "organization & equipment",
        terms: [
          "組織",
          "設備",
          "装置",
          "操作",
          "協調",
          "節約",
          "代金",
          "相続",
          "専攻",
          "選択",
        ],
      },
      {
        label: "explaining a situation",
        terms: ["経緯", "決行", "件", "前者", "先日", "対する", "立場", "故人"],
      },
    ],
  },
  {
    key: "n3-b08-groups-scale-individuality",
    title: "Groups, Scale & Individuality",
    subtitle: "集団・個",
    insight:
      "This group covers describing things in bulk versus one at a time. A 群 ('a group, a crowd') of people or animals moving together might make 騒音 ('noise'), while a single 選手 ('an athlete, a player') stands out during 体育 ('physical education, athletics'). 対 ('a pair, a set') describes exactly two things together, and 種 ('a seed; a kind, a cause') can describe either a literal seed or a category of thing. Scale and boundary words round this out: 底 ('the bottom'), 平ら ('flat, level'), 大 ('big, great'), 度 ('a counter for occurrences, a degree'), and 切り ('a limit, a stopping point'), as in a task with no 切り (きりがない, 'no end in sight').",
    extendedInsight:
      "それぞれ, 互い, and 個々 all push back against treating a group as one lump: それぞれ means 'each one, respectively' (人それぞれ, 'each person is different'), 互い means 'each other, mutually' (お互いに, 'to one another'), and 個々 means 'individually, one by one' — together they're the vocabulary for insisting on individual difference within 他 ('other people or things') or a 他人 ('an unrelated stranger').",
    examples: [
      {
        jp: "それぞれの意見がある。",
        romaji: "Sorezore no iken ga aru.",
        en: "Each person has their own opinion.",
      },
      {
        jp: "この道はとても平らです。",
        romaji: "Kono michi wa totemo taira desu.",
        en: "This road is very flat.",
      },
    ],
    commonMistake:
      "他人 specifically means someone unrelated to you, not just 'another person' in general, which is closer to plain 他 or ほかの人 — calling a family member or close friend 他人 would sound like you're denying any connection to them.",
    rows: [
      {
        label: "groups & scale",
        terms: ["群", "騒音", "底", "平ら", "大", "度", "種", "切り"],
      },
      {
        label: "people & sports",
        terms: ["体育", "選手", "対"],
      },
      {
        label: "individuality",
        terms: ["それぞれ", "互い", "個々", "他", "他人"],
      },
    ],
  },
  {
    key: "n3-b09-tsuu-passage",
    title: "通 — Passing Through, Traffic & Communication",
    subtitle: "通のつく言葉",
    insight:
      "通 (つう) at its core means 'to pass through.' It builds words about literal passage — 通勤 (commuting to work), 通学 (commuting to school), 通行 (traffic, passing along a road), 通過 (passing through without stopping) — and figurative passage, where an idea or signal 'gets through': 通じる (to lead to, to be understood), 通信 (communication), 通訳 (interpretation).",
    extendedInsight:
      "通過 (つうか, 'passing through') and 通貨 (つうか, 'currency') are perfect homophones with unrelated meanings — 過 is the kanji for 'to pass,' while 貨 is the kanji for 'goods, money.' Only the kanji, never the pronunciation, tells them apart.",
    examples: [
      {
        jp: "毎日電車で通勤しています。",
        romaji: "Mainichi densha de tsuukin shite imasu.",
        en: "I commute to work by train every day.",
      },
      {
        jp: "英語は世界中で通じます。",
        romaji: "Eigo wa sekaijuu de tsuujimasu.",
        en: "English is understood all over the world.",
      },
    ],
    commonMistake:
      "通す (とおす, 'to let something pass through, to push something through') takes a direct object, while 通じる (つうじる, 'to lead to, to be understood') doesn't — 意見を通す ('to push an opinion through') is correct, but 意見が通じる makes a different claim: that the opinion gets across and is understood.",
    rows: [
      {
        label: "交通・移動 — traffic & passage",
        terms: ["通学", "通勤", "通行", "通過", "通す", "通り過ぎる"],
      },
      {
        label: "伝える・つながる — communication & currency",
        terms: ["通じる", "通信", "通訳", "通貨"],
      },
    ],
  },
  {
    key: "n3-b09-geography-infrastructure",
    title: "Land, Regions & Infrastructure",
    subtitle: "地理・インフラ",
    insight:
      "地 (ち) means 'earth, ground, place,' and it anchors words from the literal — 地球 (the earth), 土 (soil), 地下 (underground) — to the abstract, like 地位 ('social position,' built on the idea of a standing-place) or 地平線 ('horizon,' the line where 'ground' meets sky). 地方 ('the regions,' as opposed to the capital) and 都会 ('the city') form the classic rural/urban pair, while 地域 ('area, region' generally) and 地区 ('district,' a more officially bounded area, like a voting or school district) both translate as 'area' but aren't interchangeable.",
    extendedInsight:
      "停 means 'to stop,' and it's the shared root behind two pieces of everyday infrastructure vocabulary: 停電 ('power outage,' literally electricity stopping) and 停留所 (a bus or tram stop). Both describe something coming to an unwelcome halt — one you wait out, one you wait at.",
    examples: [
      {
        jp: "この地域は交通の便がいいです。",
        romaji: "Kono chiiki wa koutsuu no ben ga ii desu.",
        en: "This area has good transportation access.",
      },
      {
        jp: "台風で停電しました。",
        romaji: "Taifuu de teiden shimashita.",
        en: "There was a power outage because of the typhoon.",
      },
    ],
    commonMistake:
      "地域 and 地区 both mean 'area,' but 地区 implies an officially drawn boundary (a school district, a voting district), while 地域 describes a region more loosely, by geography or culture — swapping them in an official context can sound odd.",
    rows: [
      {
        label: "地 — land & place",
        terms: [
          "地",
          "地位",
          "地域",
          "地下",
          "地球",
          "地区",
          "地平線",
          "地方",
          "土",
          "都会",
        ],
      },
      {
        label: "インフラ — infrastructure & stopping",
        terms: ["停電", "停留所", "鉄", "鉄道", "道路"],
      },
    ],
  },
  {
    key: "n3-b09-chuu-center-focus",
    title: "中 & 注 — Middle, Center & Attention",
    subtitle: "中心・注意",
    insight:
      "中 (ちゅう) means 'inside, middle,' and 中央 and 中心 both narrow that down to 'the very center' — 中央 for a center defined by location (中央駅, 'central station'), 中心 for a center defined by importance or focus (町の中心, 'the heart of town'). 注 (ちゅう) is a different word sharing the same reading, meaning 'to pour attention into something': 注目 ('to pay attention to,' literally 'pour the eyes') and 注文 ('an order,' pouring your request out to someone).",
    extendedInsight:
      "中止 ('cancellation, suspension') and 駐車 ('parking') both use ちゅう readings but different kanji — 中止 stops an event partway through (中, 'in the middle of'), while 駐車 ('to station a vehicle,' 駐 meaning 'to stay put') describes stopping a car, not an event. 昼食 ('lunch') shares the ちゅう reading purely by coincidence, from 昼 ('daytime') rather than 中 or 注 at all.",
    examples: [
      {
        jp: "台風で試合が中止になりました。",
        romaji: "Taifuu de shiai ga chuushi ni narimashita.",
        en: "The match was cancelled because of the typhoon.",
      },
      {
        jp: "レストランで料理を注文しました。",
        romaji: "Resutoran de ryouri o chuumon shimashita.",
        en: "I ordered food at the restaurant.",
      },
    ],
    commonMistake:
      "中央 and 中心 are often used interchangeably in English ('center'), but 中央 describes a fixed geographic middle, while 中心 describes what something revolves around and works figuratively too (彼が話の中心だった, 'he was the center of the conversation') — a park's 中央 is a spot; a story's 中心 is a topic.",
    rows: [
      {
        label: "中 — middle & center",
        terms: ["中", "中央", "中学", "中古", "中止", "中心", "昼食"],
      },
      {
        label: "注 — pouring in attention",
        terms: ["注", "注目", "注文"],
      },
      {
        label: "駐 — staying in place",
        terms: ["駐車"],
      },
    ],
  },
  {
    key: "n3-b09-suitability-simplicity",
    title: "適 & 単 — Fitting, Degree & Simplicity",
    subtitle: "適切さ・単純さ",
    insight:
      "適 (てき) means 'suitable, fitting,' and four words share it: 適する ('to suit, to be fit for'), 適切 ('appropriate'), 適度 ('a moderate amount — neither too much nor too little'), and 適用 ('to apply a rule to a case'). 程度 ('degree, extent') and 段 ('a step, a grade') both describe a point along a scale, which is exactly what 適度 is judging: an amount at just the right point.",
    extendedInsight:
      "単 (たん) means 'single, simple,' and its family moves from the concrete to the abstract: 単語 ('a single word,' i.e. vocabulary) and 単位 ('a unit,' or a school credit — one countable piece) are nouns, while 単純 ('simple, uncomplicated'), 単なる ('mere, nothing more than'), and 単に ('simply, merely') all describe something reduced to one plain thing, with nothing extra added.",
    examples: [
      {
        jp: "この仕事に適した人を探しています。",
        romaji: "Kono shigoto ni tekishita hito o sagashite imasu.",
        en: "I'm looking for a person suited to this job.",
      },
      {
        jp: "それは単なる噂です。",
        romaji: "Sore wa tannaru uwasa desu.",
        en: "That's merely a rumor.",
      },
    ],
    commonMistake:
      "適する and 適切 look similar but behave differently — 適する is a verb ('to suit,' この仕事に適する人, 'a person who suits this job'), while 適切 is a na-adjective describing a quality ('appropriate'), as in 適切な言葉 ('appropriate words'). Using 適する where an adjective is needed, or the reverse, is a common slip.",
    rows: [
      {
        label: "適 — fitting & degree",
        terms: ["適する", "適切", "適度", "適用", "程度", "段"],
      },
      {
        label: "単 — simple & single",
        terms: ["単位", "単語", "単純", "単なる", "単に"],
      },
    ],
  },
  {
    key: "n3-b09-sameness-traits",
    title: "同 & 独・特 — Sameness, Individuality & Traits",
    subtitle: "同じ・独自・特徴",
    insight:
      "同 (どう) means 'same,' scaling from the strict (同一, 'identical, one and the same') to the general (同様, 'similar, the same kind of thing') to the social (同僚, 'colleague,' someone at the same workplace) and the temporal (同時, 'at the same time'). 独 (どく) means 'alone, by oneself,' the opposite instinct: 独身 ('single, unmarried') and 独立 ('independence') both describe standing apart rather than together.",
    extendedInsight:
      "特徴 and 特長 are both read とくちょう and both translate as 'characteristic,' but they aren't neutral synonyms — 特徴 is a plain distinguishing feature, good or bad or neither, while 特長 specifically means a strong point, a distinguishing feature that's a virtue. 独特 ('unique, peculiar to something') describes the quality of having such a trait at all.",
    examples: [
      {
        jp: "彼は私の同僚です。",
        romaji: "Kare wa watashi no douryou desu.",
        en: "He is my colleague.",
      },
      {
        jp: "この店の料理には独特の味があります。",
        romaji: "Kono mise no ryouri ni wa dokutoku no aji ga arimasu.",
        en: "This restaurant's food has a distinctive taste.",
      },
    ],
    commonMistake:
      "童謡 (どうよう, 'a children's song') and 同様 (どうよう, 'the same, similarly') are perfect homophones — only the kanji separates 'let's sing a 童謡' from 'the same 同様 result.'",
    rows: [
      {
        label: "同 — same",
        terms: ["同一", "同時", "同様", "童謡", "同僚"],
      },
      {
        label: "独・特 — unique & distinctive",
        terms: ["独身", "特徴", "特長", "独特", "独立"],
      },
    ],
  },
  {
    key: "n3-b09-society-knowledge-ideas",
    title: "Society, Knowledge & the Written Word",
    subtitle: "社会・知識・言葉",
    insight:
      "This cluster gathers N3's civic and intellectual life vocabulary. On the civic side: 団体 ('an organization, group'), 党 ('a political party'), 知事 ('a prefectural governor'), 投票 ('voting'), and 道徳 ('morals, ethics') describe how people organize and govern themselves. On the intellectual side, 知 ('to know') builds 知恵 ('wisdom'), 知識 ('knowledge'), and 知能 ('intelligence') — three different senses of 'being smart': practical wisdom, accumulated facts, and raw mental capacity, respectively.",
    extendedInsight:
      "伝わる ('to be handed down, to be transmitted') and 伝統 ('tradition') share 伝 ('to transmit'), capturing how a 伝統 is really just something that has 伝わった — passed hand to hand — across generations. 著者 ('an author') is who does the transmitting in writing, and 典型 ('a type, an archetype') describes something so representative it becomes the model everyone else is compared to.",
    examples: [
      {
        jp: "この祭りは昔から伝わっています。",
        romaji: "Kono matsuri wa mukashi kara tsutawatte imasu.",
        en: "This festival has been passed down since long ago.",
      },
      {
        jp: "彼は歴史の知識が豊富です。",
        romaji: "Kare wa rekishi no chishiki ga houfu desu.",
        en: "He has abundant knowledge of history.",
      },
    ],
    commonMistake:
      "知恵 and 知識 both get translated 'knowledge,' but they're not the same thing — 知識 is information you've learned (facts, dates, vocabulary), while 知恵 is the practical judgment to use it well; someone can have a head full of 知識 and still lack the 知恵 to apply it.",
    rows: [
      {
        label: "社会・政治 — society & politics",
        terms: ["団体", "担当", "知事", "党", "道徳", "投票"],
      },
      {
        label: "知 — knowing & the mind",
        terms: ["知恵", "知識", "知能", "哲学", "動詞", "読書"],
      },
      {
        label: "伝える・書く — transmitting & writing",
        terms: ["著者", "伝わる", "典型", "伝統", "問い"],
      },
    ],
  },
  {
    key: "n3-b09-chance-danger",
    title: "Chance Encounters & Danger",
    subtitle: "偶然・危険",
    insight:
      "偶々 ('by chance, unexpectedly') sits on the kanji 偶 ('even; a pairing by chance'), and it's the key to a small family about things that happen without being planned: 出会う ('to meet by chance'), its noun forms 出会い/出合い ('an encounter'), and 出来事 ('an incident, something that happens'). できれば ('if possible') hedges toward the same uncertainty — it asks for something only if circumstances allow.",
    extendedInsight:
      "Not every unplanned event is pleasant: 弾 ('a bullet'), 敵 ('an enemy'), 毒 ('poison'), and 罪 ('a crime, a fault') describe the darker chances life presents, and the verbs 騙す ('to trick, to deceive') and 捕まる ('to be caught, to be arrested') describe both sides of getting caught up in one. 抵抗 ('resistance') is the natural response to any of them.",
    examples: [
      {
        jp: "駅で偶々友達に会いました。",
        romaji: "Eki de tamatama tomodachi ni aimashita.",
        en: "I happened to run into a friend at the station.",
      },
      {
        jp: "犯人が警察に捕まりました。",
        romaji: "Hannin ga keisatsu ni tsukamarimashita.",
        en: "The criminal was caught by the police.",
      },
    ],
    commonMistake:
      "出会い and 出合い are both read であい and both mean 'an encounter,' but 出会い is the standard, much more common form (especially for meeting people), while 出合い is a narrower, more literary variant often reserved for rivers or roads 'meeting' — reaching for 出合い to describe meeting a friend reads as unusual.",
    rows: [
      {
        label: "偶然 — chance & happening",
        terms: [
          "偶",
          "偶々",
          "出",
          "出会い",
          "出合い",
          "出会う",
          "出来事",
          "できれば",
        ],
      },
      {
        label: "危険 — danger & conflict",
        terms: ["弾", "騙す", "捕まる", "罪", "抵抗", "敵", "毒"],
      },
    ],
  },
  {
    key: "n3-b09-connectors-certainty",
    title: "Connecting Ideas & Expressing Certainty",
    subtitle: "接続表現・確信",
    insight:
      "N3 leans heavily on connector words that glue sentences and ideas together: つまり ('in other words, in short') restates a point more plainly, ですから ('therefore') gives a reason, and 直接 ('directly') describes information or contact with nothing in between. 常に ('always') and 次々 ('one after another, in succession') both describe patterns over time, while 遂に ('finally, at last') marks the end of a long wait, and どうしても ('no matter what, by any means') insists that something will happen regardless of obstacles.",
    extendedInsight:
      "違いない ('there's no mistaking it, it must be the case') is built from 違い ('a difference') plus ない ('there isn't'), literally 'there is no difference [from the truth]' — a sentence-ending phrase like 雨に違いない ('it must be raining') expresses strong certainty, distinct from 違い used plainly as a noun ('the difference between A and B'). 掴む ('to grasp, to seize') extends the same way in English and Japanese alike, from a physical grip to grasping an idea or a chance.",
    examples: [
      {
        jp: "つまり、彼は来ないということです。",
        romaji: "Tsumari, kare wa konai to iu koto desu.",
        en: "In other words, he's not coming.",
      },
      {
        jp: "彼が犯人に違いない。",
        romaji: "Kare ga hannin ni chigainai.",
        en: "He must be the criminal.",
      },
    ],
    commonMistake:
      "ちゃんと ('properly, exactly') describes doing something correctly and completely, while 直接 ('directly') describes the absence of an intermediary — 直接話す ('to speak directly, without a go-between') and ちゃんと話す ('to speak properly, clearly and seriously') answer different questions, and learners sometimes reach for one where the other is meant.",
    rows: [
      {
        label: "接続表現 — connectors & adverbs",
        terms: [
          "ちゃんと",
          "直接",
          "遂に",
          "次々",
          "常に",
          "つまり",
          "ですから",
          "どうしても",
        ],
      },
      {
        label: "確信・違い — certainty & difference",
        terms: ["違い", "違いない", "掴む"],
      },
    ],
  },
  {
    key: "n3-b09-feelings-trust",
    title: "Personal States, Feelings & Testing Trust",
    subtitle: "気持ち・状態・信頼",
    insight:
      "調子 ('condition, state — of your health, a machine, or a conversation's flow') is the word behind 調子がいい/悪い ('feeling good/bad'), and it sits alongside more specific physical and emotional states: 疲れ ('tiredness'), 辛い ('painful, hard to bear'), and たまらない ('unbearable, more than one can stand' — often about a craving or a feeling too strong to hold in). 得意 ('good at, a strong suit') describes the opposite: a state of confident pride rather than strain. 黙る ('to fall silent') is a state too — not speaking, whether from choice or from having nothing left to say.",
    extendedInsight:
      "試す ('to test, to try out') and 頼る ('to rely on') are connected by trust: 試し ('a trial run') is what you do before deciding whether something — or someone — is dependable enough to 頼る on. 便り ('news, a letter, word from someone') is what keeps that reliance alive across distance, the update that confirms someone is still there.",
    examples: [
      {
        jp: "今日は体の調子がいいです。",
        romaji: "Kyou wa karada no choushi ga ii desu.",
        en: "My body is in good condition today.",
      },
      {
        jp: "新しい方法を試してみます。",
        romaji: "Atarashii houhou o tameshite mimasu.",
        en: "I'll try out the new method.",
      },
    ],
    commonMistake:
      "疲れ is a noun ('tiredness'), and it takes noun grammar rather than verb grammar — 疲れがたまる ('tiredness accumulates') treats it as a thing that piles up, not an action you conjugate directly.",
    rows: [
      {
        label: "気持ち・状態 — feelings & states",
        terms: ["たまらない", "黙る", "調子", "疲れ", "辛い", "得意"],
      },
      {
        label: "信頼 — trust & trial",
        terms: ["試し", "試す", "便り", "頼る"],
      },
    ],
  },
  {
    key: "n3-b09-tsuku-homophones",
    title: "つく & つぐ — One Sound, Many Kanji",
    subtitle: "同じ読み方の動詞",
    insight:
      "つく is one of Japanese's most overloaded verb sounds. Here it covers three unrelated meanings: 付く ('to be attached, to stick to'), 就く ('to take up a position — a seat, a job, a teacher'), and 突く ('to poke, to thrust at'). つぐ, its close cousin, covers two more: 次ぐ ('to come next, to rank right after') and 注ぐ ('to pour into,' a different word from the unrelated 注ぐ meaning 'to concentrate attention' elsewhere in N3 vocabulary).",
    extendedInsight:
      "The 付ける/着ける pair mirrors 付く/就く: 付ける ('to attach something') is the general-purpose transitive verb, while 着ける ('to put on, to wear; to bring something alongside') is reserved for clothing and arriving somewhere. Separately, 繋がる ('to be connected,' intransitive), 繋ぐ ('to tie, to connect,' transitive), and 繋げる (also 'to connect,' a newer transitive alternative to 繋ぐ) all share 繋 ('to link') and describe connection at every level, from a rope to a phone call to a relationship.",
    examples: [
      {
        jp: "電話がなかなか繋がりません。",
        romaji: "Denwa ga nakanaka tsunagarimasen.",
        en: "The phone just won't connect.",
      },
      {
        jp: "父は去年、新しい仕事に就きました。",
        romaji: "Chichi wa kyonen, atarashii shigoto ni tsukimashita.",
        en: "My father took up a new job last year.",
      },
    ],
    commonMistake:
      "付く ('to stick, to adjoin,' a physical or figurative attachment) and 就く ('to take up a position — a seat, a job, a role') share the same sound but never substitute for each other: 席に就く ('to take one's seat') uses 就く because a seat is a position you occupy, not a surface something sticks to.",
    rows: [
      {
        label: "つく — three verbs, one sound",
        terms: ["付く", "就く", "突く"],
      },
      {
        label: "つぐ・つける — pouring, ranking & attaching",
        terms: ["次ぐ", "注ぐ-2", "付ける", "着ける"],
      },
      {
        label: "繋 — connecting",
        terms: ["繋がる", "繋ぐ", "繋げる"],
      },
    ],
  },
  {
    key: "n3-b09-piling-scattering",
    title: "Piling Up & Scattering — Matched Verb Pairs",
    subtitle: "溜まる⇔溜める、散る⇔散らす",
    insight:
      "N3 grammar leans hard on transitive/intransitive verb pairs, and this cluster has two clean ones: 溜まる ('to accumulate,' intransitive — things pile up on their own, like 疲れが溜まる, 'tiredness builds up') pairs with 溜める ('to accumulate,' transitive — you deliberately save something up, like お金を溜める, 'to save money'). 散る ('to scatter, to fall,' intransitive — famously used for cherry blossoms falling) pairs with 散らす ('to scatter something,' transitive).",
    extendedInsight:
      "積む and 積もる look like the same pair but aren't quite — 積む ('to stack, to load') is the general transitive verb for piling things up (箱を積む, 'to stack boxes'), while 積もる ('to pile up') is intransitive but specializes in things that accumulate naturally from above, above all snow (雪が積もる, 'snow piles up'). 詰める ('to pack tightly, to cram in') is a third, related idea — not accumulation over time but compression into a fixed space.",
    examples: [
      {
        jp: "疲れが溜まっています。",
        romaji: "Tsukare ga tamatte imasu.",
        en: "Fatigue has been building up.",
      },
      {
        jp: "山に雪が積もりました。",
        romaji: "Yama ni yuki ga tsumorimashita.",
        en: "Snow piled up on the mountain.",
      },
    ],
    commonMistake:
      "積む and 積もる are not a true transitive/intransitive pair the way 溜める/溜まる are — you can't say 雪を積む to mean 'snow piles up,' since 積む needs an agent doing the stacking; snow piling up on its own is always 雪が積もる.",
    rows: [
      {
        terms: [
          "溜まる",
          "溜める",
          "積む",
          "積もる",
          "詰める",
          "散らす",
          "散る",
        ],
      },
    ],
  },
  {
    key: "n3-b09-tokeru-homophones",
    title: "とける Homophones — Melting, Untying & Retreating",
    subtitle: "とく・とける",
    insight:
      "溶く ('to dissolve something,' transitive, used for mixing paint or ingredients) pairs with 溶ける ('to melt, to dissolve,' intransitive — ice or sugar 溶ける on its own). 解く ('to untie; to solve,' transitive — a knot, a problem, or a misunderstanding) pairs the same way with 解ける ('to come untied, to be solved,' intransitive). Despite the identical とける sound, 溶ける and 解ける are unrelated words that just happen to share a reading.",
    extendedInsight:
      "解く's range is wider than 'untie' alone: 問題を解く ('to solve a problem') and a misunderstanding both use the same verb, treating a puzzle or a bad feeling as something 'knotted' that needs to be loosened. 退く ('to retreat, to step back') is a different family entirely, sharing only its sound with 毒 ('poison') from elsewhere in this batch.",
    examples: [
      {
        jp: "問題が全部解けました。",
        romaji: "Mondai ga zenbu tokemashita.",
        en: "I managed to solve all the problems.",
      },
      {
        jp: "この雪はすぐに溶けるでしょう。",
        romaji: "Kono yuki wa sugu ni tokeru deshou.",
        en: "This snow will probably melt soon.",
      },
    ],
    commonMistake:
      "溶ける (ice, sugar, or metal melting/dissolving) and 解ける (a knot coming undone, or a problem getting solved) are spelled with completely different kanji but pronounced identically as とける — mixing them up when writing, rather than speaking, is a very easy mistake to make.",
    rows: [
      {
        terms: ["溶く", "溶ける", "解く", "解ける", "退く"],
      },
    ],
  },
  {
    key: "n3-b09-katakana-loanwords",
    title: "Katakana Loanwords — Modern Life",
    subtitle: "カタカナ語",
    insight:
      "These everyday katakana loanwords cover recreation and modern social life: ダンス ('dance') and チーム ('team,' for sports or work) describe activities done together, チーズ ('cheese') and テント ('tent') are borrowed nouns for imported foods and gear, and チャンス ('a chance, an opportunity') and デート ('a date,' the social-outing sense) both describe a moment worth seizing.",
    extendedInsight:
      "デモ is short for デモンストレーション ('demonstration') but almost always means a political protest march in everyday use, not a product demo — context is usually the only way to tell which sense is meant, since Japanese shortens both the same way.",
    examples: [
      {
        jp: "来週、彼女と初めてデートします。",
        romaji: "Raishuu, kanojo to hajimete deeto shimasu.",
        en: "Next week, I'll go on my first date with her.",
      },
      {
        jp: "これはいいチャンスです。",
        romaji: "Kore wa ii chansu desu.",
        en: "This is a good chance.",
      },
    ],
    commonMistake:
      "デート means a romantic outing, not a calendar date — a learner translating 'date' straight from English sometimes reaches for デート where a word for a day on the calendar is actually meant.",
    rows: [
      {
        terms: [
          "ダンス",
          "チーズ",
          "チーム",
          "チャンス",
          "デート",
          "デモ",
          "テント",
        ],
      },
    ],
  },
  {
    key: "n3-b09-time-weather-nature",
    title: "Time, Weather & the Natural World",
    subtitle: "時間・天候・自然",
    insight:
      "近頃 ('these days, lately') and 当時 ('at that time, back then') are opposite ends of the same idea — one anchored to now, one to a specified past. 遅刻 ('being late, especially to school or work') and 徹夜 ('staying up all night') are two common ways a schedule goes wrong, one from arriving too late, one from never going to bed at all. 東洋 ('the Orient, East Asia') is this cluster's one broad cultural-geographic term, naming a region rather than a single place.",
    extendedInsight:
      "天候 ('weather,' the more formal, forecast-report register) and 天然 ('nature, the natural state of something') both use 天 ('sky, heaven') to point at the natural world beyond human control — fitting company for 梅雨 (the early-summer rainy season), 頂上 (a mountain's summit, where 到着 — arrival — is the whole point of the climb), and 翼 (wings, whether on a bird or a plane).",
    examples: [
      {
        jp: "頂上に到着しました。",
        romaji: "Choujou ni touchaku shimashita.",
        en: "We arrived at the summit.",
      },
      {
        jp: "近頃、天候が不安定です。",
        romaji: "Chikagoro, tenkou ga fuantei desu.",
        en: "The weather has been unstable lately.",
      },
    ],
    commonMistake:
      "天候 describes weather over a stretch of time, in the more formal register used in forecasts and reports, while ordinary conversation about today's weather uses a plainer, more casual word — reaching for 天候 to ask a friend how the weather is can sound stiff.",
    rows: [
      {
        label: "時間 — time",
        terms: ["近頃", "遅刻", "徹夜", "当時"],
      },
      {
        label: "天候・自然 — weather & nature",
        terms: ["頂上", "翼", "梅雨", "天候", "天然", "到着", "東洋"],
      },
    ],
  },
  {
    key: "n3-b09-business-work",
    title: "Business, Procedure & Effort",
    subtitle: "手続き・仕事",
    insight:
      "Formal procedure vocabulary clusters around submitting and proposing: 提案 ('a proposal,' putting an idea forward) leads to 提出 ('submission,' handing in a document), which might be an 答案 ('an exam answer sheet'). 調査 ('a survey, an investigation') gathers the facts that inform a 提案 in the first place, and 長期 ('long-term') and 定期 ('a fixed, regular term or interval') both describe how that process is scheduled over time — with 貯金 ('savings') as the long-term financial habit these same words describe. 電子 ('electron; electronic') has become the modern word attached to nearly any of these processes once it moves online.",
    extendedInsight:
      "勤め ('work, employment') and 務め ('a duty, an obligation') are homophones (both つとめ) that describe two sides of a job: 勤め is the position itself, 務め is what you're obligated to do once you're in it. 手間 ('the time and labor something takes') and 手伝い ('help, assistance') both put 手 ('hand') to work, while 徹底 ('thoroughness, seeing something through completely') describes doing that work without cutting corners.",
    examples: [
      {
        jp: "新しい提案を部長に提出しました。",
        romaji: "Atarashii teian o buchou ni teishutsu shimashita.",
        en: "I submitted a new proposal to the department manager.",
      },
      {
        jp: "毎月、少しずつ貯金しています。",
        romaji: "Maitsuki, sukoshizutsu chokin shite imasu.",
        en: "I save a little money each month.",
      },
    ],
    commonMistake:
      "勤め and 務め are pronounced identically, but only 務め fits set phrases about duty and responsibility (親の務め, 'a parent's duty') — using 勤め there, as if it meant the same thing, would describe a job rather than an obligation.",
    rows: [
      {
        label: "手続き — procedure",
        terms: ["長期", "調査", "貯金", "提案", "定期", "提出", "答案", "電子"],
      },
      {
        label: "仕事・努力 — work & effort",
        terms: ["勤め", "務め", "手伝い", "徹底", "手間"],
      },
    ],
  },
  {
    key: "n3-b09-everyday-life",
    title: "Everyday Life — People, Objects & Customs",
    subtitle: "人・物・習慣",
    insight:
      "This cluster rounds up everyday people and social vocabulary: 父親 ('father,' a more formal word than パパ), 男子 ('a boy, a young man'), and 誕生 ('birth,' as in 誕生日, 'birthday') describe family and growing up, while どうぞよろしく ('pleased to meet you') and ちょうだい (a softer, casual 'please give me,' used often by children and women) are everyday set phrases for politeness.",
    extendedInsight:
      "付き合い ('socializing, an association with someone,' the noun) and 付合う ('to associate with, to go out with,' the verb) both describe an ongoing relationship, whether a friendship, a business connection, or a romance — 連れ ('a companion, someone accompanying you') names the person you're doing something together with, in that very moment. On the object side, 茶 ('tea'), 釣 ('fishing'), 手品 ('a magic trick'), 包み ('a wrapped bundle or package'), 塔 ('a tower or pagoda'), and 銅貨 ('a copper coin') are all concrete nouns for everyday things and pastimes, and 続き ('a sequel, a continuation') is what you're waiting for after any of them ends partway through.",
    examples: [
      {
        jp: "初めまして、どうぞよろしく。",
        romaji: "Hajimemashite, douzo yoroshiku.",
        en: "Nice to meet you, please treat me well.",
      },
      {
        jp: "友達と釣りに行きました。",
        romaji: "Tomodachi to tsuri ni ikimashita.",
        en: "I went fishing with a friend.",
      },
    ],
    commonMistake:
      "ちょうだい sounds like a plain, neutral 'please,' but it's distinctly casual and associated with children's or women's speech — using it in a formal or business setting where a more polite request word belongs can come across as childish.",
    rows: [
      {
        label: "人・関係 — people & relationships",
        terms: [
          "男子",
          "誕生",
          "父親",
          "ちょうだい",
          "付き合い",
          "付合う",
          "連れ",
          "どうぞよろしく",
        ],
      },
      {
        label: "物・習慣 — objects & customs",
        terms: ["茶", "続き", "包み", "釣", "手品", "塔", "銅貨"],
      },
    ],
  },
  {
    key: "n3-b10-indefinites-connectors",
    title: "Indefinites, Fillers & Connecting Expressions",
    subtitle: "副詞・接続表現",
    insight:
      "A family of indefinite words built on か and も — どこか ('somewhere'), 何か ('something'), なにも ('nothing', with a negative), 無し ('without') — sits alongside a related set of 'anyway/somehow' words: とにかく ('anyhow, at any rate'), 何とか ('somehow, one way or another'), 何でも ('anything, by all means'), and 何で ('why, what for'). ところが and ところで both connect sentences but do different jobs: ところが marks an unexpected turn ('however, as it turned out'), while ところで changes the subject ('by the way').",
    extendedInsight:
      "なお ('still, moreover') and なぜなら ('because') are more formal, often written connectors — なぜなら in particular always needs a ~からです/~のです ending later in the sentence to state the reason, unlike a plain ~から clause on its own.",
    examples: [
      {
        jp: "どこかで会いましたね。",
        romaji: "Dokoka de aimashita ne.",
        en: "We've met somewhere, haven't we?",
      },
      {
        jp: "なぜなら、疲れたからです。",
        romaji: "Nazenara, tsukareta kara desu.",
        en: "That's because I was tired.",
      },
    ],
    commonMistake:
      "なぜなら ('because', explaining a reason) always needs an explicit ~からです/~のです at the end of its clause — dropping that ending leaves the reason grammatically unfinished, unlike a plain ~から clause tacked onto a single sentence.",
    rows: [
      {
        label: "indefinite this-or-that",
        terms: ["どこか", "何か", "なにも", "無し"],
      },
      {
        label: "somehow, anyway & anything",
        terms: ["とにかく", "何とか", "何でも", "何で", "どんなに"],
      },
      {
        label: "however & by the way",
        terms: ["ところが", "ところで", "なお", "なぜなら"],
      },
      {
        label: "reactions & pace",
        terms: ["はあかん", "にっこり", "ばったり", "のんびり", "とんでもない"],
      },
    ],
  },
  {
    key: "n3-b10-land-farming",
    title: "Land, Farming & the Countryside",
    subtitle: "土地・農業",
    insight:
      "Words for land and rural life beyond simple city/country: 都市 ('city, urban'), 土地 ('a plot of land'), and 熱帯 ('the tropics') describe places and climate, while 農家 ('a farming household'), 農業 ('agriculture, the industry'), 農民 ('farmers, as a class'), 畑 ('a field/patch'), and 野 ('a field, open land') describe farming life itself. 登山 ('mountain-climbing') rounds the group out as an outdoor activity tied to the land.",
    extendedInsight:
      "農家 (a farmer or farming household — a person/business) and 農民 (farmers as a social class — a more general, sometimes historical term) share the same first kanji but aren't interchangeable; 農家です naturally means 'I'm a farmer,' while 農民 usually describes farmers collectively rather than a single household.",
    examples: [
      {
        jp: "彼の家族は農業をしています。",
        romaji: "Kare no kazoku wa nougyou o shite imasu.",
        en: "His family is in agriculture.",
      },
      {
        jp: "週末に登山に行きます。",
        romaji: "Shuumatsu ni tozan ni ikimasu.",
        en: "I'm going mountain-climbing this weekend.",
      },
    ],
    commonMistake:
      "農家 (a farmer/farming household, a person or business) and 農業 (agriculture, the industry itself) get swapped — 農家です means 'I am a farmer,' while 農業です sounds like claiming to literally be an industry.",
    rows: [
      {
        label: "city & land",
        terms: ["都市", "土地", "熱帯"],
      },
      {
        label: "farming & the countryside",
        terms: ["農家", "農業", "農民", "畑", "野"],
      },
      {
        label: "outdoor activity",
        terms: ["登山"],
      },
    ],
  },
  {
    key: "n3-b10-years-age",
    title: "Years, Age & Duration",
    subtitle: "年月・年齢",
    insight:
      "A cluster built entirely from 年 ('year'): 年間 (a span of one year, or an X-year period), 年中 (all year round, always), 年代 (an era or generation), 年齢 (age, the formal word for how old someone is), and 年月 (years and months — a long stretch of time), plus 年寄 (an elderly person).",
    extendedInsight:
      "年月 has two accepted readings, としつき and ねんげつ — both mean 'years and months' (a long span of time), with としつき the more natural spoken reading and ねんげつ the more literary/formal one.",
    examples: [
      {
        jp: "祖母は年寄になっても元気です。",
        romaji: "Sobo wa toshiyori ni natte mo genki desu.",
        en: "My grandmother is energetic even now that she's elderly.",
      },
      {
        jp: "長い年月がかかりました。",
        romaji: "Nagai toshitsuki ga kakarimashita.",
        en: "It took many years.",
      },
    ],
    commonMistake:
      "年齢 (the formal word for 'age') isn't how age comes up in casual conversation — 何歳ですか asks someone's age in everyday speech, while 年齢 shows up mostly in forms and formal writing, like a 年齢欄 ('age field') on a document.",
    rows: [
      {
        label: "spans of time",
        terms: ["年間", "年中", "年代", "年月", "年月-2"],
      },
      {
        label: "age & the elderly",
        terms: ["年齢", "年寄"],
      },
    ],
  },
  {
    key: "n3-b10-publishing-records",
    title: "Publishing, Records & Presentation",
    subtitle: "出版・発表",
    insight:
      "図書 ('books', as a category), 内容 ('the contents/substance' of something written or spoken), 載せる/載る ('to place something so it appears in print' / 'for it to appear in print', a transitive-intransitive pair), 拍手 ('applause', what an audience gives after a presentation), and トップ ('the top', as in a top story or top rank) together cover how information gets recorded and shared.",
    extendedInsight:
      "載せる and 載る form a transitive/intransitive pair like N4's own 決める/決まる — 新聞に記事を載せる ('to run an article in the newspaper', someone's action) versus 記事が新聞に載る ('the article appears in the newspaper', the resulting state).",
    examples: [
      {
        jp: "その記事は新聞のトップに載りました。",
        romaji: "Sono kiji wa shinbun no toppu ni norimashita.",
        en: "That article appeared on the front page of the newspaper.",
      },
      {
        jp: "発表の後、大きな拍手がありました。",
        romaji: "Happyou no ato, ookina hakushu ga arimashita.",
        en: "After the presentation, there was a big round of applause.",
      },
    ],
    commonMistake:
      "載せる (to publish/place information so it appears in print) and 乗せる (to put a physical thing or person onto/aboard something) are homophones written differently — 新聞に載せる publishes it in the paper, while 車に乗せる gives someone a ride.",
    rows: [
      {
        terms: ["図書", "内容", "載せる", "載る", "拍手", "トップ"],
      },
    ],
  },
  {
    key: "n3-b10-hatsu-compounds",
    title: "発 Compounds — Discovery, Development & Departure",
    subtitle: "発～",
    insight:
      "発 ('to emit, set out, occur') is the shared building block behind a whole family of words: 発見 (discovery), 発明 (invention), 発達/発展 (both roughly 'development', 発達 leaning toward a person, skill, or technology maturing, 発展 toward a business or region expanding), 発車/発射 (both read はっしゃ but meaning different things — a vehicle departing versus something being fired/launched), 発行 (issuing a publication), 発表 (making an announcement), and 爆発 (an explosion, where 発 forms the second half).",
    extendedInsight:
      "発車 and 発射 are true homophones (both read はっしゃ) told apart only by kanji and context — 電車が発車する is the train departing, while ロケットが発射する is a rocket launching.",
    examples: [
      {
        jp: "新しい薬が発見されました。",
        romaji: "Atarashii kusuri ga hakken saremashita.",
        en: "A new medicine was discovered.",
      },
      {
        jp: "電車がもうすぐ発車します。",
        romaji: "Densha ga mou sugu hassha shimasu.",
        en: "The train will depart soon.",
      },
    ],
    commonMistake:
      "発車 (a vehicle departing) and 発射 (firing/launching something, like a rocket) share the exact reading はっしゃ but describe very different events — mixing up the kanji is an easy slip even for native speakers.",
    rows: [
      {
        label: "finding & creating",
        terms: ["発見", "発明"],
      },
      {
        label: "growing & developing",
        terms: ["発達", "発展"],
      },
      {
        label: "departing & launching",
        terms: ["発車", "発射"],
      },
      {
        label: "publishing & announcing",
        terms: ["発行", "発表"],
      },
      {
        label: "bursting out",
        terms: ["爆発"],
      },
    ],
  },
  {
    key: "n3-b10-homophone-verbs",
    title: "Homophone Verb Trios — Same Reading, Different Kanji",
    subtitle: "同音異義語",
    insight:
      "Several everyday readings split into different verbs depending on what's happening: のぼる splits into 上る (to go up/climb, a general ascent) and 昇る (to rise, especially the sun or something rising through the air); とめる splits into 留める (to fasten something in place, or turn something off) and 泊める (to let someone stay the night); はかる splits three ways depending on what's measured — 計る (time or a count), 量る (weight), 測る (length, area, or depth); and なる splits into 為る (to become/turn into) and 生る (for a plant to bear fruit).",
    extendedInsight:
      "These trios are a classic N3 reading trap — the kana alone (のぼる, とめる, はかる, なる) never tells you which kanji is meant, so context is the only way to choose correctly, the same skill N4's 空く/開く homophones taught on a smaller scale.",
    examples: [
      {
        jp: "太陽が東から昇ります。",
        romaji: "Taiyou ga higashi kara noborimasu.",
        en: "The sun rises from the east.",
      },
      {
        jp: "時間を計ってください。",
        romaji: "Jikan o hakatte kudasai.",
        en: "Please time it.",
      },
    ],
    commonMistake:
      "計る、量る、測る are often all written casually as just はかる, but each kanji is expected to match what's being measured — using 計る for a person's weight, which should be 量る, is a common mix-up.",
    rows: [
      {
        label: "のぼる: ascending",
        terms: ["上る", "昇る"],
      },
      {
        label: "とめる: fastening vs. lodging",
        terms: ["留める", "泊める"],
      },
      {
        label: "はかる: measuring",
        terms: ["計る", "量る", "測る"],
      },
      {
        label: "なる: becoming vs. bearing fruit",
        terms: ["為る-2", "生る"],
      },
    ],
  },
  {
    key: "n3-b10-katakana-loanwords",
    title: "Katakana Loanwords — Travel, Leisure & Everyday Items",
    subtitle: "外来語",
    insight:
      "Many everyday nouns are katakana loanwords close enough to their English source to read at sight, spanning travel (ドライブ, トラック, トンネル, パイロット, パスポート, ハイキング), leisure (トランプ, ドラマ, バイオリン, トレーニング, ドレス), and ordinary items and words (パイプ, はさみ, バッグ, ノー, ノック, パス, パーセント, トン).",
    extendedInsight:
      "A few of these have a narrower Japanese meaning than their English source suggests — パス doesn't just mean 'a pass' in general, it's specifically a ticket/pass (定期パス) or a pass in a game, and トラック can mean either 'truck' or a running 'track', told apart only by context.",
    examples: [
      {
        jp: "週末に友達とドライブに行きます。",
        romaji: "Shuumatsu ni tomodachi to doraibu ni ikimasu.",
        en: "I'm going for a drive with a friend this weekend.",
      },
      {
        jp: "パスポートを忘れないでください。",
        romaji: "Pasupooto o wasurenaide kudasai.",
        en: "Please don't forget your passport.",
      },
    ],
    commonMistake:
      "パス (a pass/ticket, or a pass in sports) isn't related to the English verb 'to pass' meaning time passing — Japanese uses 過ぎる for that instead, so パスする only ever means handing off, skipping, or letting a specific thing pass.",
    rows: [
      {
        label: "getting around",
        terms: [
          "ドライブ",
          "トラック",
          "トンネル",
          "パイロット",
          "パスポート",
          "ハイキング",
        ],
      },
      {
        label: "leisure & fashion",
        terms: ["トランプ", "ドラマ", "バイオリン", "トレーニング", "ドレス"],
      },
      {
        label: "everyday items & words",
        terms: [
          "パイプ",
          "はさみ",
          "バッグ",
          "ノー",
          "ノック",
          "パス",
          "パーセント",
          "トン",
        ],
      },
    ],
  },
  {
    key: "n3-b10-friends-compatibility",
    title: "Friends, Togetherness & Compatibility",
    subtitle: "友人・相性",
    insight:
      "友 (a friend, the plain/literary word behind 友達), 仲 (the rapport between people, as in 仲がいい, 'to get along well'), and 仲間 (a companion, a fellow member of a group) describe relationships; 共に ('together', more formal than 一緒に) describes doing something jointly; 似合う ('to suit someone', e.g. clothing) and 馴れる ('to become used to/tame with', over time) round out the group.",
    extendedInsight:
      "仲 (the bond/rapport itself) and 仲間 (an actual person sharing that bond) are built from the same kanji but aren't interchangeable — 仲がいい describes a relationship, while 仲間ができる means 'I made a companion.'",
    examples: [
      {
        jp: "彼らはいつも共に働いています。",
        romaji: "Karera wa itsumo tomoni hataraite imasu.",
        en: "They always work together.",
      },
      {
        jp: "あの色はあなたによく似合います。",
        romaji: "Ano iro wa anata ni yoku niaimasu.",
        en: "That color really suits you.",
      },
    ],
    commonMistake:
      "共に ('together', a formal written word) isn't a casual substitute for 一緒に — using 共に in everyday spoken conversation can sound stiff or literary where 一緒に would be natural.",
    rows: [
      {
        terms: ["友", "共に", "仲", "仲間", "似合う", "馴れる"],
      },
    ],
  },
  {
    key: "n3-b10-abstract-extremes",
    title: "Abstract Concepts, Ability & Extremes",
    subtitle: "抽象語・程度",
    insight:
      "A wide-ranging set of abstract nouns and intensity words: what's inside or the substance of something (中身/中味, two spellings of the same word), the middle point of something (半ば), a mystery (謎), and the moment something finally makes sense (納得), alongside what you struggle with (苦手) versus what you're capable of (能力, 能), and how strongly something happens, from an intense storm (激しい) to a vast sum (莫大) to being utterly absorbed in something (熱中).",
    extendedInsight:
      "中身 and 中味 are two accepted spellings of the exact same word なかみ — 身 ('body/substance') is the more common modern spelling, 味 ('flavor') an older variant — both meaning 'the contents/substance of something,' not 'flavor' specifically.",
    examples: [
      {
        jp: "彼はテニスに熱中しています。",
        romaji: "Kare wa tenisu ni netchuu shite imasu.",
        en: "He's absorbed in tennis.",
      },
      {
        jp: "箱の中身が気になります。",
        romaji: "Hako no nakami ga ki ni narimasu.",
        en: "I'm curious about what's inside the box.",
      },
    ],
    commonMistake:
      "苦手 (something you're bad at or dislike, a subjective weak point) isn't the same as 下手 (unskilled, a judgment on actual ability) — 泳ぐのが苦手です can mean you avoid swimming even if you're not truly unskilled at it, while 下手 always judges competence.",
    rows: [
      {
        label: "substance, mystery & understanding",
        terms: ["中身", "中味", "半ば", "謎", "納得"],
      },
      {
        label: "people, ability & everyday life",
        terms: ["苦手", "努力", "能力", "能", "人気", "人間", "日常"],
      },
      {
        label: "intensity & extremes",
        terms: ["激しい", "莫大", "熱中", "馬鹿", "端"],
      },
    ],
  },
  {
    key: "n3-b10-nature-japan",
    title: "Nature, Weather & Japan Itself",
    subtitle: "自然・日本",
    insight:
      "A mix of natural imagery — animals (虎, tiger; 鼠, mouse/rat), elemental words (波, wave; 灰, ash; 根, root) — and the rainy season under its more formal reading (梅雨, here read ばいう rather than the everyday つゆ), plus a small cluster built on 日 ('sun/day') itself: 日 (day), 日光 (sunlight), 日中 (daytime), and 日本's own two accepted readings.",
    extendedInsight:
      "日本 is read both にっぽん and にほん — both are completely correct and mean the same thing, but にっぽん is the more formal/emphatic reading (used on currency and at sporting events, 'がんばれ日本!'), while にほん is the everyday reading used in ordinary conversation.",
    examples: [
      {
        jp: "今日は日光が強いです。",
        romaji: "Kyou wa nikkou ga tsuyoi desu.",
        en: "The sunlight is strong today.",
      },
      {
        jp: "梅雨の時期は雨が多いです。",
        romaji: "Baiu no jiki wa ame ga ooi desu.",
        en: "During the rainy season, there's a lot of rain.",
      },
    ],
    commonMistake:
      "梅雨 is almost always read つゆ in everyday speech — the reading ばいう given here is the more formal/written one, so using ばいう in casual conversation can sound oddly stiff even though it isn't wrong.",
    rows: [
      {
        label: "animals & elements",
        terms: ["虎", "鼠", "波", "灰", "根"],
      },
      {
        label: "the rainy season",
        terms: ["梅雨-2"],
      },
      {
        label: "day, sunlight & Japan",
        terms: ["日", "日本", "日本-2", "日光", "日中"],
      },
    ],
  },
  {
    key: "n3-b10-wishes-body",
    title: "Wishes, Sorrow & the Body",
    subtitle: "願い・悲しみ",
    insight:
      "願い/願う and 望み/望む are two closely related noun/verb pairs both meaning 'wish/hope' — 願う leans toward a heartfelt request, 望む toward hoping for a particular outcome. 涙 (tears) and 悩む (to be troubled) describe emotional distress; 亡くす (to lose someone to death) and 殴る (to strike) describe painful events; 肌 and 裸 round the group out as body-related words.",
    extendedInsight:
      "願う and 望む overlap heavily, but 願い事 ('a wish', e.g. what you make at a shrine) specifically uses 願う's noun form, not 望み's — a collocation difference rather than a meaning difference.",
    examples: [
      {
        jp: "彼女は医者になることを望んでいます。",
        romaji: "Kanojo wa isha ni naru koto o nozonde imasu.",
        en: "She hopes to become a doctor.",
      },
      {
        jp: "祖父を亡くして、悲しかったです。",
        romaji: "Sofu o nakushite, kanashikatta desu.",
        en: "I was sad after losing my grandfather.",
      },
    ],
    commonMistake:
      "亡くす specifically means 'to lose someone to death,' not 'to lose an object' — losing your keys or wallet uses 無くす (a different but identically-sounding word), and mixing up the kanji here can sound like you're saying an object died.",
    rows: [
      {
        label: "wishing & hoping",
        terms: ["願い", "願う", "望み", "望む"],
      },
      {
        label: "sorrow & pain",
        terms: ["涙", "悩む", "亡くす", "殴る"],
      },
      {
        label: "the body",
        terms: ["肌", "裸"],
      },
    ],
  },
  {
    key: "n3-b10-verb-pairs-flow",
    title: "Transitive & Intransitive Verb Pairs, More",
    subtitle: "自動詞・他動詞（続）",
    insight:
      "A more advanced round of the same transitive/intransitive pattern N4 introduced — someone actively doing something versus that same change just happening on its own: 抜く/抜ける (to pull out / to come out), 煮る/煮える (to boil something / for it to boil), 外す/外れる (to unfasten / to come undone), 流す/流れる (to drain something away / for it to flow), and two related verbs for stretching or delaying, 伸ばす/伸びる (to physically extend/stretch something) and 延ばす/延びる (to extend or postpone, more often used for time and schedules).",
    extendedInsight:
      "伸ばす／伸びる and 延ばす／延びる share the same reading pair (のばす／のびる) but split by what's being extended — 伸 is for physical length or growth (髪を伸ばす, 'to grow out your hair'), while 延 is for time, distance, or postponing (出発を延ばす, 'to postpone a departure').",
    examples: [
      {
        jp: "旅行の予定を延ばしました。",
        romaji: "Ryokou no yotei o nobashimashita.",
        en: "I postponed the travel plans.",
      },
      {
        jp: "川の水が速く流れています。",
        romaji: "Kawa no mizu ga hayaku nagarete imasu.",
        en: "The river water is flowing fast.",
      },
    ],
    commonMistake:
      "取れる ('to come off', e.g. a button) is close to 外れる ('to come undone/detach'), but 外れる suggests something fitted or fastened coming loose (a lid, a mechanism), while 取れる is the more general 'came off' for anything that was attached.",
    rows: [
      {
        label: "pulling out & coming out",
        terms: ["抜く", "抜ける"],
      },
      {
        label: "boiling",
        terms: ["煮る", "煮える"],
      },
      {
        label: "unfastening & coming undone",
        terms: ["外す", "外れる", "取れる"],
      },
      {
        label: "stretching, growing & postponing",
        terms: ["伸ばす", "伸びる", "延ばす", "延びる"],
      },
      {
        label: "flowing, wetting & viewing",
        terms: ["流す", "流れ", "流れる", "濡らす", "眺め", "眺める"],
      },
    ],
  },
  {
    key: "n3-b10-occupations-institutions",
    title: "Occupations, Institutions & Events",
    subtitle: "職業・行事",
    insight:
      "A mix of people, places, and events beyond everyday routine — a job (俳優, actor), an academic title (博士, a doctorate holder), buildings you'd visit occasionally (博物館, museum; 墓, a grave), a financial crisis (破産, bankruptcy), a service that brings something to you (配達, delivery), an event's beginning (入場, entering a venue), and the counter for buildings themselves (軒).",
    extendedInsight:
      "軒 doubles as both the plain noun 'eaves' (the edge of a roof) and the counter for buildings/houses (一軒, 二軒) — the counter use is by far more common in everyday conversation than the architectural noun.",
    examples: [
      {
        jp: "祖母は先週、博物館に行きました。",
        romaji: "Sobo wa senshuu, hakubutsukan ni ikimashita.",
        en: "My grandmother went to the museum last week.",
      },
      {
        jp: "荷物が今日配達されます。",
        romaji: "Nimotsu ga kyou haitatsu saremasu.",
        en: "The package will be delivered today.",
      },
    ],
    commonMistake:
      "破産 ('bankruptcy', a company or person's finances collapsing) is sometimes confused with simply losing money — 破産する specifically describes the legal/financial state of being unable to pay debts, not just having a bad month financially.",
    rows: [
      {
        terms: ["俳優", "博士", "博物館", "墓", "破産", "配達", "入場", "軒"],
      },
    ],
  },
  {
    key: "n3-b10-everyday-objects",
    title: "Everyday Objects & Materials",
    subtitle: "身の回りの物・材料",
    insight:
      "A grab-bag of common nouns for things you can point at and describe — a cooking pot (鍋), rope (縄), cloth (布), a flag (旗) — plus a few nouns that feel abstract but are actually very concrete in use: 名 (a name), 場 (a place/spot, as in その場, 'on the spot'), 値 (a price or value), 泥 (mud), and 生 (raw, uncooked or unprocessed, as in 生野菜, 'raw vegetables').",
    extendedInsight:
      "値 (a price or numeric value) shows up constantly in compounds like 値段 ('price') and 価値 ('worth') — worth noticing as the same building block reappearing in bigger words, the same way N4 taught 気 as a recurring root.",
    examples: [
      {
        jp: "鍋で野菜を煮ます。",
        romaji: "Nabe de yasai o nimasu.",
        en: "I boil the vegetables in a pot.",
      },
      {
        jp: "その品物の値が上がりました。",
        romaji: "Sono shinamono no ne ga agarimashita.",
        en: "The price of that item went up.",
      },
    ],
    commonMistake:
      "生 (raw/uncooked, read なま here) shouldn't be confused with 新しい ('new') — 生 specifically means unprocessed or uncooked, not simply 'fresh' in a general sense, so 生の肉 means raw meat, not just meat that was recently bought.",
    rows: [
      {
        terms: ["鍋", "縄", "布", "旗", "名", "場", "値", "泥", "生-2"],
      },
    ],
  },
  {
    key: "n3-b10-handling-reaching",
    title: "Handling, Removing, Reaching & Closing",
    subtitle: "扱う・届く",
    insight:
      "Everyday physical-action verbs for how you handle things and spaces — taking hold of something (握る, to grasp) or taking it away (取り上げる, to take up/confiscate; 除く, to remove/exclude), looking briefly into a space (覗く, to peek), putting something onto a surface or vehicle (乗せる), leaving something behind on purpose (残す, with its noun form 残り, 'what's left over'), cleaning (掃く, to sweep), shutting something (閉じる, e.g. a book or your eyes), and something finally arriving (届く).",
    extendedInsight:
      "閉じる covers the softer or more abstract side of 'closing' (目を閉じる, 'to close your eyes'; 本を閉じる, 'to close a book'), while the everyday pair 閉まる/閉める is used more for doors and windows.",
    examples: [
      {
        jp: "彼は目を閉じて考えました。",
        romaji: "Kare wa me o tojite kangaemashita.",
        en: "He closed his eyes and thought.",
      },
      {
        jp: "手紙がやっと届きました。",
        romaji: "Tegami ga yatto todokimashita.",
        en: "The letter finally arrived.",
      },
    ],
    commonMistake:
      "取り上げる has two very different everyday senses — literally 'to pick something up' and, just as commonly, 'to confiscate/take something away' (子供からゲームを取り上げる, 'to take the game away from the child') — context alone tells you which is meant.",
    rows: [
      {
        terms: [
          "取り上げる",
          "握る",
          "覗く",
          "除く",
          "乗せる",
          "残す",
          "残り",
          "掃く",
          "閉じる",
          "届く",
        ],
      },
    ],
  },
  {
    key: "n3-b10-effort-sound-sudden",
    title: "Effort, Sound & Sudden Events",
    subtitle: "努力・音・突然の出来事",
    insight:
      "A mixed set of action verbs and time words — slacking off (怠ける, to be idle) versus putting in real work (働き, the noun form of 働く, 'labor'), making a sound (鳴らす, to ring/sound something) or speaking formally (述べる, to state one's view), quick physical motions (飛ばす, to skip over; 飛び出す, to dash/fly out), growing (生える, for hair, teeth, or plants to sprout), being punished (罰する), and vomiting (吐く) — plus four words for when something happens: 途端 (the instant something else happens), 突然 (suddenly), 始まり (a beginning), and 後 (afterwards, read のち in its more literary sense).",
    extendedInsight:
      "途端 always describes one event triggering immediately from another — 家を出た途端、雨が降り出した ('the moment I left the house, it started raining') — unlike 突然, which just marks that something happened abruptly with no such triggering relationship required.",
    examples: [
      {
        jp: "家を出た途端、雨が降り出しました。",
        romaji: "Ie o deta totan, ame ga furidashimashita.",
        en: "The moment I left the house, it started raining.",
      },
      {
        jp: "彼は突然立ち上がりました。",
        romaji: "Kare wa totsuzen tachiagarimashita.",
        en: "He suddenly stood up.",
      },
    ],
    commonMistake:
      "怠ける (to be lazy/neglect your duties, a judgment on your effort) isn't the same as simply being tired or resting — 疲れて休む ('resting because you're tired') isn't 怠ける, which specifically implies avoidable neglect, not legitimate rest.",
    rows: [
      {
        label: "effort & speaking",
        terms: ["怠ける", "働き", "述べる", "鳴らす", "罰する"],
      },
      {
        label: "quick physical motion",
        terms: ["飛ばす", "飛び出す", "吐く", "生える"],
      },
      {
        label: "when something happens",
        terms: ["途端", "突然", "始まり", "後-2"],
      },
    ],
  },
  {
    key: "n3-b11-fu-negative-prefix",
    title: "The 不 Negative Prefix — Un-, Non-, Dis-",
    subtitle: "不・無・非",
    insight:
      "不, 無, and 非 are negation prefixes meaning roughly 'not, non-, un-,' each attaching to a word to flip it to its opposite or its absence. 不 is the most common, usually read ふ (不安 'anxiety', 不足 'shortage', 不可 'impossible', 不正 'injustice') but shifting to ぶ before some sounds, as in the standalone 不 itself, used as the negative answer opposite of 可 ('permissible'). 無事, 'without incident,' shows the same pattern with 無 — the prefix alone carries the word's whole meaning.",
    extendedInsight:
      "非常 literally negates 常 ('usual, constant'), but in everyday use it has narrowed to mean an emergency or a seriousness that breaks from the ordinary, not just 'a bit unusual.' 不可, by contrast, keeps the plain logic of 不 plus 可 ('permissible'): together they mean 'not permitted, no good' — the two are often seen paired on forms marking what is and isn't allowed.",
    examples: [
      {
        jp: "台風で電車が不通になった。",
        romaji: "Taifuu de densha ga futsuu ni natta.",
        en: "Due to the typhoon, the trains stopped running.",
      },
      {
        jp: "給料に不満を持つ人が多い。",
        romaji: "Kyuuryou ni fuman o motsu hito ga ooi.",
        en: "Many people are dissatisfied with their salary.",
      },
    ],
    commonMistake:
      "不足 (a missing quantity — not enough of something) and 不満 (a feeling of dissatisfaction) get confused because English uses similar phrasing for both — but 時間が不足している ('there isn't enough time') is a fact about quantity, while 不満 is an emotional reaction that can exist even when nothing is literally missing.",
    rows: [
      {
        label: "不 (ふ・ぶ)",
        terms: [
          "不",
          "不-2",
          "不安",
          "不可",
          "不幸",
          "不自由",
          "不正",
          "不足",
          "不平",
          "不満",
          "不利",
          "不思議",
          "不通",
        ],
      },
      {
        label: "無 & 非",
        terms: ["無-2", "無事", "非常"],
      },
    ],
  },
  {
    key: "n3-b11-katakana-loanwords",
    title: "Katakana Loanwords — Everyday Borrowed Words",
    subtitle: "外来語",
    insight:
      "N3 keeps adding katakana loanwords borrowed mostly from English, each reshaped to fit Japanese sound patterns: バランス ('balance'), プラン ('plan'), and プロ (short for 'professional') all keep their English meaning nearly intact, while others narrow or shift — ホーム usually means a train platform, not 'home,' and ボール can mean either 'ball' or 'bowl' depending on context.",
    extendedInsight:
      "Many katakana words are clipped from a longer English phrase: プロ is short for プロフェッショナル, and ホーム is short for プラットホーム, not a translation of the English word 'home.' Recognizing the clipping pattern helps you guess at unfamiliar katakana words instead of memorizing each one as a separate label.",
    examples: [
      {
        jp: "彼はテニスのプロになった。",
        romaji: "Kare wa tenisu no puro ni natta.",
        en: "He became a professional tennis player.",
      },
      {
        jp: "電車がホームに着いた。",
        romaji: "Densha ga hoomu ni tsuita.",
        en: "The train arrived at the platform.",
      },
    ],
    commonMistake:
      "Learners often use ホーム to mean 'my home,' copying the English word directly — but in Japanese ホーム almost always means a train platform; 'home' in the everyday sense is 家 or 家庭, not ホーム.",
    rows: [
      {
        terms: [
          "バランス",
          "ハンサム",
          "ビール",
          "ピクニック",
          "ビデオ",
          "プラス",
          "プラスチック",
          "プラン",
          "ブレーキ",
          "プロ",
          "ベルト",
          "ペンキ",
          "ベンチ",
          "ボーイ",
          "ボート",
          "ホーム",
          "ボール",
          "ピン",
        ],
      },
    ],
  },
  {
    key: "n3-b11-judgment-evaluation",
    title: "Judgment, Criticism & Evaluation",
    subtitle: "判断・評価",
    insight:
      "判断 ('judgment,' deciding what's true or right) and 評価 ('evaluation,' deciding how good something is) are the two general-purpose words this whole group revolves around. 比較 ('comparison') and 範囲 ('scope, range') describe how you evaluate — against what, and how far — while 批判 ('criticism,' pointing out faults) and 批評 ('criticism, commentary,' a more neutral review) describe what comes out of it.",
    extendedInsight:
      "批判 and 批評 both translate as 'criticism,' but 批判 leans negative — pointing out what's wrong, often with disapproval — while 批評 is closer to 'a review' or 'commentary,' which can praise as easily as it can fault. A film 批評 might be glowing; a 批判 almost never is.",
    examples: [
      {
        jp: "二つの案を比較して判断した。",
        romaji: "Futatsu no an o hikaku shite handan shita.",
        en: "I compared the two proposals and made a decision.",
      },
      {
        jp: "彼の意見を否定するつもりはない。",
        romaji: "Kare no iken o hitei suru tsumori wa nai.",
        en: "I don't intend to deny his opinion.",
      },
    ],
    commonMistake:
      "反省 ('reflection, self-examination, regret over one's own conduct') is often confused with 批判 ('criticism,' directed at someone or something else) — 反省する is always about yourself, so 彼を反省する ('to reflect on him') is a mistake; you 反省 your own mistakes and 批判 someone else's.",
    rows: [
      {
        terms: [
          "反省",
          "判断",
          "比較",
          "否定",
          "等しい",
          "批判",
          "批評",
          "評価",
          "範囲",
        ],
      },
    ],
  },
  {
    key: "n3-b11-crime-protection-misfortune",
    title: "Crime, Protection & Misfortune",
    subtitle: "犯罪・保護",
    insight:
      "犯罪 ('crime') and 犯人 ('the offender, the criminal') share the kanji 犯 ('to commit an offense'); around them sit the words for what a crime causes — 被害 ('damage, harm suffered') and, in the worst cases, 悲劇 ('tragedy') — and what stops it: 防ぐ ('to prevent, to defend against'), 法 ('law, an Act'), and 武器 ('weapon'), the thing law and prevention exist to control.",
    extendedInsight:
      "保証 ('guarantee, assurance') and 保存 ('preservation, conservation') both open with 保, 'to protect, to keep safe' — 保証 protects a promise (製品を保証する, 'to guarantee a product'), while 保存 protects a thing itself from decay or loss (データを保存する, 'to save/preserve data').",
    examples: [
      {
        jp: "警察は犯人を捜している。",
        romaji: "Keisatsu wa hannin o sagashite iru.",
        en: "The police are searching for the culprit.",
      },
      {
        jp: "事故を防ぐために法律を守る。",
        romaji: "Jiko o fusegu tame ni houritsu o mamoru.",
        en: "We follow the law in order to prevent accidents.",
      },
    ],
    commonMistake:
      "反抗 ('opposition, resistance,' usually against authority like a parent or rule) is sometimes confused with 犯罪 ('crime,' a legal offense) — being 反抗的 (rebellious) toward a rule isn't automatically 犯罪; the first is about attitude, the second about breaking the law.",
    rows: [
      {
        label: "crime & law",
        terms: ["反抗", "犯罪", "犯人"],
      },
      {
        label: "protection & prevention",
        terms: ["防ぐ", "法", "保証", "保存", "武器"],
      },
      {
        label: "harm & misfortune",
        terms: ["被害", "悲劇"],
      },
    ],
  },
  {
    key: "n3-b11-business-economy",
    title: "Business, Pricing & Trade",
    subtitle: "商売・物価",
    insight:
      "販売 ('sale, selling') is the anchor word of this group: what a business does after weighing its 費用 ('cost, expense') against the surrounding 物価 ('market prices'), wrapping the result in 包装 ('packaging'), and hoping to build a good 評判 ('reputation') once supply is 豊富 ('abundant, plentiful').",
    extendedInsight:
      "物価 specifically means the general price level across the whole economy — 物価が上がる means prices are rising economy-wide (inflation) — not the price tag on one particular item, which is instead 値段, a separate everyday word worth keeping distinct.",
    examples: [
      {
        jp: "この店は商品の評判がいい。",
        romaji: "Kono mise wa shouhin no hyouban ga ii.",
        en: "This shop has a good reputation for its goods.",
      },
      {
        jp: "配達には包装の費用がかかる。",
        romaji: "Haitatsu ni wa housou no hiyou ga kakaru.",
        en: "Delivery involves packaging costs.",
      },
    ],
    commonMistake:
      "豊富 describes abundance in general — 資源が豊富 ('resources are abundant') — and can't describe a single item the way 'plenty' sometimes can in English; 豊富 needs something countable or measurable in bulk behind it, like 資源, 経験, or 種類.",
    rows: [
      {
        terms: ["販売", "物価", "費用", "豊富", "包装", "評判"],
      },
    ],
  },
  {
    key: "n3-b11-kanji-building-blocks",
    title: "Kanji Building Blocks — 表・分・方・平・本",
    subtitle: "漢字の仲間",
    insight:
      "Some kanji show up again and again as the first half of a compound, each time bending the same core meaning slightly: 表 ('surface, to show') gives 表現 ('expression'), 表情 ('facial expression'), and 表面 ('surface'); 分 ('to divide') gives 部分 ('a part'), 分野 ('a field, a divided-off area of study'), and 分析 ('analysis,' breaking something into its parts); 方 ('direction, way') gives 方向 ('direction') and 方法 ('method'); 平 ('flat, even') gives 平等 ('equality'), 平和 ('peace'), and 平均 ('average'); and 本 ('root, origin, true') gives 本当 ('truth'), 本人 ('the person themself'), and 本物 ('the genuine article').",
    extendedInsight:
      "本 is worth lingering on: its core sense is 'the true root of something,' which is why 本人 doesn't just mean 'a person' but specifically 'that exact person, and not a stand-in or a rumor about them,' and 本物 doesn't just mean 'an object' but 'the real one, not a copy.'",
    examples: [
      {
        jp: "これは本物のダイヤモンドです。",
        romaji: "Kore wa honmono no daiyamondo desu.",
        en: "This is a genuine diamond.",
      },
      {
        jp: "彼はこの分野で有名な学者だ。",
        romaji: "Kare wa kono bun'ya de yuumei na gakusha da.",
        en: "He is a famous scholar in this field.",
      },
    ],
    commonMistake:
      "方 alone (ほう, 'side, direction') is easy to confuse with 方法 ('method') since both get glossed as 'way' in English — but 方 ('this side, that direction') is spatial and relative, while 方法 is a set procedure for doing something; このほうがいい ('this one is better') uses 方 alone, not 方法.",
    rows: [
      {
        label: "表 — surface, to show",
        terms: ["表", "表現", "表情", "表面"],
      },
      {
        label: "分 — to divide",
        terms: ["分", "分-2", "部分", "分野", "分析"],
      },
      {
        label: "方 — direction, way",
        terms: ["方", "方向", "方法", "方々-2"],
      },
      {
        label: "平 — flat, even",
        terms: ["平等", "平和", "平均"],
      },
      {
        label: "本 — root, true, origin",
        terms: ["本当", "本人", "本物"],
      },
    ],
  },
  {
    key: "n3-b11-transitive-intransitive-pairs",
    title:
      "Transitive & Intransitive Pairs — Separating, Spreading, Changing Amount",
    subtitle: "自動詞・他動詞",
    insight:
      "離す/離れる, 放す/放れる, and 広げる/広がる are three transitive/intransitive verb pairs built on the same idea: the す-ending verb is something you do to an object (荷物を離す, 'to let go of the baggage'), while the れる-ending verb is something that happens to a subject on its own (子供が母親から離れる, 'the child becomes separated from its mother'). 減らす/減る follows the identical pattern for quantity: 減らす is 'to reduce something,' 減る is 'to decrease by itself.'",
    extendedInsight:
      "広める looks like it should pair with 広がる/広げる, but it specializes: while 広げる spreads something physical (地図を広げる, 'to spread out a map'), 広める spreads something intangible — information, a custom, a reputation (うわさを広める, 'to spread a rumor'). 増やす and 殖やす are both transitive 'to increase,' but 殖やす is reserved for things that grow by reproducing or compounding — animals, plants, savings — while 増やす covers everything else.",
    examples: [
      {
        jp: "子供は母親から離れなかった。",
        romaji: "Kodomo wa hahaoya kara hanarenakatta.",
        en: "The child did not leave its mother's side.",
      },
      {
        jp: "人口が急に減った。",
        romaji: "Jinkou ga kyuu ni hetta.",
        en: "The population suddenly decreased.",
      },
    ],
    commonMistake:
      "離す (transitive: 'I separate it') and 離れる (intransitive: 'it becomes separated') are easy to swap because English 'separate' works both ways — 手を離した ('I let go of my hand') takes an object with を, while 手から離れた ('it came away from my hand') takes から and no direct object; mixing the particle almost always signals the wrong verb.",
    pairwise: true,
    rows: [
      {
        label: "to part ways",
        terms: ["離す", "離れる"],
      },
      {
        label: "to release / get free",
        terms: ["放す", "放れる"],
      },
      {
        label: "to spread",
        terms: ["広げる", "広がる"],
      },
      {
        label: "to decrease",
        terms: ["減らす", "減る"],
      },
      {
        label: "to grow & spread further",
        terms: ["広める", "増やす", "殖やす"],
      },
    ],
  },
  {
    key: "n3-b11-adverbs-degree",
    title: "Adverbs of Manner & Degree",
    subtitle: "副詞",
    insight:
      "This group covers how something happens rather than what happens: ぴったり ('exactly, neatly') and ほぼ ('almost, roughly') sit at opposite ends of precision, ふと ('suddenly, on a whim') marks something unplanned, and ぼんやり ('vaguely, absentmindedly') describes an unfocused state of mind or a hazy image. 普段 ('usually, ordinarily') sets the baseline that 再び ('again, once more') and 必死 ('desperately, with everything you've got') then depart from.",
    extendedInsight:
      "別に most often shows up in its negative pattern, 別に〜ない, meaning 'not particularly' or 'nothing in particular' — 別に忙しくない ('I'm not particularly busy') — rather than its more literal sense of 'separately.' Used alone as a one-word answer, 別に can also sound curt or dismissive, closer to 'whatever' than a neutral 'nothing much.'",
    examples: [
      {
        jp: "靴のサイズがぴったり合った。",
        romaji: "Kutsu no saizu ga pittari atta.",
        en: "The shoe size fit exactly.",
      },
      {
        jp: "彼は普段あまり話さない。",
        romaji: "Kare wa fudan amari hanasanai.",
        en: "He doesn't usually talk much.",
      },
    ],
    commonMistake:
      "ほぼ ('almost, roughly,' close to complete) is often confused with ぼんやり ('vaguely, hazily,' unclear or unfocused) just because both soften a statement in English translation — but ほぼ終わった means the task is nearly done, while ぼんやり覚えている means the memory itself is fuzzy, not that the remembering is almost finished.",
    rows: [
      {
        terms: [
          "ぴったり",
          "ふと",
          "ほぼ",
          "別に",
          "再び",
          "普段",
          "ぼんやり",
          "必死",
        ],
      },
    ],
  },
  {
    key: "n3-b11-words-speech-atmosphere",
    title: "Words, Speech & Atmosphere",
    subtitle: "言葉・雰囲気",
    insight:
      "文 ('a sentence') is the basic unit of written language — extend the same kanji outward and you get 文明 ('civilization,' the culture that shared writing and knowledge helped build). 一言 ('one word, a brief remark') and 話し合う ('to discuss, to talk something through together') describe how much gets said and how; 秘密 ('secret') describes what doesn't get said at all; and 雰囲気 ('atmosphere, mood') is the feeling that surrounds a conversation, whether or not any words are spoken.",
    extendedInsight:
      "微妙 is one of the most commonly misjudged N3 words in conversation: it literally means 'delicate, subtle,' but in casual speech 微妙 has drifted toward a soft, noncommittal 'not really' or 'kind of iffy' — answering 味はどう？('how's the taste?') with 微妙 doesn't mean 'subtle,' it means 'not great, honestly.'",
    examples: [
      {
        jp: "友達とその問題について話し合った。",
        romaji: "Tomodachi to sono mondai ni tsuite hanashiatta.",
        en: "I discussed the problem with my friend.",
      },
      {
        jp: "部屋の雰囲気が急に変わった。",
        romaji: "Heya no fun'iki ga kyuu ni kawatta.",
        en: "The room's atmosphere suddenly changed.",
      },
    ],
    commonMistake:
      "秘密 means a secret that's deliberately kept hidden — it's not the right word for something simply private or personal that hasn't come up in conversation; 秘密にする means 'to keep something secret' on purpose, which is a stronger claim than just not having mentioned it yet.",
    rows: [
      {
        terms: ["文", "文明", "一言", "話し合う", "秘密", "雰囲気", "微妙"],
      },
    ],
  },
  {
    key: "n3-b11-body-face",
    title: "Body, Face & Expression",
    subtitle: "体・顔",
    insight:
      "腹 ('belly, stomach'), 膝 ('knee'), 額 ('forehead' — here read ひたい), and 骨 ('bone') round out the everyday body-part vocabulary N5/N4 didn't cover. 頬 has two accepted readings, ほほ and ほお, for the exact same word ('cheek') — both are correct and you'll see both in writing. 羽 ('a wing') and 羽根 ('a feather') are closely related but distinct: 羽 is the whole limb a bird flies with, 羽根 is one of the light parts that cover it.",
    extendedInsight:
      "誇り ('pride') and 埃 ('dust') are pure homophones — both read ほこり — with no meaning in common at all; only the kanji or context tells them apart, so 誇りを持つ ('to have pride') and 埃がたまる ('dust accumulates') sound identical read aloud.",
    examples: [
      {
        jp: "彼女は誇りを持って働いている。",
        romaji: "Kanojo wa hokori o motte hataraite iru.",
        en: "She works with pride.",
      },
      {
        jp: "赤ちゃんが微笑んだ。",
        romaji: "Akachan ga hohoenda.",
        en: "The baby smiled.",
      },
    ],
    commonMistake:
      "額 has two completely different readings depending on meaning: read ひたい it means 'forehead' (a body part, the reading taught in this group), but read がく it means 'a sum of money' or 'a framed picture' — the same kanji, unrelated meanings, so context alone tells you which one is meant.",
    rows: [
      {
        label: "body parts",
        terms: ["腹", "膝", "額-2", "骨"],
      },
      {
        label: "the cheek — two readings, one word",
        terms: ["頬", "頬-2"],
      },
      {
        label: "wings & feathers",
        terms: ["羽", "羽根"],
      },
      {
        label: "face & feeling",
        terms: ["微笑む", "誇り", "埃"],
      },
    ],
  },
  {
    key: "n3-b11-travel-structures",
    title: "Travel, Visits & Old Structures",
    subtitle: "旅・建物",
    insight:
      "飛行 ('flight, aviation') and 便 (here 'a flight,' a scheduled service) both describe travel by air; 引越し ('moving house') and 訪問 ('a visit, a call') describe more everyday trips, while 冒険 ('an adventure') describes a much bigger one. 歩道 ('a walkway, a sidewalk') and its 幅 ('width, breadth') are the everyday infrastructure all of this travel happens on.",
    extendedInsight:
      "堀 and 濠 are both read ほり and both mean 'moat' — the kind of defensive water-filled ditch that once surrounded a 塀 (a wall or fence) around a castle or temple. Old Japanese castle towns are full of place names built on this vocabulary, which is why these words show up constantly in historical fiction and travel writing even though moats themselves are rare today.",
    examples: [
      {
        jp: "来月、隣の町に引越しをする。",
        romaji: "Raigetsu, tonari no machi ni hikkoshi o suru.",
        en: "Next month, I'm moving to the neighboring town.",
      },
      {
        jp: "この歩道は幅が広い。",
        romaji: "Kono hodou wa haba ga hiroi.",
        en: "This sidewalk is wide.",
      },
    ],
    commonMistake:
      "訪問 ('a visit, a call') sounds formal in Japanese the way 'to call on someone' does in English — it's the right word for visiting a client's office or a patient in hospital, but using it for casually dropping by a friend's house overstates the occasion; 遊びに行く ('to go over, to hang out') is the everyday equivalent.",
    rows: [
      {
        label: "travel & visiting",
        terms: ["飛行", "引越し", "訪問", "冒険", "歩道", "幅", "便"],
      },
      {
        label: "walls, moats & old buildings",
        terms: ["塀", "堀", "濠", "仏", "棒", "宝石"],
      },
    ],
  },
  {
    key: "n3-b11-everyday-objects-occasions",
    title: "Everyday Objects & Occasions",
    subtitle: "日用品・行事",
    insight:
      "This is a grab bag of the small physical things around daily life — a 針 ('needle') and 紐 ('string, cord') for sewing or tying, a 袋 ('bag') or 瓶 ('bottle') for carrying and storing, a 筆 ('writing brush') and 笛 ('flute, whistle') for two very different kinds of craft — alongside the everyday nouns for organizing time and occasions: 日付 ('a date'), 秒 ('a second'), 服装 ('one's attire, what someone's wearing'), and 舞台 ('a stage'), plus 報告 ('a report') for describing any of it afterward.",
    extendedInsight:
      "品 (here 品-2, read ひん) has a double sense worth knowing: it means 'goods, an item for sale' in compounds like 商品, but used alone or in words like 上品 ('refined, elegant'), it means something closer to 'quality, class, taste' — an abstract sense with no direct English equivalent.",
    examples: [
      {
        jp: "今日の日付を書いてください。",
        romaji: "Kyou no hizuke o kaite kudasai.",
        en: "Please write today's date.",
      },
      {
        jp: "駅は人込みでいっぱいだった。",
        romaji: "Eki wa hitogomi de ippai datta.",
        en: "The station was packed with crowds of people.",
      },
    ],
    commonMistake:
      "服装 ('attire, what someone is wearing overall') is broader than any single clothing item — it covers the whole outfit, styling included, not one 服 ('piece of clothing') at a time; describing just a shirt as someone's 服装 undersells what the word actually covers.",
    rows: [
      {
        label: "everyday objects",
        terms: [
          "針",
          "紐",
          "袋",
          "瓶",
          "品-2",
          "筆",
          "笛",
          "弁当",
          "縁-2",
          "節",
        ],
      },
      {
        label: "dates, crowds & occasions",
        terms: ["日付", "人込み", "秒", "服装", "舞台", "報告", "他-2"],
      },
    ],
  },
  {
    key: "n3-b11-nature-change-scenery",
    title: "Nature, Change & Scenery",
    subtitle: "自然・変化",
    insight:
      "原 ('a field, a plain') and 風景 ('scenery') describe the natural world at its most visible; 灯 ('a light, a lamp') and 炎 ('a flame') describe light and fire within it; and 物質 ('matter, substance') and 物理 ('physics') step back to describe the science of what any of it is made of. Around them sit the words for how things shift over time — 変化 ('change, in general'), 変更 ('a change, a modification,' more deliberate and often official), and 深まる ('to deepen,' as a relationship or the seasons do).",
    extendedInsight:
      "流行る ('to be popular, to come into fashion') and 派手 ('showy, flashy') often show up together describing trends: something that is 流行っている ('currently popular') tends to also be 派手 ('eye-catching, loud') precisely because standing out is what makes a trend spread. Neither word is inherently negative, but 派手 can carry a faint note of 'too much' depending on tone.",
    examples: [
      {
        jp: "この町の風景は季節ごとに変化する。",
        romaji: "Kono machi no fuukei wa kisetsu goto ni henka suru.",
        en: "This town's scenery changes with each season.",
      },
      {
        jp: "その色は少し派手すぎる。",
        romaji: "Sono iro wa sukoshi hade sugiru.",
        en: "That color is a bit too flashy.",
      },
    ],
    commonMistake:
      "変化 and 変更 both mean 'change,' but 変化 describes something changing on its own or gradually (天気が変化する, 'the weather changes'), while 変更 describes a deliberate change someone makes to a plan or a rule (予定を変更する, 'to change the schedule') — using 変更 for the weather sounds like someone is in charge of it.",
    rows: [
      {
        label: "nature & the physical world",
        terms: ["原", "灯", "風景", "炎", "物質", "物理"],
      },
      {
        label: "change, trends & scenes",
        terms: ["変化", "変更", "深まる", "流行る", "場面", "派手"],
      },
    ],
  },
  {
    key: "n3-b11-everyday-verbs",
    title: "Everyday Action Verbs — Contact, Care & Habit",
    subtitle: "動作動詞",
    insight:
      "This group covers verbs of physical contact and everyday action: 打つ ('to hit, to strike') and its more accidental cousin ぶつかる ('to collide with, to bump into') describe forceful contact, while 引っ張る ('to pull, to drag') and 振る ('to wave, to shake') describe controlled motion. 震える ('to shiver, to tremble') describes motion your body does on its own, and 触れる ('to touch, to make contact with') is the gentlest word in the group — it can describe a light physical touch or, more abstractly, briefly mentioning a topic.",
    extendedInsight:
      "含む and 含める look similar but split the task differently: 含む describes what something already contains as a state (この値段は税を含む, 'this price includes tax'), while 含める describes the action of deliberately adding something in (私を含めて三人, 'three people, including me') — 含む is passive and descriptive, 含める is an active choice.",
    examples: [
      {
        jp: "犬が知らない人に吠えた。",
        romaji: "Inu ga shiranai hito ni hoeta.",
        en: "The dog barked at a stranger.",
      },
      {
        jp: "彼は驚いて体が震えた。",
        romaji: "Kare wa odoroite karada ga furueta.",
        en: "He was so surprised his body trembled.",
      },
    ],
    commonMistake:
      "ぶつかる (intransitive: 'to collide, to bump into something') and ぶつける (transitive: 'to knock something into something, often on purpose or by carelessness') are a transitive/intransitive pair themselves — 車にぶつかった ('I collided with the car,' it happened to me) versus 車にぶつけた ('I hit the car with something,' I caused it) — mixing them up can make an accident sound intentional or vice versa.",
    rows: [
      {
        label: "physical contact & force",
        terms: [
          "引っ張る",
          "打つ",
          "ぶつかる",
          "ぶつける",
          "振る",
          "震える",
          "触れる",
        ],
      },
      {
        label: "household & care verbs",
        terms: ["省く", "冷やす", "拭く", "含む", "含める", "吠える"],
      },
    ],
  },
  {
    key: "n3-b11-people-relationships",
    title: "People & Relationships",
    subtitle: "人間関係",
    insight:
      "母親 ('mother') and 夫婦 ('a married couple') describe family relationships directly; 夫人 ('wife, Mrs.,' a polite title for someone else's wife) and 婦人 ('woman,' a formal word for women in general, as in 婦人服 'women's clothing') are close homophones — both read ふじん — but mean different things. 独り ('alone, unmarried') and 一人一人 ('one by one, each person individually') both build on 一人 ('one person') but point in different directions: one toward solitude, the other toward treating a group as individuals.",
    extendedInsight:
      "美人 ('a beautiful woman') is one of the few common N3 words specific to describing a person's appearance rather than their actions or feelings — it's a compliment about looks specifically, distinct from words describing someone's character, and using it about a man sounds odd since it specifically implies a woman.",
    examples: [
      {
        jp: "その夫婦には双子の子供がいる。",
        romaji: "Sono fuufu ni wa futago no kodomo ga iru.",
        en: "That married couple has twin children.",
      },
      {
        jp: "彼は独りで旅行するのが好きだ。",
        romaji: "Kare wa hitori de ryokou suru no ga suki da.",
        en: "He likes traveling alone.",
      },
    ],
    commonMistake:
      "婦人 and 夫人 are pure homophones (both ふじん) with different meanings — 婦人 is a formal general word for 'women' (婦人服, 'women's clothing'), while 夫人 specifically means 'someone's wife' and is normally attached to a name or title — using 夫人 to mean 'women in general' is a mistake that only shows up in writing, since the two sound identical.",
    rows: [
      {
        terms: [
          "母親",
          "夫婦",
          "夫人",
          "婦人",
          "双子",
          "美人",
          "独り",
          "一人一人",
        ],
      },
    ],
  },
  {
    key: "n3-b12-intensity-verbs",
    title: "Rising, Strengthening & Weakening — Intensity Verbs",
    subtitle: "程度の変化を表す動詞",
    insight:
      'Many N3 verbs describe a quality changing in degree rather than a thing physically moving — 増す ("to increase") widens something\'s amount, 高まる ("to rise") lifts a feeling or reputation, and 広まる ("to spread") lets something become widely known. Several pair an intransitive verb (something changes on its own) with a transitive partner (someone changes it): 強まる/強める ("to strengthen") and 弱まる/弱める ("to weaken") follow that same intransitive/transitive logic.',
    extendedInsight:
      'ますます ("increasingly, more and more") often stacks on top of one of these change verbs to emphasize a trend continuing — 不安がますます高まる ("the anxiety keeps rising more and more") adds extra emphasis on top of the verb itself, rather than being an intensity verb on its own.',
    examples: [
      {
        jp: "台風で風が強まりました。",
        romaji: "Taifuu de kaze ga tsuyomarimashita.",
        en: "The wind strengthened because of the typhoon.",
      },
      {
        jp: "彼との信頼を深めたいです。",
        romaji: "Kare to no shinrai o fukametai desu.",
        en: "I want to deepen my trust with him.",
      },
    ],
    commonMistake:
      "弱まる (something weakens by itself, intransitive) and 弱める (someone weakens something, transitive) are often mixed up — 風が弱まりました describes the wind dying down on its own, while 音を弱めてください asks someone to actively lower the volume.",
    rows: [
      {
        label: "increasing in degree",
        terms: [
          "増す",
          "ますます",
          "高まる",
          "強まる",
          "強める",
          "広まる",
          "深める",
        ],
      },
      {
        label: "decreasing in degree",
        terms: ["弱まる", "弱める"],
      },
    ],
  },
  {
    key: "n3-b12-mixing-verbs",
    title: "Mixing & Blending — 混/交 Verb Pairs",
    subtitle: "混ざる・交じる",
    insight:
      'Six verbs, one meaning — "to mix/blend" — split across two kanji (混 and 交) and three verb forms. 混ざる and 交ざる both mean "to become mixed" for things blending into a single whole, 混じる and 交じる lean toward one thing mixing in among a group of others, and 混ぜる/交ぜる are the transitive partner, "to mix something in" yourself.',
    extendedInsight:
      '混 generally suggests substances blending until they\'re no longer separable (水と絵の具が混ざる, "the water and paint mix together"), while 交 suggests distinct things intermingling while staying individually recognizable (色々な人が交じる, "various people are mixed in among the crowd") — a useful rule of thumb, though the two kanji are often used interchangeably in casual writing.',
    examples: [
      {
        jp: "水と絵の具を混ぜてください。",
        romaji: "Mizu to enogu o mazete kudasai.",
        en: "Please mix the water and the paint.",
      },
      {
        jp: "外国人も交じっていました。",
        romaji: "Gaikokujin mo majitte imashita.",
        en: "Foreigners were mixed in among them too.",
      },
    ],
    commonMistake:
      '混ぜる needs an object marked with を (絵の具を混ぜる, "to mix the paint"), while 混ざる describes the result happening on its own, marked with が (絵の具が混ざる, "the paint gets mixed") — swapping their particles is a common slip.',
    rows: [
      {
        label: "混 forms",
        terms: ["混ざる", "混じる", "混ぜる"],
      },
      {
        label: "交 forms",
        terms: ["交ざる", "交じる", "交ぜる"],
      },
    ],
  },
  {
    key: "n3-b12-katakana-loanwords",
    title: "Katakana Loanwords — Business, Media & Everyday Life",
    subtitle: "カタカナ語",
    insight:
      'N3 brings a wave of katakana loanwords close enough to English to read at sight, but each has settled into its own specific Japanese usage — マーケット names a market, ルール is the everyday word for a rule, and データ is used constantly in both business and casual conversation for "data, information."',
    extendedInsight:
      'ストレス doesn\'t just mean physical "stress" the way a science class might use it — in everyday Japanese it almost always means the psychological kind, as in ストレスがたまる ("stress builds up"); マッサージ (a massage) is one common remedy Japanese speakers mention for exactly that.',
    examples: [
      {
        jp: "最近、仕事のストレスがたまっています。",
        romaji: "Saikin, shigoto no sutoresu ga tamatte imasu.",
        en: "Lately, work stress has been building up.",
      },
      {
        jp: "会社のルールを守ってください。",
        romaji: "Kaisha no ruuru o mamotte kudasai.",
        en: "Please follow the company's rules.",
      },
    ],
    commonMistake:
      'マスター has two unrelated everyday senses in Japanese — "the owner/proprietor of a bar or café" and "to master a skill" (as in マスターする) — context alone tells them apart, since neither sense maps cleanly onto a single English word.',
    rows: [
      {
        label: "business, media & data",
        terms: [
          "マーケット",
          "マスター",
          "タイトル",
          "データ",
          "デザイン",
          "マスコミ",
          "メッセージ",
          "ラベル",
          "ルール",
        ],
      },
      {
        label: "everyday & the body",
        terms: [
          "マイク",
          "マイナス",
          "ショック",
          "ストレス",
          "ダウン",
          "チャイム",
          "デザート",
          "マッサージ",
        ],
      },
    ],
  },
  {
    key: "n3-b12-family-life-health",
    title: "Family, Life Stages & Health",
    subtitle: "家族・人生・健康",
    insight:
      'A life\'s course, told in nouns — 迷子 ("a lost child") and 孫 ("a grandchild") mark two ends of family life, 成年 ("the age of adulthood") is the legal milestone in between, and 生涯 ("one\'s whole lifetime") frames the entire arc, ending eventually in 死 ("death"). School life gets its own pair of less happy events: 転校 ("changing schools") and 退学 ("dropping out of school").',
    extendedInsight:
      '生理 most often means "physiology" in a compound like 生理学 ("physiology," the academic field), but used alone it commonly refers to menstruation — a good example of how the same two kanji can carry a narrower everyday meaning than their literal, more clinical sense.',
    examples: [
      {
        jp: "祖母は長い生涯を過ごしました。",
        romaji: "Sobo wa nagai shougai o sugoshimashita.",
        en: "My grandmother spent a long lifetime.",
      },
      {
        jp: "小学校のとき、一度転校しました。",
        romaji: "Shougakkou no toki, ichido tenkou shimashita.",
        en: "When I was in elementary school, I changed schools once.",
      },
    ],
    commonMistake:
      '死 ("death") as a bare noun sounds abrupt and clinical in everyday conversation — Japanese speakers usually soften it with a gentler verb when talking about a real person\'s death, reserving 死 itself for more formal or written contexts (死の原因, "the cause of death").',
    rows: [
      {
        label: "family & growing up",
        terms: ["迷子", "孫", "成年", "転校", "退学"],
      },
      {
        label: "the body & health",
        terms: ["生理", "治療", "脳", "肺", "股"],
      },
      {
        label: "the arc of a life",
        terms: ["生涯", "死"],
      },
    ],
  },
  {
    key: "n3-b12-certainty-feeling",
    title: "Certainty, Feeling & Expectation",
    subtitle: "気持ち・予測の表現",
    insight:
      'These words color a statement with how sure or how emotionally affected the speaker is — まさか ("no way, surely not") voices disbelief, まさに ("precisely, truly") voices certainty, and 当然 ("naturally, of course") frames something as too obvious to question. 予想 ("a prediction") is what you form beforehand, 動揺 ("being shaken, unsettled") is what happens when reality doesn\'t match it, and ほっと ("to feel relieved") is the emotion once things turn out fine after all.',
    extendedInsight:
      'まさか almost always appears with a surprised, negative-leaning statement — まさか彼が来るとは思わなかった ("I never imagined he\'d actually come") — so it functions less like a plain adverb and more like an exclamation of disbelief bolted onto the sentence that follows it.',
    examples: [
      {
        jp: "まさか雪が降るとは思いませんでした。",
        romaji: "Masaka yuki ga furu to wa omoimasen deshita.",
        en: "I never thought it would actually snow.",
      },
      {
        jp: "結果を聞いて、ほっとしました。",
        romaji: "Kekka o kiite, hotto shimashita.",
        en: "I heard the result and felt relieved.",
      },
    ],
    commonMistake:
      '当然 doesn\'t just mean "naturally" in the soft English sense — 当然です can sound blunt or even a little cold in Japanese, closer to "that\'s obvious, it goes without saying," so it\'s worth pairing with a softer tone rather than using it as a casual filler.',
    rows: [
      {
        terms: ["まさか", "まさに", "情", "当然", "動揺", "ほっと", "予想"],
      },
    ],
  },
  {
    key: "n3-b12-grammar-fillers",
    title: "Grammar Terms, Fillers & Everyday Words",
    subtitle: "文法用語・会話の言葉",
    insight:
      'A grab-bag of small, high-frequency words that don\'t belong to one topic — まあ ("well...") softens a statement the way English "well" does, 全く ("completely, really") adds emphasis, and 前もって ("in advance, beforehand") sets up a plan ahead of time. A few of Japanese grammar\'s own basic terms round out the group: 修飾 ("modification," how one word describes another), 節 ("a clause," a grammatical unit smaller than a sentence), and 例え, which besides meaning "an example" also works as "even if" in the pattern たとえ～ても.',
    extendedInsight:
      '末-2 almost always attaches onto another word rather than standing alone, the way 月末 means "the end of the month" and 年末 means "the end of the year," while this pool\'s 音 is read ね rather than the more common おと — a reading reserved for a musical note or a pleasing tone, distinct from おと\'s more neutral "noise, sound."',
    examples: [
      {
        jp: "前もって予約してください。",
        romaji: "Maemotte yoyaku shite kudasai.",
        en: "Please make a reservation in advance.",
      },
      {
        jp: "彼から伝言を預かりました。",
        romaji: "Kare kara dengon o azukarimashita.",
        en: "I received a message from him.",
      },
    ],
    commonMistake:
      '全く behaves differently depending on what follows it — 全く分かりません ("I don\'t understand at all") needs a negative verb to mean "not at all," but 全くその通りです ("that\'s exactly right") pairs it with a positive statement to mean "completely, exactly" — the same adverb doing two different jobs depending on polarity.',
    rows: [
      {
        label: "fillers & degree",
        terms: ["まあ", "全く", "並", "前もって"],
      },
      {
        label: "grammar terms",
        terms: ["修飾", "節-2", "例え", "と"],
      },
      {
        label: "everyday nouns",
        terms: ["伝言", "供", "音-2", "末-2"],
      },
    ],
  },
  {
    key: "n3-b12-homophone-verbs",
    title: "Same-Reading Verb Pairs",
    subtitle: "同じ読み方の動詞",
    insight:
      'N3 keeps pairing up verbs that share a reading but split into different kanji for different shades of meaning. 沿う ("to run along/follow," as a road follows a river) and 添う ("to accompany, to stay close beside") are both read そう; 接ぐ ("to join two things, to graft") and 継ぐ ("to inherit, to succeed someone in a role") are both つぐ; 慣らす ("to get something used to a condition") and 馴らす ("to tame an animal") are both ならす; 諮る ("to consult a group before deciding") and 図る ("to plan, to attempt") are both はかる.',
    extendedInsight:
      '図る is one of Japanese\'s more famous multi-kanji homophones — besides 図る ("to attempt/plan"), the same はかる reading also covers verbs for measuring time, length and weight, none of which are in this batch, but worth knowing 図る is only the "scheme, devise" sense, not a general "to measure" verb.',
    examples: [
      {
        jp: "この道は川に沿っています。",
        romaji: "Kono michi wa kawa ni sotte imasu.",
        en: "This road runs along the river.",
      },
      {
        jp: "祖父の店を継ぎました。",
        romaji: "Sofu no mise o tsugimashita.",
        en: "I took over my grandfather's shop.",
      },
    ],
    commonMistake:
      "諮る always involves asking others before deciding (委員会に諮る, \"to consult the committee\") — using it for a plan you're making entirely on your own, where 図る fits instead, reverses the two words' whole point.",
    rows: [
      {
        label: "そう — to run along / to accompany",
        terms: ["沿う", "添う"],
      },
      {
        label: "つぐ — to graft / to succeed",
        terms: ["接ぐ", "継ぐ"],
      },
      {
        label: "ならす — to accustom / to tame",
        terms: ["慣らす", "馴らす"],
      },
      {
        label: "はかる — to consult / to attempt",
        terms: ["諮る", "図る"],
      },
    ],
  },
  {
    key: "n3-b12-maku-family",
    title: "One Reading, Five Kanji — まく",
    subtitle: "同音異字「まく」",
    insight:
      'Five completely different words share the exact same reading, まく — 巻く ("to wind, to coil, to roll up"), 蒔く ("to sow seeds"), 撒く ("to scatter, to sprinkle"), and two nouns, 幕 ("a curtain, or an act of a play") and 膜 ("a membrane, a thin film"). Nothing links their meanings — they simply sound identical, a reminder that context and kanji, not sound alone, carry meaning in Japanese.',
    extendedInsight:
      '蒔く and 撒く are close enough in both sound and sense to blur together — 種を蒔く ("to sow seeds") plants something to grow, while 水を撒く ("to sprinkle water") just scatters something loosely, with no intention of it taking root.',
    examples: [
      {
        jp: "庭に花の種を蒔きました。",
        romaji: "Niwa ni hana no tane o makimashita.",
        en: "I sowed flower seeds in the garden.",
      },
      {
        jp: "首にマフラーを巻きました。",
        romaji: "Kubi ni mafuraa o makimashita.",
        en: "I wound a scarf around my neck.",
      },
    ],
    commonMistake:
      '幕 (curtain, act) and 膜 (membrane, film) look almost identical and share the same まく reading, but 幕 is something large hung up for a stage or ceremony, while 膜 is a thin biological or material layer — 開幕 ("the curtain rises") and 薄い膜 ("a thin membrane") show how differently each actually gets used.',
    rows: [
      {
        terms: ["巻く", "蒔く", "撒く", "幕", "膜"],
      },
    ],
  },
  {
    key: "n3-b12-formal-abstract",
    title: "Formal & Abstract Vocabulary — Judging, Truth & Perspective",
    subtitle: "判断・抽象語",
    insight:
      'A more formal, written-register vocabulary sits above N3\'s everyday words — 裁く ("to judge," in a court sense), 問う ("to ask, to call into question," more formal than plain asking), and 説く ("to explain, to advocate for an idea") are the kind of verbs you\'d meet in a newspaper editorial rather than casual conversation. The abstract nouns follow the same register: 自己 ("the self"), 視点 ("a point of view"), and 真理 ("truth," in the philosophical sense) name ideas rather than things you can point at.',
    extendedInsight:
      '臨む carries a sense of "facing" something significant — 試験に臨む ("to face an exam") or 会議に臨む ("to go into a meeting prepared") — distinct from the plain word for "to attend" a casual get-together.',
    examples: [
      {
        jp: "彼は平和の大切さを説きました。",
        romaji: "Kare wa heiwa no taisetsusa o tokimashita.",
        en: "He advocated for the importance of peace.",
      },
      {
        jp: "試験に臨む前に、しっかり準備しました。",
        romaji: "Shiken ni nozomu mae ni, shikkari junbi shimashita.",
        en: "Before facing the exam, I prepared thoroughly.",
      },
    ],
    commonMistake:
      '問う is more formal and abstract than plain "to ask" — 責任を問う ("to call someone\'s responsibility into question") challenges or interrogates an idea, not literally asking a simple factual question.',
    rows: [
      {
        label: "formal verbs — judging, questioning & facing",
        terms: ["裁く", "断つ", "問う", "説く", "臨む", "経る"],
      },
      {
        label: "abstract nouns — self, truth & the world",
        terms: ["自己", "視点", "正体", "真理", "相", "難", "振り", "優", "世"],
      },
    ],
  },
  {
    key: "n3-b12-everyday-verbs",
    title: "Everyday Verbs — Effort, Care & Small Actions",
    subtitle: "日常の動詞",
    insight:
      'A broad set of common verbs for everyday effort and small physical actions — 任せる ("to entrust something to someone"), まとめる ("to put things in order, to summarize"), and 学ぶ ("to learn," a more formal word than everyday studying) cover getting organized and picking up new skills, while 擦る ("to rub"), 摘む ("to pluck/pick"), and 捲る ("to turn a page") describe small, specific hand movements.',
    extendedInsight:
      'まとまる (intransitive, "to come together, to be settled") and まとめる (transitive, "to put together, to organize") are a matched pair — 意見がまとまる means opinions naturally converge, while 意見をまとめる means someone actively pulls them together into one.',
    examples: [
      {
        jp: "みんなの意見がやっとまとまりました。",
        romaji: "Minna no iken ga yatto matomarimashita.",
        en: "Everyone's opinions finally came together.",
      },
      {
        jp: "本のページを一枚ずつ捲りました。",
        romaji: "Hon no peeji o ichimai zutsu mekurimashita.",
        en: "I turned the pages of the book one by one.",
      },
    ],
    commonMistake:
      '見掛ける ("to happen to notice, to catch sight of," an unplanned glimpse) is not the same as deliberately looking at something — 駅で彼を見掛けました means you spotted him by chance, not that you went looking for him.',
    rows: [
      {
        label: "entrusting, learning & organizing",
        terms: ["任せる", "まとまる", "まとめる", "学ぶ", "真似", "招く"],
      },
      {
        label: "hands-on physical actions",
        terms: ["裂ける", "擦る", "摘む", "綴じる", "生やす", "捲る"],
      },
      {
        label: "noticing & standing out",
        terms: ["見掛ける", "映える"],
      },
    ],
  },
  {
    key: "n3-b12-science-craft",
    title: "Science, Craft & Invention",
    subtitle: "科学・技術",
    insight:
      'A small cluster of words for how things are made and how they change chemically — 酸化 ("oxidation," the chemical process behind rust), 有機 ("organic," as in 有機野菜 "organic vegetables"), and 精巧 ("elaborate, finely made") describe both natural processes and human craftsmanship, while 操縦 ("to pilot/operate a vehicle or machine") and 創造 ("creation," originating something new) describe skilled human control and invention.',
    extendedInsight:
      '創造 (to create something genuinely new, like an artist or inventor) implies originality, not just assembly, which is why it pairs naturally with art or 世界 ("the world," as in 神が世界を創造した, "God created the world").',
    examples: [
      {
        jp: "鉄は酸化すると錆びます。",
        romaji: "Tetsu wa sanka suru to sabimasu.",
        en: "When iron oxidizes, it rusts.",
      },
      {
        jp: "このおもちゃはとても精巧に作られています。",
        romaji: "Kono omocha wa totemo seikou ni tsukurarete imasu.",
        en: "This toy is made very elaborately.",
      },
    ],
    commonMistake:
      '操縦 specifically means piloting or physically controlling a vehicle or machine (飛行機を操縦する, "to pilot a plane") — it\'s not used for managing people or a company the way an English "to steer/run" might suggest.',
    rows: [
      {
        terms: ["酸化", "精巧", "操縦", "創造", "有機"],
      },
    ],
  },
  {
    key: "n3-b12-work-institutions-society",
    title: "Work, Institutions & Society",
    subtitle: "仕事・制度・社会",
    insight:
      'The vocabulary of organized groups and public institutions — from a workplace\'s own hierarchy (上司 "one\'s superior," 指揮 "to command/direct," 隊/班 "a group, a team") to the machinery of national politics (選挙 "an election," 票 "a ballot/vote," 野党 "the opposition party"). 捜査 ("a criminal investigation") and 非行 ("delinquency, misconduct") name the justice system\'s own side of things, while 倒産 ("bankruptcy") names a company\'s.',
    extendedInsight:
      '正規 ("regular, official, legitimate") contrasts with anything done outside the proper channel — 正規の手続き ("the proper/official procedure") is the correct way to do something, the opposite of a shortcut or workaround.',
    examples: [
      {
        jp: "来月、選挙が行われます。",
        romaji: "Raigetsu, senkyo ga okonawaremasu.",
        en: "An election will be held next month.",
      },
      {
        jp: "警察が事件を捜査しています。",
        romaji: "Keisatsu ga jiken o sousa shite imasu.",
        en: "The police are investigating the case.",
      },
    ],
    commonMistake:
      '野党 ("the opposition party," out of power) and any political party in general aren\'t interchangeable — calling the ruling party itself 野党 would be a direct contradiction, since 野党 specifically means the party or parties not currently in government.',
    rows: [
      {
        label: "leadership & groups at work",
        terms: ["指揮", "衆", "上司", "精算", "隊", "班"],
      },
      {
        label: "politics, law & public order",
        terms: [
          "申告",
          "正規",
          "選挙",
          "捜査",
          "倒産",
          "非行",
          "票",
          "保護",
          "野党",
        ],
      },
    ],
  },
  {
    key: "n3-b12-adjectives-outcomes",
    title: "Adjectives & Competition Outcomes",
    subtitle: "様子・勝敗",
    insight:
      'A mix of descriptive adjectives — 貧しい ("poor, needy"), 真っ赤 ("deep red, flushed"), まぶしい ("dazzling, too bright to look at directly") — alongside the vocabulary of a contest\'s result: 挑戦 ("a challenge, to take something on"), 負け ("a defeat, a loss," the noun form of losing), and the counter 敗 ("~ losses," as in 三勝二敗 "three wins, two losses").',
    extendedInsight:
      '良い is the formal, written reading of the everyday adjective いい ("good") — both are the same word, but 良い appears more often in writing and set phrases (仲が良い, "to get along well"), while いい dominates casual speech.',
    examples: [
      {
        jp: "彼は新しい仕事に挑戦しました。",
        romaji: "Kare wa atarashii shigoto ni chousen shimashita.",
        en: "He took on the challenge of a new job.",
      },
      {
        jp: "夕日で空が真っ赤になりました。",
        romaji: "Yuuhi de sora ga makka ni narimashita.",
        en: "The sky turned deep red from the sunset.",
      },
    ],
    commonMistake:
      '間違い ("a mistake," the noun) and 負け ("a defeat/loss," also a noun) both describe something going wrong, but they\'re not synonyms — a wrong answer is 間違い, while losing a match or contest is 負け.',
    rows: [
      {
        label: "describing quality & appearance",
        terms: ["貧しい", "真っ赤", "まぶしい", "良い"],
      },
      {
        label: "competing, winning & losing",
        terms: ["挑戦", "負け", "敗", "対-2", "間違い"],
      },
    ],
  },
  {
    key: "n3-b12-objects-places",
    title: "Everyday Objects, Structures & Places",
    subtitle: "物・建物・場所",
    insight:
      'A collection of nouns for physical structures and the spaces around them — 柵 ("a fence"), 棟 ("the ridge of a roof," also a counter for buildings), and 枠 ("a frame," physical or figurative, like 予算の枠 "a budget frame") describe the built environment, while 間 ("a space, a room, a pause"), 住 ("dwelling, living somewhere"), and 街 ("a town, a street") describe where and how people actually live.',
    extendedInsight:
      '間, read ま here, appears constantly in compounds for physical or timing gaps — 間に合う ("to be in time for something," literally "to fit into the gap"), 居間 ("a living room," literally "a room for being") — a useful building block for many other everyday words.',
    examples: [
      {
        jp: "庭の周りに柵を作りました。",
        romaji: "Niwa no mawari ni saku o tsukurimashita.",
        en: "I built a fence around the garden.",
      },
      {
        jp: "この街には古い建物がたくさんあります。",
        romaji: "Kono machi ni wa furui tatemono ga takusan arimasu.",
        en: "This town has many old buildings.",
      },
    ],
    commonMistake:
      '街 ("a town," a lively area with shops and streets) and the more general word for "town" (including quiet residential ones) overlap in meaning but aren\'t identical — 街 leans toward a bustling commercial district, so calling a sleepy rural area 街 can sound a little off.',
    rows: [
      {
        label: "structures & fixtures",
        terms: ["柵", "照明", "水洗", "棟", "枠"],
      },
      {
        label: "objects & documents",
        terms: ["膳", "盾", "碑", "年鑑"],
      },
      {
        label: "space & everyday places",
        terms: ["間", "住", "街"],
      },
    ],
  },
  {
    key: "n3-b12-nature-culture",
    title: "Nature, Festivals & Religious Culture",
    subtitle: "自然・祭り・宗教",
    insight:
      'A small cluster connecting nature to Japanese culture and religion — 松 ("a pine tree," a symbol of longevity often seen at New Year\'s), 露 ("dew," the morning moisture on plants), and 福 ("good fortune, blessing") sit alongside religious life: 禅 ("Zen," the Buddhist school and meditation practice), 僧 ("a Buddhist monk/priest"), and 像 ("a statue or image," as in 仏像 "a Buddha statue").',
    extendedInsight:
      '露 ("dew") is a mostly literary, poetic word in modern Japanese — daily conversation rarely needs it, but it shows up often in set phrases about something fleeting and delicate, much like the English "morning dew."',
    examples: [
      {
        jp: "お寺で僧に会いました。",
        romaji: "Otera de sou ni aimashita.",
        en: "I met a monk at the temple.",
      },
      {
        jp: "庭に大きな松の木があります。",
        romaji: "Niwa ni ookina matsu no ki ga arimasu.",
        en: "There's a big pine tree in the garden.",
      },
    ],
    commonMistake:
      '像 ("a statue or image") always names a physical or visual representation (銅像, "a bronze statue") — it\'s never used the way English "image" can mean a reputation or impression, which Japanese instead expresses with a different word.',
    rows: [
      {
        terms: ["松", "祭", "禅", "僧", "像", "露", "福"],
      },
    ],
  },
  {
    key: "n3-b12-homophones-1",
    title: "Same-Reading Kanji Nouns I",
    subtitle: "同音異義語（前半）",
    insight:
      'Five pairs of two-kanji nouns that sound completely identical but mean entirely different things — 資格 ("a qualification, a license") and 視覚 ("the sense of sight") are both しかく; 磁気 ("magnetism") and 磁器 ("porcelain, china") are both じき; 脂肪 ("fat, grease," the bodily substance) and 志望 ("a wish, an ambition," as in 志望校 "one\'s target school") are both しぼう. Only the kanji, never the sound alone, tells a listener which word is meant.',
    extendedInsight:
      '私用 ("personal/private use," the opposite of official business) and 仕様 ("specifications, a method," used constantly in technical and business writing) are both read しよう — 私用で使う ("to use for personal reasons") and 製品の仕様 ("a product\'s specifications") show how differently the same sound can land.',
    examples: [
      {
        jp: "運転の資格を取りました。",
        romaji: "Unten no shikaku o torimashita.",
        en: "I got a driving qualification.",
      },
      {
        jp: "彼は医学部を志望しています。",
        romaji: "Kare wa igakubu o shibou shite imasu.",
        en: "He aspires to attend medical school.",
      },
    ],
    commonMistake:
      '辞退 ("to decline, to respectfully refuse," e.g. an offer) and 字体 ("a font, a style of lettering") share the exact same じたい reading but nothing else — only context makes clear which topic is actually being discussed.',
    rows: [
      {
        label: "しかく",
        terms: ["資格", "視覚"],
      },
      {
        label: "じき",
        terms: ["磁気", "磁器"],
      },
      {
        label: "じたい",
        terms: ["字体", "辞退"],
      },
      {
        label: "しぼう",
        terms: ["脂肪", "志望"],
      },
      {
        label: "しよう",
        terms: ["私用", "仕様"],
      },
    ],
  },
  {
    key: "n3-b12-homophones-2",
    title: "Same-Reading Kanji Nouns II",
    subtitle: "同音異義語（後半）",
    insight:
      'A second wave of same-sounding kanji pairs — 進行 ("advancing, progress"), 新興 ("newly-arisen, up-and-coming," as in 新興国 "an emerging country"), and 振興 ("promotion, encouragement," of an industry or region) are all しんこう, three completely different words sharing one sound. 声明 ("a public declaration/statement") and 姓名 ("someone\'s full name") are both せいめい, and 保障 ("a guarantee, security," as in 社会保障 "social security") and 補償 ("compensation," for a loss or damage) are both ほしょう.',
    extendedInsight:
      '同士 ("fellow ~, one another," attaching after a noun like 友達同士 "among friends") and 同志 ("a comrade, someone who shares your cause") both read どうし and both describe people who share something in common, but 同士 is a light grammatical suffix while 同志 is a heavier, more political or ideological word for a fellow believer in a cause.',
    examples: [
      {
        jp: "工事の進行はどうですか。",
        romaji: "Kouji no shinkou wa dou desu ka.",
        en: "How is the construction progressing?",
      },
      {
        jp: "政府が地域の振興に取り組んでいます。",
        romaji: "Seifu ga chiiki no shinkou ni torikunde imasu.",
        en: "The government is working on regional promotion.",
      },
    ],
    commonMistake:
      '判 ("size," as in B5判 "B5 paper size") and 版 ("an edition," as in 初版 "the first edition") are both read はん and both relate to printed material, which is exactly why they\'re easy to confuse — 判 is about physical size/format, 版 is about which edition or version.',
    rows: [
      {
        label: "じょし",
        terms: ["女史", "助詞"],
      },
      {
        label: "しんこう",
        terms: ["進行", "新興", "振興"],
      },
      {
        label: "せいめい",
        terms: ["声明", "姓名"],
      },
      {
        label: "せんこう",
        terms: ["先行", "選考"],
      },
      {
        label: "どうし",
        terms: ["同士", "同志"],
      },
      {
        label: "はん",
        terms: ["判", "版"],
      },
      {
        label: "ほしょう",
        terms: ["保障", "補償"],
      },
    ],
  },
];
