import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'junit'],
    browser: {
      viewport: {
        width: 1920,
        height: 1080
      }
    }
  }
});
