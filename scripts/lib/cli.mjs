/** What every data script starts from: the repo root and its command line. */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export const args = process.argv.slice(2);

/** The value after `--name`, or undefined. */
export const flagValue = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
