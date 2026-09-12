import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockLesson,
  mockGetLessons,
  mockAnalyzeJapanese,
} from "./setup";

const callHandler = (handler: any) =>
  handler({
    node: {
      req: {
        socket: { remoteAddress: "127.0.0.1" },
        headers: {},
      },
    },
  });

describe("News API - Tokenization", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("attaches tokens derived from originalText to every returned lesson", async () => {
    const tokens = [
      {
        surface: "首相",
        reading: "しゅしょう",
        romaji: "shushō",
        partOfSpeech: "noun",
      },
      { surface: "は", reading: "は", romaji: "ha", partOfSpeech: "particle" },
    ];
    mockAnalyzeJapanese.mockResolvedValue(tokens);
    mockGetLessons.mockResolvedValue([
      createMockLesson({ id: "a", originalText: "首相は表明した。" }),
    ]);
    (global as any).getQuery.mockReturnValue({});

    const response = await callHandler(handler);

    expect(mockAnalyzeJapanese).toHaveBeenCalledWith("首相は表明した。");
    expect(response.data.lessons[0].tokens).toEqual(tokens);
  });

  it("tokenizes each lesson's own originalText independently", async () => {
    mockAnalyzeJapanese.mockImplementation(async (text: string) => [
      { surface: text, reading: "x", romaji: "x", partOfSpeech: "noun" },
    ]);
    mockGetLessons.mockResolvedValue([
      createMockLesson({ id: "a", originalText: "テキストA" }),
      createMockLesson({ id: "b", originalText: "テキストB" }),
    ]);
    (global as any).getQuery.mockReturnValue({});

    const response = await callHandler(handler);

    expect(response.data.lessons[0].tokens[0].surface).toBe("テキストA");
    expect(response.data.lessons[1].tokens[0].surface).toBe("テキストB");
  });

  it("still returns lessons when tokenization fails or returns nothing", async () => {
    mockAnalyzeJapanese.mockResolvedValue([]);
    mockGetLessons.mockResolvedValue([createMockLesson({ id: "a" })]);
    (global as any).getQuery.mockReturnValue({});

    const response = await callHandler(handler);

    expect(response.success).toBe(true);
    expect(response.data.lessons[0].tokens).toEqual([]);
  });
});
