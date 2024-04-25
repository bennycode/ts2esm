/**
 * Note: When multiple patterns match a module specifier, the pattern with the longest matching prefix before any * token is used.
 * @see https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths
 */
export function isMatchingPath(pattern: string, path: string) {
  const normalized = pattern.replace('/*', '').replace('*', '');
  return path.startsWith(normalized);
}
