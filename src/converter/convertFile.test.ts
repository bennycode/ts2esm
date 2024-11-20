import path from 'node:path';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {convertFile} from './convertFile.js';

describe('convertFile', () => {
  const fixtures = path.join(process.cwd(), 'src', 'test', 'fixtures');

  describe('imports', () => {
    it('fixes imports from index files', async () => {
      const projectDir = path.join(fixtures, 'index-import');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const project = ProjectUtil.getProject(projectConfig);

      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('fixes imports when tsconfig has an "include" property', async () => {
      const projectDir = path.join(fixtures, 'tsconfig-include');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const project = ProjectUtil.getProject(projectConfig);

      const snapshot = path.join(projectDir, 'src', 'consumer.snap.ts');
      const sourceFile = project.getSourceFile('consumer.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('turns CJS require statements into ESM imports', async () => {
      const projectDir = path.join(fixtures, 'require-import');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const project = ProjectUtil.getProject(projectConfig);

      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('handles index files referenced with a trailing slash', async () => {
      const projectDir = path.join(fixtures, 'trailing-slash');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const project = ProjectUtil.getProject(projectConfig);

      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('handles files with a Shebang (#!) at the beginning', async () => {
      const projectDir = path.join(fixtures, 'cjs-shebang');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const project = ProjectUtil.getProject(projectConfig);

      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('handles named imports from require statements', async () => {
      const projectDir = path.join(fixtures, 'cjs-destructuring');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const project = ProjectUtil.getProject(projectConfig);

      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });
  });

  describe('exports', () => {
    it.only('converts "module.exports" into ESM-exports', async () => {
      const projectDir = path.join(fixtures, 'module-exports');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const project = ProjectUtil.getProject(projectConfig);

      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      const multipleNamedExports = project.getSourceFile('multiple-named-exports.ts')!;
      const multipleNamedExportsActual = convertFile(multipleNamedExports);
      const multipleNamedExportsExpected = path.join(projectDir, 'src', 'multiple-named-exports.snap.ts');

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
      await expect(multipleNamedExportsActual?.getFullText()).toMatchFileSnapshot(multipleNamedExportsExpected);
    });

    it('handles functions exported as default from plain JavaScript files', async () => {
      const projectDir = path.join(fixtures, 'module-exports-function-js');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const project = ProjectUtil.getProject(projectConfig);

      const snapshot = path.join(projectDir, 'src', 'build-example-index.snap.js');
      const snapshot2 = path.join(projectDir, 'src', 'build-example-index-markdown.snap.js');

      const sourceFile = project.getSourceFile('build-example-index.js')!;
      const modifiedFile = convertFile(sourceFile);

      const sourceFile2 = project.getSourceFile('build-example-index-markdown.js')!;
      const modifiedFile2 = convertFile(sourceFile2);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
      await expect(modifiedFile2?.getFullText()).toMatchFileSnapshot(snapshot2);
    });
  });
});
