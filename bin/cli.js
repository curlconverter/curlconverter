#!/usr/bin/env node

import * as curlconverter from '../index.js'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import fs from 'fs'

// sets a default in case -l/--langauge isn't passed
const defaultLanguage = 'python'

// used to map languages to functions
// NOTE: make sure to update this when adding language support
const translate = {
  ansible: 'toAnsible',
  browser: 'toBrowser',
  dart: 'toDart',
  elixir: 'toElixir',
  go: 'toGo',
  json: 'toJsonString',
  node: 'toNodeFetch',
  'node-request': 'toNodeRequest',
  php: 'toPhp',
  python: 'toPython',
  r: 'toR',
  rust: 'toRust',
  strest: 'toStrest',
  matlab: 'toMATLAB',
  java: 'toJava'
}

const argv = yargs(hideBin(process.argv))
  .scriptName('curlconverter')
  .usage('Usage: $0 [-l <language>] [curl_command]')
  .option('l', {
    alias: 'language',
    choices: Object.keys(translate),
    demandOption: false,
    default: defaultLanguage,
    describe: 'the language to convert the curl command to',
    type: 'string'
  })
  .positional('curl_command', {
    describe: 'if no <curl_command> is passed, the script will read from stdin',
    type: 'string'
  })
  .alias('h', 'help')
  .help()
  .argv

const curl = argv._.length ? argv._[0] : fs.readFileSync(0, 'utf8')
const generator = curlconverter[translate[argv.language]]
const code = generator(curl)
process.stdout.write(code)
