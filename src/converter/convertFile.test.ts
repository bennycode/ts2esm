import path from 'node:path';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {convertFile} from './convertFile.js';

describe('convertFile', () => {
  const fixtures = path.join(process.cwd(), 'src', 'test', 'fixtures');

  it('fixes imports from index files', async () => {
    const projectDir = path.join(fixtures, 'index-import');
    const projectConfig = path.join(projectDir, 'tsconfig.json');
    const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
    const project = ProjectUtil.getProject(projectConfig);

    const sourceFile = project.getSourceFile('main.ts')!;
    const modifiedFile = convertFile(projectConfig, sourceFile, true);

    await expect(modifiedFile.getText()).toMatchFileSnapshot(snapshot);
  });

  it('fixes imports when tsconfig has an "include" property', async () => {
    const projectDir = path.join(fixtures, 'tsconfig-include');
    const projectConfig = path.join(projectDir, 'tsconfig.json');
    const snapshot = path.join(projectDir, 'src', 'consumer.snap.ts');
    const project = ProjectUtil.getProject(projectConfig);

    const sourceFile = project.getSourceFile('consumer.ts')!;
    const modifiedFile = convertFile(projectConfig, sourceFile, true);

    await expect(modifiedFile.getText()).toMatchFileSnapshot(snapshot);
  });
});
