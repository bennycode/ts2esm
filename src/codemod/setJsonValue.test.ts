import {setJsonValue} from './setJsonValue.js';

describe('setJsonValue', () => {
  it('adds a missing property', () => {
    const before = {
      key: 'value',
    };
    const after = setJsonValue(before, '/type', 'module');
    expect(after.key).toBe('value');
    expect(after.type).toBe('module');
  });

  it('replaces a property', () => {
    const before = {
      key: 'value',
      type: 'commonjs',
    };
    const after = setJsonValue(before, '/type', 'module');
    expect(after.key).toBe('value');
    expect(after.type).toBe('module');
  });

  it('keeps a property', () => {
    const before = {
      key: 'value',
      type: 'module',
    };
    const after = setJsonValue(before, '/type', 'module');
    expect(after.key).toBe('value');
    expect(after.type).toBe('module');
  });

  it('adds sub-properties', () => {
    const before = {
      key: 'value',
    };
    // TODO: Handle a path that doesn't exist yet
    const after = setJsonValue(before, '/compilerOptions/module', 'nodenext');
    expect(after.key).toBe('value');
    expect(after.compilerOptions.module).toBe('nodenext');
  });
});
