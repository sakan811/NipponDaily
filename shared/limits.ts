/**
 * The numbers the app's rules turn on, written once so the code that applies
 * them, the tests and the docs that state them all read the same value.
 * Data-free and import-free, so `app/`, `server/` and the node scripts can all
 * use it.
 */

/** The longest search text Explore accepts. */
export const MAX_QUERY_LENGTH = 50;

/** How many matches Explore lists at a time; "Show more" asks for another page.
 *  The list is every word that has opened, so it grows by one each day. */
export const EXPLORE_PAGE_SIZE = 100;

/** The longest part text the API accepts (the longest in the data is far shorter). */
export const MAX_PART_LENGTH = 12;

/** How many words the "More like this" row offers. */
export const RELATED_LIMIT = 6;

/** A shared part is a specific link; a shared process or layer counts for
 *  less the more words carry it (nearly every word is a compound). */
export const RELATED_PART_WEIGHT = 3;

/** Sharing a couple of very common tags (most words are compounds, many are
 *  borrowings) is not a resemblance, so a word needs this much in common to be
 *  offered at all: a part, or several tags that are rare between them. */
export const RELATED_MIN_SCORE = 1.5;

/** The most example sentences an entry carries. */
export const MAX_EXAMPLES = 2;

/** The side of the square KanjiVG draws every kanji on, which the stroke
 *  snapshot, the API and the page's viewBox all use. */
export const STROKE_SQUARE = 109;

/** Patterns lists sets of this many tags (processes plus the layer) up to the
 *  maximum; a pair is already listed on its own. */
export const PATTERN_MIN_COMBINATION = 3;
export const PATTERN_MAX_COMBINATION = 4;
/** How many example words a Patterns row carries. */
export const PATTERN_EXAMPLE_LIMIT = 3;

/** How many readings Patterns lists among the words that sound the same. */
export const SOUND_ALIKE_GROUP_LIMIT = 12;

/** How many other kanji a kanji page names under each part it is built from. */
export const KANJI_ALSO_LIMIT = 8;
