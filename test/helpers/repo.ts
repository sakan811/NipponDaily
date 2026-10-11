import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** The repo root, for the tests that read the project's own files. */
export const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** A repo-relative file's text. */
export const read = (p: string): string => readFileSync(join(ROOT, p), "utf8");

/** Every file under `dir` with one of the extensions, as repo-relative paths. */
export const walk = (dir: string, exts: string[]): string[] =>
  readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((d) =>
    d.isDirectory()
      ? walk(join(dir, d.name), exts)
      : exts.some((e) => d.name.endsWith(e))
        ? [join(dir, d.name)]
        : [],
  );
