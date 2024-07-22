import {diffString} from 'json-diff';

export function getJsonDiff(a: unknown, b: unknown) {
  const diff = diffString(a, b);
  if (diff.length === 0) {
    return null;
  }
  return diff;
}
