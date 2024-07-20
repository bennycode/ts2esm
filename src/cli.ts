#!/usr/bin/env node

import {convert} from './main.js';
import {input} from '@inquirer/prompts';
import {ExitPromptError} from '@inquirer/core';
import path from 'node:path';

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
  const absolutePath = path.join(process.cwd(), tsConfigFilePath);
  console.log(`Processing: ${absolutePath}`);
  await convert(absolutePath, enableDebug);
}
