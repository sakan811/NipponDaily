import { describe, expect, it } from "vitest";
import { read, walk } from "../helpers/repo";

/**
 * Guards the two principles the rest of the suite cannot see (Core theme):
 * "No reader data" and "Nothing leaves the app". The others have tests of
 * their own: the import rule (`no-future-leak`), only open days (the
 * endpoint tests), every device (`e2e/`). Each case scans the code that ships
 * and fails with the file, so a new feature that breaks a principle is caught
 * in the change that adds it, not found in a review.
 */

const SHIPPED = [
  ...walk("app", [".vue", ".ts", ".css"]),
  ...walk("server", [".ts"]),
  ...walk("shared", [".ts"]),
  "nuxt.config.ts",
];
/** The server and the browser both run these. */
const SERVER = walk("server", [".ts"]);
const APP = walk("app", [".vue", ".ts"]);

/** Text with every `open … close` span removed (an unterminated opener stays). */
const dropSpans = (text: string, open: string, close: string) => {
  let out = "";
  let at = 0;
  for (;;) {
    const start = text.indexOf(open, at);
    const end = start < 0 ? -1 : text.indexOf(close, start + open.length);
    if (end < 0) return out + text.slice(at);
    out += text.slice(at, start);
    at = end + close.length;
  }
};

/** A file's code: comments dropped, since prose may name what code must not do. */
const code = (file: string) => {
  // Repeat until stable so a comment opener rebuilt by a removal (`<!<!---->--`)
  // is stripped too.
  let text = read(file);
  for (let prev = ""; prev !== text;) {
    prev = text;
    text = dropSpans(text, "<!--", "-->")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
  }
  return text;
};

const offenders = (files: string[], pattern: RegExp) =>
  files.filter((f) => pattern.test(code(f)));

describe("Nothing leaves the app", () => {
  it("loads and links nothing from another origin", () => {
    // The data sources are linked from shared/sources.ts as citations; an SVG
    // namespace or the local address is not a request.
    const allowed = /^https?:\/\/(?:www\.w3\.org|www\.sitemaps\.org|localhost)/;
    const external = SHIPPED.filter((f) => f !== "shared/sources.ts").flatMap(
      (f) =>
        [...code(f).matchAll(/https?:\/\/[^\s"'`)]+/g)]
          .map((m) => m[0])
          .filter((url) => !allowed.test(url))
          .map((url) => `${f}: ${url}`),
    );
    expect(external).toEqual([]);
  });

  it("has no third-party script, frame, embed or stylesheet", () => {
    expect(
      offenders(
        [...APP, "nuxt.config.ts"],
        /<(?:iframe|embed|object)\b|<script[^>]+\bsrc=|rel=["']stylesheet["']|@import\s+url\(/,
      ),
    ).toEqual([]);
  });

  it("offers no download or export", () => {
    expect(
      offenders(
        APP,
        /<a\b[^>]*\bdownload\b|createObjectURL|new Blob\(|showSaveFilePicker/,
      ),
    ).toEqual([]);
  });

  it("sends nothing out of the app: no beacon, socket, analytics or form post", () => {
    expect(
      offenders(
        [...APP, ...SERVER],
        /sendBeacon|new (?:WebSocket|EventSource)\b|gtag\(|dataLayer|plausible|<form\b[^>]*\b(?:action|method)=/i,
      ),
    ).toEqual([]);
  });

  it("fetches only the app's own paths", () => {
    expect(
      offenders([...APP, ...SERVER], /\b\$?fetch\(\s*[`"']https?:/),
    ).toEqual([]);
  });

  it("writes nothing on the server outside its own process", () => {
    expect(
      offenders(
        SERVER,
        /\b(?:writeFile|appendFile|createWriteStream|mkdir)(?:Sync)?\b|\bsetItem(?:Raw)?\(|\bsetCookie\(|\buseCookie\(/,
      ),
    ).toEqual([]);
  });
});

describe("No reader data", () => {
  it("sets no cookie and uses no browser storage but localStorage", () => {
    expect(
      offenders(
        [...APP, "nuxt.config.ts", "shared/seasons.ts"],
        /document\.cookie|useCookie|sessionStorage|indexedDB|caches\.open|navigator\.storage/,
      ),
    ).toEqual([]);
  });

  it("reads and writes localStorage only through the named keys", () => {
    // `shared/storage-keys.ts` lists the keys and single-source.test.ts keeps
    // their names out of other files; here no call may pass a literal.
    const literal = /localStorage\.(?:getItem|setItem|removeItem)\(\s*["'`]/;
    expect(
      offenders([...APP, "nuxt.config.ts", "shared/seasons.ts"], literal),
    ).toEqual([]);
  });

  it("never reads the reader's address or headers except to count requests", () => {
    // The rate limiter is the one place a client address is read; it holds it
    // in memory for a window and writes it nowhere.
    const readers = SERVER.filter((f) =>
      /getRequestIP|getRequestHeaders?\(|x-forwarded-for|remoteAddress/i.test(
        code(f),
      ),
    );
    expect(readers).toEqual(["server/middleware/rate-limit.ts"]);
  });
});
