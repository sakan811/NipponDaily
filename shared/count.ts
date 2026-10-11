/**
 * A count as the word prose uses ("four seasons"), and a list of names as
 * prose writes it, so a chapter can say how many of something there are, and
 * name them, from the list that holds them instead of typing either.
 * Data-free and import-free.
 */
const WORDS = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

export const countWord = (n: number): string => WORDS[n] ?? String(n);

/** Capitalised, for a heading. */
export const CountWord = (n: number): string => {
  const w = countWord(n);
  return w[0]!.toUpperCase() + w.slice(1);
};

/** Names as prose lists them: "a", "a and b", "a, b and c". */
export const andList = (items: readonly string[]): string =>
  items.length < 2
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
