import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './')
    },
    include: ['**/*.test.tsx', '**/*.test.ts'],
    exclude: ['node_modules', 'editron-starters/**', 'tests/smoke/**']
  }
})
