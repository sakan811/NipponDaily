import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'

// Make Vue composition functions globally available
;(global as any).ref = ref
;(global as any).computed = computed
;(global as any).reactive = reactive
;(global as any).onMounted = onMounted
;(global as any).onUnmounted = onUnmounted

// Mock Nuxt composables
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    geminiApiKey: 'test-api-key',
    geminiModel: 'gemini-1.5-flash'
  }),
  useFetch: vi.fn(),
  $fetch: vi.fn(),
  ref,
  computed,
  reactive,
  onMounted,
  onUnmounted
}))

// Make $fetch globally available
;(global as any).$fetch = vi.fn()

// Mock global fetch
global.fetch = vi.fn()

// Configure Vue Test Utils
config.global.mocks = {
  $fetch: vi.fn()
}

// Auto-import Vue composition functions
config.global.plugins = [
  {
    install(app: any) {
      app.config.globalProperties.$ref = ref
      app.config.globalProperties.$computed = computed
      app.config.globalProperties.$reactive = reactive
      app.config.globalProperties.$onMounted = onMounted
      app.config.globalProperties.$onUnmounted = onUnmounted
    }
  }
]

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