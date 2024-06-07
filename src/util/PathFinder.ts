import fs from 'node:fs';

export class PathFinder {
  static findPath(baseFilePath: string, extension: string) {
    const hasNoJSExtension = !['.js', '.cjs', '.mjs'].includes(extension);
    if (extension === '' || (hasNoJSExtension && !fs.existsSync(baseFilePath))) {
      for (const bareOrIndex of ['', '/index']) {
        for (const extension of [
          // Sorted by expected most common to least common for performance.
          {candidate: '.ts', new: '.js'},
          {candidate: '.tsx', new: '.js'},
          {candidate: '.js', new: '.js'},
          {candidate: '.jsx', new: '.js'},
          {candidate: '.cts', new: '.cjs'},
          {candidate: '.mts', new: '.mjs'},
          {candidate: '.cjs', new: '.cjs'},
          {candidate: '.mjs', new: '.mjs'},
        ]) {
          const fileCandidate = `${baseFilePath}${bareOrIndex}${extension.candidate}`;
          // If a valid file has been found, create a fully-specified path (including the file extension) for it.
          if (fs.existsSync(fileCandidate)) {
            return {
              extension: `${bareOrIndex}${extension.new}`,
              file: fileCandidate,
            };
          }
        }
      }
    }
    return null;
  }
}
