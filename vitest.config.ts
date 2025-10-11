import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '**/*.d.ts',
        'coverage/',
        'nuxt.config.ts',
        'app.config.ts',
        '*.config.{ts,js,mjs,cjs}',
        '.nuxt/**'
      ]
    }
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.')
    }
  },
  projects: [
    {
      test: {
        name: 'unit',
        include: ['test/unit/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        environment: 'jsdom',
      },
    },
    {
      test: {
        name: 'server',
        include: ['test/server/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        environment: 'node',
      },
    },
  ],
})