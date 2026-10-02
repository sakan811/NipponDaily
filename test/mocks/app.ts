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

export function useRouter() {
  return { push: () => {}, replace: () => {} };
}

export function useRuntimeConfig() {
  return { public: {} };
}

export function useAsyncData() {
  return { data: null, error: null, status: "idle", refresh: async () => {} };
}

export function useSeoMeta() {}

export function useHead() {}

export function useRequestURL() {
  return new URL("https://nippondaily.test/");
}

export function useRequestEvent() {
  return undefined;
}

export function setResponseStatus() {}
