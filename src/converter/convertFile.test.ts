import path from 'node:path';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {convertFile} from './convertFile.js';

describe('convertFile', () => {
  const fixtures = path.join(process.cwd(), 'src', 'test', 'fixtures');

  describe('imports', () => {
    it('fixes imports from index files', async () => {
      const projectDir = path.join(fixtures, 'index-import');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const project = ProjectUtil.getProject(projectConfig);

      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('fixes imports when tsconfig has an "include" property', async () => {
      const projectDir = path.join(fixtures, 'tsconfig-include');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const snapshot = path.join(projectDir, 'src', 'consumer.snap.ts');
      const project = ProjectUtil.getProject(projectConfig);

      const sourceFile = project.getSourceFile('consumer.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('turns CJS require statements into ESM imports', async () => {
      const projectDir = path.join(fixtures, 'require-import');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const project = ProjectUtil.getProject(projectConfig);

      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('handles index files referenced with a trailing slash', async () => {
      const projectDir = path.join(fixtures, 'trailing-slash');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const project = ProjectUtil.getProject(projectConfig);

      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('handles files with a Shebang (#!) at the beginning', async () => {
      const projectDir = path.join(fixtures, 'cjs-shebang');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const project = ProjectUtil.getProject(projectConfig);

      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });

    it('handles named imports from require statements', async () => {
      const projectDir = path.join(fixtures, 'cjs-destructuring');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const project = ProjectUtil.getProject(projectConfig);

      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });
  });

  describe('exports', () => {
    it('converts "module.exports" into ESM-exports', async () => {
      const projectDir = path.join(fixtures, 'module-exports');
      const projectConfig = path.join(projectDir, 'tsconfig.json');
      const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
      const project = ProjectUtil.getProject(projectConfig);

      const sourceFile = project.getSourceFile('main.ts')!;
      const modifiedFile = convertFile(sourceFile);

      await expect(modifiedFile?.getFullText()).toMatchFileSnapshot(snapshot);
    });
  });
});
