/**
 * Utility mapping function to resolve dynamic prefecture names
 * or regions returned by Gemini into standard map ID regions.
 */
export const mapPrefectureToRegion = (name: string): string => {
  if (!name) return "";
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/(prefecture|ken|fu|to|ko|region|\s)/g, "");

  const mapping: Record<string, string> = {
    // Hokkaido
    hokkaido: "hokkaido",

    // Tohoku
    aomori: "tohoku",
    iwate: "tohoku",
    miyagi: "tohoku",
    akita: "tohoku",
    yamagata: "tohoku",
    fukushima: "tohoku",
    tohoku: "tohoku",

    // Kanto
    ibaraki: "kanto",
    tochigi: "kanto",
    gunma: "kanto",
    saitama: "kanto",
    chiba: "kanto",
    tokyo: "kanto",
    kanagawa: "kanto",
    kanto: "kanto",

    // Chubu
    niigata: "chubu",
    toyama: "chubu",
    ishikawa: "chubu",
    fukui: "chubu",
    yamanashi: "chubu",
    nagano: "chubu",
    gifu: "chubu",
    shizuoka: "chubu",
    aichi: "chubu",
    chubu: "chubu",

    // Kansai
    mie: "kansai",
    shiga: "kansai",
    kyoto: "kansai",
    osaka: "kansai",
    hyogo: "kansai",
    nara: "kansai",
    wakayama: "kansai",
    kansai: "kansai",

    // Chugoku
    tottori: "chugoku",
    shimane: "chugoku",
    okayama: "chugoku",
    hiroshima: "chugoku",
    yamaguchi: "chugoku",
    chugoku: "chugoku",

    // Shikoku
    tokushima: "shikoku",
    kagawa: "shikoku",
    ehime: "shikoku",
    kochi: "shikoku",
    shikoku: "shikoku",

    // Kyushu & Okinawa
    fukuoka: "kyushu",
    saga: "kyushu",
    nagasaki: "kyushu",
    kumamoto: "kyushu",
    oita: "kyushu",
    miyazaki: "kyushu",
    kagoshima: "kyushu",
    okinawa: "okinawa",
    kyushu: "kyushu",
  };

  return mapping[normalized] || "";
};
