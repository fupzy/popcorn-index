import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', ['junit', { outputFile: './dist/test/test-results.xml' }]],
    browser: {
      viewport: {
        width: 1920,
        height: 1080
      }
    }
  }
});
