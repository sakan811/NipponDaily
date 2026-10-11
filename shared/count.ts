/**
 * A count as the word prose uses ("four seasons"), so a chapter can say how
 * many of something there are from the list that holds them instead of typing
 * the number. Data-free and import-free.
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
