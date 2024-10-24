import path from 'node:path';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {convertFile} from './convertFile.js';

describe('convertFile', () => {
  const fixtures = path.join(process.cwd(), 'src', 'test', 'fixtures');

  it('adds imports from barrel files', async () => {
    const barrelImportDir = path.join(fixtures, 'barrel-import');
    const barrelImportConfig = path.join(barrelImportDir, 'tsconfig.json');
    const barrelImportSnapshot = path.join(barrelImportDir, 'consumer.snap.ts');
    const project = ProjectUtil.getProject(barrelImportConfig);
    const modifiedFile = convertFile(project, project.getSourceFile('consumer.ts')!, true);
    await expect(modifiedFile.getText()).toMatchFileSnapshot(barrelImportSnapshot);
  });
});
