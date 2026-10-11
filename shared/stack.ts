/**
 * What the project is built with, read from `package.json` so the docs and the
 * README never type a version: the Node range is its `engines`, a framework's
 * major version is its dependency range's. Pure: pass it the parsed
 * `package.json`. Data-free and import-free.
 */

export interface PackageFacts {
  engines?: { node?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** `^22.22.3 || ^24.15.0 || >=26.0.0` as people write it: "22.22.3, 24.15 or 26 and newer". */
export function nodeRangeText(range: string): string {
  const versions = range
    .split("||")
    .map((r) => r.replace(/[\^>=\s]/g, "").replace(/(\.0)+$/, ""));
  return `${versions.slice(0, -1).join(", ")} or ${versions[versions.length - 1]} and newer`;
}

/** The major version a dependency range starts at (`^4.6.0` is 4). */
export function majorOf(pkg: PackageFacts, name: string): number {
  const range = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
  const major = Number(range?.match(/\d+/)?.[0]);
  if (!Number.isInteger(major)) throw new Error(`package.json has no ${name}`);
  return major;
}

/** The facts the docs and README quote. */
export function stackOf(pkg: PackageFacts) {
  if (!pkg.engines?.node) throw new Error("package.json has no engines.node");
  return {
    node: nodeRangeText(pkg.engines.node),
    nuxt: majorOf(pkg, "nuxt"),
    vue: majorOf(pkg, "vue"),
    tailwind: majorOf(pkg, "tailwindcss"),
  };
}
