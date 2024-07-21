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

  it('adds new paths if needed', () => {
    const before = {
      key: 'value',
    };
    const after: any = setJsonValue(before, '/compilerOptions/abc/xyz/module', 'nodenext');
    expect(after.key).toBe('value');
    expect(after.compilerOptions.abc.xyz.module).toBe('nodenext');
  });

  it('adds new sub-paths if needed', () => {
    const before = {
      key: 'value',
      compilerOptions: {
        abc: {},
      },
    };
    const after: any = setJsonValue(before, '/compilerOptions/abc/xyz/module', 'nodenext');
    expect(after.key).toBe('value');
    expect(after.compilerOptions.abc.xyz.module).toBe('nodenext');
  });

  it('replaces properties in an added sub-paths', () => {
    const before = {
      key: 'value',
      compilerOptions: {
        module: 'commonjs',
      },
    };
    const after: any = setJsonValue(before, '/compilerOptions/module', 'nodenext');
    expect(after.key).toBe('value');
    expect(after.compilerOptions.module).toBe('nodenext');
  });
});
