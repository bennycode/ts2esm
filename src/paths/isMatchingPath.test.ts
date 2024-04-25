import {isMatchingPath} from './isMatchingPath.js';

describe('isMatchingPath', () => {
  it('matches paths aliases from tsconfig.json', () => {
    // truthy
    expect(isMatchingPath('@app/*', '@app/dto/AppTokens')).toBe(true);
    expect(isMatchingPath('*', './removeSuffix')).toBe(true);
    expect(isMatchingPath('🐵', '🐵/removeSuffix')).toBe(true);
    expect(isMatchingPath('~/*', '~/layouts/PageLayout.astro')).toBe(true);
    // falsy
    expect(isMatchingPath('@app/*', './removeSuffix')).toBe(false);
    expect(isMatchingPath('🐵', './removeSuffix')).toBe(false);
    expect(isMatchingPath('helpers/*', 'helpers/removeSuffix')).toBe(true);
  });
});
