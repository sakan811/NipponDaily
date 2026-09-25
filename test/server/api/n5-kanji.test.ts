import { describe, it, expect, beforeEach } from "vitest";
import {
  getKanjiHandler,
  setupDefaults,
  mockGetKanjiPool,
  createMockPool,
} from "./setup";

describe("GET /api/n5-kanji", () => {
  beforeEach(() => {
    setupDefaults();
  });

  it("returns the full kanji pool", async () => {
    const kanji = createMockPool().kanji;
    mockGetKanjiPool.mockResolvedValue(kanji);

    const handler = await getKanjiHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(kanji);
    expect(result.count).toBe(kanji.length);
  });

  it("returns an empty array when the pool is empty", async () => {
    mockGetKanjiPool.mockResolvedValue([]);

    const handler = await getKanjiHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });

  it("throws a 500 error when the service rejects", async () => {
    mockGetKanjiPool.mockRejectedValue(new Error("Redis unreachable"));

    const handler = await getKanjiHandler();

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
