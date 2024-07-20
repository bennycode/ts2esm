import fs from 'node:fs';
import jju from 'jju';

export async function loadJSON(filePath: string) {
  const data = fs.readFileSync(filePath, 'utf8');
  // We use JSON5 so that we can support commments and commas in config files
  return jju.parse(data);
}
