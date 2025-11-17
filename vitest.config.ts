import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

const resolvePath = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': resolvePath('./app'),
      '@': resolvePath('./app'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setupTests.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './tests/coverage',
    },
  },
});
