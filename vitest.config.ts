import { defineConfig } from "vitest/config";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [vue(), tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: ["./test/setup.ts"],
    environment: "happy-dom",
    include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    environmentMatchGlobs: [
      ["test/server/**", "node"],
      ["test/unit/**", "happy-dom"],
    ],
    coverage: {
      provider: "v8",
      reporter: ["text"],
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
