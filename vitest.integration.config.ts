import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vitest configuration for integration tests
 *
 * Integration tests require external services (e.g., Redis via SRH) to be running.
 * These tests are not run as part of the normal test suite.
 *
 * Run with: pnpm test:integration
 */
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), "");
  // Merge loaded env into process.env so they are available in tests
  process.env = { ...process.env, ...env };

  return {
    plugins: [tsconfigPaths()],
    test: {
      globals: true,
      // No setupFiles needed for integration tests - we use dynamic imports
      environment: "node",
      include: [
        "test/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      ],
      exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
      testTimeout: 30000, // 30 second timeout for integration tests
      hookTimeout: 30000,
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        include: ["server/**/*.ts"],
        exclude: [
          "node_modules/",
          "test/",
          "dist/",
          "**/*.d.ts",
          "coverage/",
          "nuxt.config.ts",
          "app.config.ts",
          "*.config.{ts,js,mjs,cjs}",
          ".nuxt/**",
          ".output/**",
          "scripts/**",
        ],
      },
    },
    resolve: {
      alias: {
        "~": resolve(__dirname, "."),
        "@": resolve(__dirname, "."),
        "~~": resolve(__dirname, "."),
        "@@": resolve(__dirname, "."),
      },
    },
  };
});
