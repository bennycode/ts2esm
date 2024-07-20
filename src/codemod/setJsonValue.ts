import jju from 'jju';

export function setJsonValue(json: Record<string, string>, key: string, value: string) {
  const clone = jju.parse(jju.stringify(json));
  clone[key] = value;
  return clone;
}
