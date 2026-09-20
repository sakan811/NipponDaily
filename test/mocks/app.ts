/**
 * Resolution target for the "#app" alias in vitest.config.ts.
 *
 * Nuxt provides "#app" as a real virtual module at build/dev time, but
 * plain Vite (which is all this test config runs) has no such module —
 * so any `import ... from "#app"` needs somewhere real to resolve to.
 * `test/setup.ts`'s `vi.mock("#app", ...)` replaces this file's exports
 * with test doubles at runtime; these are just fallback implementations
 * for the type checker and for any code path vi.mock doesn't intercept.
 */
export function useRoute() {
  return { path: "/", query: {}, params: {} };
}
