import { vi } from "vitest";
import { config } from "@vue/test-utils";
import {
  ref,
  computed,
  reactive,
  onMounted,
  onUnmounted,
  toValue,
  watch,
} from "vue";

// Make Vue composition functions globally available
(global as any).ref = ref;
(global as any).computed = computed;
(global as any).reactive = reactive;
(global as any).onMounted = onMounted;
(global as any).onUnmounted = onUnmounted;

// Node >= 25 ships its own global `localStorage`, which (without
// --localstorage-file) is a stub lacking clear()/key() and shadows
// happy-dom's. Give DOM tests a real in-memory Storage so they behave the
// same on every Node version (CI runs Node 25).
if (
  typeof document !== "undefined" &&
  typeof globalThis.localStorage?.clear !== "function"
) {
  const store = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return store.size;
    },
    key: (i) => [...store.keys()][i] ?? null,
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
    clear: () => store.clear(),
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: memoryStorage,
  });
}

// Enhanced mock $fetch for all tests with better default responses
const globalMockFetch = vi.fn();
globalMockFetch.mockResolvedValue({
  data: [],
  success: true,
  count: 0,
  timestamp: new Date().toISOString(),
});
(global as any).$fetch = globalMockFetch;

// Mock environment variables
process.env.NODE_ENV = "test";

// Enhanced Nuxt composables mock with more comprehensive coverage
const mockRuntimeConfig = vi.fn(() => ({ public: {} }));

// A working stand-in for Nuxt's useAsyncData: runs the handler straight away
// (as the browser would), re-runs it when a reactive key changes, and exposes
// the same data/error/status/refresh surface. No SSR payload is involved.
const mockUseAsyncData = vi.fn((key: any, handler: any) => {
  const data = ref<unknown>(null);
  const error = ref<unknown>(null);
  const status = ref<"idle" | "pending" | "success" | "error">("idle");
  const refresh = async () => {
    status.value = "pending";
    error.value = null;
    try {
      data.value = await handler({});
      status.value = "success";
    } catch (err) {
      data.value = null;
      error.value = err;
      status.value = "error";
    }
  };
  void refresh();
  if (typeof key !== "string") {
    watch(
      () => toValue(key),
      () => void refresh(),
    );
  }
  return {
    data,
    error,
    status,
    pending: computed(() => status.value === "pending"),
    refresh,
  };
});

vi.mock("#app", () => ({
  useRuntimeConfig: mockRuntimeConfig,
  useAsyncData: mockUseAsyncData,
  useSeoMeta: vi.fn(),
  useHead: vi.fn(),
  useRequestURL: vi.fn(() => new URL("https://nippondaily.test/")),
  useRequestEvent: vi.fn(() => undefined),
  setResponseStatus: vi.fn(),
  useFetch: vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })),
  useRoute: vi.fn(() => ({ path: "/", query: {}, params: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  $fetch: globalMockFetch,
  ref,
  computed,
  reactive,
  onMounted,
  onUnmounted,
  defineNuxtPlugin: vi.fn(),
  defineNuxtRouteMiddleware: vi.fn(),
  navigateTo: vi.fn(),
  abortNavigation: vi.fn(),
  createError: vi.fn((error) => error),
  useError: vi.fn(() => ref(null)),
  clearError: vi.fn(),
}));

// Make useRuntimeConfig globally available for server tests
(global as any).useRuntimeConfig = mockRuntimeConfig;

// Mock H3 utilities for server tests
vi.mock("h3", () => ({
  getQuery: vi.fn(() => ({})),
  getHeader: vi.fn(() => undefined),
  getRouterParam: vi.fn(() => null),
  getCookie: vi.fn(() => null),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  setResponseHeaders: vi.fn(),
  readBody: vi.fn(() => ({})),
  createError: vi.fn((error) => ({
    statusCode: error.statusCode || 500,
    statusMessage: error.statusMessage || "Internal Server Error",
    data: error.data || {},
  })),
  defineEventHandler: vi.fn((handler) => handler),
  toNodeListener: vi.fn(),
  fromNodeMiddleware: vi.fn(),
  fromWebHandler: vi.fn((handler) => handler),
}));

// Make H3 functions globally available for server tests
(global as any).defineEventHandler = vi.fn((handler) => handler);
(global as any).getQuery = vi.fn(() => ({}));
(global as any).getHeader = vi.fn(() => undefined);
(global as any).createError = vi.fn((error) => ({
  statusCode: error.statusCode || 500,
  statusMessage: error.statusMessage || "Internal Server Error",
  data: error.data || {},
}));
(global as any).setResponseHeaders = vi.fn();

// Mock global fetch with enhanced functionality
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    headers: new Map(),
  }),
);

// Configure Vue Test Utils with enhanced mocks
config.global.stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ["to"],
  },
  NuxtLayout: { template: "<div><slot /></div>" },
  UButton: {
    template:
      "<button :disabled=\"disabled\" :class=\"['u-button', block ? 'block' : '', color === 'primary' && variant === 'solid' ? 'bg-[var(--color-primary)]' : '', variant === 'outline' ? 'border' : '']\" @click=\"$emit('click', $event)\">{{ label }}<slot /></button>",
    props: [
      "disabled",
      "loading",
      "color",
      "size",
      "icon",
      "label",
      "block",
      "variant",
    ],
    emits: ["click"],
  },
  UCard: { template: '<div class="u-card"><slot /></div>' },
  UBadge: {
    template: '<span class="u-badge" :class="`badge-${color}`"><slot /></span>',
    props: ["color", "size", "variant"],
  },
  UHeader: {
    template:
      '<header class="u-header" :open="open" @click="$emit(\'update:open\', !open)"><slot name="left" /><slot name="right" /><slot name="body" /></header>',
    props: ["open"],
    emits: ["update:open"],
  },
  UApp: { template: '<div class="u-app"><slot /></div>' },
  USkeleton: { template: '<div class="u-skeleton"><slot /></div>' },
  UColorModeButton: {
    template: '<button class="u-color-mode-button u-button"><slot /></button>',
  },
  UIcon: {
    template: '<span class="u-icon" :name="name" />',
    props: ["name", "class", "aria-hidden"],
  },
  UPage: { template: '<div class="u-page"><slot /></div>' },
  UPageCard: {
    template:
      '<div class="u-page-card"><h3>{{ title }}</h3><p>{{ description }}</p></div>',
    props: ["title", "description", "icon"],
  },
  UFooter: {
    template:
      '<footer class="u-footer"><slot name="left" /><slot name="right" /><slot name="top" /></footer>',
  },
};

config.global.mocks = {
  $fetch: globalMockFetch,
  $route: {
    path: "/",
    query: {},
    params: {},
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
};

// Auto-import Vue composition functions
config.global.plugins = [
  {
    install(app: any) {
      app.config.globalProperties.$ref = ref;
      app.config.globalProperties.$computed = computed;
      app.config.globalProperties.$reactive = reactive;
      app.config.globalProperties.$onMounted = onMounted;
      app.config.globalProperties.$onUnmounted = onUnmounted;
    },
  },
];
