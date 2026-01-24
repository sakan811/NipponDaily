import { defineConfig } from "vitest/config";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [vue(), tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: ["./test/setup.ts"],
    // Unit tests only - no integration tests here
    projects: [
      // Client-side unit tests (Vue components, happy-dom)
      {
        extends: true,
        test: {
          environment: "happy-dom",
          include: ["test/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
          exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
        },
      },
      // Server-side unit tests (Node environment)
      {
        extends: true,
        test: {
          environment: "node",
          include: ["test/server/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
          exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
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
});
