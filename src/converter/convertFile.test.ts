import path from 'node:path';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {convertFile} from './convertFile.js';

describe('convertFile', () => {
  function testFileConversion(directoryName: string, fileName = 'main', extension = 'ts') {
    const fixtures = path.join(process.cwd(), 'src', 'test', 'fixtures');
    const projectDir = path.join(fixtures, directoryName);
    const projectConfig = path.join(projectDir, 'tsconfig.json');
    const project = ProjectUtil.getProject(projectConfig);

    const snapshot = path.join(projectDir, 'src', `${fileName}.snap.${extension}`);
    const sourceFileName = `${fileName}.${extension}`;
    const sourceFile = project.getSourceFile(sourceFileName);
    if (!sourceFile) {
      throw new Error(`File "${sourceFileName}" not found.`);
    }
    const modifiedFile = convertFile(sourceFile);
    if (!modifiedFile) {
      throw new Error(`File "${sourceFileName}" was not converted.`);
    }
    return expect(modifiedFile.getFullText()).toMatchFileSnapshot(snapshot);
  }

  describe('imports', () => {
    it('converts imports from index files', async () => {
      await testFileConversion('index-import');
    });

    it('converts imports when tsconfig has an "include" property', async () => {
      await testFileConversion('tsconfig-include', 'consumer');
    });

    it('converts CJS require statements into ESM imports', async () => {
      await testFileConversion('require-import');
    });

    it('converts dynamic imports', async () => {
      await testFileConversion('dynamic-imports');
    });

    it('handles index files referenced with a trailing slash', async () => {
      await testFileConversion('trailing-slash');
    });

    it('handles files with a Shebang (#!) at the beginning', async () => {
      await testFileConversion('cjs-shebang');
    });

    it('handles named imports from require statements', async () => {
      await testFileConversion('cjs-destructuring');
    });
  });

  describe('exports', () => {
    describe('CJS (module.exports) to ESM', () => {
      it('converts default and named exports', async () => {
        await testFileConversion('module-exports');
      });

      it('converts multiple named exports', async () => {
        await testFileConversion('module-exports', 'multiple-named-exports');
      });

      it('handles functions exported as default from plain JavaScript files', async () => {
        await testFileConversion('module-exports-function-js', 'build-example-index', 'js');
        await testFileConversion('module-exports-function-js', 'build-example-index-markdown', 'js');
      });
    });
  });
});
