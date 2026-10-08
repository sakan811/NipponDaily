import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { afterAll, describe, it, expect } from "vitest";
import { $fetch, fetch, setup } from "@nuxt/test-utils/e2e";
import { DOC_CHAPTERS, docPath } from "~~/shared/docs";

/**
 * The one place the whole app runs: Nuxt builds into a throwaway directory,
 * its server starts, and every route is requested over HTTP. Unit tests mock
 * the composables and the router, so a page that breaks only when it is
 * really rendered (a bad import, a server fetch that fails, a route that
 * answers the wrong status) is caught here and nowhere else.
 */

// @nuxt/test-utils names a new build directory on every run and, once the
// build has made it, never removes it, so a fixed one is used and removed here.
// This hook is registered first so it runs last, after the server has stopped.
const buildDir = fileURLToPath(
  new URL("../../.nuxt/integration", import.meta.url),
);
afterAll(() => rm(buildDir, { recursive: true, force: true }));

await setup({
  rootDir: fileURLToPath(new URL("../..", import.meta.url)),
  buildDir,
  server: true,
  browser: false,
});

const html = (path: string) => $fetch<string>(path, { responseType: "text" });
const status = (path: string) =>
  fetch(path, { redirect: "manual" }).then((r) => r.status);

interface Envelope<T> {
  success: boolean;
  data: T;
}
const api = async <T>(path: string) => (await $fetch<Envelope<T>>(path)).data;

describe("pages", () => {
  it("the home page holds today's word in the HTML", async () => {
    const { entry } = await api<{ entry: { term: string; date: string } }>(
      "/api/daily-word",
    );
    const page = await html("/");
    expect(page).toContain(entry.term);
    expect(page).toContain("<h1");
  });

  it("an open day's page holds its word, and links the share image", async () => {
    const { first } = await api<{ first: string }>("/api/catalogue");
    const { entry } = await api<{ entry: { term: string } }>(
      `/api/daily-word?date=${first}`,
    );
    const page = await html(`/words/${first}`);
    expect(page).toContain(entry.term);
    expect(page).toContain(`/og.png?date=${first}`);
  });

  it("the calendar, Explore, Patterns, Parts, Kanji and Kana answer 200", async () => {
    for (const path of [
      "/words",
      "/explore",
      "/patterns",
      "/parts",
      "/kanji",
      "/kana",
    ]) {
      expect(await status(path), path).toBe(200);
    }
  });

  it("a part page and a kanji page answer 200", async () => {
    const { parts } = await api<{ parts: { text: string }[] }>("/api/parts");
    const { kanji } = await api<{ kanji: { char: string }[] }>("/api/kanji");
    expect(await status(`/parts/${encodeURIComponent(parts[0]!.text)}`)).toBe(
      200,
    );
    expect(await status(`/kanji/${encodeURIComponent(kanji[0]!.char)}`)).toBe(
      200,
    );
  });

  it("every chapter of the book answers 200", async () => {
    expect(await status("/docs")).toBe(200);
    for (const chapter of DOC_CHAPTERS) {
      const path = docPath(chapter.slug);
      expect(await status(path), path).toBe(200);
    }
  });
});

describe("what must not be served", () => {
  it("a day that has not arrived is a 404, as is the day before the first", async () => {
    expect(await status("/words/2999-01-01")).toBe(404);
    expect(await status("/words/2018-10-07")).toBe(404);
  });

  it("an unknown page is a real 404 and noindex", async () => {
    const res = await fetch("/no-such-page");
    expect(res.status).toBe(404);
    expect(await res.text()).toMatch(/noindex/);
  });

  it("the removed game and lesson routes redirect to the home page", async () => {
    for (const path of ["/game", "/learn/anything", "/vocab/anything"]) {
      const res = await fetch(path, { redirect: "manual" });
      expect(res.status, path).toBe(302);
      expect(res.headers.get("location"), path).toBe("/");
    }
  });
});

describe("server routes", () => {
  it("the API refuses a future date", async () => {
    expect(await status("/api/daily-word?date=2999-01-01")).toBe(400);
  });

  it("the share image is a PNG for an open day and a 404 for a future one", async () => {
    const { first } = await api<{ first: string }>("/api/catalogue");
    const ok = await fetch(`/og.png?date=${first}`);
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-type")).toBe("image/png");
    expect(await status("/og.png?date=2999-01-01")).toBe(404);
  });

  it("the sitemap and robots.txt name the site and keep the API out", async () => {
    expect(await html("/sitemap.xml")).toContain("<urlset");
    expect(await html("/robots.txt")).toMatch(/Disallow: \/api\//);
  });

  it("a successful answer is cacheable until midnight and an error is not", async () => {
    const ok = await fetch("/api/catalogue");
    expect(ok.headers.get("cache-control")).toMatch(/s-maxage=\d+/);
    const bad = await fetch("/api/daily-word?date=2999-01-01");
    expect(bad.headers.get("cache-control") ?? "").not.toMatch(/s-maxage/);
  });
});
