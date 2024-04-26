/**
 * When multiple patterns match a module specifier, the pattern with the longest matching prefix before any * token is used. That's why the length of the matching pattern is being returned instead of just a boolean value.
 * @see https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths
 */
export function isMatchingPath(pattern: string, path: string) {
  const normalized = pattern.replace('/*', '').replace('*', '');
  if (path.startsWith(normalized)) {
    return pattern.length;
  }
  return 0;
}

export function findBestMatch(aliasMap: Record<string, string[]>, path: string) {
  let bestRank = 0;
  let bestMatch = '';
  for (const key of Object.keys(aliasMap)) {
    bestRank = isMatchingPath(key, path);
    if (bestRank) {
      bestMatch = key;
    }
  }
  return bestMatch;
}
