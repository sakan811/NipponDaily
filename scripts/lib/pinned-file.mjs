/**
 * A source file pinned by size and checksum: downloaded once to a cache, or
 * named on the command line, and refused if it is not the pinned bytes. The
 * data builds are otherwise offline and deterministic.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const sha256Hex = (data) =>
  createHash("sha256").update(data).digest("hex");

/** Throws unless `data` is the pinned file `what` (`{ bytes, sha256 }`). */
export function assertPinned(data, pin, what, where = what) {
  const sha = sha256Hex(data);
  if (data.length !== pin.bytes || sha !== pin.sha256)
    throw new Error(
      `${where} is not the pinned ${what} (expected ${pin.bytes} bytes and sha256 ${pin.sha256}, got ${data.length} and ${sha})`,
    );
}

/**
 * The pinned file's bytes. With `path` (a `--file` flag) that file is read;
 * otherwise `cacheFile` is downloaded from `url` if it is not there yet. Either
 * way it is checked against `pin`.
 */
export async function pinnedFile({ path, cacheFile, url, label, what, pin }) {
  let file = path;
  if (!file) {
    file = cacheFile;
    if (!existsSync(file)) {
      mkdirSync(dirname(file), { recursive: true });
      console.log(`Downloading ${label}…`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    }
  }
  const data = readFileSync(file);
  assertPinned(data, pin, what, file);
  return data;
}
