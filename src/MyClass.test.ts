import {describe, it, expect} from 'vitest';
import {MyClass} from './MyClass.js';

describe('MyClass', () => {
  describe('returnHello', () => {
    it('returns Hello', () => {
      const myInstance = new MyClass();
      expect(myInstance.returnHello()).toBe('Hello');
    });
  });
});
