#!/usr/bin/env node

import net from 'net'
import util from 'util'
import { diffLines } from 'diff'
import { exec } from 'child_process'

import * as utils from '../util.js'
import { fixturesDir } from '../test-utils.js'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import fs from 'fs'

const awaitableExec = util.promisify(exec)

const DEFAULT_PORT = 28139 // chosen randomly
const EXPECTED_URL = 'http://localhost:' + DEFAULT_PORT

// Only Python is supported currently.
const extension = {
  // ansible: 'yml',
  // browser: 'js',
  // dart: 'dart',
  // elixir: 'ex',
  // go: 'go',
  // java: 'java',
  // json: 'json',
  // matlab: 'm',
  // node: 'js',
  // php: 'php',
  python: 'py',
  // r: 'R',
  // rust: 'rs',
  // strest: 'strest.yml'
}

const executable = {
  // ansible: '',
  // browser: '',
  // dart: '',
  // elixir: '',
  // go: '',
  // java: '',
  // json: '',
  // matlab: '',
  // TODO: generated code uses require() so we can't run them
  // because curlconverter is an ES6 module.
  // node: 'node',
  // php: '',
  python: 'python3',
  // r: '',
  // rust: '',
  // strest: ''
}

const argv = yargs(hideBin(process.argv))
  .scriptName('compare-request')
  .usage('Usage: $0 [--no-diff] [-l <language>] [test_name...]')
  .option('diff', {
    demandOption: false,
    default: true,
    describe: 'print a colorized diff instead of the raw requests',
    type: 'boolean'
  })
  .option('l', {
    alias: 'language',
    choices: Object.keys(extension),
    demandOption: false,
    default: ['python'],
    describe: 'the language of the generated program to compare against',
    type: 'string'
  })
  .alias('h', 'help')
  .help()
  .argv

const testFile = async (testFilename) => {
  const rawRequests = []

  const server = net.createServer((client) => {})
  server.listen(DEFAULT_PORT)

  server.on('connection', (socket) => {
    socket.setEncoding('utf8')
    socket.setTimeout(800000, () => {
      console.error('Socket timed out')
    })

    socket.on('data', (data) => {
      rawRequests.push(data)
    })

    socket.on('drain', () => { socket.resume() })
    socket.on('error', (error) => { console.error(error) })
    // socket.on('close', (error) => {})

    setTimeout(() => {
      socket.destroy()
    }, 1200000)
  })

  const inputFile = './fixtures/curl_commands/' + testFilename + '.sh'
  if (!fs.existsSync(inputFile)) {
    throw "input file doesn't exist: " + inputFile
  }
  const curlCommand = fs.readFileSync(inputFile, 'utf8')
  const requestedUrl = utils.parseCurlCommand(curlCommand).url
  if (!requestedUrl.startsWith(EXPECTED_URL)) {
    throw inputFile + ' requests ' + requestedUrl + '. It needs to request ' + EXPECTED_URL + ' so we can capture the data it sends.'
  }
  try {
    await awaitableExec('bash ' + inputFile)
  } catch (e) {}

  for (const language of languages) {
    const languageFile = './fixtures/' + language + '/' + testFilename + '.' + extension[language]
    if (fs.existsSync(languageFile)) {
      const command = executable[language] + ' ' + languageFile
      try {
        await awaitableExec(command)
      } catch (e) {
        // Uncomment for debugging. An error always happens because
        // our server doesn't respond to requests.
        // console.error(e)
      }
    } else {
      console.error(language + " file doesn't exist, skipping: " + languageFile)
    }
  }

  const [curlRequest, ...languageRequests] = rawRequests

  for (const languageRequest of languageRequests) {
    if (argv.diff) {
      diffLines(curlRequest, languageRequest).forEach((part) => {
        // green for additions, red for deletions
        // grey for common parts
        const color = part.added ? 'green'
          : part.removed ? 'red' : 'grey'
        process.stdout.write(part.value[color])
      })
      process.stdout.write('\n')
    } else {
      console.log(curlRequest)
      console.log(languageRequest)
    }
  }

  server.close()
}

let languages
if (argv.language) {
  languages = Array.isArray(argv.language) ? argv.language : [argv.language]
}

// if no tests were specified, run them all
const tests = argv._.length ? argv._ : fs.readdirSync('./fixtures/curl_commands/')
for (const test of tests) {
  const testName = test.replace(/ /g, '_').replace(/\.sh$/, '')
  await testFile(testName)
}

process.exit(0)
