import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ogAssetFiles } from "../../mocks/og-assets";

const headers = new Map<string, string>();

const getHandler = async () =>
  (await import("~/server/routes/og.png.get")).default;

const thrownBy = async (fn: () => unknown): Promise<unknown> => {
  try {
    await fn();
  } catch (e) {
    return e;
  }
  return undefined;
};

const at = (isoUtc: string) => vi.setSystemTime(new Date(isoUtc));

describe("GET /og.png", () => {
  beforeEach(() => {
    headers.clear();
    vi.useFakeTimers({ toFake: ["Date"] });
    (global as any).useStorage = () => ({
      getItemRaw: async (key: keyof typeof ogAssetFiles) => ogAssetFiles[key],
    });
    (global as any).setHeader = (_e: unknown, k: string, v: string) =>
      headers.set(k, v);
    (global as any).getQuery.mockReturnValue({});
  });
  afterEach(() => vi.useRealTimers());

  it("draws an open day as a PNG that a CDN may keep", async () => {
    at("2026-10-05T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date: "2026-10-01" });
    const handler = await getHandler();
    const body = (await handler({} as any)) as Buffer;

    expect(body.subarray(1, 4).toString()).toBe("PNG");
    expect(headers.get("content-type")).toBe("image/png");
    expect(headers.get("cache-control")).toContain("s-maxage=604800");
  });

  it("serves today's card, since today has opened", async () => {
    at("2026-10-05T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date: "2026-10-05" });
    const handler = await getHandler();
    expect(((await handler({} as any)) as Buffer).length).toBeGreaterThan(
      10_000,
    );
  });

  it("answers 404, not 400, for an upcoming day, so nothing is revealed", async () => {
    at("2026-10-05T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date: "2026-10-06" });
    const handler = await getHandler();
    expect(await thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 404,
    });
    expect(headers.size).toBe(0);
  });

  it("answers 404 for a malformed, missing or unknown date", async () => {
    at("2026-10-05T12:00:00Z");
    const handler = await getHandler();
    for (const query of [
      {},
      { date: "soon" },
      { date: "2026-02-30" },
      { date: "2021-12-31" },
    ]) {
      (global as any).getQuery.mockReturnValue(query);
      expect(
        await thrownBy(() => handler({} as any)),
        JSON.stringify(query),
      ).toMatchObject({
        statusCode: 404,
      });
    }
  });
});
