#!/usr/bin/env node

import * as curlconverter from './index.js'
import * as utils from './util.js'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import fs from 'fs'
import jsesc from 'jsesc'

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.resolve(__dirname, 'fixtures')

// used to map languages to functions
// NOTE: make sure to update this when adding language support
// TODO: share across the project
const translate = {
  ansible: 'toAnsible',
  browser: 'toBrowser',
  dart: 'toDart',
  elixir: 'toElixir',
  go: 'toGo',
  java: 'toJava',
  json: 'toJsonString',
  matlab: 'toMATLAB',
  node: 'toNodeRequest',
  php: 'toPhp',
  python: 'toPython',
  r: 'toR',
  rust: 'toRust',
  strest: 'toStrest'
}

// TODO: this is in test.js already
const extension = {
  ansible: 'yml',
  browser: 'js',
  dart: 'dart',
  elixir: 'ex',
  go: 'go',
  java: 'java',
  json: 'json',
  matlab: 'm',
  // TODO: which?
  'node': 'js',
  'node-request': 'js',
  php: 'php',
  python: 'py',
  r: 'R',
  rust: 'rs',
  strest: 'strest.yml'
}

const argv = yargs(hideBin(process.argv))
  .scriptName('gen-test')
  .usage('Usage: $0 [--parser] [-l <language>] [curl_command]')
  .boolean('parser')
  .option('l', {
    alias: 'language',
    choices: Object.keys(translate),
    demandOption: false,
    default: Object.keys(translate),
    describe: 'the language to convert the curl command to',
    type: 'array'
  })
  .positional('command_file', { // TODO: this has no effect
    describe: 'the file to read the curl command from',
    demandOption: 'true',
    type: 'string'
  })
  .alias('h', 'help')
  .help()
  .argv

const inPaths = argv._.map((infile) => {
  // check that all files exist and add '.sh' to them if needed
  const inPath = path.parse(infile)

  if (inPath.ext && inPath.ext !== '.sh') {
    process.stderr.write("unexpected file extension '" + ext + "' for " +
                          infile + '. command_file should have no extension ' +
                          "or end with '.sh'\n")
    process.exit()
  }

  if (!inPath.dir) {
    inPath.dir = path.resolve(fixturesDir, 'curl_commands')
  } else {
    inPath.dir = path.resolve(inPath.dir)
  }
  // TODO: don't add .sh to relative file paths
  const fullPath = path.join(inPath.dir, inPath.name + '.sh')
  if (!fs.existsSync(fullPath)) {
    process.stderr.write('no such file: ' + fullPath + '\n')
    process.exit()
  }
  return fullPath
})

let producedOutput = false
for (const inPath of inPaths) {
  producedOutput = true
  const curl = fs.readFileSync(inPath, 'utf8')

  for (const language of argv.language) {
    const generator = curlconverter[translate[language]]
    const code = generator(curl)

    const newExt = '.' + extension[language]
    const newFilename = path.basename(inPath).replace(/\.sh$/, newExt)
    // TODO: if path is relative, calculate a different fixturesDir
    const outPath = path.resolve(fixturesDir, language, newFilename)
    fs.writeFileSync(outPath, code)

    console.error('wrote to', outPath)
  }

  // TODO: dedupe like a --language, have it append to argv.language
  if (argv.parser) {
    const parserOutput = utils.parseCurlCommand(curl)
    const code = 'export default ' + jsesc(parserOutput, { compact: false, indent: '    ' })

    const newFilename = path.basename(inPath).replace(/\.sh$/, '.js')
    const outPath = path.resolve(fixturesDir, 'parser', newFilename)

    fs.writeFileSync(outPath, code + '\n')
    console.error('wrote to', outPath)
  }
}

if (producedOutput) {
  console.error('Please carefully check all the output for correctness before committing.')
}
