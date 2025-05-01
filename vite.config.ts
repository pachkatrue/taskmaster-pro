import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [...configDefaults.exclude],
    reporters: ['default', 'json'],
    outputFile: 'public/vitest-report.json',
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'text'],
      reportsDirectory: 'public/coverage',
      all: true,
    },
  },
});