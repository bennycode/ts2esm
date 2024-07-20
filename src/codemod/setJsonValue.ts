import JSON5 from 'json5';

export function setJsonValue(json: Record<string, string>, key: string, value: string) {
  const clone = JSON5.parse(JSON5.stringify(json));
  clone[key] = value;
  return clone;
}
