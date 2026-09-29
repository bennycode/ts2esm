import path from 'node:path';
import {Project, SourceFile} from 'ts-morph';

export const ProjectUtil = {
  getPaths: (project: Project) => {
    // Note: getCompilerOptions() cannot be cached and has to be used everytime the config is accessed
    return project.getCompilerOptions().paths;
  },
  /**
   * TypeScript resolves "paths" relative to "baseUrl" or, without "baseUrl", relative to the tsconfig.json that
   * declares them. That can be a parent config pulled in through "extends" (i.e. a monorepo root config).
   * @see https://github.com/bennycode/ts2esm/issues/127
   */
  getPathsBaseDirectory: (sourceFile: SourceFile): string => {
    const options = sourceFile.getProject().getCompilerOptions();
    if (options.baseUrl) {
      return options.baseUrl;
    }
    // "pathsBasePath" is set by TypeScript's config parser but is not part of its public types
    if ('pathsBasePath' in options && typeof options.pathsBasePath === 'string') {
      return options.pathsBasePath;
    }
    return path.dirname(ProjectUtil.getTsConfigFilePath(sourceFile));
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
