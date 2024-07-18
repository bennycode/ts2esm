import fs from 'node:fs';
import {loadJSON} from './loadJSON.js';
import {getJsonDiff} from './getJsonDiff.js';
import {confirm} from '@inquirer/prompts';
import {modifyJson} from './modifyJson.js';

export async function applyModification(packageJsonPath: string) {
  if (fs.existsSync(packageJsonPath)) {
    const pkg = await loadJSON(packageJsonPath);
    const modified = modifyJson(JSON.stringify(pkg));
    const diff = getJsonDiff(pkg, modified);
    if (diff) {
      console.log('Your "package.json" file needs this modification:');
      console.log(diff);
      const yes = await confirm({message: 'Shall it be applied?'});
      if (yes) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(modified, null, 2));
        return true;
      }
      return false;
    }
  }
  return false;
}
