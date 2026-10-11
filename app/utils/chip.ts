/** The classes of a filter chip: pressed, idle, or idle with nothing to pick. */
export const chipClass = (pressed: boolean, empty: boolean): string =>
  [
    "season-chip inline-flex items-center gap-1.5 border px-3 py-1 text-sm transition-colors",
    pressed
      ? "border-primary-500 bg-primary-500/10 text-primary-700 dark:text-primary-300"
      : "border-stone-500 bg-white dark:bg-stone-900/50 hover:border-primary-500",
    empty && !pressed ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
  ].join(" ");
