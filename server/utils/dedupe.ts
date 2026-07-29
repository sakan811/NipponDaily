/**
 * Helper to deduplicate array of articles or sources by URL (or title if URL is missing).
 */
export function deduplicateByUrl<T extends { url?: string; title?: string }>(
  items: T[],
): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    const key = item.url || item.title;
    if (key && !map.has(key)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}
