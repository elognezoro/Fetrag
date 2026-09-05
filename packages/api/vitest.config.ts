import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
    env: {
      LOG_LEVEL: 'error',
      AUTH_SECRET: 'test-secret-for-vitest-only-0123456789',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    },
  },
})
