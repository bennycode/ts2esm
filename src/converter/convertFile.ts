import {SourceFile} from 'ts-morph';
import {replaceFileExtensions} from './replacer/replaceFileExtensions.js';
import {replaceModuleExports} from './replacer/replaceModuleExports.js';
import {replaceRequires} from './replacer/replaceRequire.js';

/**
 * Returns the source file ONLY if it was modified.
 */
export function convertFile(sourceFile: SourceFile) {
  let madeChanges: boolean = false;

  // Update "require" statements to "import" statements
  const updatedRequires = replaceRequires(sourceFile);
  if (updatedRequires) {
    madeChanges = true;
  }

  // Update "module.exports" statements to "export" statements
  const replacedModuleExports = replaceModuleExports(sourceFile);
  if (replacedModuleExports) {
    madeChanges = true;
  }

  // Add explicit file extensions to imports
  const replacedImportFileExtensions = replaceFileExtensions(sourceFile, 'import');
  if (replacedImportFileExtensions) {
    madeChanges = true;
  }

  // Add explicit file extensions to exports
  const replacedExportFileExtensions = replaceFileExtensions(sourceFile, 'export');
  if (replacedExportFileExtensions) {
    madeChanges = true;
  }

  return madeChanges ? sourceFile : null;
}
