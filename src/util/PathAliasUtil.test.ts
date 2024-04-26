import {isMatchingPath} from './PathAliasUtil.js';

describe('PathAliasUtil', () => {
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
});
