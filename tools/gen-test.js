#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { fixturesDir, converters } from '../test-utils.js'

const argv = yargs(hideBin(process.argv))
  .scriptName('gen-test')
  .usage('Usage: $0 [-l <language>] [curl_command_filename...]')
  .option('l', {
    alias: 'language',
    describe: 'the language to convert the curl command to ' + '(`--language parser` saves parser state as JSON)',
    choices: Object.keys(converters),
    default: Object.keys(converters),
    defaultDescription: 'all of them',
    demandOption: false,
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

const inPaths = argv._.map((infile) => {
  // check that all files exist and add '.sh' to them if needed
  const inPath = path.parse(infile)

  if (inPath.ext && inPath.ext !== '.sh') {
    console.error("unexpected file extension '" + inPath.ext + "' for " +
                  infile + '. command_file should have no extension ' +
                  "or end with '.sh'")
    process.exit()
  }
  if (!inPath.dir) {
    inPath.dir = path.resolve(fixturesDir, 'curl_commands')
  } else {
    inPath.dir = path.resolve(inPath.dir)
  }
  const fullPath = path.join(inPath.dir, inPath.name + '.sh')
  if (!fs.existsSync(fullPath)) {
    console.error('no such file: ' + fullPath)
    process.exit()
  }
  return fullPath
})

const printEachFile = inPaths.length < 10 || languages.length < Object.keys(converters).length
let total = 0
for (const inPath of inPaths) {
  const curl = fs.readFileSync(inPath, 'utf8')
  for (const language of languages) {
    const converter = converters[language]
    let code
    try {
      code = converter.converter(curl)
    } catch (e) {
      console.error('error converting curl command to ' + language)
      console.error(inPath)
      console.error()
      console.error(curl)
      console.error()

      console.error(e)
      continue
    }

    const newFilename = path.basename(inPath).replace(/\.sh$/, converter.extension)
    const outPath = path.resolve(inPath, '../..', language, newFilename)

    fs.writeFileSync(outPath, code)
    if (printEachFile) {
      console.error('wrote to', outPath)
    } else {
      total += 1
    }
  }
}
if (!printEachFile) {
  console.error('wrote', total, 'file' + (total === 1 ? '' : 's'))
}

if (inPaths.length && languages.length) {
  console.error('Please carefully check all the output for correctness before committing.')
}
