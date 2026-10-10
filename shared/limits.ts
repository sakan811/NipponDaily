/**
 * The numbers the app's rules turn on, written once so the code that applies
 * them, the tests and the docs that state them all read the same value.
 * Data-free and import-free, so `app/`, `server/` and the node scripts can all
 * use it.
 */

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
