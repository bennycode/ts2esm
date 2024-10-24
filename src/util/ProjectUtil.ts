import {Project} from 'ts-morph';

export const ProjectUtil = {
  getProject: (tsConfigFilePath: string) => {
    return new Project({
      // Limit the scope of source files to those directly listed as opposed to also all
      // of the dependencies that may be imported. Never want to modify dependencies.
      skipFileDependencyResolution: true,
      tsConfigFilePath,
    });
  },
  getRootDirectory: (project: Project): string => {
    return project.getRootDirectories()[0]?.getPath() || '';
  },
  getPaths: (project: Project) => {
    // Note: getCompilerOptions() cannot be cached and has to be used everytime the config is accessed
    return project.getCompilerOptions().paths;
  },
};
