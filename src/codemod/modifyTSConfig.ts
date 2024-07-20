import {select} from '@inquirer/prompts';
import {ModuleKind, ModuleResolutionKind, Project} from 'ts-morph';
import {applyModification} from './applyModification.js';

/**
 * @see https://devblogs.microsoft.com/typescript/announcing-typescript-5-2/
 * @see https://typescript.tv/new-features/the-4-must-know-typescript-compiler-configs/
 * @see https://www.totaltypescript.com/tsconfig-cheat-sheet#transpiling-with-typescript
 */
function isModuleResolutionESM(moduleResolution?: ModuleResolutionKind) {
  switch (moduleResolution) {
    case ModuleResolutionKind.Bundler:
    case ModuleResolutionKind.Node16:
    case ModuleResolutionKind.NodeNext:
      return true;
    default:
      return false;
  }
}

/**
 * @see https://devblogs.microsoft.com/typescript/announcing-typescript-5-2/
 * @see https://typescript.tv/new-features/the-4-must-know-typescript-compiler-configs/
 * @see https://www.totaltypescript.com/tsconfig-cheat-sheet#not-transpiling-with-typescript
 */
function isModuleESM(module: ModuleKind | undefined) {
  switch (module) {
    case ModuleKind.ESNext:
    case ModuleKind.Node16:
    case ModuleKind.NodeNext:
    case ModuleKind.Preserve:
      return true;
    default:
      return false;
  }
}

function getAnswer<const T extends string>(property: string, noValue: T, yesValue: T) {
  return select({
    choices: [
      {
        name: 'No (common for backend apps that rely on Node.js)',
        value: noValue,
      },
      {
        name: 'Yes (common for frontend apps that rely on Webpack or Turbopack)',
        value: yesValue,
      },
    ],
    message: `Your "${property}" in your TS config needs to be adjusted for ESM.\r\nAre you using a code bundler when compiling?`,
  });
}

export async function convertTSConfig(tsConfigFilePath: string, project: Project) {
  const isWrongModuleResolution = !isModuleResolutionESM(project.getCompilerOptions().moduleResolution);
  const isWrongModule = !isModuleESM(project.getCompilerOptions().module);

  if (isWrongModule) {
    const module = await getAnswer('module', 'nodenext', 'esnext');
    await applyModification(tsConfigFilePath, 'module', module);
  }

  if (isWrongModuleResolution) {
    const moduleResolution = await getAnswer('moduleResolution', 'nodenext', 'bundler');
    await applyModification(tsConfigFilePath, 'moduleResolution', moduleResolution);
  }
}
