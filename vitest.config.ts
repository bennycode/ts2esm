import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/cli.ts', '!**/index.ts', '!**/start*.ts'],
      provider: 'v8',
      reporter: ['html', 'lcov', 'text'],
    },
    environment: 'node',
    globals: true,
  },
});
