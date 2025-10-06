import {
  findBestMatch,
  getNormalizedPath,
  hasRelativePath,
  hasPackageExports,
  isMatchingPath,
  removePathAlias,
  removeWildCards,
} from './PathUtil.js';

describe('PathUtil', () => {
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

    it('returns an empty string if there is no match', () => {
      const aliasMap = {
        '@helpers/*': ['./src/helpers/*'],
        '~/*': ['./src/*'],
        'helpers/*': ['./src/helpers/*'],
      };

      const importPath = '../getNumber';

      expect(findBestMatch(aliasMap, importPath)).toBe('');
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

  describe('hasRelativePath', () => {
    it('detects relative imports', () => {
      // relative paths
      expect(hasRelativePath('.')).toBe(true);
      expect(hasRelativePath('..')).toBe(true);
      expect(hasRelativePath('./user')).toBe(true);
      expect(hasRelativePath('../user/UserAPI')).toBe(true);
      expect(hasRelativePath('../test/fixtures.json')).toBe(true);
      // others
      expect(hasRelativePath('node:path')).toBe(false);
      expect(hasRelativePath('vitest')).toBe(false);
    });
  });

  describe('hasPackageExports', () => {
    const packageExportsTestDir = '/home/runner/work/ts2esm/ts2esm/src/test/fixtures/package-exports/node_modules';
    
    it('detects packages with exports field', () => {
      expect(hasPackageExports(`${packageExportsTestDir}/firebase-functions`)).toBe(true);
    });

    it('detects packages without exports field', () => {
      expect(hasPackageExports(`${packageExportsTestDir}/lodash`)).toBe(false);
    });

    it('returns false for non-existent packages', () => {
      expect(hasPackageExports('/non/existent/path')).toBe(false);
    });
  });
});
