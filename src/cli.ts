#!/usr/bin/env node

import {convert} from './main.js';
import {input} from '@inquirer/prompts';
import {ExitPromptError} from '@inquirer/core';

const args = process.argv.slice(2);
const options = args.filter(arg => arg.startsWith('--'));
const unknownOptions = options.filter(arg => arg !== '--debug');

if (unknownOptions.length) {
  console.error(`Unknown options: ${unknownOptions.join(', ')}`);
  process.exit(1);
}

const enableDebug = options.includes('--debug');

const configFiles = args.filter(arg => !arg.startsWith('--'));

if (configFiles.length === 0) {
  try {
    configFiles.push(
      await input({default: 'tsconfig.json', message: 'Enter the "relative" file path to your TS config'})
    );
  } catch (error: unknown) {
    if (error instanceof ExitPromptError) {
      // Capturing "Ctrl + C" in "Inquirer" prompts
      console.log('Goodbye!');
    } else {
      throw error;
    }
  }
}

for (const tsConfigFilePath of configFiles) {
  console.log(`Processing: ${tsConfigFilePath}`);
  await convert(
    {
      // Limit the scope of source files to those directly listed as opposed to also all
      // of the dependencies that may be imported. Never want to modify dependencies.
      skipFileDependencyResolution: true,
      tsConfigFilePath,
    },
    enableDebug
  );
}
