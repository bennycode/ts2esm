import path from 'node:path';
import {applyModification} from '../codemod/applyModification.js';
import {convertTSConfig} from '../codemod/convertTSConfig.js';
import {convertFile} from './convertFile.js';
import {ProjectUtil} from '../util/ProjectUtil.js';

/**
 * Traverses all source code files from a project and checks its import and export declarations.
 */
export async function convertProject(tsConfigFilePath: string, debugLogging: boolean = false) {
  let checkedFiles = 0;
  let modifiedFiles = 0;

  const project = ProjectUtil.getProject(tsConfigFilePath);
  const paths = ProjectUtil.getPaths(project);

  // Check "module" and "moduleResolution" in "tsconfig.json"
  await convertTSConfig(tsConfigFilePath, project);

  // Add "type": "module" to "package.json"
  const packageJsonPath = path.join(ProjectUtil.getRootDirectory(tsConfigFilePath), 'package.json');
  await applyModification(packageJsonPath, '/type', 'module');

  if (paths && debugLogging) {
    console.log('Found path aliases (🧪):', paths);
  }

  project.getSourceFiles().forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    checkedFiles += 1;
    if (debugLogging) {
      console.log(` Checking (🧪): ${filePath}`);
    }
    const modifiedFile = convertFile(sourceFile);
    if (modifiedFile) {
      modifiedFiles += 1;
      modifiedFile.saveSync();
      console.log(`  Modified (🔧): ${filePath}`);
    }
  });

  console.log(` Checked "${checkedFiles}" files / Modified "${modifiedFiles}" files ✨`);
}
