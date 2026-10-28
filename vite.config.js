import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}', 'server/**/*.js', 'api/**/*.js'],
      exclude: ['**/*.test.{js,jsx}', 'src/test/**', 'src/main.jsx'],
      reporter: ['text', 'text-summary'],
      thresholds: { statements: 90, branches: 85, functions: 90, lines: 90 },
    },
  },
})
