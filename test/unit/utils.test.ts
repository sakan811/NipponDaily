import { describe, it, expect } from "vitest";
import { getEnvOrConfig } from "~/server/utils/config";

describe("server utils", () => {
  describe("getEnvOrConfig", () => {
    it("returns runtimeConfig value if present", () => {
      // In vitest environment with mock runtime config
      const val = getEnvOrConfig("upstashRedisRestUrl", "NON_EXISTENT_ENV_KEY");
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
});
