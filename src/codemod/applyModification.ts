import fs from 'node:fs';
import {loadJSON} from './loadJSON.js';
import {getJsonDiff} from './getJsonDiff.js';
import {confirm} from '@inquirer/prompts';
import {setJsonValue} from './setJsonValue.js';
import JSON5 from 'json5';

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
        fs.writeFileSync(jsonPath, JSON5.stringify(modified, {quote: '"', space: 2}));
        return true;
      }
      return false;
    }
  }
  return false;
}
