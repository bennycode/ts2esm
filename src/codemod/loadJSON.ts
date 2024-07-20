import fs from 'node:fs';
import JSON5 from 'json5';

export async function loadJSON(filePath: string) {
  const data = fs.readFileSync(filePath, 'utf8');
  // We use JSON5 so that we can support commments and commas in config files
  return JSON5.parse(data);
}
