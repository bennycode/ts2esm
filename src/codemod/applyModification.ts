import {confirm} from '@inquirer/prompts';
import fs from 'node:fs';
import {getJsonDiff} from './getJsonDiff.js';
import {loadJSON} from './loadJSON.js';
import {setJsonValue} from './setJsonValue.js';
import jju from 'jju';

export async function applyModification(jsonPath: string, key: string, value: string) {
  if (fs.existsSync(jsonPath)) {
    const pkg: Record<string, string> = await loadJSON(jsonPath);
    const modified = setJsonValue(pkg, key, value);
    const diff = getJsonDiff(pkg, modified);
    if (diff) {
      console.log(`Your "${jsonPath}" file needs this modification:`);
      console.log(diff);
      const yes = await confirm({message: 'Shall it be applied?'});
      if (yes) {
        fs.writeFileSync(jsonPath, jju.stringify(modified, {mode: 'json'}));
        return true;
      }
      return false;
    }
  }
  return false;
}
