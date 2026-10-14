/**
 * Reads one file out of a zip archive's bytes (stored or deflated), enough for
 * the small archives the builders pin. Node has no zip reader of its own.
 */
import { inflateRawSync } from "node:zlib";

const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const CENTRAL_DIRECTORY_FILE = 0x02014b50;
const LOCAL_FILE = 0x04034b50;

/** The names of the files in the archive. */
export function zipNames(data) {
  return centralDirectory(data).map((e) => e.name);
}

/** The bytes of the file called `name`; throws when the archive has none. */
export function readZipFile(data, name) {
  const entry = centralDirectory(data).find((e) => e.name === name);
  if (!entry) throw new Error(`the archive has no file called ${name}`);
  if (data.readUInt32LE(entry.offset) !== LOCAL_FILE)
    throw new Error(`${name}: bad local file header`);
  const start =
    entry.offset +
    30 +
    data.readUInt16LE(entry.offset + 26) +
    data.readUInt16LE(entry.offset + 28);
  const packed = data.subarray(start, start + entry.compressedSize);
  if (entry.method === 0) return Buffer.from(packed);
  if (entry.method === 8) return inflateRawSync(packed);
  throw new Error(`${name}: compression method ${entry.method} is not read`);
}

function centralDirectory(data) {
  let end = data.length - 22;
  while (end >= 0 && data.readUInt32LE(end) !== END_OF_CENTRAL_DIRECTORY) end--;
  if (end < 0) throw new Error("not a zip archive");
  const count = data.readUInt16LE(end + 10);
  let at = data.readUInt32LE(end + 16);
  const entries = [];
  for (let i = 0; i < count; i++) {
    if (data.readUInt32LE(at) !== CENTRAL_DIRECTORY_FILE)
      throw new Error("bad central directory");
    const nameLength = data.readUInt16LE(at + 28);
    entries.push({
      method: data.readUInt16LE(at + 10),
      compressedSize: data.readUInt32LE(at + 20),
      offset: data.readUInt32LE(at + 42),
      name: data.toString("utf8", at + 46, at + 46 + nameLength),
    });
    at +=
      46 + nameLength + data.readUInt16LE(at + 30) + data.readUInt16LE(at + 32);
  }
  return entries;
}
