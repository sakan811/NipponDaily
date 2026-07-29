import { createHash } from "node:crypto";

/**
 * Standard SHA-256 hashing to generate unique vector article IDs from article URLs.
 */
export function getArticleId(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}
