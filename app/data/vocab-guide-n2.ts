/**
 * Curated companion content for the N2 study pages — the N2 counterpart to
 * vocab-guide-n3.ts. N2_WORD_CLUSTERS is what the N2 lesson path
 * (app/data/lessons-n2.ts, /learn?level=N2) is built from. It reuses the
 * shared types from vocab-guide.ts.
 *
 * Every id refers to a PoolVocab `id` from the N2 word list and is checked
 * against data/reference/n2-reference.json by test/content/n2/ the same way
 * N3's content is checked — see CLAUDE.md's Content Accuracy section.
 * Readings, meanings and transitivity claims come from that evidence
 * (`pnpm data:draft:clusters N2`), never from memory.
 */
import type { WordCluster } from "./vocab-guide";

export const N2_WORD_CLUSTERS: WordCluster[] = [
  {
    key: "n2-v01-break-crush",
    title: "Breaking, Crushing & Collapsing",
    subtitle: "崩れる・砕ける・潰れる",
    insight:
      "Many N2 verbs come in pairs: one where someone breaks something (transitive, takes を) and one where it breaks on its own (intransitive, takes が). 崩す/崩れる (to destroy / to collapse), 砕く/砕ける (to smash / to be smashed) and 潰す/潰れる (to smash / to be smashed) all follow that pattern.",
    extendedInsight:
      "崩す has a second, everyday sense: to break a large bill into smaller change (千円札を崩す). 潰れる likewise extends beyond physical crushing to a business going bankrupt.",
    examples: [
      {
        jp: "地震で古い壁が崩れました。",
        romaji: "Jishin de furui kabe ga kuzuremashita.",
        en: "The old wall collapsed in the earthquake.",
      },
      {
        jp: "この千円札を崩してくれませんか。",
        romaji: "Kono senensatsu o kuzushite kuremasen ka.",
        en: "Could you break this 1,000-yen bill into change for me?",
      },
    ],
    commonMistake:
      "Don't mix the two of a pair. A wall that falls by itself takes が (壁が崩れた), while 壁を崩した means someone brought it down. 壁を崩れた is ungrammatical, because an intransitive verb can't take を for its subject.",
    pairwise: true,
    rows: [
      {
        label: "collapsing",
        terms: ["崩す", "崩れる"],
      },
      {
        label: "smashing",
        terms: ["砕く", "砕ける"],
      },
      {
        label: "crushing; going bankrupt",
        terms: ["潰す", "潰れる"],
      },
    ],
  },
  {
    key: "n2-v02-turning-rolling-scattering",
    title: "Rolling, Flipping & Scattering",
    subtitle: "転がる・引っ繰り返る・散らかる",
    insight:
      "These pairs describe things that roll, flip over or end up scattered. 転がす/転がる (to roll something / to roll), 引っ繰り返す/引っ繰り返る (to turn over / to be overturned) and 散らかす/散らかる (to scatter around / to be in disorder) each split into a vt form (someone does it) and a vi form (it happens).",
    extendedInsight:
      "裏返す (to turn inside out, to turn something over) is close to 引っ繰り返す, but it suits a flat thing with a front and a back, such as a sleeve, a card or a piece of fish in a pan. 跳ねる (to jump, to leap) is an intransitive verb for bouncing motion, from a ball to a fish.",
    examples: [
      {
        jp: "ボールが坂を転がっていきました。",
        romaji: "Booru ga saka o korogatte ikimashita.",
        en: "The ball rolled away down the slope.",
      },
      {
        jp: "子供が部屋を散らかしました。",
        romaji: "Kodomo ga heya o chirakashimashita.",
        en: "The child made a mess of the room.",
      },
    ],
    commonMistake:
      "散らかす and 散らかる are easy to swap. 部屋が散らかっている describes the state (the room is messy), while 部屋を散らかした says who made it that way. Use を only with 散らかす.",
    rows: [
      {
        label: "rolling",
        terms: ["転がす", "転がる"],
      },
      {
        label: "flipping over",
        terms: ["引っ繰り返す", "引っ繰り返る"],
      },
      {
        label: "scattering",
        terms: ["散らかす", "散らかる"],
      },
      {
        label: "turning over; jumping",
        terms: ["裏返す", "跳ねる"],
      },
    ],
  },
  {
    key: "n2-v03-blocked-stuck-attached",
    title: "Blocked, Stuck & Attached",
    subtitle: "塞がる・詰まる・挟まる",
    insight:
      "This group covers things being closed off, wedged in or stuck together. 塞ぐ/塞がる (to block up / to be shut up), 挟む/挟まる (to hold between / to get caught between) and くっつける/くっつく (to attach / to adhere) are transitive/intransitive pairs. 詰まる (to be blocked, to be packed) and 引っ掛かる (to be caught in) are intransitive on their own.",
    extendedInsight:
      "突っ込む (to plunge or stick into) and はめる (to insert, to put on) are the transitive actions that often cause the stuck state. つまずく (to stumble, to trip) is what happens when your foot catches on something.",
    examples: [
      {
        jp: "パンの間にハムを挟みました。",
        romaji: "Pan no aida ni hamu o hasamimashita.",
        en: "I put some ham between the slices of bread.",
      },
      {
        jp: "道でつまずいて、転びそうになりました。",
        romaji: "Michi de tsumazuite, korobisou ni narimashita.",
        en: "I tripped on the road and almost fell.",
      },
    ],
    commonMistake:
      "挟む and 挟まる are not interchangeable. 本にしおりを挟む uses the transitive verb (you insert a bookmark), while ドアに指が挟まった uses the intransitive one (your finger got caught in the door, without anyone meaning it).",
    rows: [
      {
        label: "blocking up",
        terms: ["塞ぐ", "塞がる", "詰まる"],
      },
      {
        label: "getting caught between",
        terms: ["挟む", "挟まる", "引っ掛かる"],
      },
      {
        label: "sticking together",
        terms: ["くっつける", "くっつく"],
      },
      {
        label: "pushing in",
        terms: ["突っ込む", "はめる", "つまずく"],
      },
    ],
  },
  {
    key: "n2-v04-shape-size",
    title: "Changing Shape & Size",
    subtitle: "縮む・膨らむ・尖る",
    insight:
      "Some verbs describe something getting smaller, bigger or changing shape. 縮む/縮める (to shrink / to shorten) and 膨らむ/膨らます (to swell / to inflate) are pairs, and 縮れる (to be wavy, to be curled) describes hair or fabric that has crinkled. 尖る (to taper to a point), 凹む (to be dented) and 曲げる (to bend) describe the resulting shape.",
    extendedInsight:
      "薄める (to dilute, to water down) changes a liquid's strength rather than its shape, but it belongs with these because it also reduces something. 固まる (to harden, to solidify) is the opposite direction from 溶かす, which appears in the next lessons.",
    examples: [
      {
        jp: "風船を膨らましてください。",
        romaji: "Fuusen o fukuramashite kudasai.",
        en: "Please blow up the balloon.",
      },
      {
        jp: "セーターを洗ったら、縮んでしまいました。",
        romaji: "Seetaa o arattara, chijinde shimaimashita.",
        en: "When I washed the sweater, it shrank.",
      },
    ],
    commonMistake:
      "縮む is intransitive (服が縮む, the clothes shrink) and 縮める is transitive (時間を縮める, to cut down the time). Because 縮める often takes things like 距離 or 時間, learners sometimes wrongly put が on the object of 縮める.",
    pairwise: true,
    rows: [
      {
        label: "shrinking",
        terms: ["縮む", "縮める"],
      },
      {
        label: "swelling",
        terms: ["膨らむ", "膨らます"],
      },
      {
        label: "curling; pointing; denting",
        terms: ["縮れる", "尖る", "凹む"],
      },
      {
        label: "bending; hardening; diluting",
        terms: ["曲げる", "固まる", "薄める"],
      },
    ],
  },
  {
    key: "n2-v05-heat-light",
    title: "Heat, Burning & Light",
    subtitle: "焦げる・溶かす・照らす",
    insight:
      "This lesson covers verbs of cooking, melting and shining. 焦がす/焦げる (to burn, to scorch / to be burned) and 溶かす (to melt, to dissolve) are the vt side of a change, while 照らす (to shine on, to illuminate) is transitive and 照る (to shine) is intransitive. 熱する (to heat) is a formal verb ending in する.",
    extendedInsight:
      "炒る and 煎る are both read いる and both mean to roast dry (beans, tea leaves, sesame seeds). あぶる (to scorch, to roast) is for cooking over a direct flame. 涼む (to cool off) is what people do in the evening breeze.",
    examples: [
      {
        jp: "魚を焦がしてしまいました。",
        romaji: "Sakana o kogashite shimaimashita.",
        en: "I ended up burning the fish.",
      },
      {
        jp: "月が夜の道を照らしています。",
        romaji: "Tsuki ga yoru no michi o terashite imasu.",
        en: "The moon is shining on the night road.",
      },
    ],
    commonMistake:
      "焦がす and 焦げる differ in who is doing the burning. 魚が焦げた says the fish got burnt (perhaps through inattention), while 魚を焦がした says you burnt it. In the same way, 照らす takes を (月が道を照らす) but 照る does not.",
    rows: [
      {
        label: "burning",
        terms: ["焦がす", "焦げる"],
      },
      {
        label: "melting; heating",
        terms: ["溶かす", "熱する"],
      },
      {
        label: "roasting",
        terms: ["炒る", "煎る", "あぶる"],
      },
      {
        label: "shining; cooling off",
        terms: ["照らす", "照る", "涼む"],
      },
    ],
  },
  {
    key: "n2-v06-nature-change-state",
    title: "Withering, Ripening & Growing Calm",
    subtitle: "枯れる・実る・静まる",
    insight:
      "These intransitive verbs describe how nature and conditions change without anyone acting. 枯れる (to wither), しぼむ (to wither, to shrivel), 錆びる (to rust) and 濁る (to become muddy) describe things getting worse, while 実る (to bear fruit, to ripen), 茂る (to grow thick) and 蘇る (to be revived) describe things thriving.",
    extendedInsight:
      "荒れる (to be stormy, to be rough, to be ruined) covers weather, skin and even a person's mood. 静まる (to quieten down) and 更ける (to get late) are used for the calm of night, and 透き通る (to become transparent) suits clear water or glass. 凍える and 飢える describe a body suffering from cold or hunger.",
    examples: [
      {
        jp: "水をやらなかったので、花が枯れました。",
        romaji: "Mizu o yaranakatta node, hana ga karemashita.",
        en: "I didn't water the flowers, so they withered.",
      },
      {
        jp: "秋になると、稲が実ります。",
        romaji: "Aki ni naru to, ine ga minorimasu.",
        en: "When autumn comes, the rice ripens.",
      },
    ],
    commonMistake:
      "These verbs take が, not を, since nothing acts on the plant or the metal: 花が枯れる, 自転車が錆びる. To say someone caused it, English adds a causative, but Japanese usually picks a different verb (for example 枯らす, which is not part of this lesson).",
    rows: [
      {
        label: "decline",
        terms: ["枯れる", "しぼむ", "錆びる", "濁る"],
      },
      {
        label: "growth",
        terms: ["実る", "茂る", "蘇る"],
      },
      {
        label: "stormy and calm",
        terms: ["荒れる", "静まる", "更ける"],
      },
      {
        label: "clear; cold; hungry",
        terms: ["透き通る", "凍える", "飢える"],
      },
    ],
  },
  {
    key: "n2-v07-hanging-wrapping-tying",
    title: "Hanging, Wrapping & Tying",
    subtitle: "吊る・包む・縛る",
    insight:
      "Handwork verbs cover hanging things up, covering them, and tying, sewing or knitting. 吊る and 吊す (both to hang), ぶらさげる (to hang, to suspend), 担ぐ (to carry on the shoulder) and 背負う (to carry on the back) all hold something up off the ground. 被せる (to cover with something), くるむ (to wrap up), 着せる (to put clothes on someone) and 敷く (to spread out) all lay one thing over or under another.",
    extendedInsight:
      "縛る (to tie, to bind), 編む (to knit), 縫う (to sew) and 解く read ほどく (to unfasten) are the handwork verbs that shape and undo. 着替える (to change one's clothes) is what you do to yourself, while 着せる is what you do to someone else.",
    examples: [
      {
        jp: "彼は大きな荷物を背負って歩いていました。",
        romaji: "Kare wa ookina nimotsu o seotte aruite imashita.",
        en: "He was walking along carrying a big pack on his back.",
      },
      {
        jp: "母は毎晩、赤ちゃんに毛布を掛けます。",
        romaji: "Haha wa maiban, akachan ni moufu o kakemasu.",
        en: "My mother puts a blanket over the baby every night.",
      },
    ],
    commonMistake:
      "着せる and 着る are different. You 着る (wear) your own clothes, but you 着せる (dress) a child or a doll, and the person being dressed takes に: 子供に服を着せる. 着替える is for changing your own clothes, so 自分を着替える is unnatural.",
    rows: [
      {
        label: "hanging",
        terms: ["吊る", "吊す", "ぶらさげる"],
      },
      {
        label: "carrying",
        terms: ["担ぐ", "背負う"],
      },
      {
        label: "covering & wrapping",
        terms: ["被せる", "くるむ", "敷く"],
      },
      {
        label: "clothes",
        terms: ["着せる", "着替える"],
      },
      {
        label: "tying, sewing, knitting",
        terms: ["縛る", "編む", "縫う", "解く"],
      },
    ],
  },
  {
    key: "n2-v08-cutting-digging-rubbing",
    title: "Cutting, Digging & Working With Your Hands",
    subtitle: "刻む・掘る・撫でる",
    insight:
      "This lesson gathers verbs for hands-on physical work. 刻む (to mince, to carve), 剃る (to shave), 削る (to cut down little by little), 剥す (to peel off) and 彫る (to carve, to chisel) all remove or shape material. 掘る (to dig) and 耕す (to till) work the soil.",
    extendedInsight:
      "絞る (to wring, to squeeze), 揉む (to rub), 撫でる (to stroke), 捩る and 捻る (both to twist) and 擦る (to rub) describe motions with the fingers or palms. 扇ぐ (to fan), かじる (to bite at) and しゃぶる (to suck) involve the hand or mouth in a lighter way. 破く (to tear) and ちぎる (to cut or tear into small pieces) are transitive verbs for tearing something apart by hand.",
    examples: [
      {
        jp: "ネギを細かく刻んでください。",
        romaji: "Negi o komakaku kizande kudasai.",
        en: "Please chop the green onions finely.",
      },
      {
        jp: "犬の頭を優しく撫でました。",
        romaji: "Inu no atama o yasashiku nademashita.",
        en: "I gently stroked the dog's head.",
      },
    ],
    commonMistake:
      "There are two readings of 掘る/彫る: both are ほる. 井戸を掘る means to dig a well, while 木を彫る means to carve wood. The kanji, not the sound, tells you which is meant. 捩る and 捻る both mean to twist, and only the kanji differ.",
    rows: [
      {
        label: "cutting & shaving",
        terms: ["刻む", "剃る", "削る", "剥す"],
      },
      {
        label: "tearing",
        terms: ["破く", "ちぎる"],
      },
      {
        label: "carving & digging",
        terms: ["彫る", "掘る", "耕す"],
      },
      {
        label: "squeezing & rubbing",
        terms: ["絞る", "揉む", "撫でる", "擦る"],
      },
      {
        label: "twisting",
        terms: ["捩る", "捻る"],
      },
      {
        label: "fanning, biting, sucking",
        terms: ["扇ぐ", "かじる", "しゃぶる"],
      },
    ],
  },
  {
    key: "n2-v09-taking-out-cancelling",
    title: "Taking In, Taking Out & Cancelling",
    subtitle: "取り出す・取り消す・受け持つ",
    insight:
      "A large family of compound verbs starts with 取り or 引き. 取り入れる (to take in, to adopt), 取り出す (to take out), 取り消す (to cancel) and 引き出す (to pull out, to withdraw) all say what direction something moves. 打ち消す (to deny, to negate) is the same idea applied to a statement.",
    extendedInsight:
      "The same family covers responsibility and money. 受け持つ (to take charge of) and 引受る (to undertake) are used when you accept a duty, 配る (to distribute) hands things out, and 払い込む (to pay in) and 払い戻す (to pay back, to refund) describe money moving in and out. 蓄える (to save, to store) is the verb for putting something aside for later.",
    examples: [
      {
        jp: "予約を取り消したいのですが。",
        romaji: "Yoyaku o torikeshitai no desu ga.",
        en: "I'd like to cancel my reservation.",
      },
      {
        jp: "銀行でお金を引き出しました。",
        romaji: "Ginkou de okane o hikidashimashita.",
        en: "I withdrew some money at the bank.",
      },
    ],
    commonMistake:
      "取り出す and 取り消す both start with 取り but go in different directions. 取り出す is for physically taking something out (かばんから財布を取り出す), and 取り消す is for cancelling something abstract like a reservation or a statement. Saying 予約を取り出す would be a strange thing to say.",
    rows: [
      {
        label: "taking in and out",
        terms: ["取り入れる", "取り出す", "引き出す"],
      },
      {
        label: "cancelling & denying",
        terms: ["取り消す", "打ち消す"],
      },
      {
        label: "taking charge",
        terms: ["受け持つ", "引受る", "配る"],
      },
      {
        label: "money in and out",
        terms: ["払い込む", "払い戻す", "蓄える"],
      },
    ],
  },
  {
    key: "n2-v10-catching-searching-aiming",
    title: "Catching, Searching & Aiming",
    subtitle: "捕える・捜す・狙う",
    insight:
      "This lesson gathers verbs for going after something. 捕える (to seize, to capture) and 捕る (to catch, to take) are the ways of grabbing, and 採る (to pick, to adopt) is for gathering or choosing. 捜す (to search for) and 探る (to search, to investigate) are the ways of looking, and 狙う (to aim at) and 目指す (to aim at, to have an eye on) describe the target.",
    extendedInsight:
      "捕る, 採る and 取る are all read とる. 捕る is for catching living things (魚を捕る), 採る is for picking or adopting (きのこを採る, 案を採る), and the plain 取る is the general word. 捜す and 探す are both read さがす, and 捜す leans towards looking for something that is lost or a person who is missing.",
    examples: [
      {
        jp: "警察が犯人を捕えました。",
        romaji: "Keisatsu ga hannin o toraemashita.",
        en: "The police captured the criminal.",
      },
      {
        jp: "弟は夏に虫を捕るのが好きです。",
        romaji: "Otouto wa natsu ni mushi o toru no ga suki desu.",
        en: "My little brother likes catching insects in the summer.",
      },
    ],
    commonMistake:
      "捜す and 探る are not interchangeable. 財布を捜す means to look for a lost wallet, while 探る means to feel out or investigate something you don't yet know, such as someone's motives (相手の気持ちを探る).",
    rows: [
      {
        label: "catching & picking",
        terms: ["捕える", "捕る", "採る"],
      },
      {
        label: "searching",
        terms: ["捜す", "探る"],
      },
      {
        label: "aiming",
        terms: ["狙う", "目指す"],
      },
    ],
  },
  {
    key: "n2-v11-calling-speaking",
    title: "Calling Out, Speaking & Promising",
    subtitle: "呼び掛ける・怒鳴る・誓う",
    insight:
      "Compound verbs ending in 掛ける and 出す describe speech directed at someone. 呼び掛ける (to call out to, to appeal), 話し掛ける (to talk to someone) and 言い出す (to start talking, to suggest) all begin an exchange. 呼び出す (to summon, to call) and 言い付ける (to tell, to order) are what someone in authority says.",
    extendedInsight:
      "The register of speaking varies a lot. 囁く (to whisper) and 怒鳴る (to shout, to yell) sit at opposite ends of volume. 論ずる (to argue, to discuss), 誓う (to swear, to vow) and 命ずる (to command) are formal, while 詫びる (to apologize) is a literary word for saying sorry. 言付ける (to leave a message) and 略す (to abbreviate) round out the group.",
    examples: [
      {
        jp: "知らない人に急に話し掛けられました。",
        romaji: "Shiranai hito ni kyuu ni hanashikakeraremashita.",
        en: "A stranger suddenly spoke to me.",
      },
      {
        jp: "彼女は先生に呼び出されました。",
        romaji: "Kanojo wa sensei ni yobidasaremashita.",
        en: "She was called in by the teacher.",
      },
    ],
    commonMistake:
      "言い付ける and 言付ける look almost identical but mean different things. 言い付ける (いいつける) is to order someone or to tell on them (先生に言い付ける), while 言付ける (ことづける) is to leave a message with someone to pass on. The kanji are almost the same, but the reading and the meaning are not.",
    rows: [
      {
        label: "starting a conversation",
        terms: ["呼び掛ける", "話し掛ける", "言い出す"],
      },
      {
        label: "authority",
        terms: ["呼び出す", "言い付ける", "命ずる"],
      },
      {
        label: "volume",
        terms: ["囁く", "怒鳴る"],
      },
      {
        label: "formal speech",
        terms: ["論ずる", "誓う", "詫びる", "言付ける", "略す"],
      },
    ],
  },
  {
    key: "n2-v12-formal-verbs",
    title: "Formal Verbs in ずる and する",
    subtitle: "信ずる・存じる・承る",
    insight:
      "Formal and written Japanese uses verbs ending in ずる, which is a variant of じる. 信ずる (to believe), 応ずる (to respond, to comply with), 感ずる (to feel, to sense), 生ずる (to arise, to be generated) and 通ずる (to lead, to run) all belong in reports and speeches. 属する (to belong to) and 接する (to attend to, to come into contact with) are formal する verbs.",
    extendedInsight:
      "Humble keigo verbs also end in this form. 存じる and 存ずる are the humble forms of to know (or to think), and 承る (to hear, to be told, to receive an order) is what a shop assistant or receptionist says when taking a request. 心得る (to understand, to have thorough knowledge) and 為す (to accomplish, to do) are old-fashioned, formal verbs.",
    examples: [
      {
        jp: "お客様のご注文を承りました。",
        romaji: "Okyakusama no gochuumon o uketamawarimashita.",
        en: "We have received your order.",
      },
      {
        jp: "その事実を知って、責任を感じました。",
        romaji: "Sono jijitsu o shitte, sekinin o kanjimashita.",
        en: "Knowing that fact, I felt a sense of responsibility.",
      },
    ],
    commonMistake:
      "存じる is humble, so it is used only about yourself. ご存じですか (with ご and じ) is the polite way to ask whether someone else knows something, while 存じますか about the other person would be wrong. Learners often use 存じる for someone else's knowledge.",
    rows: [
      {
        label: "ずる verbs",
        terms: ["信ずる", "応ずる", "感ずる", "生ずる", "通ずる"],
      },
      {
        label: "する verbs",
        terms: ["属する", "接する"],
      },
      {
        label: "humble keigo",
        terms: ["存じる", "存ずる", "承る"],
      },
      {
        label: "formal & old-fashioned",
        terms: ["心得る", "為す"],
      },
    ],
  },
  {
    key: "n2-v13-respect-ritual",
    title: "Respect, Ritual & Fortune",
    subtitle: "敬う・拝む・占う",
    insight:
      "Some verbs belong to religion, custom and respect. 敬う (to show respect, to honor), 拝む (to worship, to pray), 祭る (to deify, to enshrine) and 占う (to predict, to divine) are the actions of a shrine visit, a festival or a fortune-teller's booth. 慶ぶ (to be delighted) is a formal verb of celebration.",
    extendedInsight:
      "祭る (to enshrine a god or spirit) and 祭り (a festival) are related, and this verb is used for the act of enshrining. 拝む describes pressing the palms together in prayer, and 占う usually takes an object such as 運勢 (fortune) or 将来 (the future).",
    examples: [
      {
        jp: "お正月には神社で手を合わせて拝みます。",
        romaji: "Oshougatsu ni wa jinja de te o awasete ogamimasu.",
        en: "At New Year we put our hands together and pray at the shrine.",
      },
      {
        jp: "私たちは年上の人を敬うべきです。",
        romaji: "Watashitachi wa toshiue no hito o uyamau beki desu.",
        en: "We should show respect to our elders.",
      },
    ],
    commonMistake:
      "敬う is for respect shown to people or traditions (先生を敬う), not for a feeling of fondness. To say you like or love someone, use 好き or 可愛がる, and don't use 敬う, which suggests deference rather than closeness.",
    rows: [
      {
        label: "respect & worship",
        terms: ["敬う", "拝む", "祭る"],
      },
      {
        label: "fortune & celebration",
        terms: ["占う", "慶ぶ"],
      },
    ],
  },
  {
    key: "n2-v14-looking-seeing",
    title: "Looking Up, Looking Down & Seeing Off",
    subtitle: "見上げる・見詰める・見送る",
    insight:
      "Compounds with 見 say how and where you look. 見上げる (to look up at, to admire), 見下ろす (to overlook, to look down on), 見詰める (to stare at) and 睨む (to glare at) describe the direction and intensity of a look, and 振り向く (to turn around) is the movement of turning to look behind you.",
    extendedInsight:
      "The same 見 compounds also cover social acts. 見送る (to see off, to let pass), 見舞う (to visit someone who is ill, to ask after their health), 見直す (to look over again, to review) and 見慣れる (to become used to seeing) describe things you do with, or for, other people. 目立つ (to be conspicuous) belongs here because it describes what catches the eye.",
    examples: [
      {
        jp: "空を見上げると、星がきれいでした。",
        romaji: "Sora o miageru to, hoshi ga kirei deshita.",
        en: "When I looked up at the sky, the stars were beautiful.",
      },
      {
        jp: "駅で友達を見送りました。",
        romaji: "Eki de tomodachi o miokurimashita.",
        en: "I saw my friend off at the station.",
      },
    ],
    commonMistake:
      "見送る has two directions. Seeing someone off is 見送る (the person who stays behind does it), but 見送る also means to let an opportunity pass, as in チャンスを見送る. Neither is the same as 送る (to send).",
    rows: [
      {
        label: "looking up, down and hard",
        terms: ["見上げる", "見下ろす", "見詰める", "睨む"],
      },
      {
        label: "turning and standing out",
        terms: ["振り向く", "目立つ"],
      },
      {
        label: "social looking",
        terms: ["見送る", "見舞う", "見直す", "見慣れる"],
      },
    ],
  },
  {
    key: "n2-v15-feelings-attitudes",
    title: "Feelings & Attitudes Toward Others",
    subtitle: "憧れる・恨む・慰める",
    insight:
      "Many N2 verbs describe how one person feels about another. 憧れる (to long for), 羨む (to envy), 恨む (to bear a grudge) and 憎む (to hate) are feelings you have, 悔やむ (to regret) is one you have about yourself, and 呆れる (to be shocked, to be appalled) is a reaction. 嫌がる (to dislike) and 威張る (to swagger) describe how those feelings show.",
    extendedInsight:
      "Kindness has its own verbs. 慰める (to comfort), 可愛がる (to love, to be affectionate towards) and 甘やかす (to pamper) are all done to someone else, and 恵まれる (to be blessed with) describes good fortune. Playful teasing is からかう and ふざける, while 脅かす and 驚かす (both to frighten, to surprise) and ためらう (to hesitate) show a range of reactions.",
    examples: [
      {
        jp: "私は子供のころから外国の生活に憧れていました。",
        romaji:
          "Watashi wa kodomo no koro kara gaikoku no seikatsu ni akogarete imashita.",
        en: "Since I was a child I have longed for life abroad.",
      },
      {
        jp: "友達が落ち込んでいたので、慰めました。",
        romaji: "Tomodachi ga ochikonde ita node, nagusamemashita.",
        en: "My friend was feeling down, so I comforted her.",
      },
    ],
    commonMistake:
      "驚かす and 驚く are transitive and intransitive. 驚く (to be surprised) takes が, but 驚かす (to surprise someone) needs an object: 友達を驚かした. 脅かす is likewise transitive and means to threaten or startle another person, so it is not a synonym for being frightened yourself.",
    rows: [
      {
        label: "longing, envy, hatred",
        terms: ["憧れる", "羨む", "恨む", "憎む"],
      },
      {
        label: "regret and disgust",
        terms: ["悔やむ", "呆れる", "嫌がる", "威張る"],
      },
      {
        label: "kindness",
        terms: ["慰める", "可愛がる", "甘やかす", "恵まれる"],
      },
      {
        label: "teasing & surprise",
        terms: ["からかう", "ふざける", "脅かす", "驚かす", "ためらう"],
      },
      {
        label: "enduring & tiring",
        terms: ["堪える", "くたびれる", "思い込む"],
      },
    ],
  },
  {
    key: "n2-v16-work-duty-completion",
    title: "Work, Duty & Finishing Things",
    subtitle: "努める・務める・仕上がる",
    insight:
      "Verbs for effort, duty and completion appear again and again in work settings. 努める (to try, to aim) and 務める (to serve, to act) are both read つとめる, and the kanji tell you which meaning is meant. 仕上がる and 出来上がる (both to be finished), 組み立てる (to assemble) and こしらえる (to make) describe production.",
    extendedInsight:
      "Money and quantity are part of the same family. 儲かる and 儲ける (to be profitable / to earn), 余る (to be left over) and 足る (to be sufficient) describe results, while 改める (to change, to revise) and 補う (to compensate for) describe fixing them. 売り切れる (to be sold out), 締め切る (to close, cancel) and 張り切る (to be full of vigor) finish the set, and 整う (to be prepared, to be in order) describes readiness.",
    examples: [
      {
        jp: "彼は会議で議長を務めました。",
        romaji: "Kare wa kaigi de gichou o tsutomemashita.",
        en: "He served as chairperson at the meeting.",
      },
      {
        jp: "夕食の準備が整いました。",
        romaji: "Yuushoku no junbi ga totonoimashita.",
        en: "Dinner is ready.",
      },
    ],
    commonMistake:
      "努める and 務める are both つとめる, so they are easy to confuse in writing. 努める means to make an effort (改善に努める), while 務める means to fill a role (司会を務める). A third word, 勤める, is used for being employed at a company, and this lesson does not cover it.",
    rows: [
      {
        label: "effort & duty",
        terms: ["努める", "務める", "改める", "補う"],
      },
      {
        label: "making & finishing",
        terms: ["仕上がる", "出来上がる", "組み立てる", "こしらえる", "整う"],
      },
      {
        label: "profit & quantity",
        terms: ["儲かる", "儲ける", "余る", "足る"],
      },
      {
        label: "selling out, closing, energy",
        terms: ["売り切れる", "締め切る", "張り切る"],
      },
    ],
  },
  {
    key: "n2-v17-approaching-moving",
    title: "Approaching, Chasing & Moving Around",
    subtitle: "近寄る・追い越す・逃がす",
    insight:
      "Verbs of movement describe distance and direction. 近付ける (to bring near) and 近寄る (to approach) go towards something, 迫る (to draw near, to press) is used for time or danger, 追いかける (to run after) and 追い越す (to pass, to outstrip) describe a chase. 逃がす (to let escape) and 退ける (to put something out of the way) send things away.",
    extendedInsight:
      "Body movement has its own verbs: 立ち止まる (to stop, to stand still), 突き当たる (to run into, to collide with), 通り掛かる (to happen to pass by), 飛び込む (to jump in), 這う (to crawl), しゃがむ (to squat), 腰掛ける (to sit down), またぐ (to straddle) and もたれる (to lean on). 巡る (to go around), 遡る (to go back upstream, to date back), 隔てる (to separate, to isolate) and 引き返す (to turn back) trace longer paths.",
    examples: [
      {
        jp: "道を歩いていたら、犬が近寄ってきました。",
        romaji: "Michi o aruite itara, inu ga chikayotte kimashita.",
        en: "As I was walking along the road, a dog came up to me.",
      },
      {
        jp: "雨が強くなったので、途中で引き返しました。",
        romaji: "Ame ga tsuyoku natta node, tochuu de hikikaeshimashita.",
        en: "It started raining harder, so I turned back partway.",
      },
    ],
    commonMistake:
      "近付ける and 近寄る both involve getting close, but 近寄る is intransitive (you approach) while 近付ける is transitive (you bring something close): 火に近寄る (approach the fire), but 火に手を近付ける (hold your hand near the fire).",
    rows: [
      {
        label: "approaching",
        terms: ["近付ける", "近寄る", "迫る"],
      },
      {
        label: "chasing & escaping",
        terms: ["追いかける", "追い越す", "逃がす", "退ける"],
      },
      {
        label: "stopping & colliding",
        terms: ["立ち止まる", "突き当たる", "通り掛かる", "飛び込む"],
      },
      {
        label: "posture",
        terms: ["這う", "しゃがむ", "腰掛ける", "またぐ", "もたれる"],
      },
      {
        label: "going around and back",
        terms: ["巡る", "遡る", "隔てる", "引き返す"],
      },
    ],
  },
  {
    key: "n2-v18-fit-balance-appearance",
    title: "Fitting, Balancing & Appearing",
    subtitle: "釣り合う・当てはまる・浮かぶ",
    insight:
      "These verbs describe how things line up or show up. 釣り合う (to balance), 当てはまる (to be applicable), 当てはめる (to apply, to adapt) and 区切る (to punctuate, to cut off) deal with fitting and dividing, while 片寄る (to be one-sided), 逸れる (to stray from a subject) and ずらす (to shift, to put off) deal with things getting out of line. 傾く (to incline toward, to slant) is the physical version.",
    extendedInsight:
      "浮く, 浮ぶ and 浮かべる all describe floating. 浮く is intransitive (to float), 浮ぶ (to float, to come to mind) is used for ideas as well as objects, and 浮かべる is the transitive form (to float, to show a smile). 潜る (to dive, to get under) is the opposite direction. 匂う (to be fragrant, to smell), 味わう (to taste, to savor) and 響く (to resound) are verbs of the senses, and 真似る and 倣う both mean to imitate.",
    examples: [
      {
        jp: "この規則は全員に当てはまります。",
        romaji: "Kono kisoku wa zenin ni atehamarimasu.",
        en: "This rule applies to everyone.",
      },
      {
        jp: "彼女は顔に笑みを浮かべました。",
        romaji: "Kanojo wa kao ni emi o ukabemashita.",
        en: "She put a smile on her face.",
      },
    ],
    commonMistake:
      "当てはまる and 当てはめる are a vi/vt pair. 条件に当てはまる means you meet the requirement, while 条件に当てはめる means you fit something to the requirement. Learners often use 当てはまる with an object, which needs the transitive form.",
    rows: [
      {
        label: "fitting & dividing",
        terms: ["釣り合う", "当てはまる", "当てはめる", "区切る"],
      },
      {
        label: "out of line",
        terms: ["片寄る", "逸れる", "ずらす", "傾く"],
      },
      {
        label: "floating & diving",
        terms: ["浮く", "浮ぶ", "浮かべる", "潜る"],
      },
      {
        label: "senses",
        terms: ["匂う", "味わう", "響く"],
      },
      {
        label: "imitating",
        terms: ["真似る", "倣う"],
      },
    ],
  },
  {
    key: "n2-v19-hindering-staying-behaving",
    title: "Hindering, Staying & Behaving",
    subtitle: "妨げる・留まる・振舞う",
    insight:
      "This lesson gathers verbs about stopping, staying and conduct. 妨げる (to disturb, to prevent) and 引き止める (to hold back, to detain) obstruct someone, 留まる read とどまる (to remain, to stay) and 留まる read とまる (to stop, to come to a halt) describe stopping in place, and 引っ込む (to draw back) describes retreating.",
    extendedInsight:
      "The other verbs describe manner and mood: 怠る (to neglect, to fail to do), 振舞う (to behave), 暴れる (to act violently, to rage), 落着く (to calm down, to settle down), 長引く (to be prolonged, to drag on) and 係わる (to be involved in). 落着く is often written 落ち着く in everyday text.",
    examples: [
      {
        jp: "騒音が勉強を妨げています。",
        romaji: "Souon ga benkyou o samatagete imasu.",
        en: "The noise is getting in the way of my studying.",
      },
      {
        jp: "会議が長引いて、帰りが遅くなりました。",
        romaji: "Kaigi ga nagabiite, kaeri ga osoku narimashita.",
        en: "The meeting dragged on, so I got home late.",
      },
    ],
    commonMistake:
      "留まる is written the same for two different words. Read とどまる it means to remain in a place or within a limit (町に留まる), and read とまる it means to stop moving. The reading, not the kanji, tells you which; in everyday writing とまる is usually written 止まる.",
    rows: [
      {
        label: "obstructing",
        terms: ["妨げる", "引き止める", "引っ込む"],
      },
      {
        label: "staying & stopping",
        terms: ["留まる", "留まる-2"],
      },
      {
        label: "conduct",
        terms: ["怠る", "振舞う", "暴れる", "係わる"],
      },
      {
        label: "calming & lasting",
        terms: ["落着く", "長引く"],
      },
    ],
  },
  {
    key: "n2-v20-body-reactions-and-household",
    title: "Nodding, Numbness & Household Verbs",
    subtitle: "うなずく・しびれる・干す",
    insight:
      "This group is a set of small verbs for everyday physical events. うなずく (to nod), しびれる (to become numb) and あふれる (to overflow) are intransitive and describe something that happens to a body or a container. 干す (to air, to dry), 盛る (to serve food, to fill up) and 差す (to hold up an umbrella, to shine, to insert) are transitive-style verbs of doing a chore.",
    extendedInsight:
      "差す has many uses. As the umbrella verb, 傘をさす (to hold up an umbrella), its kanji is 差す, though everyday writing often uses hiragana. 盛る means to serve food onto a dish (ご飯を盛る) as well as to fill up or to prescribe, and 干す means to dry laundry or bedding in the sun, or to drink a cup dry.",
    examples: [
      {
        jp: "長く座っていたので、足がしびれました。",
        romaji: "Nagaku suwatte ita node, ashi ga shibiremashita.",
        en: "I had been sitting for a long time, so my legs went numb.",
      },
      {
        jp: "天気がいいので、布団を干しました。",
        romaji: "Tenki ga ii node, futon o hoshimashita.",
        en: "The weather was nice, so I aired the futon.",
      },
    ],
    commonMistake:
      "あふれる is intransitive and takes が, like 川の水があふれる (the river water overflows) or 涙があふれる (tears well up). Don't add を to say someone made something overflow. Use a different verb for that, or a causative.",
    rows: [
      {
        label: "body & container",
        terms: ["うなずく", "しびれる", "あふれる"],
      },
      {
        label: "chores",
        terms: ["干す", "盛る", "かさをさす"],
      },
    ],
  },
  {
    key: "n2-v21-giving-throwing-telling",
    title: "Sending, Throwing & Telling",
    subtitle: "よこす・放る・物語る",
    insight:
      "Several transitive verbs cover sending, throwing and describing. よこす (to send, to hand over) is used when something is sent towards the speaker, 放る (to throw, to fling; to abandon) covers throwing, and やっつける (to beat, to finish off) and 斬る (to slash, to cut down) are forceful actions. 例える (to compare, to liken) and 物語る (to tell, to indicate) are about describing.",
    extendedInsight:
      "待ち合わせる (to meet at a prearranged place and time) and 溶け込む (to melt into, to blend in) are social verbs. 待ち合わせる is the compound behind 待ち合わせ (a rendezvous), and 溶け込む is used for someone fitting into a new group.",
    examples: [
      {
        jp: "後で連絡をよこしてください。",
        romaji: "Ato de renraku o yokoshite kudasai.",
        en: "Please get in touch with me later.",
      },
      {
        jp: "駅の前で友達と待ち合わせました。",
        romaji: "Eki no mae de tomodachi to machiawasemashita.",
        en: "I arranged to meet my friend in front of the station.",
      },
    ],
    commonMistake:
      "よこす has a direction built in: something comes from someone towards the speaker. 手紙をよこした means someone sent me a letter, but if you send a letter to someone else, use 送る, not よこす.",
    rows: [
      {
        label: "sending",
        terms: ["よこす", "待ち合わせる"],
      },
      {
        label: "throwing & fighting",
        terms: ["放る", "やっつける", "斬る"],
      },
      {
        label: "describing & blending",
        terms: ["例える", "物語る", "溶け込む"],
      },
    ],
  },
  {
    key: "n2-a01-annoying-character",
    title: "Shameless, Sly & Irritating People",
    subtitle: "厚かましい・狡い・しつこい",
    insight:
      "N2 has a rich set of い-adjectives for criticizing behavior. 厚かましい and 図々しい (both impudent, shameless) describe someone who takes too much for granted, 狡い (sly, cunning) describes unfair cleverness, and しつこい (insistent, obstinate) and くどい (verbose, heavy) describe someone who won't let something go.",
    extendedInsight:
      "A second group criticizes manners. だらしない (slovenly, loose), みっともない (shameful, indecent) and そそっかしい (careless, thoughtless) describe untidy or hasty people, while くだらない (worthless, stupid) and ばからしい (absurd) describe things not worth the effort. 憎い and 憎らしい (both hateful) are strong, and やかましい (fussy, overly critical) and 面倒臭い (tiresome) describe bother.",
    examples: [
      {
        jp: "彼は図々しい人で、いつも人のお菓子を食べます。",
        romaji: "Kare wa zuuzuushii hito de, itsumo hito no okashi o tabemasu.",
        en: "He is a shameless person who always eats other people's sweets.",
      },
      {
        jp: "しつこく誘われて、断れませんでした。",
        romaji: "Shitsukoku sasowarete, kotowaremasen deshita.",
        en: "I was asked over and over and couldn't say no.",
      },
    ],
    commonMistake:
      "憎い and 憎らしい are not the same strength. 憎い is a hard, serious word (hateful, detestable), while 憎らしい is often used with a smile for a child or pet that is too clever for its own good. Calling a person 憎い is a very strong statement.",
    rows: [
      {
        label: "shameless & sly",
        terms: ["厚かましい", "図々しい", "狡い"],
      },
      {
        label: "insistent & wordy",
        terms: ["しつこい", "くどい", "やかましい", "面倒臭い"],
      },
      {
        label: "untidy & careless",
        terms: ["だらしない", "みっともない", "そそっかしい"],
      },
      {
        label: "worthless & hateful",
        terms: ["くだらない", "ばからしい", "憎い", "憎らしい", "醜い"],
      },
    ],
  },
  {
    key: "n2-a02-busy-dim-dangerous",
    title: "Noisy, Busy, Dim & Dangerous",
    subtitle: "騒がしい・薄暗い・険しい",
    insight:
      "These い-adjectives describe atmosphere. 騒がしい and 騒々しい (both noisy) and 慌ただしい (busy, hurried) describe a scene full of activity, 薄暗い (dim, gloomy), 煙い (smoky) and 青白い (pale) describe poor light or air, and 険しい (steep, rugged; severe) describes both a mountain path and a stern expression.",
    extendedInsight:
      "危うい (dangerous, critical) and 怪しい (suspicious, dubious) warn of risk, 物凄い (earth-shattering, extreme) and 甚だしい (extreme, excessive) describe degree, and 思い掛けない (unexpected) describes a surprise. 物凄い is common in speech as an intensifier, as in 物凄く速い (astonishingly fast).",
    examples: [
      {
        jp: "年末は仕事が忙しくて、慌ただしい毎日です。",
        romaji:
          "Nenmatsu wa shigoto ga isogashikute, awatadashii mainichi desu.",
        en: "Work is busy at the end of the year, so the days are hectic.",
      },
      {
        jp: "この山道は険しいので、気をつけてください。",
        romaji: "Kono yamamichi wa kewashii node, ki o tsukete kudasai.",
        en: "This mountain path is steep, so please be careful.",
      },
    ],
    commonMistake:
      "騒がしい and 騒々しい both mean noisy, but 騒々しい is the stronger, more disapproving word. 教室が騒がしい just describes noise, while 騒々しい suggests something out of control, such as a riot or a crowd of children.",
    rows: [
      {
        label: "noisy & hectic",
        terms: ["騒がしい", "騒々しい", "慌ただしい"],
      },
      {
        label: "dim & smoky",
        terms: ["薄暗い", "煙い", "青白い"],
      },
      {
        label: "steep & dangerous",
        terms: ["険しい", "危うい", "怪しい"],
      },
      {
        label: "extreme & unexpected",
        terms: ["物凄い", "甚だしい", "思い掛けない"],
      },
    ],
  },
  {
    key: "n2-a03-nostalgia-gratitude-admiration",
    title: "Missing, Grateful & Admirable",
    subtitle: "恋しい・懐かしい・有難い",
    insight:
      "Some い-adjectives express warm feelings. 恋しい (dear; missed) and 懐かしい (dear, missed, nostalgic) describe longing for a person or a time past, 有難い (grateful, thankful) expresses gratitude, and 惜しい (regrettable, disappointing) expresses a feeling of loss when something almost works.",
    extendedInsight:
      "Admiration has its own adjectives: 偉い (great, remarkable), 頼もしい (reliable, promising), 力強い (powerful, strong), 勇ましい (brave, valiant), 若々しい (youthful) and 清い (clear, pure). めでたい (happy, propitious) is the word of celebration (おめでとう comes from it), and すまない (sorry) is an apology used among people who are close.",
    examples: [
      {
        jp: "この歌を聞くと、子供のころが懐かしくなります。",
        romaji: "Kono uta o kiku to, kodomo no koro ga natsukashiku narimasu.",
        en: "Hearing this song makes me nostalgic for my childhood.",
      },
      {
        jp: "手伝ってくれて、本当に有難いです。",
        romaji: "Tetsudatte kurete, hontou ni arigatai desu.",
        en: "I'm truly grateful that you helped.",
      },
    ],
    commonMistake:
      "恋しい and 懐かしい are not the same. 恋しい is longing for someone or something you can't have now (故郷が恋しい), while 懐かしい is a fond feeling about something in the past that you have met again (懐かしい写真). Use 恋しい for someone missed, but don't use it for a photograph.",
    rows: [
      {
        label: "longing",
        terms: ["恋しい", "懐かしい", "惜しい"],
      },
      {
        label: "gratitude & celebration",
        terms: ["有難い", "めでたい", "すまない"],
      },
      {
        label: "admirable",
        terms: ["偉い", "頼もしい", "力強い", "勇ましい", "若々しい", "清い"],
      },
    ],
  },
  {
    key: "n2-a04-texture-weight-color",
    title: "Texture, Weight, Shape & Color",
    subtitle: "粗い・軟らかい・重たい・茶色い",
    insight:
      "Physical descriptions need a few more い-adjectives at N2. 粗い (coarse, rough), 軟らかい (soft, tender), 緩い (loose, lenient) and 重たい (heavy) describe how something feels, 塩辛い (salty) describes taste, and 四角い (square) and 茶色い (brown) are the colour and shape adjectives that take い.",
    extendedInsight:
      "荒い (rough, rude, wild) is read あらい, like 粗い, but describes behaviour, waves or breathing, not surface texture. 鈍い is read にぶい (dull, slow) when it describes a knife or a reaction, and のろい (slow, sluggish) when it describes speed, so the reading matters.",
    examples: [
      {
        jp: "この肉は軟らかくて、おいしいです。",
        romaji: "Kono niku wa yawarakakute, oishii desu.",
        en: "This meat is tender and delicious.",
      },
      {
        jp: "スープが塩辛すぎて、飲めませんでした。",
        romaji: "Suupu ga shiokarasugite, nomemasen deshita.",
        en: "The soup was too salty, and I couldn't drink it.",
      },
    ],
    commonMistake:
      "粗い and 荒い are both read あらい, and they are easy to mix up in writing. 粗い is about texture (粗い布 is coarse cloth, 目が粗い is a coarse weave), while 荒い is about violence or roughness of manner (波が荒い, the waves are rough; 言葉が荒い, coarse language).",
    rows: [
      {
        label: "coarse and rough",
        terms: ["粗い", "荒い"],
      },
      {
        label: "soft, loose, heavy",
        terms: ["軟らかい", "緩い", "重たい"],
      },
      {
        label: "dull and slow",
        terms: ["鈍い", "鈍い-2"],
      },
      {
        label: "taste, shape, colour",
        terms: ["塩辛い", "四角い", "茶色い"],
      },
    ],
  },
  {
    key: "n2-a05-manner-humble-frank",
    title: "Frank, Humble & Pushy Manner",
    subtitle: "素直・謙虚・強引",
    insight:
      "Na-adjectives at N2 describe manner and temperament. 素直 (obedient, docile), 卒直 (frank, candid), 謙虚 (modest, humble) and 朗らか (bright, cheerful) describe pleasant characters, and 卑怯 (cowardly, unfair), 生意気 (impertinent), 強引 (forcible, pushy) and 強気 (firm, strong) describe difficult ones.",
    extendedInsight:
      "呑気 (carefree, optimistic, careless), 安易 (easy-going, taking things too easily) and みじめ (sad, pitiful, wretched) round out the group, and 懸命 (eager, strenuous) is used for someone trying with all their might, as in 一生懸命 or 懸命に働く.",
    examples: [
      {
        jp: "彼女は素直な性格で、みんなに好かれています。",
        romaji: "Kanojo wa sunao na seikaku de, minna ni sukarete imasu.",
        en: "She has an honest, straightforward nature and everyone likes her.",
      },
      {
        jp: "彼は強引に話を進めました。",
        romaji: "Kare wa gouin ni hanashi o susumemashita.",
        en: "He pushed the discussion forward without regard for others.",
      },
    ],
    commonMistake:
      "素直 and 卒直 sound alike but differ in meaning. 素直 describes someone who is obedient and takes things at face value, while 卒直 describes someone who says what they think openly, as in 卒直な意見 (a frank opinion).",
    rows: [
      {
        label: "pleasant characters",
        terms: ["素直", "卒直", "謙虚", "朗らか"],
      },
      {
        label: "difficult characters",
        terms: ["卑怯", "生意気", "強引", "強気"],
      },
      {
        label: "carefree & earnest",
        terms: ["呑気", "安易", "懸命", "みじめ"],
      },
    ],
  },
  {
    key: "n2-a06-quality-refinement",
    title: "Refined, Pure & Fashionable",
    subtitle: "上品・純粋・高級",
    insight:
      "This lesson gathers na-adjectives about quality and style. 上品 (refined, elegant) and 下品 (vulgar, coarse) are opposites, 高級 (high class) and 高等 (high grade) describe rank, 純粋 (pure, genuine) and さわやか (refreshing) describe freshness, and スマート (smart, stylish, slim) and モダン (modern) borrow English words.",
    extendedInsight:
      "不潔 (unclean, dirty) is the opposite of 清潔, and 傑作 (masterpiece, best work) names something of the highest quality. Note the readings: 上品 is じょうひん and 下品 is げひん.",
    examples: [
      {
        jp: "その女性は上品な話し方をします。",
        romaji: "Sono josei wa jouhin na hanashikata o shimasu.",
        en: "That woman speaks in a refined way.",
      },
      {
        jp: "山の空気はさわやかで、気持ちがいいです。",
        romaji: "Yama no kuuki wa sawayaka de, kimochi ga ii desu.",
        en: "The mountain air is fresh and feels good.",
      },
    ],
    commonMistake:
      "上品 and 高級 are both about quality, but they describe different things. 上品 describes taste and manners (a person, a colour, a flavour), while 高級 describes price and rank (a hotel, a car, a restaurant). A cheap thing can be 上品, but not 高級.",
    rows: [
      {
        label: "refined and vulgar",
        terms: ["上品", "下品", "不潔"],
      },
      {
        label: "rank & masterpiece",
        terms: ["高級", "高等", "傑作"],
      },
      {
        label: "fresh & stylish",
        terms: ["純粋", "さわやか", "スマート", "モダン"],
      },
    ],
  },
  {
    key: "n2-a07-appropriate-precise-unusual",
    title: "Proper, Precise & Unusual",
    subtitle: "妥当・的確・特殊",
    insight:
      "Formal writing needs adjectives for judging how well something fits. 妥当 (proper, appropriate), 的確 and 適確 (both precise, accurate), 手頃 (moderate, handy) and 厳重 (strict, severe) evaluate things, while 特殊 (special, unique), 平凡 (common, ordinary), 稀 (rare) and 膨大 (enormous) describe how usual or large they are.",
    extendedInsight:
      "In casual and mixed registers, あいまい (vague, ambiguous), おおざっぱ (rough, sketchy), めちゃくちゃ (absurd, messed up), まあまあ (so-so) and 不規則 (irregular) describe imprecision. 物騒 (dangerous, insecure), 俄 (sudden), 消極的 (passive), 余計 (too much, unnecessary), フリー (free) and イコール (equal) are handy odds and ends.",
    examples: [
      {
        jp: "この値段は妥当だと思います。",
        romaji: "Kono nedan wa datou da to omoimasu.",
        en: "I think this price is reasonable.",
      },
      {
        jp: "先生の説明はとても的確でした。",
        romaji: "Sensei no setsumei wa totemo tekikaku deshita.",
        en: "The teacher's explanation was very precise.",
      },
    ],
    commonMistake:
      "的確 and 適確 are both read てきかく and are near-synonyms, but 的確 is the more common spelling. Don't confuse them with 適当 (てきとう), which can mean suitable or, in speech, sloppy or half-hearted.",
    rows: [
      {
        label: "proper & precise",
        terms: ["妥当", "的確", "適確", "手頃", "厳重"],
      },
      {
        label: "usual and unusual",
        terms: ["特殊", "平凡", "稀", "膨大"],
      },
      {
        label: "vague & rough",
        terms: ["あいまい", "おおざっぱ", "めちゃくちゃ", "まあまあ", "不規則"],
      },
      {
        label: "odds and ends",
        terms: ["物騒", "俄", "消極的", "余計", "フリー", "イコール"],
      },
    ],
  },
  {
    key: "n2-a08-shape-direction-colour",
    title: "Vertical, Level, Transparent & Pitch-Dark",
    subtitle: "垂直・透明・真っ暗",
    insight:
      "This group describes shape, direction and pure states. 垂直 (vertical), 水平 (horizontal), 逆様 (upside down) and 傾らか (gradual, gentle) describe direction and slope, while 透明 (transparent) and 真空 (vacuum) describe the absence of anything.",
    extendedInsight:
      "The 真っ prefix intensifies a colour or state: 真っ暗 (total darkness), 真っ黒 (pitch black), 真っ青 (deep blue, ghastly pale) and 真っ白 (pure white). These take な or の before a noun and can also be used as adverbs with に: 顔が真っ青になる, a face turning white with fear.",
    examples: [
      {
        jp: "停電で、部屋の中が真っ暗になりました。",
        romaji: "Teiden de, heya no naka ga makkura ni narimashita.",
        en: "There was a blackout and the room went pitch dark.",
      },
      {
        jp: "この坂はなだらかで、歩きやすいです。",
        romaji: "Kono saka wa nadaraka de, aruki yasui desu.",
        en: "This slope is gentle and easy to walk up.",
      },
    ],
    commonMistake:
      "真っ青 does not only mean deep blue. It also describes a face gone pale with shock or illness (顔が真っ青だ), so 真っ青な空 and 顔が真っ青 mean very different things.",
    rows: [
      {
        label: "direction",
        terms: ["垂直", "水平", "逆様", "傾らか"],
      },
      {
        label: "nothing there",
        terms: ["透明", "真空"],
      },
      {
        label: "intensified colours",
        terms: ["真っ暗", "真っ黒", "真っ青", "真っ白"],
      },
    ],
  },
  {
    key: "n2-n01-calendar-time",
    title: "The Calendar: Days, Weeks & Parts of the Month",
    subtitle: "一昨日・上旬・以降",
    insight:
      "N2 adds precise time words. 一昨昨日 (three days ago), 一昨日 (the day before yesterday), 一昨年 (the year before last), 先々週 (two weeks ago) and 先々月 (the month before last) each step one further back than the N4 words you know. 上旬, 中旬 and 下旬 split a month into first, second and last thirds.",
    extendedInsight:
      "先程 (a little while ago) is a polite word for a short time back, and 以降 and 以後 (on and after, hereafter) both mark a point from which something continues. 元日 is New Year's Day itself, while お正月 covers the whole season. 中世 (the Middle Ages) is the historian's version of the same idea, applied to eras.",
    examples: [
      {
        jp: "来月の上旬に出張があります。",
        romaji: "Raigetsu no joujun ni shutchou ga arimasu.",
        en: "I have a business trip in the first ten days of next month.",
      },
      {
        jp: "先程はありがとうございました。",
        romaji: "Sakihodo wa arigatou gozaimashita.",
        en: "Thank you for earlier.",
      },
    ],
    commonMistake:
      "一昨日 has two common readings, おととい and いっさくじつ. In everyday speech it is おととい, but the reading given here, いっさくじつ, is the formal, written one. 以降 includes the starting point (5日以降 includes the 5th), and this is a useful thing to remember in schedules and notices.",
    rows: [
      {
        label: "further back",
        terms: ["一昨昨日", "一昨日", "一昨年", "先々週", "先々月", "先程"],
      },
      {
        label: "parts of a month",
        terms: ["上旬", "中旬", "下旬", "元日"],
      },
      {
        label: "from then on",
        terms: ["以降", "以後", "中世"],
      },
    ],
  },
  {
    key: "n2-n02-transport-commuting",
    title: "Getting On, Off & Around",
    subtitle: "乗車・下車・出張",
    insight:
      "Station and journey words follow a pattern with 車 and 出. 乗車 (boarding), 下車 (getting off) and 停車 (a stop) describe what a train does, while 乗換 (a transfer) and 乗り越し (riding past your stop) are the passenger's side. 交通機関 (transportation facilities) is the general term for buses, trains and the like.",
    extendedInsight:
      "出勤 (going to work), 出張 (a business trip), 出迎え (meeting someone arriving) and お出掛け (an outing) use 出 for leaving. 出入り (coming and going) and 出入口 (an entrance and exit) describe doorways, 上り (the up-train, ascent) is a train heading toward Tokyo, and 人通り (pedestrian traffic), 並木 (a row of trees) and 交差 (crossing, intersection) describe streets.",
    examples: [
      {
        jp: "次の駅で電車を乗り換えます。",
        romaji: "Tsugi no eki de densha o norikaemasu.",
        en: "I'll change trains at the next station.",
      },
      {
        jp: "この道は夜になると、人通りが少なくなります。",
        romaji:
          "Kono michi wa yoru ni naru to, hitodoori ga sukunaku narimasu.",
        en: "This road gets quiet at night, with fewer people about.",
      },
    ],
    commonMistake:
      "乗り越し and 乗り越える are related but different. 乗り越し (riding past) is a noun used at fare adjustment machines (乗り越し精算), while 乗り越える (to get over, to overcome) is a verb. Don't use the noun to mean overcoming a difficulty.",
    rows: [
      {
        label: "boarding & leaving trains",
        terms: ["乗車", "下車", "停車", "乗換", "乗り越し", "上り"],
      },
      {
        label: "transport in general",
        terms: ["交通機関"],
      },
      {
        label: "going out",
        terms: ["出勤", "出張", "出迎え", "お出掛け"],
      },
      {
        label: "doors and streets",
        terms: ["出入り", "出入口", "人通り", "並木", "交差"],
      },
    ],
  },
  {
    key: "n2-n03-holidays-work-school",
    title: "Days Off, Joining & Sitting Exams",
    subtitle: "休業・入社・受験",
    insight:
      "Words with 休 cover different kinds of rest. 一休み (a short rest) and お休み (a holiday, absence; also good night) are personal, 休業 (closure) is for a business, 休講 (a cancelled lecture) is for a class and 休養 (rest, recreation) is for recovery.",
    extendedInsight:
      "Other organisational events fit here: 入社 (entering a company), 人事 (personnel matters), 募集 (recruitment) and 受験 (taking an exam) mark the beginning of a new stage. 催促 (a demand, pressing for action) and 催し (an event, function) share the kanji 催, which relates to holding something and urging it on.",
    examples: [
      {
        jp: "先生が病気なので、今日は休講です。",
        romaji: "Sensei ga byouki na node, kyou wa kyuukou desu.",
        en: "The teacher is ill, so today's lecture is cancelled.",
      },
      {
        jp: "この会社は新入社員を募集しています。",
        romaji: "Kono kaisha wa shinnyuushain o boshuu shite imasu.",
        en: "This company is recruiting new employees.",
      },
    ],
    commonMistake:
      "お休み is used both for a holiday and for saying good night (お休みなさい), and the two overlap only in the sense of rest. 休業 is not a personal holiday: a shop that is 休業 is closed for business, sometimes for a long period, while a person taking time off would say お休み or 休暇.",
    rows: [
      {
        label: "resting",
        terms: ["一休み", "お休み", "休養"],
      },
      {
        label: "closures & cancellations",
        terms: ["休業", "休講"],
      },
      {
        label: "joining & being tested",
        terms: ["入社", "人事", "募集", "受験"],
      },
      {
        label: "events & reminders",
        terms: ["催し", "催促"],
      },
    ],
  },
  {
    key: "n2-n04-family-relatives",
    title: "Uncles, Aunts & Family Ties",
    subtitle: "伯父・叔父・主人",
    insight:
      "Japanese distinguishes an uncle or aunt older than your parent from one who is younger. 伯父 and 伯母 are the older parent's siblings, 叔父 and 叔母 the younger's, and all four are read おじ or おば. 伯父さん, 叔父さん and their aunt forms (おじさん, おばさん) are what you would call them directly.",
    extendedInsight:
      "おじさん also means a middle-aged man in general, and 伯父さん and 叔父さん share that reading, so context tells you whether a relative is meant. 主人 is a way of referring to your own husband, and 先祖 (an ancestor) is used for a family's forebears. 仲直り (reconciliation) and 仲良し (a close friend) describe relationships, and 中年 (middle-aged) describes an age.",
    examples: [
      {
        jp: "叔父は東京で働いています。",
        romaji: "Oji wa Toukyou de hataraite imasu.",
        en: "My uncle works in Tokyo.",
      },
      {
        jp: "けんかをした友達と仲直りしました。",
        romaji: "Kenka o shita tomodachi to nakanaori shimashita.",
        en: "I made up with the friend I had quarrelled with.",
      },
    ],
    commonMistake:
      "叔父 and 伯父 are both read おじ, so they are identical when spoken. The kanji only show whether the uncle is older (伯父) or younger (叔父) than your parent, and in speech Japanese speakers just say おじ and rely on context.",
    rows: [
      {
        label: "older uncle",
        terms: ["伯父", "伯父さん"],
      },
      {
        label: "older aunt",
        terms: ["伯母"],
      },
      {
        label: "younger uncle",
        terms: ["叔父", "叔父さん"],
      },
      {
        label: "younger aunt",
        terms: ["叔母"],
      },
      {
        label: "husband, ancestors, friends",
        terms: ["主人", "先祖", "仲直り", "仲良し", "中年"],
      },
    ],
  },
  {
    key: "n2-n05-fingers-health-body",
    title: "Fingers, Bandages & Health Words",
    subtitle: "人差指・包帯・保健",
    insight:
      "This lesson gathers words about the hand and about health. 中指 (the middle finger) and 人差指 (the index finger) name two fingers, 包帯 (a bandage) covers a wound, and 内科 (internal medicine), 保健 (health preservation) and 伝染 (contagion) appear on hospital and school signs.",
    extendedInsight:
      "人差指 is written with 差 (to point), because it is the finger you point with. 保健室 is the school nurse's room, and 内科 is a clinic for internal illnesses such as colds, as opposed to injuries treated in 外科.",
    examples: [
      {
        jp: "指を切ったので、包帯を巻きました。",
        romaji: "Yubi o kitta node, houtai o makimashita.",
        en: "I cut my finger, so I put a bandage on it.",
      },
      {
        jp: "風邪をひいて、内科に行きました。",
        romaji: "Kaze o hiite, naika ni ikimashita.",
        en: "I caught a cold, so I went to an internist.",
      },
    ],
    commonMistake:
      "人差指 is read ひとさしゆび, and in everyday text you will often see it written 人差し指, with a し, which is the same word. It is the finger you point with, which is where the 差 (to point) comes from.",
    rows: [
      {
        label: "fingers",
        terms: ["中指", "人差指"],
      },
      {
        label: "medicine",
        terms: ["包帯", "内科", "保健", "伝染"],
      },
    ],
  },
  {
    key: "n2-n06-maths-geometry-science",
    title: "Numbers, Shapes & Physical Science",
    subtitle: "分数・半径・光線",
    insight:
      "School maths and science use compact noun compounds. 三角 (a triangle), 円周 (circumference), 半径 (radius) and 体積 (volume) name shapes and measurements, 分数 (a fraction), 割算 (division), 偶数 (an even number) and 単数 (singular) name kinds of number, and 分解, 分布, 分量 and 分類 all build on 分 (to divide).",
    extendedInsight:
      "加速 (acceleration), 加速度 (rate of acceleration) and 加熱 (heating) are physics terms built on 加 (to add). 光線 (a light ray), 北極 and 南極 (the north and south poles) and 原理 (a principle, fundamental truth) are more science vocabulary, and 三日月 (a crescent moon) is a shape from the night sky.",
    examples: [
      {
        jp: "この円の半径は五センチです。",
        romaji: "Kono en no hankei wa go senchi desu.",
        en: "The radius of this circle is five centimetres.",
      },
      {
        jp: "ごみを種類ごとに分類してください。",
        romaji: "Gomi o shurui goto ni bunrui shite kudasai.",
        en: "Please sort the rubbish by type.",
      },
    ],
    commonMistake:
      "分数 is the name for a fraction as a topic, but you say a specific fraction aloud with 分の: 三分の一 is one third, with the denominator first. Note also that 分 is read ぶん here, not ふん as in the minutes of a clock.",
    rows: [
      {
        label: "shapes & measures",
        terms: ["三角", "三日月", "円周", "半径", "体積"],
      },
      {
        label: "kinds of number",
        terms: ["分数", "割算", "偶数", "単数"],
      },
      {
        label: "dividing",
        terms: ["分解", "分布", "分量", "分類"],
      },
      {
        label: "physics & nature",
        terms: ["加速", "加速度", "加熱", "光線", "原理", "北極", "南極"],
      },
    ],
  },
  {
    key: "n2-n07-grammar-writing-literature",
    title: "Grammar Terms, Writing & Literature",
    subtitle: "主語・仮名・俳句",
    insight:
      "Language and literature have their own noun family. 主語 (the grammatical subject), 副詞 (an adverb), 代名詞 (a pronoun), 仮名 (kana), 仮名遣い (kana orthography) and 五十音 (the Japanese syllabary) are the terms of Japanese grammar and writing.",
    extendedInsight:
      "For writing, 下書き (a rough draft), 原稿 (a manuscript), 下線 (an underline) and 便箋 (writing paper) cover the steps and tools. 作者 (an author), 全集 (complete works), 伝記 (a biography) and 俳句 (haiku) are literary terms. 創作, 制作, 作成 and 作製 are all about making, and differ by what is made: a creative work, a film or book, a document, or a manufactured item.",
    examples: [
      {
        jp: "この文の主語はどれですか。",
        romaji: "Kono bun no shugo wa dore desu ka.",
        en: "Which word is the subject of this sentence?",
      },
      {
        jp: "彼は毎年、俳句を作っています。",
        romaji: "Kare wa maitoshi, haiku o tsukutte imasu.",
        en: "He writes haiku every year.",
      },
    ],
    commonMistake:
      "作成 and 作製 are both read さくせい but differ. 作成 is for making documents, plans and lists (書類を作成する), while 作製 is for manufacturing a physical item such as a piece of equipment. 制作 (せいさく) is again different, and is used for creative works like a film or a book.",
    rows: [
      {
        label: "grammar terms",
        terms: ["主語", "副詞", "代名詞"],
      },
      {
        label: "kana & syllabary",
        terms: ["仮名", "仮名遣い", "五十音"],
      },
      {
        label: "drafting",
        terms: ["下書き", "原稿", "下線", "便箋"],
      },
      {
        label: "literature",
        terms: ["作者", "全集", "伝記", "俳句"],
      },
      {
        label: "making",
        terms: ["創作", "制作", "作成", "作製"],
      },
    ],
  },
  {
    key: "n2-n08-geography-places",
    title: "Peninsulas, Islands & Parts of Town",
    subtitle: "半島・列島・下町",
    insight:
      "This lesson gathers geography and place words. 半島 (a peninsula), 列島 (a chain of islands), 南米 (South America) and 南北 (south and north) describe large areas, while 区域 (a zone, district), 付近 (the neighbourhood, vicinity) and 下町 (the old parts of town) describe smaller ones.",
    extendedInsight:
      "In towns, 下水 (drainage, sewage) and 井戸 (a well) name water systems, one modern and one traditional. 下町 is traditionally the low-lying, older commercial part of a city, and it contrasts with 山の手.",
    examples: [
      {
        jp: "日本は長い列島の国です。",
        romaji: "Nihon wa nagai rettou no kuni desu.",
        en: "Japan is a country made of a long chain of islands.",
      },
      {
        jp: "この付近に銀行はありますか。",
        romaji: "Kono fukin ni ginkou wa arimasu ka.",
        en: "Is there a bank near here?",
      },
    ],
    commonMistake:
      "付近 and 近所 both mean nearby, but 近所 is about the neighbourhood where you live and the neighbours in it, while 付近 is a more neutral, formal word for the area around any point (駅の付近, around the station).",
    rows: [
      {
        label: "large areas",
        terms: ["半島", "列島", "南米", "南北"],
      },
      {
        label: "smaller areas",
        terms: ["区域", "付近", "下町"],
      },
      {
        label: "water",
        terms: ["下水", "井戸"],
      },
    ],
  },
  {
    key: "n2-n09-public-law-institutions",
    title: "Public Life, Law & Institutions",
    subtitle: "公共・判事・体制",
    insight:
      "The 公 prefix marks things belonging to the public. 公共 (public, communal), 公式 (formula, official), 公衆 (the public), 公表 (an official announcement), 公務 (official business) and 公害 (public nuisance, pollution) all use it, and each has its own field of use.",
    extendedInsight:
      "Institutions and order appear in 体系 (a system), 体制 (an order, structure), 判事 (a judge), 判子 (a seal), 免税 (a tax exemption), 侵入 (an invasion, trespass), 儀式 (a ceremony), 兵隊 (a soldier), 会館 (a meeting hall), 共産 (communist) and 人文科学 (the humanities). 交流 (an exchange; alternating current) has two quite different senses depending on context.",
    examples: [
      {
        jp: "公共の場所では静かにしましょう。",
        romaji: "Koukyou no basho de wa shizuka ni shimashou.",
        en: "Let's be quiet in public places.",
      },
      {
        jp: "この店では外国人観光客は免税で買い物ができます。",
        romaji:
          "Kono mise de wa gaikokujin kankoukyaku wa menzei de kaimono ga dekimasu.",
        en: "At this shop, foreign tourists can shop tax-free.",
      },
    ],
    commonMistake:
      "公式 has two meanings. In everyday life it means official (公式サイト, the official site), and in maths it means a formula (数学の公式). The context, and the kanji 式, make it clear which is meant.",
    rows: [
      {
        label: "public",
        terms: ["公共", "公衆", "公害"],
      },
      {
        label: "official",
        terms: ["公式", "公表", "公務"],
      },
      {
        label: "systems & ideas",
        terms: ["体系", "体制", "共産", "人文科学"],
      },
      {
        label: "law & order",
        terms: ["判事", "判子", "免税", "侵入", "兵隊"],
      },
      {
        label: "ceremony & exchange",
        terms: ["儀式", "会館", "交流"],
      },
    ],
  },
  {
    key: "n2-n10-household-objects",
    title: "Things Around the House",
    subtitle: "丼・包丁・便所",
    insight:
      "This lesson gathers household nouns. 丼 (a bowl, or a bowl of rice with toppings), 匙 (a spoon), 包丁 (a kitchen knife) and 刺身 (sliced raw fish) belong to the kitchen and table, 下駄 (wooden clogs), 剃刀 (a razor) and 口紅 (lipstick) are personal items, and 便所 (a toilet) and 倉庫 (a warehouse) are places.",
    extendedInsight:
      "入れ物 (a container), 乾電池 (a dry cell battery), 受話器 (a telephone receiver), 冠 (a crown) and お代わり (a second helping) round out the set. 住まい (a dwelling) is a softer word than 家 or 住宅, and 別荘 is a second home in the mountains or by the sea.",
    examples: [
      {
        jp: "昼ごはんに牛丼を食べました。",
        romaji: "Hirugohan ni gyuudon o tabemashita.",
        en: "I had a beef bowl for lunch.",
      },
      {
        jp: "ご飯のお代わりはいかがですか。",
        romaji: "Gohan no okawari wa ikaga desu ka.",
        en: "Would you like another helping of rice?",
      },
    ],
    commonMistake:
      "便所 is a plain, somewhat blunt word for a toilet. In polite company or in public places, people say トイレ or お手洗い instead. 便所 sounds old-fashioned or crude in most conversation.",
    rows: [
      {
        label: "kitchen & table",
        terms: ["丼", "匙", "包丁", "刺身", "お代わり"],
      },
      {
        label: "personal items",
        terms: ["下駄", "剃刀", "口紅", "冠"],
      },
      {
        label: "containers & tools",
        terms: ["入れ物", "乾電池", "受話器"],
      },
      {
        label: "places",
        terms: ["便所", "倉庫", "住まい", "別荘"],
      },
    ],
  },
  {
    key: "n2-n11-levels-sequence-scope",
    title: "Levels, Order & Scope",
    subtitle: "上級・一通り・全般",
    insight:
      "Some nouns rank things or describe their place in a sequence. 初級 (elementary level), 上級 (advanced level), 初歩 (the rudiments) and 一流 (first class) describe standing, and 中間 (the middle, interim), 先端 (the tip), 先頭 (the head, the lead) and 前後 (before and after; front and back) describe position.",
    extendedInsight:
      "全般 (the whole, in general), 全力 (all one's strength), 一通り (generally, briefly), 一定 (fixed, regular), 並行 (going side by side) and 別々 (separately) describe scope and manner. 上下 (up and down), 予備 (a spare, preparation), 中途 (halfway) and the prefixes 上～ (upper ~), 前～ (former ~) and 副～ (vice ~) also show ranking and sequence.",
    examples: [
      {
        jp: "この教室は初級と上級に分かれています。",
        romaji: "Kono kyoushitsu wa shokyuu to joukyuu ni wakarete imasu.",
        en: "This class is divided into beginner and advanced levels.",
      },
      {
        jp: "全力で頑張ります。",
        romaji: "Zenryoku de ganbarimasu.",
        en: "I'll do my best with all my strength.",
      },
    ],
    commonMistake:
      "上級 and 上位 both suggest higher rank, but 上級 is about level of skill or class (上級コース, an advanced course), while 上位 is about ranking position. 一定 also has two uses: 一定の (a fixed, certain) and 一定する (to become fixed).",
    rows: [
      {
        label: "levels",
        terms: ["初級", "上級", "初歩", "一流"],
      },
      {
        label: "position",
        terms: ["中間", "先端", "先頭", "前後", "上下"],
      },
      {
        label: "scope & manner",
        terms: ["全般", "全力", "一通り", "一定", "並行", "別々"],
      },
      {
        label: "spare & halfway",
        terms: ["予備", "中途"],
      },
      {
        label: "rank prefixes",
        terms: ["上", "前", "副"],
      },
    ],
  },
  {
    key: "n2-n12-change-decline-effect",
    title: "Decline, Change & Results",
    subtitle: "下降・交替・効力",
    insight:
      "Words for change often pair with 下 and 低 for going down. 下降 (descent, decline) and 低下 (a fall, decline) both describe a drop in a measurement, 停止 (a suspension, stoppage) describes a halt, and 交替 (a change, relief) describes one thing taking over from another. 削除 (deletion) removes something entirely.",
    extendedInsight:
      "効力 (effect, efficacy), 功績 (an achievement, merit), 反映 (reflection, influence) and 動作 (an action, movements) describe results and actions, 勝敗 and 勝負 describe winning and losing, and 利害 (advantages and disadvantages) describes what someone stands to gain or lose. 修繕 (repair) and 出来上がり (being finished, ready) are the practical, physical side.",
    examples: [
      {
        jp: "気温が急に下降しました。",
        romaji: "Kion ga kyuu ni kakou shimashita.",
        en: "The temperature suddenly dropped.",
      },
      {
        jp: "古い家を修繕しました。",
        romaji: "Furui ie o shuuzen shimashita.",
        en: "We repaired the old house.",
      },
    ],
    commonMistake:
      "勝敗 and 勝負 are close but not the same. 勝敗 is the outcome, who won and who lost (勝敗は決まった), while 勝負 is the contest itself (勝負に出る) and can also mean going all out. 交替 is changing places, whereas 交代 is a different spelling used for shifts and turns.",
    rows: [
      {
        label: "falling & stopping",
        terms: ["下降", "低下", "停止", "削除"],
      },
      {
        label: "changing over",
        terms: ["交替", "反映", "動作"],
      },
      {
        label: "results",
        terms: ["効力", "功績", "利害", "出来上がり"],
      },
      {
        label: "winning, losing, mending",
        terms: ["勝敗", "勝負", "修繕"],
      },
    ],
  },
  {
    key: "n2-n13-people-misc-nouns",
    title: "Everyday Nouns: Luck, Excuses & Receipts",
    subtitle: "不運・乱暴・口実",
    insight:
      "A mixed group of useful nouns rounds out this batch. 不運 (bad luck), 乱暴 (rude, violent, rough) and 勘違い (a misunderstanding) describe things going wrong, 主役 (the leading part), 人命 (human life) and 個体 (an individual) describe people and things, and 口実 (an excuse) and 受取 (a receipt) are practical words for daily dealings.",
    extendedInsight:
      "割引 (a discount), 何分 (by all means, please), 余所 (another place, somewhere else), 一応 (tentatively, for the time being), 人造 (man-made) and 中性 (neutral, neuter) are other useful odds and ends. 一応 softens a statement, as in 一応確認します (I'll check just in case).",
    examples: [
      {
        jp: "彼は乱暴な言葉を使いました。",
        romaji: "Kare wa ranbou na kotoba o tsukaimashita.",
        en: "He used rough language.",
      },
      {
        jp: "これは学生割引の値段です。",
        romaji: "Kore wa gakusei waribiki no nedan desu.",
        en: "This is the price with the student discount.",
      },
    ],
    commonMistake:
      "勘違い is a noun for a misunderstanding, used with する: 勘違いしました (I got the wrong idea). It is about a mistaken belief or mix-up, and it is not the same as 間違い, which is a simple error or wrong answer.",
    rows: [
      {
        label: "things going wrong",
        terms: ["不運", "乱暴", "勘違い"],
      },
      {
        label: "people & things",
        terms: ["主役", "人命", "個体", "人造", "中性"],
      },
      {
        label: "practical",
        terms: ["口実", "受取", "割引"],
      },
      {
        label: "softeners",
        terms: ["何分", "余所", "一応"],
      },
    ],
  },
  {
    key: "n2-n14-origins-materials",
    title: "Origins, Raw Materials & Rough Surfaces",
    subtitle: "原料・原産・凸凹",
    insight:
      "The kanji 原 (origin, source) appears in several N2 nouns. 原料 (raw materials), 原産 (place of origin) and 原始 (origin, primeval) all point back to where something starts. 冷凍 (freezing, cold storage) is the preservation step that often follows.",
    extendedInsight:
      "区分 (a division, classification), 凸凹 (unevenness, roughness) and 両側 (both sides) are descriptive nouns that fit with these physical and structural words. 凸凹 can also be used as an adjective (凸凹な道, a bumpy road) and as a verb with する.",
    examples: [
      {
        jp: "このワインの原料はぶどうです。",
        romaji: "Kono wain no genryou wa budou desu.",
        en: "The raw material of this wine is grapes.",
      },
      {
        jp: "肉は冷凍して保存しています。",
        romaji: "Niku wa reitou shite hozon shite imasu.",
        en: "I keep the meat frozen.",
      },
    ],
    commonMistake:
      "原産 names where a plant or product comes from (日本原産の花, a flower native to Japan), while 原料 names what a product is made from. Don't say 原産 when you mean the ingredients.",
    rows: [
      {
        label: "sources",
        terms: ["原料", "原産", "原始"],
      },
      {
        label: "preserving & surfaces",
        terms: ["冷凍", "凸凹"],
      },
      {
        label: "sections & sides",
        terms: ["区分", "両側"],
      },
    ],
  },
  {
    key: "n2-n15-school-shrine-office",
    title: "Exercise, Sketching, Shrine Visits & Office Phones",
    subtitle: "体操・写生・お参り",
    insight:
      "This lesson gathers school and everyday activities. 体操 (gymnastics, physical exercises) and 写生 (sketching from nature) are typical school lessons, 助教授 (an assistant professor) is a university rank, and お参り (a shrine or temple visit) and 内線 (a phone extension) belong to religion and the office.",
    extendedInsight:
      "写生 combines 写 (to copy) and 生 (life), so it means drawing directly from what is in front of you. お参りする is the everyday phrase for visiting a shrine, temple or grave. 内線 (an internal line) is the extension number used inside a company.",
    examples: [
      {
        jp: "毎朝、ラジオ体操をしています。",
        romaji: "Maiasa, rajio taisou o shite imasu.",
        en: "I do radio calisthenics every morning.",
      },
      {
        jp: "お正月には家族で神社にお参りに行きます。",
        romaji: "Oshougatsu ni wa kazoku de jinja ni omairi ni ikimasu.",
        en: "At New Year, my family goes to visit a shrine.",
      },
    ],
    commonMistake:
      "写生 is drawing from life, not general drawing. To say you draw pictures as a hobby, use 絵を描く, and reserve 写生 for sketching a real scene or object, as in 公園で写生をする.",
    rows: [
      {
        label: "school",
        terms: ["体操", "写生", "助教授"],
      },
      {
        label: "shrine & office",
        terms: ["お参り", "内線"],
      },
    ],
  },
  {
    key: "n2-n16-classics-theatre-pastimes",
    title: "Classics, Theatre & Pastimes",
    subtitle: "古典・役者・将棋",
    insight:
      "This lesson gathers words for culture and leisure. 古典 (the classics), 名作 (a masterpiece) and 図鑑 (a picture book, an illustrated reference) are about works, 台詞 (lines, remarks), 役者 (an actor) and 太鼓 (a drum) belong to the stage, and 娯楽 (amusement), 将棋 (Japanese chess), 彫刻 (sculpture) and 工芸 (industrial arts) are pastimes and crafts.",
    extendedInsight:
      "台詞 is written with two kanji that do not literally mean 'lines': it is an old spelling read せりふ, and it is commonly written in hiragana. 娯楽 is a formal word for entertainment (娯楽施設, an amusement facility), while 趣味 is the everyday word for a hobby.",
    examples: [
      {
        jp: "この役者は台詞を覚えるのが早いです。",
        romaji: "Kono yakusha wa serifu o oboeru no ga hayai desu.",
        en: "This actor learns his lines quickly.",
      },
      {
        jp: "祖父は毎週、友達と将棋をします。",
        romaji: "Sofu wa maishuu, tomodachi to shougi o shimasu.",
        en: "My grandfather plays shogi with his friends every week.",
      },
    ],
    commonMistake:
      "古典 refers to classical literature and arts (古典文学), not to anything old. A merely old thing is 古い, and 古典 is reserved for works that have stood the test of time. Also, 名作 (a masterpiece) is a work of art, while 名物 (a local speciality) is a product.",
    rows: [
      {
        label: "works",
        terms: ["古典", "名作", "図鑑"],
      },
      {
        label: "on stage",
        terms: ["台詞", "役者", "太鼓"],
      },
      {
        label: "pastimes & crafts",
        terms: ["娯楽", "将棋", "彫刻", "工芸"],
      },
    ],
  },
  {
    key: "n2-n17-places-landmarks-roads",
    title: "Hometowns, Landmarks & Roads",
    subtitle: "古里・名所・大通り",
    insight:
      "These nouns describe places you can point to on a map or visit. 古里 (a hometown, birthplace), 各地 (various parts of the country), 名所 (a famous place), 名物 (a local speciality) and 地名 (a place name) describe where things are and what is famous, while 地点 (a point on a map), 地帯 (an area, zone) and 周辺 (the surroundings) describe locations more technically.",
    extendedInsight:
      "The landscape includes 平野 (a plain), 山林 (a mountain forest), 岬 (a cape), 峠 (a mountain pass) and 寒帯 (the frigid zone). In a town, 大通り (a main street), 四つ角 (a crossroads), 広場 (a plaza), 回り道 (a detour), 大木 (a large tree) and 垣根 (a hedge) are common sights.",
    examples: [
      {
        jp: "京都には有名な名所がたくさんあります。",
        romaji: "Kyouto ni wa yuumei na meisho ga takusan arimasu.",
        en: "There are many famous sights in Kyoto.",
      },
      {
        jp: "工事中なので、回り道をしました。",
        romaji: "Kouji chuu na node, mawarimichi o shimashita.",
        en: "It was under construction, so I took a detour.",
      },
    ],
    commonMistake:
      "名所 and 名物 are often confused. 名所 is a famous place (a temple, a view), while 名物 is a famous product of a place (京都の名物, a Kyoto speciality). You visit a 名所 and you buy or eat a 名物.",
    rows: [
      {
        label: "home & fame",
        terms: ["古里", "故郷", "各地", "名所", "名物", "地名"],
      },
      {
        label: "points & areas",
        terms: ["地点", "地帯", "周辺", "寒帯"],
      },
      {
        label: "landscape",
        terms: ["平野", "山林", "岬", "峠"],
      },
      {
        label: "streets & town",
        terms: ["大通り", "四つ角", "広場", "回り道", "大木", "垣根"],
      },
    ],
  },
  {
    key: "n2-n18-earth-weather-eruption",
    title: "Earth, Weather & Eruptions",
    subtitle: "地盤・吹雪・噴火",
    insight:
      "Words for the ground and the sky's moods appear in the news. 地盤 (the ground, a base), 地面 (the ground surface), 地下水 (underground water) and 地質 (geological features) describe the earth, 境界 (a boundary) marks its edges, and 噴火 (an eruption) and 噴水 (a fountain) both use 噴, the kanji for spouting.",
    extendedInsight:
      "吹雪 (a snowstorm) and 夕立 (a sudden evening shower) name weather events, and 夕日 (the evening sun, the setting sun) and 夕刊 (the evening paper) share 夕 for evening. 塊 (a lump, a mass) and 屑 (waste, scrap) describe pieces of matter.",
    examples: [
      {
        jp: "山が噴火して、たくさんの灰が降りました。",
        romaji: "Yama ga funka shite, takusan no hai ga furimashita.",
        en: "The mountain erupted and a lot of ash fell.",
      },
      {
        jp: "帰り道で夕立にあって、ぬれてしまいました。",
        romaji: "Kaerimichi de yuudachi ni atte, nurete shimaimashita.",
        en: "I got caught in an evening shower on the way home and got wet.",
      },
    ],
    commonMistake:
      "夕立 is a sudden shower, usually in summer, that falls in the late afternoon or evening, while 吹雪 is a snowstorm with wind. Neither is used for a light, steady rain, which is 小雨 or しとしと降る雨.",
    rows: [
      {
        label: "the ground",
        terms: ["地盤", "地面", "地下水", "地質", "境界"],
      },
      {
        label: "spouting",
        terms: ["噴火", "噴水"],
      },
      {
        label: "sky & evening",
        terms: ["吹雪", "夕立", "夕日", "夕刊"],
      },
      {
        label: "lumps & scraps",
        terms: ["塊", "屑"],
      },
    ],
  },
  {
    key: "n2-n19-school-study-learning",
    title: "School Years, Subjects & Learners",
    subtitle: "学年・学科・弟子",
    insight:
      "Words with 学 describe the world of study. 学年 (a school year), 学科 (a subject, course), 学級 (a class), 学力 (academic ability), 学会 (an academic society or conference) and 学術 (learning, scholarship) all belong to schools and universities, and 在学 (being enrolled) states your status.",
    extendedInsight:
      "The ladder runs from 幼児 (an infant), 幼稚 (childish, infantile) and 幼稚園 (a kindergarten) to 小学生 (an elementary school pupil) and 大学院 (a graduate school). 実習 (practical training), 定規 (a ruler), 引算 (subtraction) and 小数 (a decimal) are classroom words, and 弟子 (a pupil, disciple) is the traditional word for someone learning from a master.",
    examples: [
      {
        jp: "姉は今、大学院に在学しています。",
        romaji: "Ane wa ima, daigakuin ni zaigaku shite imasu.",
        en: "My older sister is currently enrolled in graduate school.",
      },
      {
        jp: "この学科では、実習が多いです。",
        romaji: "Kono gakka de wa, jisshuu ga ooi desu.",
        en: "This department has many practical sessions.",
      },
    ],
    commonMistake:
      "幼稚 on its own means childish, and it can be an insult when said about an adult (幼稚な考え). 幼稚園 (a kindergarten) uses the same word for young children, but has no such negative sense, so don't avoid it out of fear it sounds rude.",
    rows: [
      {
        label: "study words",
        terms: ["学年", "学科", "学級", "学力", "学会", "学術", "在学"],
      },
      {
        label: "stages of school",
        terms: ["幼児", "幼稚", "幼稚園", "小学生", "大学院"],
      },
      {
        label: "classroom",
        terms: ["実習", "定規", "引算", "小数", "弟子", "校庭"],
      },
    ],
  },
  {
    key: "n2-n20-commerce-sales-prices",
    title: "Shops, Sales & Prices",
    subtitle: "商業・売上・定価",
    insight:
      "Business words with 売 and 商 cover shops and sales. 商業 (commerce), 商社 (a trading company) and 商店 (a shop) name commercial bodies, and 売上 (proceeds), 売行き (sales), 売買 (buying and selling), 売店 (a stall or kiosk) and 売り切れ (sold out) describe selling.",
    extendedInsight:
      "定価 (a fixed price), 差し引き (a deduction, balance), 小遣い (pocket money, an allowance), 回数券 (a book of tickets), 定期券 (a commuter pass) and 定休日 (a regular holiday) are everyday commercial notices. Note that 定 appears in all of 定価, 定期券 and 定休日, where it means fixed or regular.",
    examples: [
      {
        jp: "今月の売上は先月より増えました。",
        romaji: "Kongetsu no uriage wa sengetsu yori fuemashita.",
        en: "This month's sales are higher than last month's.",
      },
      {
        jp: "この店の定休日は水曜日です。",
        romaji: "Kono mise no teikyuubi wa suiyoubi desu.",
        en: "This shop's regular day off is Wednesday.",
      },
    ],
    commonMistake:
      "売り切れ and 売り切れる are the noun and verb of the same idea. A sign says 売り切れ (sold out), while you say 商品が売り切れた or 売り切れました in a sentence. 売上 is money taken in, whereas 売行き is how well something is selling.",
    rows: [
      {
        label: "commerce",
        terms: ["商業", "商社", "商店"],
      },
      {
        label: "selling",
        terms: ["売上", "売行き", "売買", "売店", "売り切れ"],
      },
      {
        label: "fixed prices & passes",
        terms: ["定価", "回数券", "定期券", "定休日"],
      },
      {
        label: "money in hand",
        terms: ["差し引き", "小遣い"],
      },
    ],
  },
  {
    key: "n2-n21-government-officials-rulers",
    title: "Government, Officials & Rulers",
    subtitle: "官庁・役人・天皇",
    insight:
      "Public administration has its own nouns. 官庁 (a government office), 役所 (a public office), 役人 (a government official), 役目 (a duty), 巡査 (a police officer) and 就任 (assuming office) describe the people and places of government, and 国立 (national) marks an institution run by the state.",
    extendedInsight:
      "At the top, 天皇 (the Emperor of Japan) and 国王 (a king) name rulers, and 専制 (despotism), 可決 (approval, passage of a bill), 対策 (a counter-measure) and 対立 (confrontation, opposition) describe how power is exercised and contested.",
    examples: [
      {
        jp: "引っ越しの手続きのために、役所に行きました。",
        romaji: "Hikkoshi no tetsuzuki no tame ni, yakusho ni ikimashita.",
        en: "I went to the government office to do the paperwork for moving.",
      },
      {
        jp: "その法案は国会で可決されました。",
        romaji: "Sono houan wa kokkai de kaketsu saremashita.",
        en: "That bill was passed in the Diet.",
      },
    ],
    commonMistake:
      "役所, 官庁 and 役人 are related but not identical. 役所 is the local office where you file forms (市役所), 官庁 is the more formal word for a government agency at national level, and 役人 is the person who works there.",
    rows: [
      {
        label: "offices",
        terms: ["官庁", "役所", "国立"],
      },
      {
        label: "officials",
        terms: ["役人", "役目", "巡査", "就任"],
      },
      {
        label: "rulers",
        terms: ["天皇", "国王", "専制"],
      },
      {
        label: "decisions & conflict",
        terms: ["可決", "対策", "対立"],
      },
    ],
  },
  {
    key: "n2-n22-meetings-questions-answers",
    title: "Meetings, Questions & Answers",
    subtitle: "司会・問い合わせ・回答",
    insight:
      "Words for organised discussion begin with 司会 (a host, chairperson). 問い合わせ (an inquiry), 問答 (questions and answers) and 回答 (a reply, an answer) describe the flow of questions, and 学会 and 宴会 (a banquet, a party) are gatherings where people meet.",
    extendedInsight:
      "各々 (each, every) and 各自 (individual, each) refer to people one at a time, 合同 (combination, joint), 合流 (a merging, a confluence), 合理 (rational) and 同格 (the same rank, apposition) describe how people or ideas combine or compare.",
    examples: [
      {
        jp: "この件については、担当者にお問い合わせください。",
        romaji: "Kono ken ni tsuite wa, tantousha ni otoiawase kudasai.",
        en: "Please direct questions about this matter to the person in charge.",
      },
      {
        jp: "各自、お弁当を持ってきてください。",
        romaji: "Kakuji, obentou o motte kite kudasai.",
        en: "Everyone, please bring your own lunch.",
      },
    ],
    commonMistake:
      "回答 and 解答 are both こたえ, but 回答 is a reply to a question or a survey (アンケートに回答する), while 解答 is the solution to a problem or test question, and this lesson only covers the first.",
    rows: [
      {
        label: "chairing",
        terms: ["司会", "宴会"],
      },
      {
        label: "asking & answering",
        terms: ["問い合わせ", "問答", "回答"],
      },
      {
        label: "each one",
        terms: ["各々", "各自"],
      },
      {
        label: "combining",
        terms: ["合同", "合流", "合理", "同格"],
      },
    ],
  },
  {
    key: "n2-n23-people-family-names",
    title: "Children, Spouses, Descendants & Names",
    subtitle: "坊っちゃん・夫妻・名字",
    insight:
      "This lesson gathers words for people and family. 坊や (a boy), 坊っちゃん (someone else's son) and 坊さん (a Buddhist priest) all come from 坊, 夫妻 (a married couple), 女房 (a wife), 姪 (a niece) and 子孫 (descendants) describe family, and 名字 (a family name) is your surname.",
    extendedInsight:
      "小父さん and 小母さん are the kanji forms of おじさん and おばさん used for men and women who are not relatives, while 孝行 (filial piety) is a virtue described with the phrase 親孝行. 御無沙汰 (not being in touch for a while), お帰り (a welcome home) and 失恋 (a broken heart) belong to social situations, and 女～ is a prefix meaning female.",
    examples: [
      {
        jp: "山田さん夫妻をパーティーに招待しました。",
        romaji: "Yamada san fusai o paatii ni shoutai shimashita.",
        en: "We invited Mr and Mrs Yamada to the party.",
      },
      {
        jp: "ご無沙汰しております。お元気ですか。",
        romaji: "Gobusata shite orimasu. Ogenki desu ka.",
        en: "It's been a long time since we last spoke. How are you?",
      },
    ],
    commonMistake:
      "坊さん and 坊っちゃん look alike but are different. 坊さん is a monk, while 坊っちゃん is a polite way to refer to somebody else's son, and 坊や is a friendly way to address a little boy. Calling a monk 坊っちゃん would be a serious mistake.",
    rows: [
      {
        label: "boys & monks",
        terms: ["坊や", "坊っちゃん", "坊さん"],
      },
      {
        label: "family",
        terms: ["夫妻", "女房", "姪", "子孫", "孝行"],
      },
      {
        label: "names & neighbours",
        terms: ["名字", "小父さん", "小母さん", "女"],
      },
      {
        label: "social situations",
        terms: ["御無沙汰", "お帰り", "失恋"],
      },
    ],
  },
  {
    key: "n2-n24-body-posture-health",
    title: "Lips, Posture, Nausea & Lifespan",
    subtitle: "唇・姿勢・寿命",
    insight:
      "Words for the body and its state include 唇 (the lips), 小指 (the little finger), 姿勢 (posture, attitude) and 吐き気 (nausea). 寿命 (a life span) and 心身 (mind and body) describe the person as a whole.",
    extendedInsight:
      "平気 (calm, unconcerned), 実感 (a real feeling, realization) and the pair 好き嫌い (likes and dislikes) and 好き好き (a matter of taste) describe attitudes, and 小便 is a blunt colloquial word for urine, used less often than おしっこ or 尿.",
    examples: [
      {
        jp: "姿勢を正して、座ってください。",
        romaji: "Shisei o tadashite, suwatte kudasai.",
        en: "Please sit up straight.",
      },
      {
        jp: "船に乗ると、吐き気がします。",
        romaji: "Fune ni noru to, hakike ga shimasu.",
        en: "I feel nauseous when I get on a boat.",
      },
    ],
    commonMistake:
      "姿勢 means both posture (背中の姿勢) and a stance or attitude (前向きな姿勢). 好き嫌い and 好き好き differ too: 好き嫌い is a person's likes and dislikes (好き嫌いが多い, a picky eater), while 好き好き is that people's tastes differ (人それぞれ、好き好きです).",
    rows: [
      {
        label: "body parts",
        terms: ["唇", "小指"],
      },
      {
        label: "posture & lifespan",
        terms: ["姿勢", "寿命", "心身"],
      },
      {
        label: "sickness",
        terms: ["吐き気", "小便"],
      },
      {
        label: "attitudes",
        terms: ["平気", "実感", "好き嫌い", "好き好き"],
      },
    ],
  },
  {
    key: "n2-n25-home-rooms-bedding",
    title: "Rooms, Cushions & Bedding",
    subtitle: "座敷・座布団・寝間着",
    insight:
      "Traditional Japanese homes have their own room and furniture words. 座敷 (a tatami room), 床の間 (an alcove), 座布団 (a Japanese cushion), 客間 (a guest room) and 客席 (guest seating) describe where visitors sit, while 寝台 (a bed) and 寝間着 or 寝巻 (pyjamas) describe where and how people sleep.",
    extendedInsight:
      "寝間着 and 寝巻 are two written forms of the same word, ねまき. Housing itself is described with 団地 (a housing complex), 家屋 (a house, building), 家主 (a landlord), 店屋 (a store, shop), 屋外 (outdoors), 定員 (capacity) and 塵紙 (tissue paper).",
    examples: [
      {
        jp: "お客さんを座敷に案内しました。",
        romaji: "Okyakusan o zashiki ni annai shimashita.",
        en: "I showed the guests into the tatami room.",
      },
      {
        jp: "この部屋の定員は十人です。",
        romaji: "Kono heya no teiin wa juunin desu.",
        en: "The capacity of this room is ten people.",
      },
    ],
    commonMistake:
      "寝間着 and 寝巻 are the same word with the same reading (ねまき), so one is not more correct than the other. 屋外 (outdoors) is the opposite of 屋内, and shouldn't be confused with 室外.",
    rows: [
      {
        label: "tatami room & alcove",
        terms: ["座敷", "床の間", "座布団", "客間", "客席"],
      },
      {
        label: "sleeping",
        terms: ["寝台", "寝間着", "寝巻"],
      },
      {
        label: "housing",
        terms: ["団地", "家屋", "家主", "店屋", "屋外"],
      },
      {
        label: "capacity & paper",
        terms: ["定員", "塵紙"],
      },
    ],
  },
  {
    key: "n2-n26-measurement-size-change",
    title: "Measuring, Turning & Increasing",
    subtitle: "寸法・回転・増大",
    insight:
      "Measurement words describe size and quantity. 寸法 (measurements, dimensions), 容積 (capacity, volume), 広さ (extent), 図形 (a figure), 図表 (a chart, diagram) and 大小 (size) describe what things are like, and 回数 (number of times) counts occurrences.",
    extendedInsight:
      "Change over time appears in 増減 (increase and decrease), 増大 (increase, growth), 回転 (rotation), 圧縮 (compression), 展開 (development, expansion, the opposite of compression), 延長 (extension, prolongation), 引力 (gravity) and 引分け (a draw). 展開 also means the way a story develops, as in 話の展開.",
    examples: [
      {
        jp: "机の寸法を測りました。",
        romaji: "Tsukue no sunpou o hakarimashita.",
        en: "I measured the dimensions of the desk.",
      },
      {
        jp: "試合は延長になりました。",
        romaji: "Shiai wa enchou ni narimashita.",
        en: "The match went into extra time.",
      },
    ],
    commonMistake:
      "増大 and 増加 both mean increase, but 増大 stresses growth in size or degree (不安が増大する), while 増加 is an increase in number (人口が増加する). 増減 covers both up and down at once, so it's not just an increase.",
    rows: [
      {
        label: "size",
        terms: ["寸法", "容積", "広さ", "大小"],
      },
      {
        label: "figures & counts",
        terms: ["図形", "図表", "回数"],
      },
      {
        label: "growing & shrinking",
        terms: ["増減", "増大", "圧縮", "展開"],
      },
      {
        label: "turning & extending",
        terms: ["回転", "延長", "引力", "引分け"],
      },
    ],
  },
  {
    key: "n2-n27-foundation-work-practice",
    title: "Foundations, Construction & Practical Results",
    subtitle: "基準・工事・実績",
    insight:
      "The kanji 基 (base) gives 基準 (a standard), 基礎 (a foundation), 基地 (a base) and 基盤 (a foundation, basis). 工事 (construction), 工員 (a factory worker), 大工 (a carpenter) and 工夫 (a device, ingenuity) use 工 for work and craft.",
    extendedInsight:
      "実 gives 実績 (achievements, results), 実物 (the real thing), 実用 (practical use) and 実例 (an example). 強化 (strengthening), 弱点 (a weak point), 形式 (form, format), 当日 (the very day), 当番 (being on duty), 年度 (a fiscal year), 往復 (a round trip), 待合室 (a waiting room) and 差し支え (a hindrance) are all practical words of work life.",
    examples: [
      {
        jp: "彼は大工として二十年働いています。",
        romaji: "Kare wa daiku to shite nijuunen hataraite imasu.",
        en: "He has worked as a carpenter for twenty years.",
      },
      {
        jp: "明日でも差し支えありませんか。",
        romaji: "Ashita demo sashitsukae arimasen ka.",
        en: "Would tomorrow be all right too?",
      },
    ],
    commonMistake:
      "基準 and 基礎 both suggest a base but are used differently. 基準 is a standard to measure against (安全基準, safety standards), while 基礎 is the groundwork on which something is built (基礎を学ぶ, to learn the basics).",
    rows: [
      {
        label: "standards & bases",
        terms: ["基準", "基礎", "基地", "基盤"],
      },
      {
        label: "building & craft",
        terms: ["工事", "工員", "大工", "工夫"],
      },
      {
        label: "real results",
        terms: ["実績", "実物", "実用", "実例"],
      },
      {
        label: "form & strength",
        terms: ["形式", "強化", "弱点"],
      },
      {
        label: "duty & schedule",
        terms: ["当日", "当番", "年度", "往復", "待合室", "差し支え"],
      },
    ],
  },
  {
    key: "n2-n28-daily-life-loose-ends",
    title: "Necessities, Night Travel & Loose Ends",
    subtitle: "必需品・夜行・外科",
    insight:
      "This lesson gathers everyday words that fit no single theme. 必需品 (necessities) and 心当たり (having some idea about) are general, 夜間 (at night) and 夜行 (a night train) describe travel after dark, and 外部 (the outside) and 外科 (surgery) both use 外.",
    extendedInsight:
      "循環 (circulation, a cycle) is used for blood, money and the water cycle alike. 御中 is written after a company's name in an address, and 宛名 (an address, the addressee) is the name written on an envelope. 和服 (Japanese clothes), 和英 (Japanese-English), 和～ (Japanese style), 古～ (old ~), 室～ (room), 幾～ (several ~), ローマ字 (Roman letters), 形容詞 and 形容動詞 (adjectives) complete the batch.",
    examples: [
      {
        jp: "夜行バスで京都に行きました。",
        romaji: "Yakou basu de Kyouto ni ikimashita.",
        en: "I went to Kyoto on an overnight bus.",
      },
      {
        jp: "封筒に宛名を書いてください。",
        romaji: "Fuutou ni atena o kaite kudasai.",
        en: "Please write the address on the envelope.",
      },
    ],
    commonMistake:
      "御中 is used after the name of an organisation (株式会社ABC御中), and 様 is used after an individual's name. Don't use both together, and don't write 御中 after a person's name.",
    rows: [
      {
        label: "essentials",
        terms: ["必需品", "心当たり", "循環"],
      },
      {
        label: "night & outside",
        terms: ["夜間", "夜行", "外部", "外科"],
      },
      {
        label: "letters & address",
        terms: ["宛名", "御中", "ローマ字"],
      },
      {
        label: "grammar & Japanese-style",
        terms: ["形容詞", "形容動詞", "和服", "和英", "和"],
      },
      {
        label: "prefixes",
        terms: ["古", "室", "幾"],
      },
      {
        label: "punctuation",
        terms: ["句読点"],
      },
    ],
  },
  {
    key: "n2-n29-temple-garden-tools-writing",
    title: "Temples, Gardens, Tools & Rounding Off",
    subtitle: "寺院・園芸・四捨五入",
    insight:
      "This short lesson gathers four unrelated everyday nouns. 寺院 (a temple) is a formal word for a Buddhist temple, 園芸 (gardening, horticulture) is the hobby or trade of growing plants, 器具 (an instrument, appliance) is a general word for tools, and 執筆 (writing) is the act of writing a book or an article.",
    extendedInsight:
      "四捨五入 (rounding off) is a four-kanji compound that literally means 'discard four, take in five': digits of four or less are dropped, and five or more round up. It is used in maths and in everyday estimates.",
    examples: [
      {
        jp: "小数点以下を四捨五入してください。",
        romaji: "Shousuuten ika o shishagonyuu shite kudasai.",
        en: "Please round off everything below the decimal point.",
      },
      {
        jp: "祖母の趣味は園芸です。",
        romaji: "Sobo no shumi wa engei desu.",
        en: "My grandmother's hobby is gardening.",
      },
    ],
    commonMistake:
      "寺院 and お寺 both mean a temple, but 寺院 is the formal, written word (歴史ある寺院), and お寺 is what people say when talking about visiting one. Neither is used for a Shinto shrine, which is 神社.",
    rows: [
      {
        label: "temples & gardens",
        terms: ["寺院", "園芸"],
      },
      {
        label: "tools & writing",
        terms: ["器具", "執筆"],
      },
      {
        label: "rounding",
        terms: ["四捨五入"],
      },
    ],
  },
  {
    key: "n2-n30-reception-gratitude-feelings",
    title: "Receiving Guests & Expressing Feelings",
    subtitle: "応対・恐縮・感激",
    insight:
      "Polite business Japanese needs nouns for receiving people. 応接 (reception of guests) and 応対 (dealing with a customer) describe how you treat someone who comes to you, and 恐縮 (feeling sorry to trouble someone), 感激 (deep emotion) and 恩恵 (a blessing, benefit) express what you feel about their kindness.",
    extendedInsight:
      "Less pleasant feelings have nouns too: 恨み (resentment), 欲張り (greed), 溜息 (a sigh) and 油断 (negligence, being unprepared). 洒落 (a joke, a pun) lightens the mood, 教養 (culture, education) refers to a person's breadth of learning, and 敬語 (honorific language) is the system of respect that makes 応対 polite.",
    examples: [
      {
        jp: "お忙しいところ恐縮ですが、少しお時間をいただけますか。",
        romaji:
          "Oisogashii tokoro kyoushuku desu ga, sukoshi ojikan o itadakemasu ka.",
        en: "I'm sorry to trouble you when you're busy, but could I have a little of your time?",
      },
      {
        jp: "彼の親切に、とても感激しました。",
        romaji: "Kare no shinsetsu ni, totemo kangeki shimashita.",
        en: "I was deeply moved by his kindness.",
      },
    ],
    commonMistake:
      "恐縮 is often used in apologies and requests, and it does not mean fear in the everyday sense. 恐縮です expresses that you feel awkward about the trouble you are causing, so it sounds natural after a favour, but not after a serious mistake, where you would use 申し訳ありません.",
    rows: [
      {
        label: "receiving people",
        terms: ["応接", "応対", "敬語", "早口"],
      },
      {
        label: "gratitude & emotion",
        terms: ["恐縮", "感激", "恩恵"],
      },
      {
        label: "less pleasant feelings",
        terms: ["恨み", "欲張り", "溜息", "油断"],
      },
      {
        label: "wit & learning",
        terms: ["洒落", "教養"],
      },
    ],
  },
  {
    key: "n2-n31-concepts-structure-terms",
    title: "Meaning, Structure & Technical Terms",
    subtitle: "意義・構造・法則",
    insight:
      "Abstract nouns support analysis and explanation. 意義 (meaning, significance), 抽象 (abstract), 構造 (structure), 法則 (a law, rule), 標準 (a standard) and 段階 (a stage, gradation) are the vocabulary of discussing how things work, and 概論 (an introduction, general remarks) names a survey course or book.",
    extendedInsight:
      "For texts, 文脈 (context), 文体 (literary style), 文献 (literature, reference books) and 文芸 (literature and the arts) describe writing, while 推定 (presumption), 断定 (a firm conclusion), 指定 (designation), 成分 (an ingredient, component), 成立 (formation, establishment) and 応用 (application) describe reasoning and results. 性能 (capability), 性別 (gender), 本来 (originally, by nature), 格別 (exceptional), 架空 (imaginary), 標本 (a specimen) and 標識 (a sign) round out the group.",
    examples: [
      {
        jp: "この研究には大きな意義があります。",
        romaji: "Kono kenkyuu ni wa ookina igi ga arimasu.",
        en: "This research has great significance.",
      },
      {
        jp: "文脈から、言葉の意味を考えましょう。",
        romaji: "Bunmyaku kara, kotoba no imi o kangaemashou.",
        en: "Let's work out the meaning of the word from the context.",
      },
    ],
    commonMistake:
      "推定 and 断定 sit at opposite ends of certainty. 推定 means to presume from evidence (推定無罪, presumed innocent), while 断定 means to state something as a definite conclusion. Using 断定 for a guess makes you sound overconfident.",
    rows: [
      {
        label: "meaning & structure",
        terms: ["意義", "抽象", "構造", "概論", "本来", "格別"],
      },
      {
        label: "rules & standards",
        terms: ["法則", "標準", "段階", "標識", "標本"],
      },
      {
        label: "texts",
        terms: ["文脈", "文体", "文献", "文芸"],
      },
      {
        label: "reasoning & results",
        terms: ["推定", "断定", "指定", "成分", "成立", "応用"],
      },
      {
        label: "capability & kind",
        terms: ["性能", "性別", "架空"],
      },
    ],
  },
  {
    key: "n2-n32-sun-weather-times-of-day",
    title: "Sunshine, Shade & Times of Day",
    subtitle: "日当たり・日の出・深夜",
    insight:
      "Many N2 words describe the sun and the hours. 日当たり (sunny exposure), 日陰 (shade), 日の出 (sunrise) and 日の入り (sunset) use 日 for the sun, 明け方 (dawn) and 深夜 (late at night) mark the two ends of the night, and 明明後日 (three days from now) looks further ahead.",
    extendedInsight:
      "快晴 (good weather, clear sky), 気圧 (atmospheric pressure), 湿気 (humidity, dampness) and 気配 (a sign, an indication) describe conditions and impressions. 昼寝 (a nap) and 朝寝坊 (oversleeping, a late riser) describe sleeping at the wrong time.",
    examples: [
      {
        jp: "この部屋は日当たりがいいです。",
        romaji: "Kono heya wa hiatari ga ii desu.",
        en: "This room gets a lot of sun.",
      },
      {
        jp: "日曜日は朝寝坊をしてしまいました。",
        romaji: "Nichiyoubi wa asanebou o shite shimaimashita.",
        en: "On Sunday I overslept.",
      },
    ],
    commonMistake:
      "明明後日 is read しあさって, and that is the day after あさって, so three days after today. The reading here, しあさって, is easily confused with 明後日 (あさって), which is only two days ahead.",
    rows: [
      {
        label: "sun & shade",
        terms: ["日当たり", "日陰", "日の出", "日の入り"],
      },
      {
        label: "night & morning",
        terms: ["明け方", "深夜", "明明後日"],
      },
      {
        label: "weather",
        terms: ["快晴", "気圧", "湿気", "気配"],
      },
      {
        label: "sleep",
        terms: ["昼寝", "朝寝坊"],
      },
    ],
  },
  {
    key: "n2-n33-schedules-timetables",
    title: "Schedules, Routines & Timetables",
    subtitle: "日程・日課・時間割",
    insight:
      "Planning words are built on 日 and 時. 日時 (date and time), 日程 (a schedule), 日課 (a daily routine), 日日 (the date), 月日 (time, years and days) and 月末 (the end of the month) describe the calendar, and 時間割 (a timetable) and 時速 (speed per hour) describe hours.",
    extendedInsight:
      "日帰り (a day trip) is an outing that returns the same day, 来日 (coming to Japan) is used for visitors from abroad, 月給 (a monthly salary) is paid at month's end, and 毎度 (each time) is a set greeting in shops (毎度ありがとうございます).",
    examples: [
      {
        jp: "会議の日程が決まりました。",
        romaji: "Kaigi no nittei ga kimarimashita.",
        en: "The schedule for the meeting has been decided.",
      },
      {
        jp: "この電車は時速二百キロで走ります。",
        romaji: "Kono densha wa jisoku nihyaku kiro de hashirimasu.",
        en: "This train runs at 200 kilometres per hour.",
      },
    ],
    commonMistake:
      "日日 is read ひにち in this word list, a rare reading meaning a date or a number of days, while the more common reading is にちにち or ひび. 日時 (にちじ) means the exact day and time, and 日程 (にってい) is the whole plan of days.",
    rows: [
      {
        label: "the calendar",
        terms: ["日時", "日程", "日課", "日日", "月日", "月末"],
      },
      {
        label: "hours",
        terms: ["時間割", "時速"],
      },
      {
        label: "trips, visits & pay",
        terms: ["日帰り", "来日", "月給", "毎度"],
      },
    ],
  },
  {
    key: "n2-n34-small-household-items",
    title: "Small Household & Desk Items",
    subtitle: "戸棚・手帳・水筒",
    insight:
      "This lesson gathers small everyday objects. 戸棚 (a cupboard), 枕 (a pillow), 櫛 (a comb), 湯飲み (a teacup), 水筒 (a water bottle), 手拭い (a hand towel) and 手洗い (a restroom, a lavatory) are things you find around a home, and 手帳 (a notebook), 文房具 (stationery) and 日用品 (daily necessities) are things you buy.",
    extendedInsight:
      "扇子 (a folding fan) and 扇風機 (an electric fan) share 扇 (a fan), one hand-held and one electric. 梯子 (a ladder), 栓 (a stopper, cork), 歯車 (a gear) and 歯磨き (toothbrushing, toothpaste) round out a mixed group of small useful things.",
    examples: [
      {
        jp: "暑いので、扇風機をつけました。",
        romaji: "Atsui node, senpuuki o tsukemashita.",
        en: "It was hot, so I turned on the electric fan.",
      },
      {
        jp: "予定を手帳に書いておきます。",
        romaji: "Yotei o techou ni kaite okimasu.",
        en: "I write my plans in my notebook.",
      },
    ],
    commonMistake:
      "手洗い is a restroom (お手洗い is more polite) but is also the act of washing hands (手洗いをする). Signs at the sink say 手洗い, and the same sign on a door means the toilets.",
    rows: [
      {
        label: "in the house",
        terms: ["戸棚", "枕", "櫛", "湯飲み", "水筒", "手拭い", "手洗い"],
      },
      {
        label: "fans",
        terms: ["扇子", "扇風機"],
      },
      {
        label: "for writing & daily life",
        terms: ["手帳", "文房具", "日用品"],
      },
      {
        label: "tools & hygiene",
        terms: ["梯子", "栓", "歯車", "歯磨き"],
      },
    ],
  },
  {
    key: "n2-n35-clothing-textiles",
    title: "Clothes, Fabric & Fur",
    subtitle: "浴衣・水着・毛糸",
    insight:
      "This short lesson gathers clothing words. 浴衣 (an informal summer kimono), 水着 (a swimsuit) and 洋品店 (a store selling Western-style clothing and accessories) describe what people wear and where they buy it. 毛糸 (knitting wool) and 毛皮 (fur, pelt) are the materials.",
    extendedInsight:
      "手首 (a wrist) belongs here because it is where a bracelet or a watch is worn. 浴衣 is lighter than a formal kimono and is worn in summer, at festivals and at hot-spring inns.",
    examples: [
      {
        jp: "夏祭りに浴衣を着て行きました。",
        romaji: "Natsumatsuri ni yukata o kite ikimashita.",
        en: "I wore a yukata to the summer festival.",
      },
      {
        jp: "母は毛糸でセーターを編みました。",
        romaji: "Haha wa keito de seetaa o amimashita.",
        en: "My mother knitted a sweater from wool.",
      },
    ],
    commonMistake:
      "水着 is worn for swimming and is not the same as 下着 (underwear), even though both are clothing in direct contact with the body. 洋品店 sells 洋服 and accessories, but not everything a modern department store carries.",
    rows: [
      {
        label: "garments",
        terms: ["浴衣", "水着"],
      },
      {
        label: "materials",
        terms: ["毛糸", "毛皮", "編み物"],
      },
      {
        label: "shopping & wearing",
        terms: ["洋品店", "手首"],
      },
    ],
  },
  {
    key: "n2-n36-procedures-maintenance",
    title: "Procedures, Repairs & Checking",
    subtitle: "手続き・整備・改正",
    insight:
      "Practical noun-suru words describe getting things done. 手続き (a procedure, formalities), 打合せ (a business meeting, prior arrangement), 持参 (bringing something with you) and 投書 (a letter to an editor) describe office and civic tasks, and 指定 and 採点 (marking, grading) are examples of specifying and checking.",
    extendedInsight:
      "改札 (a ticket check), 改正 (a revision), 改造 (a remodelling) all share 改, meaning to change. 手入れ (maintenance), 整備 (maintenance, overhaul), 清掃 (cleaning), 消毒 (disinfection), 換気 (ventilation), 断水 (a water outage), 洗面 (washing one's face), 清書 (a clean copy) and 消防署 (a fire station) cover upkeep and hygiene.",
    examples: [
      {
        jp: "引っ越しの手続きは、もう終わりましたか。",
        romaji: "Hikkoshi no tetsuzuki wa, mou owarimashita ka.",
        en: "Have you already finished the paperwork for moving?",
      },
      {
        jp: "工事のため、明日は断水します。",
        romaji: "Kouji no tame, ashita wa dansui shimasu.",
        en: "There will be a water outage tomorrow because of construction work.",
      },
    ],
    commonMistake:
      "改正 and 改造 both involve changing something, but 改正 is for laws and rules (法律を改正する), while 改造 is for physical objects like a house or a car. Don't use 改正 for a building.",
    rows: [
      {
        label: "paperwork & meetings",
        terms: ["手続き", "打合せ", "持参", "投書"],
      },
      {
        label: "checking & changing",
        terms: ["採点", "改札", "改正", "改造"],
      },
      {
        label: "upkeep",
        terms: ["手入れ", "整備", "清掃", "消毒", "換気"],
      },
      {
        label: "water & hygiene",
        terms: ["断水", "洗面", "清書", "消防署"],
      },
    ],
  },
  {
    key: "n2-n37-directions-viewpoints",
    title: "Directions, Facing & Points of View",
    subtitle: "方角・正面・東西",
    insight:
      "方 (way, direction) builds a family of words. 方角 (a direction), 方面 (a direction, an area), 方針 (an objective, a policy), 方言 (a dialect) and 方程式 (an equation) all use it, and 方 read ほう also marks one side of a comparison (this side, that side).",
    extendedInsight:
      "For orientation, 正面 (the front), 正門 (the main gate), 斜め and 斜 (both diagonal), 手前 (this side, before) and 東西 (east and west) describe where something is. 欧米 (Europe and America, the West), 本部 (headquarters), 敷地 (a site, grounds) and 所々 (here and there) describe wider locations.",
    examples: [
      {
        jp: "駅の正面に大きな銀行があります。",
        romaji: "Eki no shoumen ni ookina ginkou ga arimasu.",
        en: "There is a big bank right in front of the station.",
      },
      {
        jp: "私は東京の方面へ行く電車に乗りました。",
        romaji: "Watashi wa Toukyou no houmen e iku densha ni norimashita.",
        en: "I took a train heading toward Tokyo.",
      },
    ],
    commonMistake:
      "方角 is a compass direction (north, south, east, west), while 方向 is the direction something moves or faces, and 方面 is the general area in that direction. 方言 is a regional dialect, not a foreign language.",
    rows: [
      {
        label: "directions",
        terms: ["ほうひかく", "方角", "方面", "東西"],
      },
      {
        label: "policy & language",
        terms: ["方針", "方言", "方程式"],
      },
      {
        label: "front & slant",
        terms: ["正面", "正門", "斜め", "斜", "手前"],
      },
      {
        label: "wider places",
        terms: ["欧米", "本部", "敷地", "所々"],
      },
    ],
  },
  {
    key: "n2-n38-numbers-curves-measurement",
    title: "Numbers, Curves & Measuring",
    subtitle: "整数・曲線・測定",
    insight:
      "Maths and measuring words fill out this lesson. 整数 (an integer), 掛け算 (multiplication), 桁 (a digit, a column), 曲線 (a curve), 楕円 (an ellipse) and 正方形 (a square) name numbers and figures, and 測定 (measurement), 測量 (surveying) and 濃度 (concentration, density) name ways of measuring.",
    extendedInsight:
      "満点 (a perfect score), 未満 (less than), 正味 (net weight), 枚数 (the number of flat things) and 満員 (a full house, sold out) are about limits and totals. Note that 未満 does not include the number itself, so 十八歳未満 means under eighteen.",
    examples: [
      {
        jp: "テストで満点を取りました。",
        romaji: "Tesuto de manten o torimashita.",
        en: "I got a perfect score on the test.",
      },
      {
        jp: "千円未満は切り捨てます。",
        romaji: "Senen miman wa kirisutemasu.",
        en: "Amounts under 1,000 yen are rounded down.",
      },
    ],
    commonMistake:
      "未満 and 以下 are easily confused. 未満 excludes the number (十八歳未満 is seventeen and younger), while 以下 includes it (十八歳以下 includes eighteen-year-olds). The same applies to 以上 versus 超える.",
    rows: [
      {
        label: "numbers & shapes",
        terms: ["整数", "掛け算", "桁", "曲線", "楕円", "正方形"],
      },
      {
        label: "measuring",
        terms: ["測定", "測量", "濃度"],
      },
      {
        label: "limits & totals",
        terms: ["満点", "未満", "正味", "枚数", "満員"],
      },
    ],
  },
  {
    key: "n2-n39-books-printing-performance",
    title: "Books, Printing & Performance",
    subtitle: "書籍・活字・演劇",
    insight:
      "Words with 書 cover books and writing. 書籍 (a book, a publication), 書店 (a bookshop), 書道 (calligraphy), 書取 (dictation) and 書留 (registered mail) each use it, and 活字 (printing type), 括弧 (brackets), 振り仮名 (furigana, pronunciation key), 欄 (a column of text) and 漢和 (a Chinese-character dictionary) describe printed text.",
    extendedInsight:
      "撮影 (photographing, filming), 演劇 (theatre) and 望遠鏡 (a telescope) are about seeing and showing. 振り仮名 is the small kana printed beside a kanji to show how to read it, and 括弧 is the general word for brackets of any shape.",
    examples: [
      {
        jp: "この本には振り仮名がついています。",
        romaji: "Kono hon ni wa furigana ga tsuite imasu.",
        en: "This book has furigana on the kanji.",
      },
      {
        jp: "ここでは写真の撮影は禁止です。",
        romaji: "Koko de wa shashin no satsuei wa kinshi desu.",
        en: "Taking photographs is prohibited here.",
      },
    ],
    commonMistake:
      "書留 is a registered mail service and is unrelated to 書き留める (to write down), even though both use the same kanji. When you send something valuable in Japan, you ask for 書留 at the post office.",
    rows: [
      {
        label: "books & shops",
        terms: ["書籍", "書店", "書道", "書取", "書留"],
      },
      {
        label: "printed text",
        terms: ["活字", "括弧", "振り仮名", "欄", "漢和"],
      },
      {
        label: "seeing & showing",
        terms: ["撮影", "演劇", "望遠鏡"],
      },
    ],
  },
  {
    key: "n2-n40-forest-timber-fishing",
    title: "Forests, Timber, Fruit & Fishing",
    subtitle: "森林・木材・漁業",
    insight:
      "The industries that come from land and sea appear here. 森林 (a forest), 杉 (a Japanese cedar), 植木 (garden trees, a potted plant), 木材 and 材木 (both lumber) and 果実 (fruit) are about trees and their products, while 水産 (marine products), 漁業 (the fishing industry) and 漁師 (a fisherman) are about the sea.",
    extendedInsight:
      "木材 and 材木 both mean lumber, and are hard to tell apart. 木材 emphasises the wood as a material, while 材木 is closer to timber cut for building. 杉 is Japan's most common planted tree, and is known for both its timber and its pollen.",
    examples: [
      {
        jp: "この家は杉の木材で作られています。",
        romaji: "Kono ie wa sugi no mokuzai de tsukurarete imasu.",
        en: "This house is built with cedar wood.",
      },
      {
        jp: "祖父は長い間、漁師として働きました。",
        romaji: "Sofu wa nagai aida, ryoushi to shite hatarakimashita.",
        en: "My grandfather worked as a fisherman for many years.",
      },
    ],
    commonMistake:
      "果実 is a formal or literary word for fruit, used in writing about botany or agriculture, while 果物 is the everyday word you use when shopping or eating. 果実酒 (fruit liqueur) is one of the few everyday words to keep 果実.",
    rows: [
      {
        label: "trees & wood",
        terms: ["森林", "杉", "植木", "木材", "材木"],
      },
      {
        label: "fruit",
        terms: ["果実"],
      },
      {
        label: "the sea's produce",
        terms: ["水産", "漁業", "漁師"],
      },
    ],
  },
  {
    key: "n2-n41-water-states-hot-springs",
    title: "Water in Every Form",
    subtitle: "水蒸気・淡水・温泉",
    insight:
      "Many N2 nouns describe water and its states. 水蒸気 (water vapour), 水滴 (a drop of water), 水分 (moisture), 液体 (a liquid), 淡水 (fresh water) and 水面 (the water's surface) describe it scientifically, and 水素 (hydrogen), 湯気 (steam) and 汁 (juice, soup) describe it at home.",
    extendedInsight:
      "水平線 (the horizon), 海洋 (the ocean), 流域 (a river basin), 滝 (a waterfall) and 海水浴 (sea bathing) describe water in nature. 溶岩 (lava) is the hot counterpart, and 温泉 (a hot spring), 温室 (a greenhouse) and 温帯 (the temperate zone) all use 温 for warmth.",
    examples: [
      {
        jp: "海の向こうに水平線が見えます。",
        romaji: "Umi no mukou ni suiheisen ga miemasu.",
        en: "You can see the horizon beyond the sea.",
      },
      {
        jp: "週末は家族で温泉に行きました。",
        romaji: "Shuumatsu wa kazoku de onsen ni ikimashita.",
        en: "At the weekend, my family went to a hot spring.",
      },
    ],
    commonMistake:
      "水分 and 水蒸気 both relate to water but differ. 水分 is the water content of something (水分をとる, to take in fluids), while 水蒸気 is water in its gas form. 湯気 is the visible steam you see above hot food, which is technically tiny droplets.",
    rows: [
      {
        label: "water in science",
        terms: ["水蒸気", "水滴", "水分", "液体", "淡水", "水素"],
      },
      {
        label: "steam & soup",
        terms: ["湯気", "汁", "水面"],
      },
      {
        label: "water in nature",
        terms: ["水平線", "海洋", "流域", "滝", "海水浴", "溶岩"],
      },
      {
        label: "warmth",
        terms: ["温泉", "温室", "温帯"],
      },
    ],
  },
  {
    key: "n2-n42-people-society-japan",
    title: "Parties, Warriors, Folk Songs & Japan",
    subtitle: "政党・武士・民謡",
    insight:
      "This lesson gathers social nouns. 政党 (a political party), 民間 (private, civilian), 民主 (democratic) and 民謡 (a folk song) use 民 for the people, 氏名 (a full name), 末っ子 (the youngest child) and 死体 (a corpse) describe individuals, and 武士 (a warrior, samurai) recalls Japan's past.",
    extendedInsight:
      "日本一 (number one in Japan) and 日本式 (Japanese style) show 日本 used as a building block. 民主 is a prefix in words like 民主主義 (democracy), and 民間 is used for private-sector activity as opposed to government.",
    examples: [
      {
        jp: "この民謡は、ふるさとの歌です。",
        romaji: "Kono minyou wa, furusato no uta desu.",
        en: "This folk song is a song from my hometown.",
      },
      {
        jp: "私は三人兄弟の末っ子です。",
        romaji: "Watashi wa sannin kyoudai no suekko desu.",
        en: "I am the youngest of three brothers.",
      },
    ],
    commonMistake:
      "民間 refers to the private sector (民間企業, a private company) and is not simply the word for civilians. For an ordinary citizen as opposed to a soldier, 民間人 makes the meaning explicit, whereas 民間 alone is about organisations and activities.",
    rows: [
      {
        label: "politics & people",
        terms: ["政党", "民間", "民主", "民謡"],
      },
      {
        label: "individuals",
        terms: ["氏名", "末っ子", "死体", "武士", "お手伝いさん"],
      },
      {
        label: "Japan",
        terms: ["いちにほんいち", "日本式"],
      },
    ],
  },
  {
    key: "n2-n43-trains-growth-processes",
    title: "Trains, Growth & Processes",
    subtitle: "新幹線・普及・激増",
    insight:
      "This final lesson of the batch mixes trains and processes. 新幹線 (the Shinkansen) and 機関車 (a locomotive) are trains, 有料 (paid, toll) describes a service you pay for, and 拡充 (expansion), 拡張 (extension), 普及 (spread, diffusion) and 激増 (a sudden increase) describe growth.",
    extendedInsight:
      "接近 (approaching) and 接続 (a connection, changing trains) describe joining and nearing, 損得 (loss and gain), 消化 (digestion), 消耗 (exhaustion, consumption), 混合 (mixing), 活力 (vitality) and 摩擦 (friction) describe processes and effects. 摩擦 is used literally for physics and figuratively for conflict, as in 貿易摩擦 (trade friction).",
    examples: [
      {
        jp: "新幹線に乗ると、東京から大阪まで約二時間半です。",
        romaji:
          "Shinkansen ni noru to, Toukyou kara Oosaka made yaku nijikan han desu.",
        en: "On the Shinkansen it takes about two and a half hours from Tokyo to Osaka.",
      },
      {
        jp: "スマートフォンが世界中に普及しました。",
        romaji: "Sumaatofon ga sekaijuu ni fukyuu shimashita.",
        en: "Smartphones have spread all over the world.",
      },
    ],
    commonMistake:
      "拡充 and 拡張 both mean expansion, but 拡充 is about enriching content or services (サービスの拡充), while 拡張 is about extending size or capacity (道路の拡張). 消化 is also used for using up a schedule (予定を消化する), so it isn't only about food.",
    rows: [
      {
        label: "trains",
        terms: ["新幹線", "機関車", "有料"],
      },
      {
        label: "growth & spread",
        terms: ["拡充", "拡張", "普及", "激増"],
      },
      {
        label: "joining & nearing",
        terms: ["接近", "接続"],
      },
      {
        label: "processes & effects",
        terms: ["損得", "消化", "消耗", "混合", "活力", "摩擦"],
      },
    ],
  },
  {
    key: "n2-n44-fire-volcano-power",
    title: "Fire, Volcanoes, Steam & Power",
    subtitle: "火山・煙突・発電",
    insight:
      "Words built on 火 and 灯 describe fire and light. 火山 (a volcano) and 火口 (a crater) are the natural version, 灯台 (a lighthouse) and 灯油 (kerosene, lamp oil) are man-made, and 煙突 (a chimney), 煉瓦 (a brick) and 炭鉱 (a coal mine) belong to industry.",
    extendedInsight:
      "Power and vapour follow: 発電 (generating electricity), 直流 (direct current), 蒸気 (steam, vapour) and 蒸発 (evaporation; an unexplained disappearance) all describe energy and heat. 瓦 (a roof tile) is a fired-clay product, like 煉瓦.",
    examples: [
      {
        jp: "冬は灯油のストーブを使います。",
        romaji: "Fuyu wa touyu no sutoobu o tsukaimasu.",
        en: "In winter we use a kerosene heater.",
      },
      {
        jp: "この火山は今も活動しています。",
        romaji: "Kono kazan wa ima mo katsudou shite imasu.",
        en: "This volcano is still active.",
      },
    ],
    commonMistake:
      "蒸発 has a literal meaning (water evaporating) and a slang meaning (a person vanishing without a trace, 一家が蒸発した). 蒸気 is steam in a technical sense, while 湯気 is the visible steam rising from hot food.",
    rows: [
      {
        label: "volcano",
        terms: ["火山", "火口"],
      },
      {
        label: "light & fuel",
        terms: ["灯台", "灯油", "炭鉱"],
      },
      {
        label: "industry",
        terms: ["煙突", "煉瓦", "瓦"],
      },
      {
        label: "power & vapour",
        terms: ["発電", "直流", "蒸気", "蒸発"],
      },
    ],
  },
  {
    key: "n2-n45-colours-patterns-paint",
    title: "Colours, Patterns & Paint",
    subtitle: "灰色・縞・絵の具",
    insight:
      "Colour nouns end in 色 or are simple words. 灰色 (grey), 紫 (purple) and 紺 (navy blue) name colours, 無地 (plain, without a pattern) and 縞 (stripes) describe fabric patterns, and 絵の具 (paints) and 艶 (gloss, glaze) describe materials.",
    extendedInsight:
      "紅葉 has two readings that are both in this list: こうよう (autumn colours, the change of leaves) and もみじ (a Japanese maple). 糊 (glue, paste, starch) and 芯 (a core, a wick) are small materials that go with crafts.",
    examples: [
      {
        jp: "彼女は紺のスーツを着ていました。",
        romaji: "Kanojo wa kon no suutsu o kite imashita.",
        en: "She was wearing a navy suit.",
      },
      {
        jp: "秋になると、山が紅葉で美しくなります。",
        romaji: "Aki ni naru to, yama ga kouyou de utsukushiku narimasu.",
        en: "When autumn comes, the mountains become beautiful with autumn leaves.",
      },
    ],
    commonMistake:
      "紅葉 has two readings with different emphasis. Read こうよう it names the season's colour change as an event, while read もみじ it names the maple tree or its leaves. Both are written the same, so the reading depends on the context.",
    rows: [
      {
        label: "colours",
        terms: ["灰色", "紫", "紺"],
      },
      {
        label: "patterns & finish",
        terms: ["無地", "縞", "艶"],
      },
      {
        label: "autumn leaves",
        terms: ["紅葉", "紅葉-2"],
      },
      {
        label: "craft materials",
        terms: ["絵の具", "糊", "芯"],
      },
    ],
  },
  {
    key: "n2-n46-kitchen-cooking-bottles",
    title: "Cooking, Menus & the Kitchen",
    subtitle: "炊事・献立・瀬戸物",
    insight:
      "Home-cooking words include 炊事 (cooking, kitchen work), 献立 (a menu, a meal plan), 瓶詰 (bottling, bottled goods) and 缶詰 (canned goods), which name the process and the preserved result. 粒 (a grain) and 蓋 (a lid) are small parts of cooking.",
    extendedInsight:
      "瀬戸物 (earthenware, crockery, china) takes its name from the town of Seto, famous for pottery. 箒 (a broom) and 盆 (a tray, and the Festival of the Dead) are common household objects. 盆 has two unrelated meanings, so context tells you whether it is a tray or the summer festival.",
    examples: [
      {
        jp: "今日の夕食の献立を考えています。",
        romaji: "Kyou no yuushoku no kondate o kangaete imasu.",
        en: "I'm thinking about what to have for dinner today.",
      },
      {
        jp: "この瀬戸物はおばあちゃんにもらいました。",
        romaji: "Kono setomono wa obaachan ni moraimashita.",
        en: "I got this crockery from my grandmother.",
      },
    ],
    commonMistake:
      "缶詰 has a second, figurative meaning. 缶詰になる means to be shut in somewhere to work, as when a writer is 缶詰 in a hotel to meet a deadline. 炊事 is the work of preparing meals (炊事洗濯, cooking and laundry), while 料理 is the dish itself or the art of cooking.",
    rows: [
      {
        label: "cooking & menus",
        terms: ["炊事", "献立", "粒"],
      },
      {
        label: "preserved goods",
        terms: ["瓶詰", "缶詰", "蓋"],
      },
      {
        label: "crockery, storage & sweeping",
        terms: ["瀬戸物", "箒", "盆", "物置", "紙屑", "綱"],
      },
    ],
  },
  {
    key: "n2-n47-farming-pasture-herds",
    title: "Farms, Pasture & the Countryside",
    subtitle: "牧場・田植え・盆地",
    insight:
      "Rural life has its own nouns. 牧場 (a ranch, pasture) and 牧畜 (stock farming) describe livestock, 田植え (rice planting) and 田ぼ (a paddy field) describe rice growing, and 耕地 (arable land) and 産地 (a producing area) describe where crops come from.",
    extendedInsight:
      "盆地 (a basin, an area of flat land ringed by mountains) is where many Japanese towns sit. 竹 (bamboo), 羊毛 (wool) and 群れ (a herd, flock, crowd) fit the same landscape.",
    examples: [
      {
        jp: "この地方は米の産地として有名です。",
        romaji: "Kono chihou wa kome no sanchi to shite yuumei desu.",
        en: "This region is famous as a rice-producing area.",
      },
      {
        jp: "京都は盆地にある町です。",
        romaji: "Kyouto wa bonchi ni aru machi desu.",
        en: "Kyoto is a city set in a basin.",
      },
    ],
    commonMistake:
      "田ぼ is a spelling of たんぼ used in this word list. Because ぼ is not a kanji, the ordinary way to write it is 田んぼ, so if you see 田んぼ elsewhere it is the same word.",
    rows: [
      {
        label: "livestock",
        terms: ["牧場", "牧畜", "羊毛", "群れ"],
      },
      {
        label: "rice & land",
        terms: ["田植え", "田ぼ", "耕地", "産地"],
      },
      {
        label: "landscape",
        terms: ["盆地", "竹"],
      },
    ],
  },
  {
    key: "n2-n48-straight-lines-routes",
    title: "Straight Lines, Routes & Tracks",
    subtitle: "直線・終点・線路",
    insight:
      "The kanji 直 (straight, direct) builds a group of nouns. 直線 (a straight line), 直角 (a right angle) and 直径 (a diameter) are geometry, 直通 (a direct connection) is a route, and 直前 (just before) and 直後 (immediately after) are moments.",
    extendedInsight:
      "For journeys, 片道 (one-way), 終点 (the terminus), 線路 (the track), 脱線 (derailment, or a digression), 私鉄 (a private railway) and 船便 (surface mail by ship) describe routes. 矢印 (an arrow), 目印 (a mark, landmark), 突き当たり (the end of a street), 目安 (a criterion, a guide), 等分 (equal division), 経度 (longitude) and 緯度 (latitude) are for finding your way.",
    examples: [
      {
        jp: "この電車は空港まで直通です。",
        romaji: "Kono densha wa kuukou made chokutsuu desu.",
        en: "This train goes directly to the airport.",
      },
      {
        jp: "道の突き当たりを右に曲がってください。",
        romaji: "Michi no tsukiatari o migi ni magatte kudasai.",
        en: "Please turn right at the end of the road.",
      },
    ],
    commonMistake:
      "脱線 is a derailment, and figuratively a conversation that goes off topic (話が脱線する). 直前 and 直後 both take の to attach to a noun (試験の直前, just before the exam), and neither includes the moment they refer to.",
    rows: [
      {
        label: "geometry",
        terms: ["直線", "直角", "直径", "等分"],
      },
      {
        label: "moments",
        terms: ["直前", "直後"],
      },
      {
        label: "trains & routes",
        terms: ["直通", "片道", "終点", "線路", "脱線", "私鉄", "船便"],
      },
      {
        label: "finding your way",
        terms: ["矢印", "目印", "突き当たり", "目安", "経度", "緯度"],
      },
    ],
  },
  {
    key: "n2-n49-trouble-loss-conflict",
    title: "Misfortune, Complaints & Contradiction",
    subtitle: "災難・苦情・矛盾",
    insight:
      "Things going wrong have plenty of names. 災難 (a calamity) and 盗難 (theft) are misfortunes, 火傷 (a burn) is an injury, 苦情 (a complaint) is what you make about a problem, and 苦心 (pain, trouble taken) is the effort to solve it.",
    extendedInsight:
      "矛盾 (a contradiction) comes from the story of a spear and a shield, and 相違 (a difference, discrepancy) is a more formal way of saying that two things do not match. 皮肉 (sarcasm), 破片 (a fragment), 落し物 (lost property) and 空っぽ (empty, hollow) complete a set of small setbacks.",
    examples: [
      {
        jp: "店に苦情を言いました。",
        romaji: "Mise ni kujou o iimashita.",
        en: "I made a complaint to the shop.",
      },
      {
        jp: "あなたの話には矛盾があります。",
        romaji: "Anata no hanashi ni wa mujun ga arimasu.",
        en: "There is a contradiction in what you are saying.",
      },
    ],
    commonMistake:
      "苦情 is a complaint about something that has caused you trouble (騒音の苦情), and it is not the same as 文句, which is a more casual grumble. 落し物 (lost property) is what you report at a station's lost-and-found, 落し物センター.",
    rows: [
      {
        label: "misfortunes",
        terms: ["災難", "盗難", "火傷"],
      },
      {
        label: "complaint & effort",
        terms: ["苦情", "苦心"],
      },
      {
        label: "mismatch",
        terms: ["矛盾", "相違", "皮肉"],
      },
      {
        label: "small setbacks",
        terms: ["破片", "落し物", "空っぽ"],
      },
    ],
  },
  {
    key: "n2-n50-school-subjects-instruments",
    title: "School Subjects & Measuring Tools",
    subtitle: "理科・算数・物差し",
    insight:
      "School subjects use short names. 理科 (science), 算数 (arithmetic), 習字 (penmanship), 英文 (an English sentence), 英和 (English-Japanese, as in a dictionary) and 社会科学 and 自然科学 (social and natural science) are all lessons or fields, and 熟語 (a kanji compound) is a language term.",
    extendedInsight:
      "For practising, 自習 (self-study), 稽古 (practice, training), 研修 (training) and 落第 (failing a class) describe the process. Measuring tools include 物差し (a ruler), 秤 (scales), 算盤 (an abacus) and 磁石 (a magnet), and 確率 (probability) and 点数 (a score) are maths words.",
    examples: [
      {
        jp: "小学校の算数の授業が好きでした。",
        romaji: "Shougakkou no sansuu no jugyou ga suki deshita.",
        en: "I liked arithmetic lessons in elementary school.",
      },
      {
        jp: "私は毎週、書道の稽古に通っています。",
        romaji: "Watashi wa maishuu, shodou no keiko ni kayotte imasu.",
        en: "I attend calligraphy lessons every week.",
      },
    ],
    commonMistake:
      "算数 is elementary-school arithmetic, while 数学 is mathematics at middle school and above. 稽古 is used for arts and martial arts (柔道の稽古), and 勉強 is used for study in general.",
    rows: [
      {
        label: "subjects",
        terms: ["理科", "算数", "習字", "英文", "英和", "社会科学", "自然科学"],
      },
      {
        label: "practising",
        terms: ["熟語", "自習", "稽古", "研修", "落第"],
      },
      {
        label: "instruments",
        terms: ["物差し", "秤", "算盤", "磁石"],
      },
      {
        label: "scores & chance",
        terms: ["確率", "点数"],
      },
    ],
  },
  {
    key: "n2-n51-writing-editing-publishing",
    title: "Writing, Editing & Stories",
    subtitle: "編集・目次・童話",
    insight:
      "Words for the parts of a written work include 目次 (a table of contents), 索引 (an index), 用語 (terminology) and 箇所 (a place, a passage). 筆記 (note taking), 筆者 (the writer) and 編集 (editing) describe who writes and how it is prepared.",
    extendedInsight:
      "For genres and forms, 短編 (a short piece), 童話 (a fairy tale), 神話 (a myth), 社説 (an editorial) and 粗筋 (an outline, a synopsis) name kinds of writing. 符号 (a sign, symbol) and 組合せ (a combination) are technical words for marks and arrangements.",
    examples: [
      {
        jp: "まず目次を見て、読みたい章を探しました。",
        romaji: "Mazu mokuji o mite, yomitai shou o sagashimashita.",
        en: "First I looked at the table of contents and found the chapter I wanted to read.",
      },
      {
        jp: "この童話は世界中で読まれています。",
        romaji: "Kono douwa wa sekaijuu de yomarete imasu.",
        en: "This fairy tale is read all over the world.",
      },
    ],
    commonMistake:
      "目次 and 索引 are both lists at a book's edge, but 目次 (at the front) lists chapters in order, while 索引 (at the back) lists words alphabetically or in kana order with page numbers.",
    rows: [
      {
        label: "parts of a book",
        terms: ["目次", "索引", "用語", "箇所"],
      },
      {
        label: "writer & editor",
        terms: ["筆記", "筆者", "編集"],
      },
      {
        label: "kinds of writing",
        terms: ["短編", "童話", "神話", "社説", "粗筋"],
      },
      {
        label: "marks",
        terms: ["符号", "組合せ"],
      },
    ],
  },
  {
    key: "n2-n52-body-family-appearance",
    title: "Nails, Skin, Brides & Craftspeople",
    subtitle: "爪・花嫁・職人",
    insight:
      "Body words include 爪 (a nail), 瞳 (the pupil of the eye), 皮膚 (skin), 肘 (an elbow) and 白髪 (white or grey hair). 看病 (nursing a patient), 育児 (childcare), 美容 (beauty care) and 肌着 (underwear) describe caring for the body.",
    extendedInsight:
      "People in the family and community include 父母 (parents), 花嫁 (a bride), 王女 (a princess), 知人 (an acquaintance), 祖先 (ancestors), 神様 (a god), 素人 (an amateur) and 職人 (a craftsman). 職場 (a workplace), 着替え (a change of clothes) and 草履 (Japanese sandals) round this lesson out.",
    examples: [
      {
        jp: "彼女は毎日、肌の手入れをしています。",
        romaji: "Kanojo wa mainichi, hada no teire o shite imasu.",
        en: "She looks after her skin every day.",
      },
      {
        jp: "父は昔ながらの職人です。",
        romaji: "Chichi wa mukashi nagara no shokunin desu.",
        en: "My father is a craftsman of the old school.",
      },
    ],
    commonMistake:
      "素人 and 職人 are opposites in skill. 素人 is a layman (素人には難しい, difficult for an amateur), while 職人 is a skilled craftsman, and calling someone 素人 can be a criticism of their skill. 知人 is an acquaintance, and 友人 is a friend, so they aren't interchangeable.",
    rows: [
      {
        label: "body parts",
        terms: ["爪", "瞳", "皮膚", "肘", "白髪"],
      },
      {
        label: "care",
        terms: ["看病", "育児", "美容", "肌着", "着替え", "草履"],
      },
      {
        label: "family & royalty",
        terms: ["父母", "花嫁", "王女", "祖先", "神様"],
      },
      {
        label: "people at large",
        terms: ["知人", "素人", "職人", "職場"],
      },
    ],
  },
  {
    key: "n2-n53-money-offices-procedures",
    title: "Money, Offices & Applications",
    subtitle: "為替・申請・県庁",
    insight:
      "Administrative words for dealing with offices include 申請 (an application), 窓口 (a ticket or service window), 県庁 (a prefectural office), 税関 (customs) and 番地 (a house number). Each names a place or step in official business.",
    extendedInsight:
      "Money words include 為替 (a money order, exchange), 給与 (salary), 紙幣 (paper money) and 特売 (a special sale). 総理大臣 (the Prime Minister), 自治 (self-government), 自衛 (self-defence), 移転 (moving, transfer) and 留守番 (house-sitting, caretaking) round out the government and home vocabulary.",
    examples: [
      {
        jp: "パスポートの申請は、市役所の窓口でできます。",
        romaji: "Pasupooto no shinsei wa, shiyakusho no madoguchi de dekimasu.",
        en: "You can apply for a passport at the counter of the city office.",
      },
      {
        jp: "弟が留守番をしてくれました。",
        romaji: "Otouto ga rusuban o shite kuremashita.",
        en: "My little brother looked after the house while I was out.",
      },
    ],
    commonMistake:
      "給与 and 給料 both mean pay, but 給与 is the formal, official word used on pay slips and in company documents, while 給料 is what people say in conversation. 為替 is a payment order, and also the word for the exchange rate (為替レート).",
    rows: [
      {
        label: "applications & counters",
        terms: ["申請", "窓口", "県庁", "税関", "番地"],
      },
      {
        label: "money",
        terms: ["為替", "給与", "紙幣", "特売"],
      },
      {
        label: "government & home",
        terms: ["総理大臣", "自治", "自衛", "移転", "留守番", "私立"],
      },
    ],
  },
  {
    key: "n2-n54-abstract-nouns-quality-degree",
    title: "Focus, Features & Abstract Ideas",
    subtitle: "焦点・特色・統一",
    insight:
      "Abstract nouns for analysis fill out N2. 焦点 (a focus), 特色 (a characteristic), 特定 (specific, particular), 狙い (an aim) and 発想 (an idea, a way of thinking) describe what something is about, and 発揮 (demonstrating, displaying) describes putting ability to use.",
    extendedInsight:
      "Systems and change appear in 系統 (a system, genealogy), 統一 (unification), 統計 (statistics), 継続 (continuation), 縮小 (reduction), 肯定 (affirmation), 相互 (mutual), 能率 (efficiency), 生存 (survival), 無限 and 無数 (both infinite or countless), 素質 (talent), 短期 (short term), 短所 (a weak point), 臨時 (temporary), 真っ先 (foremost) and 目下 (at present).",
    examples: [
      {
        jp: "この会議の焦点は、予算の問題です。",
        romaji: "Kono kaigi no shouten wa, yosan no mondai desu.",
        en: "The focus of this meeting is the budget problem.",
      },
      {
        jp: "彼は自分の能力を十分に発揮しました。",
        romaji: "Kare wa jibun no nouryoku o juubun ni hakki shimashita.",
        en: "He made full use of his abilities.",
      },
    ],
    commonMistake:
      "目下 is read もっか and means 'at present', as in 目下調査中 (currently under investigation). A different word with the same kanji, read めした, means a person of lower rank, so the reading matters. 無限 and 無数 differ too: 無限 is unending, and 無数 is too many to count.",
    rows: [
      {
        label: "focus & features",
        terms: ["焦点", "特色", "特定", "狙い", "発想", "発揮", "用途"],
      },
      {
        label: "systems & continuity",
        terms: ["系統", "統一", "統計", "継続", "縮小", "肯定", "相互"],
      },
      {
        label: "ability & survival",
        terms: ["能率", "生存", "素質", "無限", "無数", "純情"],
      },
      {
        label: "timing",
        terms: ["短期", "短所", "臨時", "真っ先", "目下"],
      },
    ],
  },
  {
    key: "n2-n55-festivals-entertainment",
    title: "Festivals, Sports & Entertainment",
    subtitle: "花火・相撲・祝日",
    insight:
      "Japanese festivals and pastimes fill the calendar. 花火 (fireworks), 盆-season events, 祝日 (a national holiday) and 祭日 (a national holiday, a festival day) mark the year, while 相撲 (sumo), 競馬 (horse racing), 芸能 (performing arts) and 生け花 (flower arrangement) are traditional amusements.",
    extendedInsight:
      "葬式 (a funeral), 登場 (making an entrance on stage), 発売 (going on sale), 独り言 (talking to oneself) and 無沙汰 (neglecting to stay in touch) are events and habits that fit the same lesson of social life.",
    examples: [
      {
        jp: "夏には川の近くで花火大会があります。",
        romaji: "Natsu ni wa kawa no chikaku de hanabi taikai ga arimasu.",
        en: "In summer there is a fireworks display near the river.",
      },
      {
        jp: "日曜日に友達と相撲を見に行きました。",
        romaji: "Nichiyoubi ni tomodachi to sumou o mi ni ikimashita.",
        en: "On Sunday I went to watch sumo with a friend.",
      },
    ],
    commonMistake:
      "祝日 and 祭日 both refer to public holidays, but 祝日 is the official term for the legally designated national holidays, while 祭日 is older and also covers festival days. 独り言 is talking to yourself, and it is 独り言を言う, not 独り言を話す.",
    rows: [
      {
        label: "holidays & fireworks",
        terms: ["花火", "祝日", "祭日"],
      },
      {
        label: "traditional amusements",
        terms: ["相撲", "競馬", "芸能", "生け花"],
      },
      {
        label: "life events",
        terms: ["葬式", "登場", "発売"],
      },
      {
        label: "small social words",
        terms: ["独り言", "無沙汰"],
      },
    ],
  },
  {
    key: "n2-n56-prefixes-and-loose-nouns",
    title: "Prefixes, Signs & Deadlines",
    subtitle: "総～・空～・締切",
    insight:
      "A few prefixes and suffixes can be attached to nouns. 総～ (gross, general, entire), 空～ (empty ~), 省～ (economizing ~), 短～ (short ~) and 発 (departing from) are attached to a noun or number to add a meaning.",
    extendedInsight:
      "空想 (a daydream, fantasy) and 空中 (the sky, the air) are words that keep 空. 自宅 (one's own home) and 自ら (for oneself, personally) use 自, and 看板 (a signboard), 目覚し (an alarm clock), 腰掛け (a seat, a bench), 繋がり (a connection), 終了 (an end) and 締切 (a deadline) round out the batch.",
    examples: [
      {
        jp: "レポートの締切は金曜日です。",
        romaji: "Repooto no shimekiri wa kinyoubi desu.",
        en: "The deadline for the report is Friday.",
      },
      {
        jp: "朝は目覚しの音で起きます。",
        romaji: "Asa wa mezamashi no oto de okimasu.",
        en: "In the morning I wake up to an alarm clock.",
      },
    ],
    commonMistake:
      "発 is used after a place or time to say departure (東京発, leaving from Tokyo; 九時発, leaving at nine), and 着 is used for arrival. 終了 and 締切 differ: 終了 is the end of an event, while 締切 is the last moment to submit something.",
    rows: [
      {
        label: "prefixes & suffixes",
        terms: ["総", "空", "省", "短", "発"],
      },
      {
        label: "sky & fantasy",
        terms: ["空想", "空中"],
      },
      {
        label: "self",
        terms: ["自宅", "自ら"],
      },
      {
        label: "signs, clocks & deadlines",
        terms: ["看板", "目覚し", "腰掛け", "繋がり", "終了", "締切"],
      },
    ],
  },
  {
    key: "n2-n57-fingers-pharmacy-health",
    title: "Fingers, Medicine & Diagnosis",
    subtitle: "薬局・血圧・診断",
    insight:
      "Health words fill out the hospital vocabulary. 薬品 (medicines, chemicals) and 薬局 (a pharmacy) are where you get drugs, 血圧 (blood pressure), 診断 (a diagnosis) and 輸血 (a blood transfusion) are what a doctor discusses, and 薬指 (the ring finger) and 親指 (the thumb) name fingers.",
    extendedInsight:
      "薬指 literally means 'medicine finger', a name traditionally explained by the finger's use in mixing medicine. Together with the 中指, 人差指 and 小指 you have already met, the five fingers now all have names.",
    examples: [
      {
        jp: "薬局で風邪薬を買いました。",
        romaji: "Yakkyoku de kazegusuri o kaimashita.",
        en: "I bought cold medicine at the pharmacy.",
      },
      {
        jp: "医者に血圧を測ってもらいました。",
        romaji: "Isha ni ketsuatsu o hakatte moraimashita.",
        en: "I had the doctor take my blood pressure.",
      },
    ],
    commonMistake:
      "薬局 and 薬屋 are both places selling drugs, but 薬局 is the formal word (a licensed pharmacy where a pharmacist works), while 薬屋 is a casual word for a drugstore. 薬品 is a substance, and 薬 is the everyday word for medicine.",
    rows: [
      {
        label: "fingers",
        terms: ["薬指", "親指"],
      },
      {
        label: "pharmacy",
        terms: ["薬品", "薬局"],
      },
      {
        label: "check-up & treatment",
        terms: ["血圧", "診断", "輸血"],
      },
    ],
  },
  {
    key: "n2-n58-fixtures-fittings",
    title: "Fixtures, Fittings & Household Objects",
    subtitle: "蛇口・障子・雑巾",
    insight:
      "This lesson gathers things that are built into or hang around a house. 蛇口 (a faucet), 蛍光灯 (a fluorescent lamp), 電球 (a light bulb) and 電池 (a battery) supply water and light, and 襖 (a sliding screen), 障子 (a paper sliding door), 雨戸 (a sliding storm door) and 裏口 (a back door) are the doors and screens of a traditional house.",
    extendedInsight:
      "隙 (an unguarded moment, a gap) and 隙間 (a crack, a gap) describe openings, 雑巾 (a cleaning cloth), 風呂敷 (a wrapping cloth), 食器 (tableware), 釜 (an iron pot) and 鉢 (a bowl, a pot) are what you handle daily. 隙 is also used figuratively, as in 隙を見せる (to show an opening).",
    examples: [
      {
        jp: "蛇口をよく閉めてください。",
        romaji: "Jaguchi o yoku shimete kudasai.",
        en: "Please shut the faucet tightly.",
      },
      {
        jp: "ドアの隙間から風が入ってきます。",
        romaji: "Doa no sukima kara kaze ga haitte kimasu.",
        en: "Wind comes in through the gap in the door.",
      },
    ],
    commonMistake:
      "襖 and 障子 are both sliding doors, but 襖 is opaque (covered with thick paper or cloth, and used between rooms), while 障子 is translucent (paper on a lattice, used against windows and outside walls). Do not use either word for a Western-style door, which is ドア.",
    rows: [
      {
        label: "water & light",
        terms: ["蛇口", "蛍光灯", "電球", "電池"],
      },
      {
        label: "sliding doors & screens",
        terms: ["襖", "障子", "雨戸", "裏口"],
      },
      {
        label: "gaps",
        terms: ["隙間", "隙"],
      },
      {
        label: "cloths & tableware",
        terms: ["雑巾", "風呂敷", "食器", "釜", "鉢"],
      },
    ],
  },
  {
    key: "n2-n59-metals-machine-parts",
    title: "Metals, Nails & Machine Parts",
    subtitle: "釘・銅・鉄橋",
    insight:
      "Materials and hardware have short kanji names. 釘 (a nail), 針金 (wire), 鈴 (a bell) and 銅 (copper) are metals or metal objects, 錆 (rust, also a colour) and 鉱物 (a mineral) describe natural materials, and 鉄橋 (an iron bridge) and 鉄砲 (a gun) are things built from iron.",
    extendedInsight:
      "部品 (parts, accessories) and 車輪 (a wheel) describe the pieces of a machine. 錆 is a noun here (rust), while 錆びる (to rust) appeared earlier as a verb, so the two share a stem.",
    examples: [
      {
        jp: "壁に釘を打って、絵をかけました。",
        romaji: "Kabe ni kugi o utte, e o kakemashita.",
        en: "I hammered a nail into the wall and hung a picture.",
      },
      {
        jp: "この車の部品は外国から来ています。",
        romaji: "Kono kuruma no buhin wa gaikoku kara kite imasu.",
        en: "The parts for this car come from abroad.",
      },
    ],
    commonMistake:
      "鉄砲 is a general old word for a gun, and modern usage prefers 銃 in reports. 針金 is wire made of metal, and a wire for electricity is 電線, so avoid using 針金 for an electric cable.",
    rows: [
      {
        label: "metals & hardware",
        terms: ["釘", "針金", "鈴", "銅"],
      },
      {
        label: "rust & minerals",
        terms: ["錆", "鉱物"],
      },
      {
        label: "iron works",
        terms: ["鉄橋", "鉄砲"],
      },
      {
        label: "machine parts",
        terms: ["部品", "車輪"],
      },
    ],
  },
  {
    key: "n2-n60-electricity-gravity-astronomy",
    title: "Electricity, Gravity & Measuring the World",
    subtitle: "電流・重力・観測",
    insight:
      "Physics words build on 電 and 重. 電力 (electric power), 電流 (electric current), 電波 (an electromagnetic wave) and 電柱 (a utility pole) are about electricity, and 重力 (gravity) and 重量 (weight) are about heavy things.",
    extendedInsight:
      "面積 (area), 角度 (an angle), 頂点 (a peak, a vertex), 重点 (an important point) and 赤道 (the equator) are measurements, and 観測 (observation) and 顕微鏡 (a microscope) are instruments for looking closely. 重点 is used for what you emphasise, as in 重点を置く.",
    examples: [
      {
        jp: "月の重力は地球より小さいです。",
        romaji: "Tsuki no juuryoku wa chikyuu yori chiisai desu.",
        en: "The Moon's gravity is smaller than the Earth's.",
      },
      {
        jp: "この部屋の面積は二十平方メートルです。",
        romaji: "Kono heya no menseki wa nijuu heihou meetoru desu.",
        en: "The area of this room is twenty square metres.",
      },
    ],
    commonMistake:
      "重力 (gravity) and 引力 (gravitational pull) are related but not the same: 重力 is the force felt on a planet's surface, while 引力 is the general attraction between bodies. 電力 is power, and 電流 is current, so 電力を使う but 電流が流れる.",
    rows: [
      {
        label: "electricity",
        terms: ["電力", "電流", "電波", "電柱"],
      },
      {
        label: "heavy things",
        terms: ["重力", "重量", "重点"],
      },
      {
        label: "shapes & the Earth",
        terms: ["面積", "角度", "頂点", "赤道", "零点"],
      },
      {
        label: "observing",
        terms: ["観測", "顕微鏡"],
      },
    ],
  },
  {
    key: "n2-n61-streets-rails-shipping",
    title: "Street Corners, Railways & Freight",
    subtitle: "踏切・輸送・速達",
    insight:
      "Places and movement in a city come first. 街角 (a street corner), 都心 (the heart of the city), 踏切 (a railway crossing), 通路 (a passage), 道順 (a route) and 運河 (a canal) are where you walk or wait, and 遊園地 (an amusement park) is where you go for fun.",
    extendedInsight:
      "Vehicles and shipping include 車庫 (a garage), 車掌 (a train conductor), 輸送 (transport), 貨物 (cargo), 造船 (shipbuilding) and 速力 (speed). For mail, 郵送 (mailing), 速達 (express mail) and 送料 (postage) describe cost and service.",
    examples: [
      {
        jp: "踏切で電車が通るのを待ちました。",
        romaji: "Fumikiri de densha ga tooru no o machimashita.",
        en: "I waited at the railway crossing for the train to pass.",
      },
      {
        jp: "この荷物を速達で送ってください。",
        romaji: "Kono nimotsu o sokutatsu de okutte kudasai.",
        en: "Please send this package by express mail.",
      },
    ],
    commonMistake:
      "速達 is a paid express mail service, and 速力 is a technical word for speed, mostly used for ships or engines (速力を上げる). 郵送 is sending by post, while 輸送 is carrying goods by any vehicle.",
    rows: [
      {
        label: "city places",
        terms: [
          "街角",
          "都心",
          "踏切",
          "通路",
          "道順",
          "針路",
          "運河",
          "遊園地",
        ],
      },
      {
        label: "vehicles",
        terms: ["車庫", "車掌", "速力", "造船"],
      },
      {
        label: "freight",
        terms: ["輸送", "貨物"],
      },
      {
        label: "mail",
        terms: ["郵送", "速達", "送料"],
      },
    ],
  },
  {
    key: "n2-n62-events-gatherings-rentals",
    title: "Events, Gatherings & Rentals",
    subtitle: "行事・集会・貸家",
    insight:
      "Organised occasions have specific nouns. 行事 (an event, function), 集会 (a meeting, assembly), 集合 (a gathering, assembly), 開会 (the opening of a meeting) and 閉会 (its closing) describe how a meeting starts and ends, 行列 (a line, a procession) describes a queue, and 遠足 (a trip, a picnic) and 見学 (a study tour) are school outings.",
    extendedInsight:
      "話合い (a discussion) and 連合 (an alliance) describe people working together, while 解散 (breakup, dissolution) is the group's end, 送別 (a send-off) marks a departure, and 集金 (money collection) covers the practical side. 貸し出し (lending), 貸間 (a room to let) and 貸家 (a house for rent) describe renting.",
    examples: [
      {
        jp: "明日の九時に駅前に集合してください。",
        romaji: "Ashita no kuji ni ekimae ni shuugou shite kudasai.",
        en: "Please gather in front of the station at nine tomorrow.",
      },
      {
        jp: "小学校の遠足で、動物園に行きました。",
        romaji: "Shougakkou no ensoku de, doubutsuen ni ikimashita.",
        en: "On the elementary school outing we went to the zoo.",
      },
    ],
    commonMistake:
      "集会 and 集合 both mean gathering, but 集会 is a formal meeting of an organised group (町内会の集会), while 集合 is the act of gathering at a set time and place. 行列 also means a matrix in mathematics.",
    rows: [
      {
        label: "meetings",
        terms: ["集会", "集合", "開会", "閉会", "話合い", "連合", "解散"],
      },
      {
        label: "events & outings",
        terms: ["行事", "行列", "遠足", "見学", "送別", "集金"],
      },
      {
        label: "renting",
        terms: ["貸し出し", "貸間", "貸家"],
      },
    ],
  },
  {
    key: "n2-n63-documents-explanations",
    title: "Summaries, Headings & Documents",
    subtitle: "要旨・見出し・資料",
    insight:
      "Reading and explaining texts uses a family of nouns. 要旨 and 要領 (both gist, essentials), 見出し (a heading), 表紙 (a front cover), 見本 (a sample) and 項目 (an item) describe the shape of a document, and 解説 (an explanation), 解答 (an answer) and 評論 (criticism) describe how it is discussed.",
    extendedInsight:
      "記号 (a symbol), 部首 (a kanji radical), 述語 (a predicate), 送り仮名 (the kana tail of a word), 順序 (an order), 追加 (an addition), 通知 (a notice), 資料 (materials, data) and 随筆 (essays) are words used in writing and editing. 話中 (the line is busy), 複写 (copy), 製作 (production), 裁縫 (sewing) and 見掛け (outward appearance) are practical odds and ends.",
    examples: [
      {
        jp: "この文章の要旨を短くまとめてください。",
        romaji: "Kono bunshou no youshi o mijikaku matomete kudasai.",
        en: "Please summarise the gist of this text briefly.",
      },
      {
        jp: "新聞の見出しを読んで、内容を想像しました。",
        romaji: "Shinbun no midashi o yonde, naiyou o souzou shimashita.",
        en: "I read the newspaper headline and imagined the content.",
      },
    ],
    commonMistake:
      "解説 and 解答 are both explanations of a kind, but 解説 explains how or why (ニュースの解説), while 解答 is the answer to a question (テストの解答). 送り仮名 is the part of a word written in kana after the kanji (食べる has べる as its 送り仮名).",
    rows: [
      {
        label: "gist & shape",
        terms: ["要旨", "要領", "見出し", "表紙", "見本", "項目"],
      },
      {
        label: "explaining",
        terms: ["解説", "解答", "評論", "随筆"],
      },
      {
        label: "writing terms",
        terms: ["記号", "部首", "述語", "送り仮名", "順序"],
      },
      {
        label: "documents & notices",
        terms: ["追加", "通知", "資料", "話中"],
      },
      {
        label: "making & copying",
        terms: ["複写", "製作", "裁縫", "見掛け"],
      },
    ],
  },
  {
    key: "n2-n64-rules-limits-adjustment",
    title: "Rules, Limits & Adjustments",
    subtitle: "規律・限度・調整",
    insight:
      "Order and control need a family of abstract nouns. 規律 (order, rules), 規準 (a standard), 限度 (a limit) and 限り (a limit, as far as possible) set boundaries, and 超過 (excess), 過剰 (excess, over-) and 過半数 (a majority) describe going beyond them.",
    extendedInsight:
      "調整 and 調節 (both adjustment) describe changing something to fit, 防止 (prevention), 防犯 (crime prevention), 警備 (security), 課税 (taxation), 領収 (a receipt), 領事 (a consul) and 通用 (being accepted, circulation) belong to administration. 観念 (an idea, a sense), 迷信 (a superstition), 過失 (an error, negligence), 間接 (indirect), 開通 (opening of a line) and 解放 and 開放 (both release, opening) fill out the batch, and 通帳 (a bankbook) and 賞金 (prize money) are money words.",
    examples: [
      {
        jp: "この学校は規律が厳しいです。",
        romaji: "Kono gakkou wa kiritsu ga kibishii desu.",
        en: "This school has strict discipline.",
      },
      {
        jp: "エアコンの温度を調節しました。",
        romaji: "Eakon no ondo o chousetsu shimashita.",
        en: "I adjusted the temperature of the air conditioner.",
      },
    ],
    commonMistake:
      "調整 and 調節 both mean adjust, but 調節 is for fine control of a device or an amount (音量の調節), while 調整 is for bringing things into balance, such as schedules (日程の調整). 解放 (setting free) and 開放 (opening up) are both かいほう, so the kanji show whether it is liberation or opening.",
    rows: [
      {
        label: "order & standards",
        terms: ["規律", "規準", "限度", "限り"],
      },
      {
        label: "going beyond",
        terms: ["超過", "過剰", "過半数", "過失"],
      },
      {
        label: "adjusting",
        terms: ["調整", "調節", "防止", "防犯", "警備"],
      },
      {
        label: "administration",
        terms: ["課税", "領収", "領事", "通用", "間接"],
      },
      {
        label: "opening & freeing",
        terms: ["開通", "開放", "解放"],
      },
      {
        label: "ideas & money",
        terms: ["観念", "迷信", "通帳", "賞金"],
      },
    ],
  },
  {
    key: "n2-n65-family-status-manner",
    title: "Eldest Sons, Manners & Standing",
    subtitle: "長男・謙遜・身分",
    insight:
      "Family order uses 長 (eldest, long). 長男 (the eldest son) and 長女 (the eldest daughter) name children by birth order, 長所 (a strong point) and 長短 (length, strengths and weaknesses) describe character, and 長方形 (a rectangle) is the shape.",
    extendedInsight:
      "身分 (social status), 講師 (a lecturer), 重役 (a senior executive), 青少年 (young people) and 頭脳 (brains, intellect) describe people, while 酒場 (a bar) and 酔っ払い (a drunkard) describe a night out. 謙遜 (modesty), 言葉遣い (wording, manner of speaking), 足跡 (footprints), 足元 (at one's feet), 起床 (getting up) and 行方 (whereabouts) are used in the language of daily life, and 親類 (relatives) names your kin.",
    examples: [
      {
        jp: "彼は長男なので、家の仕事を継ぎます。",
        romaji: "Kare wa chounan na node, ie no shigoto o tsugimasu.",
        en: "He's the eldest son, so he will take over the family business.",
      },
      {
        jp: "彼女は言葉遣いがとても丁寧です。",
        romaji: "Kanojo wa kotobazukai ga totemo teinei desu.",
        en: "She has very polite manners of speaking.",
      },
    ],
    commonMistake:
      "謙遜 is a virtue, but it is used differently from English 'modest'. 謙遜する means to play down your own achievements when praised (いえ、そんなことないです), and it is a social habit, not just a personality trait. 長所 is a strong point, while 長所と短所 means strengths and weaknesses.",
    rows: [
      {
        label: "birth order",
        terms: ["長男", "長女", "親類"],
      },
      {
        label: "strengths & shape",
        terms: ["長所", "長短", "長方形"],
      },
      {
        label: "people & status",
        terms: ["身分", "講師", "重役", "青少年", "頭脳"],
      },
      {
        label: "night out",
        terms: ["酒場", "酔っ払い"],
      },
      {
        label: "manner & movement",
        terms: ["謙遜", "言葉遣い", "足跡", "足元", "起床", "行方"],
      },
    ],
  },
  {
    key: "n2-n66-food-farm-nature",
    title: "Farm Produce, Seasoning & Rainbows",
    subtitle: "農産物・調味料・虹",
    insight:
      "Food words follow the farm. 農産物 (agricultural produce), 農村 (a farming village) and 農薬 (agricultural chemicals) describe farming, 調味料 (a condiment, seasoning) and 食塩 (table salt) describe what goes on the table, and 餅 (a sticky rice cake) is a traditional food.",
    extendedInsight:
      "貯蔵 (storage, preservation) and 養分 (nourishment) describe keeping and using food. 金魚 (a goldfish), 香水 (perfume), 虹 (a rainbow), 麓 (the foot of a mountain), 風船 (a balloon), 陽射 (sunlight), 響き (an echo) and 雑音 (noise) are words for things you see and hear.",
    examples: [
      {
        jp: "この村は農産物が豊かです。",
        romaji: "Kono mura wa nousanbutsu ga yutaka desu.",
        en: "This village is rich in agricultural produce.",
      },
      {
        jp: "雨のあとに、きれいな虹が出ました。",
        romaji: "Ame no ato ni, kirei na niji ga demashita.",
        en: "After the rain, a beautiful rainbow appeared.",
      },
    ],
    commonMistake:
      "雑音 is a harsh noise that interferes (ラジオの雑音, static on the radio), while 騒音 is disturbing noise like traffic or construction. 響き is an echo or resonance, and is used for pleasing sounds as well as sounds that carry.",
    rows: [
      {
        label: "farming",
        terms: ["農産物", "農村", "農薬", "飢饉"],
      },
      {
        label: "food & seasoning",
        terms: ["調味料", "食塩", "餅", "貯蔵", "養分", "衣食住"],
      },
      {
        label: "small things",
        terms: ["金魚", "香水", "風船"],
      },
      {
        label: "sky & sound",
        terms: ["虹", "麓", "陽射", "響き", "雑音"],
      },
    ],
  },
  {
    key: "n2-n67-regions-prefixes-plural",
    title: "Kansai & Kantō, Prefixes & Plurals",
    subtitle: "関西・関東・高～",
    insight:
      "Two regions of Japan have their own names. 関西 (the Kansai region, including Osaka) and 関東 (the Kantō region, including Tokyo) are the west and east of the main island, and 西暦 (the Christian era) is the way most Japanese count years alongside the imperial eras.",
    extendedInsight:
      "Several prefixes and adjectives attach to nouns: 高～ (high), 重～ (heavy), 非～ (non-), 長～ (long) and 高層 (a high-rise), 高度 (altitude, advanced), 高等学校 (a senior high school), 附属 (attached, affiliated), 複数 (plural), 逆さ (upside down), 近々 (soon), 謎謎 (a riddle), 鑑賞 (appreciation) and 録音 (recording) round out this lesson.",
    examples: [
      {
        jp: "彼は関西の出身で、大阪に住んでいました。",
        romaji: "Kare wa Kansai no shusshin de, Oosaka ni sunde imashita.",
        en: "He is from the Kansai region and used to live in Osaka.",
      },
      {
        jp: "近々、新しい店がオープンします。",
        romaji: "Chikajika, atarashii mise ga oopun shimasu.",
        en: "A new shop will open soon.",
      },
    ],
    commonMistake:
      "関西 and 関東 are regions defined by tradition, not by a fixed legal border, and 西暦 is used for AD years (二千二十六年 or 2026年), while 平成 and 令和 are era names. 高度 means altitude or an advanced level depending on context.",
    rows: [
      {
        label: "regions & era",
        terms: ["関西", "関東", "西暦"],
      },
      {
        label: "prefixes",
        terms: ["高", "重", "非", "長-2"],
      },
      {
        label: "tall & advanced",
        terms: ["高層", "高度", "高等学校", "附属"],
      },
      {
        label: "odds and ends",
        terms: ["複数", "逆さ", "近々", "謎謎", "鑑賞", "録音"],
      },
    ],
  },
  {
    key: "n2-k01-clothing-accessories",
    title: "Loanwords: Clothes & Accessories",
    subtitle: "スカーフ・ブラウス・スリッパ",
    insight:
      "Katakana words dominate fashion vocabulary. ブラウス (a blouse), ワンピース (a one-piece dress), パンツ (underpants), レインコート (a raincoat) and エプロン (an apron) are clothes, スカーフ and マフラー (scarves), ネックレス (a necklace), ブローチ (a brooch), リボン (a ribbon), ストッキング (stockings), スリッパ (slippers) and マスク (a mask) are accessories.",
    extendedInsight:
      "ナイロン (nylon), ウール (wool), シーツ (a sheet), カバー (a cover), ファスナー (a zipper), ミシン (a sewing machine), たんす (a chest of drawers) and ぼろ (rags) describe materials and household textiles. パンツ in Japanese means underpants, not trousers, which can catch English speakers out.",
    examples: [
      {
        jp: "寒いので、マフラーをしていきます。",
        romaji: "Samui node, mafuraa o shite ikimasu.",
        en: "It's cold, so I'll wear a scarf.",
      },
      {
        jp: "彼女は青いワンピースを着ていました。",
        romaji: "Kanojo wa aoi wanpiisu o kite imashita.",
        en: "She was wearing a blue dress.",
      },
    ],
    commonMistake:
      "パンツ is underwear in most everyday Japanese, and trousers are ズボン (or パンツ in the fashion trade). マフラー is a winter scarf, while スカーフ is a lighter fashion scarf, and neither means a car's exhaust silencer here.",
    rows: [
      {
        label: "clothes",
        terms: ["ブラウス", "ワンピース", "パンツ", "レインコート", "エプロン"],
      },
      {
        label: "accessories",
        terms: [
          "スカーフ",
          "マフラー",
          "ネックレス",
          "ブローチ",
          "リボン",
          "ストッキング",
          "スリッパ",
          "マスク",
        ],
      },
      {
        label: "fabrics & fastenings",
        terms: ["ナイロン", "ウール", "シーツ", "カバー", "ファスナー"],
      },
      {
        label: "sewing & storage",
        terms: ["ミシン", "たんす", "ぼろ"],
      },
    ],
  },
  {
    key: "n2-k02-school-media-programs",
    title: "Loanwords: Campus, Media & Programs",
    subtitle: "キャンパス・ゼミ・プログラム",
    insight:
      "Campus life uses many loanwords. キャンパス (a campus), ゼミ (a seminar), スクール (a school), チョーク (chalk), スライド (a slide), プリント (a print, a handout) and リポート (a report, paper) are things you meet in class.",
    extendedInsight:
      "Beyond class, コンクール (a contest), コーラス (a chorus), サークル (a club), ポスター (a poster), プログラム (a programme), メニュー (a menu), アクセント (an accent) and ジャーナリスト (a journalist) appear in student and cultural life. ひゃっかじてん (an encyclopedia) is written in hiragana, since it is a kanji compound 百科事典 that is usually written in kana in this list.",
    examples: [
      {
        jp: "大学のサークルでテニスをしています。",
        romaji: "Daigaku no saakuru de tenisu o shite imasu.",
        en: "I play tennis in a university club.",
      },
      {
        jp: "先生がプリントを配りました。",
        romaji: "Sensei ga purinto o kubarimashita.",
        en: "The teacher handed out a printed sheet.",
      },
    ],
    commonMistake:
      "サークル and クラブ are both clubs, but サークル is usually an informal university group, while クラブ is a more formal school or professional club. プリント in Japanese means a handout, not only printing something out.",
    rows: [
      {
        label: "in class",
        terms: [
          "キャンパス",
          "ゼミ",
          "スクール",
          "チョーク",
          "スライド",
          "プリント",
          "リポート",
        ],
      },
      {
        label: "contests & clubs",
        terms: [
          "コンクール",
          "コーラス",
          "サークル",
          "オーケストラ",
          "オルガン",
          "バンド",
        ],
      },
      {
        label: "media & culture",
        terms: [
          "ポスター",
          "プログラム",
          "メニュー",
          "アクセント",
          "ジャーナリスト",
          "ひゃっかじてん",
          "エチケット",
        ],
      },
    ],
  },
  {
    key: "n2-k03-sports-leisure-jobs",
    title: "Loanwords: Sports, Leisure & Jobs",
    subtitle: "マラソン・レジャー・モデル",
    insight:
      "Sports and leisure vocabulary is heavily katakana. マラソン (a marathon), ランニング (running; a tank top), テニスコート (a tennis court), スタート (a start), ストップ (a stop), コース (a course), シーズン (a sports season) and ステージ (a stage) are used in sports and events.",
    extendedInsight:
      "Occupations borrowed from English include サラリーマン (a company employee), ウエートレス (a waitress), スチュワーデス (a stewardess), モデル (a fashion model), ベテラン (a veteran), コック (a cook; a tap), ウーマン (a woman) and ギャング (a gang). レジャー (leisure), レクリェーション (recreation) and ラッシュアワー (rush hour) belong to time off and commuting.",
    examples: [
      {
        jp: "毎朝、公園でランニングをしています。",
        romaji: "Maiasa, kouen de ranningu o shite imasu.",
        en: "I go running in the park every morning.",
      },
      {
        jp: "ラッシュアワーの電車はとても込んでいます。",
        romaji: "Rasshuawaa no densha wa totemo konde imasu.",
        en: "Trains at rush hour are extremely crowded.",
      },
    ],
    commonMistake:
      "ランニング can mean either the sport or a sleeveless undershirt, and the context makes it clear. サラリーマン is a male office worker by tradition, and スチュワーデス is an older word that has largely been replaced by 客室乗務員 (cabin crew) in current use.",
    rows: [
      {
        label: "sport",
        terms: [
          "マラソン",
          "ランニング",
          "テニスコート",
          "スタート",
          "ストップ",
          "コース",
          "シーズン",
          "ステージ",
        ],
      },
      {
        label: "people at work",
        terms: [
          "サラリーマン",
          "ウエートレス",
          "スチュワーデス",
          "モデル",
          "ベテラン",
          "コック",
        ],
      },
      {
        label: "people & crowds",
        terms: ["ウーマン", "ギャング"],
      },
      {
        label: "leisure & commuting",
        terms: ["レジャー", "レクリェーション", "ラッシュアワー"],
      },
    ],
  },
  {
    key: "n2-k04-machines-materials-tools",
    title: "Loanwords: Machines, Materials & Tools",
    subtitle: "モーター・コンクリート・ハンドル",
    insight:
      "Technology and construction vocabulary borrowed from English includes オートメーション (automation), モーター (a motor), アンテナ (an antenna), スピーカー (a speaker), カセット (a cassette) and クーラー (an air conditioner). Vehicles use ハンドル (a steering wheel, a handle), タイア (a tyre), モノレール (a monorail) and ヘリコプター (a helicopter).",
    extendedInsight:
      "Building materials are コンクリート (concrete), セメント (cement), ゴム (rubber), ビニール (vinyl) and ダム (a dam), and hand tools are ペンチ (pliers), のこぎり (a saw), ねじ (a screw) and ばね (a spring). ロッカー (a locker), ロビー (a lobby), プラットホーム (a platform), シャッター (a shutter), レンズ (a lens), ダイヤル (a dial), ダイヤグラム (a diagram), サイレン (a siren), ピストル (a pistol), コンセント (an outlet), バケツ (a bucket), フライパン (a frying pan), やかん (a kettle) and ビルディング (a building) fill out the group.",
    examples: [
      {
        jp: "このビルはコンクリートで作られています。",
        romaji: "Kono biru wa konkuriito de tsukurarete imasu.",
        en: "This building is made of concrete.",
      },
      {
        jp: "家に帰って、すぐクーラーをつけました。",
        romaji: "Ie ni kaette, sugu kuuraa o tsukemashita.",
        en: "I got home and turned on the air conditioner right away.",
      },
    ],
    commonMistake:
      "ハンドル means a steering wheel (車のハンドル) in Japanese, and also a handle or a bicycle's handlebars, but a door handle is usually ドアノブ. コンセント is a wall socket, not a consent, and this is the word you need when you ask where to plug something in.",
    rows: [
      {
        label: "devices",
        terms: [
          "オートメーション",
          "モーター",
          "アンテナ",
          "スピーカー",
          "カセット",
          "クーラー",
        ],
      },
      {
        label: "vehicles",
        terms: ["ハンドル", "タイア", "モノレール", "ヘリコプター"],
      },
      {
        label: "building materials",
        terms: ["コンクリート", "セメント", "ゴム", "ビニール", "ダム"],
      },
      {
        label: "tools",
        terms: ["ペンチ", "のこぎり", "ねじ", "ばね"],
      },
      {
        label: "places & fittings",
        terms: [
          "ロッカー",
          "ロビー",
          "プラットホーム",
          "シャッター",
          "レンズ",
          "ビルディング",
          "ショップ",
          "マンション",
          "ろうそく",
        ],
      },
      {
        label: "dials, signals & kitchen",
        terms: [
          "ダイヤル",
          "ダイヤグラム",
          "サイレン",
          "ピストル",
          "コンセント",
          "バケツ",
          "フライパン",
          "やかん",
        ],
      },
    ],
  },
  {
    key: "n2-k05-body-reflexes-native-words",
    title: "Yawns, Sneezes & Body Words in Kana",
    subtitle: "あくび・くしゃみ・まぶた",
    insight:
      "Some everyday body words are written in hiragana. あくび (a yawn), くしゃみ (a sneeze), しゃっくり (a hiccup), めまい (dizziness), まぶた (an eyelid), へそ (a navel), しっぽ (a tail) and しわ (wrinkles, creases) describe reflexes and body features.",
    extendedInsight:
      "These words are mostly native Japanese, not loanwords, so they are typically written in kana. あくびをする, くしゃみをする and しゃっくりが出る are the usual collocations.",
    examples: [
      {
        jp: "授業中に大きなあくびが出てしまいました。",
        romaji: "Jugyouchuu ni ookina akubi ga dete shimaimashita.",
        en: "I let out a big yawn in the middle of class.",
      },
      {
        jp: "立ち上がったら、めまいがしました。",
        romaji: "Tachiagattara, memai ga shimashita.",
        en: "I felt dizzy when I stood up.",
      },
    ],
    commonMistake:
      "Reflex words take different verbs: あくびをする (to yawn) and くしゃみをする (to sneeze) take する, while しゃっくりが出る and めまいがする use が. Saying しゃっくりをする is understandable but less natural than しゃっくりが出る.",
    rows: [
      {
        label: "reflexes",
        terms: ["あくび", "くしゃみ", "しゃっくり", "めまい"],
      },
      {
        label: "body features",
        terms: ["まぶた", "へそ", "しっぽ", "しわかおの"],
      },
    ],
  },
  {
    key: "n2-k06-food-snacks-health",
    title: "Noodles, Snacks & Nutrition",
    subtitle: "うどん・おやつ・ビタミン",
    insight:
      "Everyday food words often stay in kana. うどん (udon noodles), おかず (a side dish), おやつ (a snack between meals) and ランチ (lunch) name meals and dishes, and ガム (chewing gum) is a small treat.",
    extendedInsight:
      "カロリー (a calorie) and ビタミン (a vitamin) are loanwords for nutrition. おかず is what you eat with rice, and おやつ is traditionally a mid-afternoon snack, especially for children. ランチ suggests a restaurant's set lunch more than a packed lunch, which is お弁当.",
    examples: [
      {
        jp: "昼ごはんにうどんを食べました。",
        romaji: "Hirugohan ni udon o tabemashita.",
        en: "I had udon for lunch.",
      },
      {
        jp: "野菜にはビタミンがたくさん入っています。",
        romaji: "Yasai ni wa bitamin ga takusan haitte imasu.",
        en: "Vegetables contain a lot of vitamins.",
      },
    ],
    commonMistake:
      "おかず and おつまみ are not the same. おかず is a dish eaten with rice as part of a meal, while おつまみ is a snack to eat with alcohol. ランチ is a restaurant lunch (ランチセット), and お弁当 is the packed lunch you bring.",
    rows: [
      {
        label: "meals",
        terms: ["うどん", "おかず", "ランチ"],
      },
      {
        label: "snacks",
        terms: ["おやつ", "ガム"],
      },
      {
        label: "nutrition",
        terms: ["カロリー", "ビタミン"],
      },
    ],
  },
  {
    key: "n2-k07-units-money-quantities",
    title: "Units, Tips, Bonuses & Samples",
    subtitle: "センチ・リットル・ボーナス",
    insight:
      "Loanwords cover many units and money words. センチ (a centimetre) and リットル (a litre) are metric units, and チップ (a tip, gratuity), ボーナス (a bonus) and ナンバー (a number) relate to money and counting.",
    extendedInsight:
      "サンプル (a sample), コレクション (a collection), ダブル (double), オイル (oil), インキ (ink) and ブラシ (a brush) are supplies and quantities. チップ is a tip for service, but tipping is not customary in Japan, and ボーナス is a payment made twice a year in many companies.",
    examples: [
      {
        jp: "この箱は幅が三十センチあります。",
        romaji: "Kono hako wa haba ga sanjuu senchi arimasu.",
        en: "This box is thirty centimetres wide.",
      },
      {
        jp: "夏のボーナスで、新しいカメラを買いました。",
        romaji: "Natsu no boonasu de, atarashii kamera o kaimashita.",
        en: "I bought a new camera with my summer bonus.",
      },
    ],
    commonMistake:
      "チップ has more than one meaning: a tip, a gambling chip and a computer chip. In Japan, tipping is not expected, so it appears more often in stories about travel abroad. ナンバー commonly means a car's number plate (ナンバープレート).",
    rows: [
      {
        label: "units",
        terms: ["センチ", "リットル", "ナンバー"],
      },
      {
        label: "money",
        terms: ["チップ", "ボーナス"],
      },
      {
        label: "supplies & quantities",
        terms: [
          "サンプル",
          "コレクション",
          "ダブル",
          "オイル",
          "インキ",
          "ブラシ",
        ],
      },
    ],
  },
  {
    key: "n2-k08-ideas-patterns-manner",
    title: "Ideas, Themes, Rhythm & Grumbling",
    subtitle: "アイデア・テーマ・でたらめ",
    insight:
      "Abstract loanwords describe creative and organisational ideas. アイデア (an idea), テーマ (a theme), パターン (a pattern), リズム (rhythm), テンポ (tempo) and シリーズ (a series) are used for work, music and media, and きっかけ (a trigger, an opportunity) is the native word for what starts something.",
    extendedInsight:
      "Some kana words describe manner: でたらめ (nonsense; random), ぶつぶつ (grumbling in a small voice), いちいち (one by one, every single one) and こないだ (the other day). カーブ (a curve) and バック (back), ピンク (pink), ダイヤモンド (a diamond) and × (ばつ, a cross) are also common.",
    examples: [
      {
        jp: "彼の話はでたらめで、信じられません。",
        romaji: "Kare no hanashi wa detarame de, shinjiraremasen.",
        en: "What he says is nonsense, and I can't believe it.",
      },
      {
        jp: "これがこの町に住み始めたきっかけです。",
        romaji: "Kore ga kono machi ni sumihajimeta kikkake desu.",
        en: "This is what got me to start living in this town.",
      },
    ],
    commonMistake:
      "きっかけ is the trigger or the occasion that starts something (留学のきっかけ), not the reason itself. And いちいち suggests annoyance at a fussy, repetitive detail, as in いちいち文句を言う (to complain about every little thing).",
    rows: [
      {
        label: "ideas & themes",
        terms: ["アイデア", "テーマ", "パターン", "シリーズ", "きっかけ"],
      },
      {
        label: "music",
        terms: ["リズム", "テンポ"],
      },
      {
        label: "manner",
        terms: ["でたらめ", "ぶつぶつ", "いちいち", "こないだ"],
      },
      {
        label: "shapes & colours",
        terms: ["カーブ", "バック", "ピンク", "ダイヤモンド", "カラー", ""],
      },
    ],
  },
  {
    key: "n2-k09-native-kana-words",
    title: "Games, Congratulations & Words Written in Kana",
    subtitle: "かるた・じゃんけん・おめでたい",
    insight:
      "A last group of words is written in hiragana. かるた (playing cards) and じゃんけん (rock-scissors-paper) are traditional games, and おめでたい (a happy event, a matter for congratulation) and しめた (I've got it) are exclamations of good fortune.",
    extendedInsight:
      "The remaining kana entries are words whose kanji forms are normally avoided: かび (mould), じゅうたん (a carpet), だいいち (first, foremost), おしまい (the end) and クリーニング (dry cleaning).",
    examples: [
      {
        jp: "お正月には、家族でかるたをします。",
        romaji: "Oshougatsu ni wa, kazoku de karuta o shimasu.",
        en: "At New Year we play karuta as a family.",
      },
      {
        jp: "ワイシャツをクリーニングに出しました。",
        romaji: "Waishatsu o kuriiningu ni dashimashita.",
        en: "I sent my shirt out to be dry-cleaned.",
      },
    ],
    commonMistake:
      "だいいち means first and foremost, and is used to list reasons (だいいち、時間がありません, first of all, there's no time). おしまい means the end, and it is what you say to close a task or a story, but it is not used for a person's death.",
    rows: [
      {
        label: "games",
        terms: ["かるた", "じゃんけん"],
      },
      {
        label: "exclamations & events",
        terms: ["おめでたい", "しめたかん", "おしまいおわり"],
      },
      {
        label: "everyday nouns",
        terms: [
          "かびがはえる",
          "じゅうたんカーペット",
          "だいいちとりわけ",
          "クリーニング",
        ],
      },
    ],
  },
  {
    key: "n2-m01-mimetic-manner",
    title: "Sound-Symbolic Adverbs: Sparkling, Fluffy & Sneaking",
    subtitle: "ぴかぴか・ふわふわ・こっそり",
    insight:
      "Japanese has a large family of mimetic adverbs that paint a scene, often by repeating a syllable. ぴかぴか (glittering), ふわふわ (light and soft), どきどき (a heart pounding), のろのろ (slowly, sluggishly), うろうろ (wandering aimlessly), まごまご (confused, at a loss) and にこにこ (smiling sweetly) describe appearance, movement and feeling.",
    extendedInsight:
      "Other manner adverbs come from ordinary words. すっきり (neat, clear), ずらり (in a row), せっせと (busily), そうっと (softly, gently), ぎっしり (tightly packed), こっそり (stealthily), しみじみ (deeply), はきはき (clearly), ぴたり (exactly), どっと (suddenly, in a rush), しいんと (silently), さっさと (quickly), ずうっと (all the time), 生き生き (vividly), 広々 (spacious), 悠々 (leisurely), 着々 (steadily), 続々 (one after another), 点々 (here and there) and 転々 (from place to place) all modify verbs.",
    examples: [
      {
        jp: "彼女はいつもにこにこしています。",
        romaji: "Kanojo wa itsumo nikoniko shite imasu.",
        en: "She is always smiling warmly.",
      },
      {
        jp: "弟は姉に隠れて、こっそりお菓子を食べました。",
        romaji: "Otouto wa ane ni kakurete, kossori okashi o tabemashita.",
        en: "My little brother ate sweets in secret, hiding from his sister.",
      },
    ],
    commonMistake:
      "Mimetic adverbs are picked by feel, and they are not interchangeable. うろうろ is aimless wandering, while ぶらぶら is a relaxed stroll, and のろのろ is a frustrating slowness, unlike ゆっくり, which is a neutral or pleasant slowness. Choose the word that carries the right emotion.",
    rows: [
      {
        label: "look and feel",
        terms: ["ぴかぴか", "ふわふわ", "すっきり", "ずらり", "ぎっしり"],
      },
      {
        label: "movement",
        terms: [
          "のろのろ",
          "うろうろ",
          "まごまご",
          "せっせと",
          "さっさと",
          "そうっと",
          "こっそり",
        ],
      },
      {
        label: "feelings & speech",
        terms: ["どきどき", "にこにこ", "しみじみ", "はきはき", "しいんとする"],
      },
      {
        label: "sudden & steady",
        terms: ["どっと", "ぴたり", "ずうっと", "着々", "続々", "点々", "転々"],
      },
      {
        label: "lively & spacious",
        terms: ["生き生き", "広々", "悠々"],
      },
    ],
  },
  {
    key: "n2-m02-time-degree-adverbs",
    title: "Adverbs of Time & Degree",
    subtitle: "いよいよ・大分・とっくに",
    insight:
      "Time adverbs tell when something happens or how fast. とっくに (long ago, already), いきなり (all of a sudden), 一斉 (all at once), 一旦 (once, for a moment), たちまち (instantly), 早速 (at once, promptly), 間も無く (soon) and 漸く (at last, finally) mark timing, and 絶えず (constantly), 始終 (always) and 再三 (again and again) mark repetition.",
    extendedInsight:
      "Degree adverbs say how much. 大分 (considerably), 大層 (very much), 大して (not very much, used with a negative), 幾分 (somewhat), 割合に and 割と (relatively), 比較的 (comparatively), 一段と (still more), いよいよ (more and more, at last) and めっきり (remarkably) describe amount. そのころ (in those days), 平日 (a weekday), 元々 (originally), 果して (as expected), ひとまず (for the time being) and ひとりでに (by itself) round out the group.",
    examples: [
      {
        jp: "雨が降り出して、私たちはたちまちぬれてしまいました。",
        romaji:
          "Ame ga furidashite, watashitachi wa tachimachi nurete shimaimashita.",
        en: "It started raining and we were soaked in no time.",
      },
      {
        jp: "この店は、割と安くておいしいです。",
        romaji: "Kono mise wa, wari to yasukute oishii desu.",
        en: "This restaurant is relatively cheap and good.",
      },
    ],
    commonMistake:
      "大して always goes with a negative: 大しておいしくない (not that tasty). Saying 大しておいしい is wrong. Also, 漸く (ようやく) means at last after a long wait, while やっと is close but more casual, and いよいよ can mean 'at last' or 'increasingly' depending on the sentence.",
    rows: [
      {
        label: "sudden & prompt",
        terms: [
          "とっくに",
          "いきなり",
          "一斉",
          "一旦",
          "たちまち",
          "早速",
          "間も無く",
          "漸く",
        ],
      },
      {
        label: "repeated",
        terms: ["絶えず", "始終", "再三"],
      },
      {
        label: "how much",
        terms: [
          "大分",
          "大層",
          "大して",
          "幾分",
          "割合に",
          "割と",
          "比較的",
          "一段と",
          "いよいよ",
          "めっきり",
        ],
      },
      {
        label: "when & how",
        terms: [
          "そのころ",
          "平日",
          "元々",
          "果して",
          "ひとまず",
          "ひとりでに",
          "初旬",
          "順々",
          "やたらに",
        ],
      },
    ],
  },
  {
    key: "n2-m03-connectors-attitude",
    title: "Connectors & Attitude Adverbs",
    subtitle: "但し・やっぱり・せっかく",
    insight:
      "Connectors join sentences and set a tone. そういえば (which reminds me), そのため (for that reason), その他 (besides), それなのに (and yet), それなら (in that case), 但し (however, provided that), 却って (on the contrary) and ともかく (anyway) link ideas in conversation and writing.",
    extendedInsight:
      "Attitude words show how the speaker feels about a fact. やっぱり (after all), どうせ (anyhow), 流石 (as one would expect), 折角 (with great pains, having gone to the trouble), せめて (at least), ぜひとも (by all means), くれぐれも (repeatedly, sincerely), なにしろ (in any case), 現に (actually), 飽くまで (to the end), 勝手に (arbitrarily) and 兼ねる (to serve two functions; unable to) add colour.",
    examples: [
      {
        jp: "せっかくの休みなのに、雨が降っています。",
        romaji: "Sekkaku no yasumi na noni, ame ga futte imasu.",
        en: "It's a rare day off, and yet it's raining.",
      },
      {
        jp: "やっぱり、あの店に行けばよかったです。",
        romaji: "Yappari, ano mise ni ikeba yokatta desu.",
        en: "I should have gone to that shop after all.",
      },
    ],
    commonMistake:
      "せっかく suggests that a good chance is being wasted or that effort was made, so it pairs with a disappointing result (せっかく作ったのに). 兼ねる has a second use as a verb ending: ～かねる means 'unable to' and is a polite way of refusing (お答えしかねます).",
    rows: [
      {
        label: "linking ideas",
        terms: [
          "そういえば",
          "そのため",
          "その他",
          "それなのに",
          "それなら",
          "但し",
          "却って",
          "ともかく",
        ],
      },
      {
        label: "speaker's attitude",
        terms: [
          "やっぱり",
          "どうせ",
          "流石",
          "折角",
          "せめて",
          "ぜひとも",
          "くれぐれも",
        ],
      },
      {
        label: "emphasis & certainty",
        terms: ["なにしろ", "現に", "飽くまで", "勝手に", "兼ねる"],
      },
      {
        label: "vague & thorough",
        terms: [
          "なんとなく",
          "なんとも",
          "残らず",
          "あれこれ",
          "あちらこちら",
          "改めて",
        ],
      },
      {
        label: "beginnings & extent",
        terms: ["始めに", "初めに", "大凡", "思い切り", "思いっ切り"],
      },
    ],
  },
  {
    key: "n2-m04-daily-greetings-thanks",
    title: "Greetings, Thanks & Comings and Goings",
    subtitle: "ただいま・ごちそうさま・お大事に",
    insight:
      "Set phrases carry the politeness of everyday life. おはよう (good morning), こんばんは (good evening), さようなら and バイバイ (goodbye), はじめまして (how do you do), ただいま (I'm home) and いってきます (I'm off) with the reply 行ってらっしゃい (have a good day) mark arrivals and departures.",
    extendedInsight:
      "Thanks and sympathy have their own phrases: ごちそうさま (thanks for the meal), ご苦労様 (thank you for your hard work), おかげさまで (thanks to you), お元気で (take care), お大事に (get well soon), お気の毒に (I'm sorry to hear that), どういたしまして (you're welcome), 乾杯 (cheers) and 万歳 (hurray). いってまいります is the humbler form of いってきます, and はい (yes) is the reply that opens most conversations.",
    examples: [
      {
        jp: "「行ってきます」「行ってらっしゃい」",
        romaji: '"Ittekimasu" "Itterasshai"',
        en: '"I\'m off." "Have a good day."',
      },
      {
        jp: "風邪をひいたそうですね。お大事に。",
        romaji: "Kaze o hiita sou desu ne. Odaiji ni.",
        en: "I heard you caught a cold. Take care of yourself.",
      },
    ],
    commonMistake:
      "ご苦労様 is said by a superior to a subordinate, and it can sound patronising to a boss. The polite thing to say to someone senior is お疲れ様です. ごちそうさま is said after a meal, and いただきます before it.",
    rows: [
      {
        label: "hello & goodbye",
        terms: [
          "おはよう",
          "こんばんは",
          "さようなら",
          "バイバイ",
          "はじめまして",
        ],
      },
      {
        label: "coming and going",
        terms: [
          "ただいま",
          "いってきます",
          "いってまいります",
          "行ってらっしゃい",
          "行っていらっしゃい",
        ],
      },
      {
        label: "thanks & sympathy",
        terms: [
          "ごちそうさま",
          "ご苦労様",
          "おかげさまで",
          "お元気で",
          "お大事に",
          "お気の毒に",
        ],
      },
      {
        label: "replies & toasts",
        terms: [
          "どういたしましてかん",
          "はいかん",
          "乾杯",
          "万歳",
          "こちらこそ",
        ],
      },
    ],
  },
  {
    key: "n2-m05-polite-requests-apologies",
    title: "Polite Requests, Apologies & Responses",
    subtitle: "お待たせしました・お邪魔します・かしこまりました",
    insight:
      "Service and visit language includes お願いします (please, I request), お待ちください (please wait a moment), お待たせしました and おまちどおさま (sorry to have kept you waiting), かしこまりました (certainly), おかけください (please sit down) and 構いません (it's all right, I don't mind).",
    extendedInsight:
      "For visits and apologies, ごめんください (may I come in?), お邪魔します (excuse me for disturbing you), お先に (after you, before you), おかまいなく (please don't go to any trouble), お世話になりました (I've been in your care), 御免 (pardon, sorry), しつれいしました (I'm sorry, excuse me), 申し訳ない (inexcusable, I am sorry), 仕方がない and しょうがない (it can't be helped), やむをえない (unavoidable), 気を付ける (to be careful) and それはいけませんね (that's not good) cover the range.",
    examples: [
      {
        jp: "お待たせしました。こちらがメニューです。",
        romaji: "Omataseshimashita. Kochira ga menyuu desu.",
        en: "Sorry to keep you waiting. Here is the menu.",
      },
      {
        jp: "ごめんください。お邪魔します。",
        romaji: "Gomen kudasai. Ojama shimasu.",
        en: "Hello, is anyone home? Excuse me for coming in.",
      },
    ],
    commonMistake:
      "仕方がない and しょうがない both mean it can't be helped, but しょうがない is more casual and can also be used to complain about a person (しょうがない人だ). 申し訳ない is a firm apology, and 申し訳ありません is the polite form to use to a customer or superior.",
    rows: [
      {
        label: "service phrases",
        terms: [
          "お願いします",
          "お待ちください",
          "お待たせしました",
          "おまちどおさま",
          "かしこまりました",
          "おかけください",
          "構いません",
        ],
      },
      {
        label: "visiting",
        terms: [
          "ごめんください",
          "お邪魔します",
          "お先に",
          "おかまいなく",
          "お世話になりました",
        ],
      },
      {
        label: "apologising",
        terms: [
          "御免",
          "しつれいしましたかん",
          "申し訳ない",
          "それはいけませんねかん",
        ],
      },
      {
        label: "resignation & care",
        terms: ["仕方がない", "しょうがない", "やむをえない", "気を付ける"],
      },
    ],
  },
  {
    key: "n2-m06-set-phrases-misc-words",
    title: "Set Words: Let Me See, Look & Woman",
    subtitle: "ええと・御覧・女の人",
    insight:
      "This lesson gathers small words used in everyday talk. ええと (let me see, well), うんと (a great deal, very much) and 何々 (such and such, what?) fill pauses and vagueness, 御覧 (look, try; the honorific of seeing), ごらん and もしかしたら (perhaps, by some chance) are used to invite or guess.",
    extendedInsight:
      "こうして (like this, with this), ついで (an opportunity, occasion), 銘々 (each, individually), 女の人 (a woman), ミリ (milli-) and まるごと (whole, all of) are useful odds and ends. 御覧 is used in the pattern ご覧ください (please take a look) and as a gentle command after a verb in て form.",
    examples: [
      {
        jp: "ええと、今日は何曜日でしたか。",
        romaji: "Eeto, kyou wa nanyoubi deshita ka.",
        en: "Um, what day of the week is it today?",
      },
      {
        jp: "もしかしたら、明日は雨かもしれません。",
        romaji: "Moshikashitara, ashita wa ame kamo shiremasen.",
        en: "Perhaps it might rain tomorrow.",
      },
    ],
    commonMistake:
      "御覧 and ごらん have a polite use (ご覧になる, the honorific of 見る) and a friendly command use (見てごらん, take a look). Using ご覧になる for your own actions is wrong, because it's honorific. もしかしたら is always used with a guess or a hope.",
    rows: [
      {
        label: "fillers",
        terms: ["ええと", "うんと", "何々"],
      },
      {
        label: "look & guess",
        terms: ["御覧", "もしかしたら"],
      },
      {
        label: "other everyday words",
        terms: [
          "こうして",
          "ついで",
          "銘々",
          "女の人",
          "ミリメートル",
          "まるごと",
        ],
      },
    ],
  },
  {
    key: "n2-x01-prefixes",
    title: "Prefixes That Change a Word's Meaning",
    subtitle: "再～・最～・未～・現～",
    insight:
      "Prefixes attach to the front of a noun to add a fixed meaning. 再～ (re-), 最～ (the most), 未～ (not yet), 現～ (present, incumbent), 各～ (each, every), 同～ (the same), 反～ (anti-), 低～ (low) and 小～ (small) are common examples, as in 再開 (a restart), 最高 (the highest), 未定 (undecided) and 現在 (the present).",
    extendedInsight:
      "Others work like adjectives before a noun: 初～ (first), 諸～ (various), 第～ (ordinal marker), 外～ (foreign, outside), 今～ (this, current), 我～ (our), 御～ (honorific), 長～ (long), 一～ (one), 防～ (prevention), 毎～ (every), 名～ (famous), 両～ (both), 明くる～ and 翌～ (the next ~) and ほんの～ (a mere).",
    examples: [
      {
        jp: "この店は最新の機械を使っています。",
        romaji: "Kono mise wa saishin no kikai o tsukatte imasu.",
        en: "This shop uses the latest machines.",
      },
      {
        jp: "明日は再び会議があります。",
        romaji: "Ashita wa futatabi kaigi ga arimasu.",
        en: "There is another meeting tomorrow.",
      },
    ],
    commonMistake:
      "毎～ and ～毎 both mean every, but they attach in different places and are read differently: 毎日 (まいにち, every day) puts 毎 first and reads まい, while 三日毎 (みっかごと, every three days) puts it last and reads ごと. 翌～ and 明くる～ both mean the following, but 翌日 is used in writing and 明くる日 in storytelling.",
    rows: [
      {
        label: "re-, most, not yet",
        terms: ["再", "最", "未", "現"],
      },
      {
        label: "each, same, anti-",
        terms: ["各", "同", "反", "両"],
      },
      {
        label: "size & level",
        terms: ["小", "低", "長"],
      },
      {
        label: "first, various, ordinal",
        terms: ["初", "諸", "第", "一"],
      },
      {
        label: "inside, outside, ours",
        terms: ["外", "今", "我", "御"],
      },
      {
        label: "every, famous, next, mere",
        terms: ["毎-2", "名", "明くる", "翌", "防", "ほんの"],
      },
    ],
  },
  {
    key: "n2-x02-counters-things",
    title: "Counters for Seats, Ships, Games & Letters",
    subtitle: "～席・～船・～戦・～通",
    insight:
      "Counters are attached to a number to count a certain kind of thing. ～席 (seats), ～船 (ships), ～艘 (small boats), ～戦 (games, matches), ～足 (pairs of shoes), ～羽 (birds and rabbits), ～頭 (large animals), ～通 (letters, documents) and ～滴 (drops) each fit a category.",
    extendedInsight:
      "Others count places and publications: ～校 (schools), ～社 (companies), ～室 (rooms), ～号 (issues, numbers), ～巻 (volumes), ～位 (ranks), ～名 (people, formal), ～問 (questions), ～点 (points, scores), ～発 (shots, bullets), ～女 (daughters or girls), and ～商 (merchant). When you read them, the number is pronounced first and the counter follows, as in 三位 (third place) and 二通 (two letters).",
    examples: [
      {
        jp: "この電車は三十席あります。",
        romaji: "Kono densha wa sanjuu seki arimasu.",
        en: "This carriage has thirty seats.",
      },
      {
        jp: "私たちのチームは三戦全勝でした。",
        romaji: "Watashitachi no chiimu wa sansen zenshou deshita.",
        en: "Our team won all three of its games.",
      },
    ],
    commonMistake:
      "Counters change their sound after certain numbers. ～羽 becomes ば or ぱ in 三羽 (さんば) and 六羽 (ろっぱ), and ～通 stays つう in 二通. The counter has to match the object, and using the general つ or 個 for a letter or a ship sounds odd.",
    rows: [
      {
        label: "seats, ships, boats",
        terms: ["席", "船", "艘"],
      },
      {
        label: "games & scores",
        terms: ["戦", "点", "位", "問", "発-2"],
      },
      {
        label: "animals, drops, shoes",
        terms: ["羽", "頭", "滴", "足"],
      },
      {
        label: "letters, volumes, issues",
        terms: ["通", "巻", "号", "名-2"],
      },
      {
        label: "schools, companies, rooms",
        terms: ["校", "社", "室-2", "女-2"],
      },
    ],
  },
  {
    key: "n2-x03-counters-time-places",
    title: "Counters for Days, Nights, Steps & Districts",
    subtitle: "～泊・～夜・～丁目・～年生",
    insight:
      "Time and place counters mark when and where. ～日 read か (counts days), ～日 read じつ (day), ～泊 (nights of a stay), ～夜 (nights), ～年生 (school year), ～時間目 (class period), ～番目 (the nth) and ～丁目 (a numbered block of a town) all come with numbers.",
    extendedInsight:
      "Other counters are used with formal or specialised things: ～所 (places), ～条 (articles of a law), ～畳 (tatami mats, a room's size), ～勝 (wins), ～着 (arrivals, finishing places, outfits), ～兆 (trillions), ～歩 (steps) and ～遍 (times). Two readings of ～日 are given here: か counts days (三日, みっか), while じつ appears in words such as 休日 and 祭日.",
    examples: [
      {
        jp: "京都に二泊三日で旅行しました。",
        romaji: "Kyouto ni nihaku mikka de ryokou shimashita.",
        en: "I took a three-day, two-night trip to Kyoto.",
      },
      {
        jp: "この部屋は六畳の広さです。",
        romaji: "Kono heya wa rokujou no hirosa desu.",
        en: "This room is six tatami mats in size.",
      },
    ],
    commonMistake:
      "二泊三日 means two nights and three days, and not the other way round: the nights come first. ～畳 is a measure of room size in Japan (六畳 is roughly ten square metres), and it is read じょう, not たたみ.",
    rows: [
      {
        label: "days & nights",
        terms: ["日", "日-2", "泊", "夜"],
      },
      {
        label: "school & sequence",
        terms: ["年生", "時間目", "番目", "丁目"],
      },
      {
        label: "space & law",
        terms: ["所", "所-2", "条", "畳"],
      },
      {
        label: "wins, arrivals & big numbers",
        terms: ["勝", "着", "兆", "歩", "遍"],
      },
    ],
  },
  {
    key: "n2-x04-suffixes-people-fields",
    title: "Suffixes for People, Groups & Fields of Work",
    subtitle: "～者・～家・～業・～論",
    insight:
      "Suffixes make nouns from other words. ～者 (a person who), ～手 (a player, a person who does), ～家 (an expert, a person of a type), ～団 (a group, corps), ～長 (a leader, head) and ～部 (a section) name people and groups.",
    extendedInsight:
      "Fields and institutions are named the same way: ～業 (a type of business), ～科 (a course, a department), ～系 (a system, a lineage), ～圏 (a sphere), ～教 (a religion), ～論 (a theory), ～史 (a history), ～省 (a ministry), ～庁 (an agency), ～病 (a disease), ～化 (turning into), ～感 (a feeling), ～力 (the power of), ～期 (a period), ～費 (a cost), ～料 (a fee), ～領 (a territory), ～集 (a collection), ～刊 (issued), ～紙 (a newspaper), ～帳 (a notebook), ～画 (a picture), ～歌 (a song), ～風 (a style), ～流 (a school, manner) and ～弁 (a dialect).",
    examples: [
      {
        jp: "彼は有名な作家で、多くの読者がいます。",
        romaji: "Kare wa yuumei na sakka de, ooku no dokusha ga imasu.",
        en: "He is a famous writer with many readers.",
      },
      {
        jp: "この町の観光化が進んでいます。",
        romaji: "Kono machi no kankouka ga susunde imasu.",
        en: "Tourism in this town is developing.",
      },
    ],
    commonMistake:
      "～者 and ～家 both refer to a kind of person, but ～家 suggests a specialist or an artist (作家, 音楽家), while ～者 is a plain doer (読者, 使用者). ～化 turns a noun into a process (都市化, urbanisation), and it can be read か or け in other words.",
    rows: [
      {
        label: "people & groups",
        terms: ["者", "手", "家", "団", "長-3", "部"],
      },
      {
        label: "business & government",
        terms: ["業", "科", "商", "省-2", "庁", "系", "圏"],
      },
      {
        label: "ideas & change",
        terms: ["教", "論", "史", "化", "感", "力", "病"],
      },
      {
        label: "time & money",
        terms: ["期", "費", "料", "領"],
      },
      {
        label: "publications & art",
        terms: ["集", "刊", "紙", "帳", "画", "歌", "風", "流", "弁"],
      },
    ],
  },
  {
    key: "n2-x05-suffixes-places-things",
    title: "Suffixes for Places, Vehicles & Kinds of Thing",
    subtitle: "～港・～館・～色・～向け",
    insight:
      "Place suffixes name kinds of location. ～園 (a garden), ～島 (an island), ～道 (a road, path), ～港 (a port), ～国 (a nation), ～山 (a mountain), ～寺 (a temple), ～館 (a hall, a building), ～場 (a ground, a field) and ～口 (an opening, an entrance) each attach to a proper noun or a type.",
    extendedInsight:
      "Others describe position and kind: ～内 (inside), ～下 (under), ～外 (out of), ～間 (between, during), ～車 (a vehicle), ～器 and ～機 (a device, a machine), ～酒 (a kind of alcohol), ～産 (made in), ～色 (a kind of colour), ～形 (a shape), ～前 (before), ～沿い (along), ～通り (as, in accordance with), ～毎 (every), ～向け (aimed at), ～付 (attached to), ～済 (already done), ～等 (etc.), ～行 (a line), ～もち (a person who has), ～切れ (out of), 殿 (a title on a letter) and ～ところ (about to do).",
    examples: [
      {
        jp: "この店は子供向けの本を売っています。",
        romaji: "Kono mise wa kodomomuke no hon o utte imasu.",
        en: "This shop sells books aimed at children.",
      },
      {
        jp: "この道沿いに、桜の木がたくさんあります。",
        romaji: "Kono michizoi ni, sakura no ki ga takusan arimasu.",
        en: "There are many cherry trees along this road.",
      },
    ],
    commonMistake:
      "～沿い is read そい in this word list, but after a noun it usually becomes ぞい (道沿い is みちぞい) because of rendaku. ～済 (ずみ) marks something that is already done (支払い済み, already paid), and ～向け (むけ) marks the intended audience.",
    rows: [
      {
        label: "kinds of place",
        terms: ["園", "島", "道", "港", "国", "山", "寺", "館", "場", "口"],
      },
      {
        label: "position",
        terms: ["内", "下", "外-2", "間", "前-2", "沿い", "通り"],
      },
      {
        label: "vehicles & devices",
        terms: ["車", "器", "機", "酒", "産", "色", "形"],
      },
      {
        label: "state & aim",
        terms: [
          "向け",
          "付",
          "済",
          "等",
          "等-2",
          "行",
          "毎",
          "もち",
          "切れ",
          "殿",
        ],
      },
    ],
  },
  {
    key: "n2-x06-verb-adjective-endings",
    title: "Endings That Add Meaning to Verbs & Adjectives",
    subtitle: "～過ぎる・～がち・～づらい",
    insight:
      "Some suffixes attach to a verb stem or an adjective. ～過ぎる (too much), ～きる (to do completely), ～がち (tends to), ～だらけ (full of), ～難い and ～辛い (hard to do), ～ぽい (-ish), ～みたい (looks like), ～気味 (slightly), ～続く (to go on) and ～ところ (about to) add a nuance.",
    extendedInsight:
      "Two more attach to nouns: ～遣い (the way something is used, as in 言葉遣い) and ～振り (after an interval, as in 久しぶり). 難い and 辛い both come after a verb stem to say something is hard, but 難い is formal and written, while 辛い is more spoken. ～ぽい is casual and can be slightly negative, as in 子供っぽい (childish).",
    examples: [
      {
        jp: "昨日は食べ過ぎて、お腹が痛くなりました。",
        romaji: "Kinou wa tabesugite, onaka ga itaku narimashita.",
        en: "I ate too much yesterday and my stomach hurt.",
      },
      {
        jp: "彼は最近、風邪をひきがちです。",
        romaji: "Kare wa saikin, kaze o hikigachi desu.",
        en: "He tends to catch colds these days.",
      },
    ],
    commonMistake:
      "～過ぎる attaches to the stem of a verb or to an adjective without the final い (高すぎる, too high). And ～がち takes a verb stem and describes an undesirable tendency, so 勉強しがち is odd, because studying is not usually a bad habit.",
    rows: [
      {
        label: "too much & fully",
        terms: ["過ぎる", "きる", "続く"],
      },
      {
        label: "tendency & look",
        terms: ["がち", "ぽい", "みたい", "気味", "だらけ"],
      },
      {
        label: "hard to do",
        terms: ["難い", "辛い"],
      },
      {
        label: "timing & use",
        terms: ["ところ", "遣い", "振り"],
      },
    ],
  },
];
