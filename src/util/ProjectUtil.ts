import path from 'node:path';
import {Project, SourceFile} from 'ts-morph';

export const ProjectUtil = {
  getPaths: (project: Project) => {
    // Note: getCompilerOptions() cannot be cached and has to be used everytime the config is accessed
    return project.getCompilerOptions().paths;
  },
  getProject: (tsConfigFilePath: string) => {
    return new Project({
      // Limit the scope of source files to those directly listed as opposed to also all
      // of the dependencies that may be imported. Never want to modify dependencies.
      skipFileDependencyResolution: true,
      tsConfigFilePath,
    });
  },
  getRootDirectory: (tsConfigFilePath: string): string => {
    return path.dirname(tsConfigFilePath);
  },
  getTsConfigFilePath: (sourceFile: SourceFile): string => {
    return sourceFile.getProject().getCompilerOptions().configFilePath + '';
  },
};
