#!/usr/bin/env node

import {convert} from './convert.js';
import {input} from '@inquirer/prompts';

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
    configFiles.push(await input({default: 'tsconfig.json', message: 'Enter the file path to your TS config'}));
  } catch {
    // Capturing "Ctrl + C" in "Inquirer" prompts
    console.log('Goodbye!');
  }
}

configFiles.forEach(tsConfigFilePath => {
  console.log(`Processing: ${tsConfigFilePath}`);
  convert(
    {
      tsConfigFilePath,
    },
    enableDebug
  );
});
