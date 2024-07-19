export async function loadJSON(filename: string) {
  const json = await import(filename, {
    with: {type: 'json'},
  });

  return json.default;
}
