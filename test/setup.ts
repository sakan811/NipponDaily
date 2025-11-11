import { vi } from "vitest";
import { config } from "@vue/test-utils";
import { ref, computed, reactive, onMounted, onUnmounted } from "vue";

// Make Vue composition functions globally available
(global as any).ref = ref;
(global as any).computed = computed;
(global as any).reactive = reactive;
(global as any).onMounted = onMounted;
(global as any).onUnmounted = onUnmounted;

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
const mockRuntimeConfig = vi.fn(() => ({
  geminiApiKey: "test-api-key",
  geminiModel: "gemini-1.5-flash",
  tavilyApiKey: "test-tavily-key",
  public: {
    apiBase: "/api",
  },
}));

vi.mock("#app", () => ({
  useRuntimeConfig: mockRuntimeConfig,
  useFetch: vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })),
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
  getRouterParam: vi.fn(() => null),
  getCookie: vi.fn(() => null),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  readBody: vi.fn(() => ({})),
  createError: vi.fn((error) => ({
    statusCode: error.statusCode || 500,
    statusMessage: error.statusMessage || "Internal Server Error",
    data: error.data || {},
  })),
  defineEventHandler: vi.fn((handler) => handler),
  toNodeListener: vi.fn(),
  fromNodeMiddleware: vi.fn(),
}));

// Make H3 functions globally available for server tests
(global as any).defineEventHandler = vi.fn((handler) => handler);
(global as any).getQuery = vi.fn(() => ({}));
(global as any).createError = vi.fn((error) => ({
  statusCode: error.statusCode || 500,
  statusMessage: error.statusMessage || "Internal Server Error",
  data: error.data || {},
}));

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

// Mock Google GenAI for service tests
const mockGenerateContent = vi.fn(() =>
  Promise.resolve({
    text: JSON.stringify([
      {
        title: "Test News",
        summary: "Test Summary",
        content: "Test Content",
        source: "Test Source",
        publishedAt: "2024-01-15T10:00:00Z",
        category: "Technology",
        url: "https://example.com/test",
      },
    ]),
  }),
);

// Create a proper constructor mock for GoogleGenAI
class MockGoogleGenAI {
  models = {
    generateContent: mockGenerateContent,
  };

  constructor(options: any) {
    // Constructor mock - handle the apiKey parameter
    return this;
  }
}

vi.mock("@google/genai", () => ({
  GoogleGenAI: MockGoogleGenAI,
}));

// Mock Tavily for service tests
const mockTavilyClient: any = {
  search: vi.fn(),
};

vi.mock("@tavily/core", () => ({
  tavily: vi.fn(() => mockTavilyClient),
}));

export { mockTavilyClient, mockGenerateContent };

// Configure Vue Test Utils with enhanced mocks
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

// Global test utilities
export const createMockNews = (overrides: any = {}) => ({
  title: "Test News Article",
  summary: "This is a test summary",
  content: "This is test content",
  source: "Test Source",
  publishedAt: "2024-01-15T10:00:00Z",
  category: "Technology",
  url: "https://example.com/test",
  ...overrides,
});

export const createMockErrorResponse = (message: string, statusCode = 500) => ({
  data: {
    error: message,
    statusCode,
  },
});

export const resetAllMocks = () => {
  vi.clearAllMocks();
  globalMockFetch.mockResolvedValue({
    data: [],
    success: true,
    count: 0,
    timestamp: new Date().toISOString(),
  });
};

// Add custom matchers
import type { MatcherFunction } from "vitest";

const toBeInTheDocument: MatcherFunction = function (received) {
  // Use happy-dom's document implementation
  const pass =
    received &&
    typeof document !== "undefined" &&
    document.documentElement.contains(received);
  return {
    message: () =>
      pass
        ? `expected element not to be in the document`
        : `expected element to be in the document`,
    pass,
  };
};

const toHaveBeenCalledWithFetchOptions: MatcherFunction = function (
  received,
  expectedOptions,
) {
  const pass =
    received &&
    expectedOptions &&
    received.mock.calls.some((call: any) => {
      const [url, options] = call;
      return (
        url === expectedOptions.url &&
        JSON.stringify(options) === JSON.stringify(expectedOptions.options)
      );
    });

  return {
    message: () =>
      pass
        ? `expected $fetch not to have been called with ${JSON.stringify(expectedOptions)}`
        : `expected $fetch to have been called with ${JSON.stringify(expectedOptions)}`,
    pass,
  };
};

expect.extend({
  toBeInTheDocument,
  toHaveBeenCalledWithFetchOptions,
});

declare module "vitest" {
  interface Assertion<T = any> {
    toBeInTheDocument(): T;
    toHaveBeenCalledWithFetchOptions(options: {
      url: string;
      options?: any;
    }): T;
  }
}

// Note: Test cleanup should be handled in individual test files using afterEach
// export resetAllMocks for use in test files
