import { describe, it, expect, beforeEach } from "vitest";
import {
  getVocabHandler,
  setupDefaults,
  mockGetVocabPool,
  createMockPool,
} from "./setup";

describe("GET /api/n5-vocab", () => {
  beforeEach(() => {
    setupDefaults();
  });

  it("returns the full vocab pool", async () => {
    const vocab = createMockPool().vocab;
    mockGetVocabPool.mockResolvedValue(vocab);

    const handler = await getVocabHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(vocab);
    expect(result.count).toBe(vocab.length);
  });

  it("returns an empty array when the pool is empty", async () => {
    mockGetVocabPool.mockResolvedValue([]);

    const handler = await getVocabHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });

  it("throws a 500 error when the service rejects", async () => {
    mockGetVocabPool.mockRejectedValue(new Error("Redis unreachable"));

    const handler = await getVocabHandler();

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("defaults to N5 when no ?level= is given", async () => {
    const handler = await getVocabHandler();
    await handler({} as any);

    expect(mockGetVocabPool).toHaveBeenCalledWith("N5");
  });

  it("passes an explicit ?level= through to the pool read", async () => {
    (global as any).getQuery.mockReturnValue({ level: "N3" });

    const handler = await getVocabHandler();
    await handler({} as any);

    expect(mockGetVocabPool).toHaveBeenCalledWith("N3");
  });

  it("returns 400 for an unsupported level", async () => {
    (global as any).getQuery.mockReturnValue({ level: "N1" });

    const handler = await getVocabHandler();
    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
