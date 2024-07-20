import jju from 'jju';
import {apply_patch} from 'jsonpatch';

export function setJsonValue(json: Record<string, string>, jsonPatchPath: string, value: string) {
  const clone = jju.parse(jju.stringify(json));
  try {
    return apply_patch(clone, [{op: 'replace', path: jsonPatchPath, value}]);
  } catch (error) {
    // Catch "Replace operation must point to an existing value!"
    return apply_patch(clone, [{op: 'add', path: jsonPatchPath, value}]);
  }
}
