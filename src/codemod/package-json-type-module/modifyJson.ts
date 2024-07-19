import {apply_patch} from 'jsonpatch';

export function modifyJson(text: string) {
  const json = JSON.parse(text);
  try {
    return apply_patch(json, [{op: 'replace', path: '/type', value: 'module'}]);
  } catch (error) {
    // Catch "Replace operation must point to an existing value!"
    return apply_patch(json, [{op: 'add', path: '/type', value: 'module'}]);
  }
}
