import {apply_patch} from 'jsonpatch';

function ensurePaths(json: Record<string, unknown>, pathParts: string[]) {
  let current = json;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (part) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }
  }
}

export function setJsonValue(json: Record<string, unknown>, jsonPatchPath: string, value: string) {
  const pathParts = jsonPatchPath.split('/').slice(1);
  ensurePaths(json, pathParts);
  try {
    return apply_patch(json, [{op: 'replace', path: jsonPatchPath, value}]);
  } catch (error) {
    // Catch "Replace operation must point to an existing value!"
    // @see https://github.com/dharmafly/jsonpatch.js/issues/41
    return apply_patch(json, [{op: 'add', path: jsonPatchPath, value}]);
  }
}
