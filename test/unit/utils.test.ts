import { describe, it, expect } from "vitest";
import { getEnvOrConfig } from "~/server/utils/config";
import { deduplicateByUrl } from "~/server/utils/dedupe";

describe("server utils", () => {
  describe("getEnvOrConfig", () => {
    it("returns runtimeConfig value if present", () => {
      // In vitest environment with mock runtime config
      const val = getEnvOrConfig("tavilyApiKey", "NON_EXISTENT_ENV_KEY");
      expect(typeof val).toBe("string");
    });

    it("returns empty string if neither runtimeConfig nor process.env is set", () => {
      const origEnv = process.env.TEST_UNSET_KEY_XYZ;
      delete process.env.TEST_UNSET_KEY_XYZ;

      const result = getEnvOrConfig(
        "nonExistentConfigKey",
        "TEST_UNSET_KEY_XYZ",
      );
      expect(result).toBe("");

      if (origEnv !== undefined) {
        process.env.TEST_UNSET_KEY_XYZ = origEnv;
      }
    });

    it("returns fallback process.env when runtimeConfig fails or is empty", () => {
      process.env.TEST_FALLBACK_KEY_123 = "  env_value_123  ";
      const result = getEnvOrConfig(
        "nonExistentConfigKey",
        "TEST_FALLBACK_KEY_123",
      );
      expect(result).toBe("env_value_123");
      delete process.env.TEST_FALLBACK_KEY_123;
    });
  });

  describe("deduplicateByUrl", () => {
    it("deduplicates articles by url", () => {
      const items = [
        { url: "https://example.com/1", title: "Title 1" },
        { url: "https://example.com/1", title: "Duplicate Title" },
        { url: "https://example.com/2", title: "Title 2" },
      ];
      const result = deduplicateByUrl(items);
      expect(result).toHaveLength(2);
      expect(result[0]?.url).toBe("https://example.com/1");
      expect(result[1]?.url).toBe("https://example.com/2");
    });

    it("deduplicates articles by title when url is missing", () => {
      const items = [
        { title: "Title A" },
        { title: "Title A" },
        { title: "Title B" },
      ];
      const result = deduplicateByUrl(items);
      expect(result).toHaveLength(2);
      expect(result[0]?.title).toBe("Title A");
      expect(result[1]?.title).toBe("Title B");
    });

    it("handles empty items or items with no key", () => {
      const items = [{ url: "" }, { title: "" }];
      const result = deduplicateByUrl(items);
      expect(result).toHaveLength(0);
    });
  });
});
