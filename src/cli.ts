#!/usr/bin/env node

import {convert} from './convert.js';
import {input} from '@inquirer/prompts';

const tsConfigFilePath = await input({default: 'tsconfig.json', message: 'Enter the file path to your TS config'});

convert({
  tsConfigFilePath,
});
