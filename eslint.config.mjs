import {defineConfig, globalIgnores} from 'eslint/config';
import eslintConfig from '@tstv/eslint-config';

export default defineConfig([
  globalIgnores(['coverage/', 'dist/', 'eslint.config.mjs', 'vitest.config.ts', 'src/test/fixtures/']),
  {
    extends: [eslintConfig],
    files: ['**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
]);
