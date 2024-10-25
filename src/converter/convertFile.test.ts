import path from 'node:path';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {convertFile} from './convertFile.js';

describe('convertFile', () => {
  const fixtures = path.join(process.cwd(), 'src', 'test', 'fixtures');

  it('fixes imports from index files', async () => {
    const projectDir = path.join(fixtures, 'index-import');
    const projectConfig = path.join(projectDir, 'tsconfig.json');
    const snapshot = path.join(projectDir, 'main.snap.ts');
    const project = ProjectUtil.getProject(projectConfig);
    const modifiedFile = convertFile(project, project.getSourceFile('main.ts')!, true);
    await expect(modifiedFile.getText()).toMatchFileSnapshot(snapshot);
  });
});
