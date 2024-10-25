import path from 'node:path';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {convertFile} from './convertFile.js';

describe.only('convertFile', () => {
  const fixtures = path.join(process.cwd(), 'src', 'test', 'fixtures');

  it('fixes imports from index files', async () => {
    const projectDir = path.join(fixtures, 'index-import');
    const projectConfig = path.join(projectDir, 'tsconfig.json');
    const snapshot = path.join(projectDir, 'src', 'main.snap.ts');
    const project = ProjectUtil.getProject(projectConfig);

    const sourceFile = project.getSourceFile('main.ts')!;
    const modifiedFile = convertFile(project, sourceFile, true);

    await expect(modifiedFile.getText()).toMatchFileSnapshot(snapshot);
  });

  it.todo('fixes imports when tsconfig has an "include" property');
});
