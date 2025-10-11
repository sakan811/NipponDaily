import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Nuxt composables
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    geminiApiKey: 'test-api-key',
    geminiModel: 'gemini-1.5-flash'
  }),
  useFetch: vi.fn(),
  $fetch: vi.fn()
}))

// Mock global fetch
global.fetch = vi.fn()

// Configure Vue Test Utils
config.global.mocks = {
  $fetch: vi.fn()
}

// Add custom matchers if needed
import type { MatcherFunction } from 'vitest'

const toBeInTheDocument: MatcherFunction = function (received) {
  const pass = received && document.body.contains(received)
  return {
    message: () =>
      pass
        ? `expected element not to be in the document`
        : `expected element to be in the document`,
    pass,
  }
}

expect.extend({ toBeInTheDocument })

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): T
  }
}