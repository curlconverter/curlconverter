#!/usr/bin/env node

import * as utils from '../util.js'
import { fixturesDir, converters } from '../test-utils.js'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import fs from 'fs'

import path from 'path'
import { fileURLToPath } from 'url'

const argv = yargs(hideBin(process.argv))
  .scriptName('gen-test')
  .usage('Usage: $0 [-l <language>] [curl_command_filename...]')
  .option('l', {
    alias: 'language',
    choices: Object.keys(converters),
    demandOption: false,
    default: Object.keys(converters),
    describe: 'the language to convert the curl command to ' + '(`--language parser` saves parser state as JSON)',
    type: 'string'
  })
  .positional('curl_command_filename', { // this has no effect, it's here for --help
    describe: 'the file to read the curl command from (or just its name without its path or file extension)',
    type: 'string'
  })
  .alias('h', 'help')
  .help()
  .argv

const languages = Array.isArray(argv.language) ? argv.language : [argv.language]

let allRelativePaths = null
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
  const fullPath = path.join(inPath.dir, inPath.name + '.sh')
  if (!fs.existsSync(fullPath)) {
    process.stderr.write('no such file: ' + fullPath + '\n')
    process.exit()
  }
  return fullPath
})

for (const inPath of inPaths) {
  let curl = fs.readFileSync(inPath, 'utf8')
  for (const language of argv.language) {
    const converter = converters[language]
    const code = converter.converter(curl)

    const newFilename = path.basename(inPath).replace(/\.sh$/, converter.extension)
    const outPath = path.resolve(inPath, '../..', language, newFilename)

    fs.writeFileSync(outPath, code)
    console.error('wrote to', outPath)
  }
}

if (inPaths.length) {
  console.error('Please carefully check all the output for correctness before committing.')
}
