import { findBestMatch, getNormalizedPath, isMatchingPath, removePathAlias, removeWildCards } from './PathAliasUtil.js';

describe('PathAliasUtil', () => {
  describe('removeWildCards', () => {
    it('removes asterisks from type alias patterns', () => {
      expect(removeWildCards('@helpers/*')).toBe('@helpers');
    });
  });

  describe('removePathAlias', () => {
    it('removes path alias prefixes from an import path', () => {
      expect(removePathAlias('@helpers/*', '@helpers/removeSuffix')).toBe('removeSuffix');
    });
  });

  describe('findBestMatch', () => {
    it('finds the best matching path alias', () => {
      /** @see https://www.typescriptlang.org/docs/handbook/modules/reference.html#wildcard-substitutions */
      const aliasMap = {
        '*': ['./src/foo/one.ts'],
        'foo/*': ['./src/foo/two.ts'],
        'foo/bar': ['./src/foo/three.ts'],
      };

      const importPath = 'foo/bar';

      expect(findBestMatch(aliasMap, importPath)).toBe('foo/bar');
    });
  });

  describe('isMatchingPath', () => {
    it('matches paths aliases from tsconfig.json', () => {
      // truthy
      expect(isMatchingPath('@app/*', '@app/dto/AppTokens')).toBeTruthy();
      expect(isMatchingPath('*', './removeSuffix')).toBeTruthy();
      expect(isMatchingPath('~/*', '~/layouts/PageLayout.astro')).toBeTruthy();
      expect(isMatchingPath('🐵', '🐵/removeSuffix')).toBeTruthy();
      expect(isMatchingPath('helpers/*', 'helpers/removeSuffix')).toBeTruthy();
      // falsy
      expect(isMatchingPath('@app/*', './removeSuffix')).toBeFalsy();
      expect(isMatchingPath('🐵', './removeSuffix')).toBeFalsy();
    });
  });

  describe('getNormalizedPath', () => {
    const projectDirectory = '/home/bennycode/dev/bennycode/ts-demo-npm-cjs';

    const expectation = `${projectDirectory}/src/helpers/removeSuffix`;

    const info = {
      normalized: '@helpers/removeSuffix',
      pathAlias: '@helpers/*',
      quoteSymbol: '"',
    };

    const paths = {
      '@helpers/*': ['./src/helpers/*'],
      '~/*': ['./src/*'],
      'helpers/*': ['./src/helpers/*'],
    };

    expect(getNormalizedPath(projectDirectory, info, paths)).toBe(expectation);
  });
});
