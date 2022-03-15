#!/usr/bin/env node

import { exec } from 'child_process'
import fs from 'fs'
import net from 'net'
import path from 'path'
import { promisify } from 'util'

import colors from 'colors'
import { diffLines } from 'diff'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import * as utils from '../util.js'
import { fixturesDir } from '../test-utils.js'

const awaitableExec = promisify(exec)

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
  python: 'py'
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
  python: 'python3'
  // r: '',
  // rust: '',
  // strest: ''
}

const argv = yargs(hideBin(process.argv))
  .scriptName('compare-request')
  .usage('Usage: $0 [--no-diff] [-l <language>] [test_name...]')
  .option('diff', {
    describe: 'print a colorized diff instead of the raw requests',
    default: true,
    demandOption: false,
    type: 'boolean'
  })
  .option('l', {
    alias: 'language',
    describe: 'the language of the generated program to compare against',
    choices: Object.keys(extension),
    default: ['python'],
    demandOption: false,
    type: 'string'
  })
  .alias('h', 'help')
  .help()
  .argv

const testFile = async (testFilename) => {
  const rawRequests = []

  const server = net.createServer()
  server.on('connection', (socket) => {
    socket.setEncoding('utf8')

    // Timeout very quickly because we only care about recieving the sent request.
    socket.setTimeout(800, () => {
      socket.end()
    })

    socket.on('data', (data) => {
      rawRequests.push(data.replace(/\r\n/g, '\n'))
      // TODO: what is this?
      if (!socket.write('Data ::' + data)) {
        socket.pause()
      }
    })

    socket.on('drain', () => {
      socket.resume()
    })
    socket.on('timeout', () => {
      socket.end()
    })
    socket.on('close', (error) => {
      if (error) {
        console.error('transmission error')
      }
    })
    setTimeout(() => {
      socket.destroy()
    }, 1000)
  })

  server.maxConnections = 1
  server.listen(DEFAULT_PORT)
  // setTimeout(function(){
  //   server.close();
  // }, 5000);

  const inputFile = path.join(fixturesDir, 'curl_commands', testFilename + '.sh')
  if (!fs.existsSync(inputFile)) {
    throw new Error("input file doesn't exist: " + inputFile)
  }
  const curlCommand = fs.readFileSync(inputFile, 'utf8')
  const requestedUrl = utils.parseCurlCommand(curlCommand).url
  if (!requestedUrl.startsWith(EXPECTED_URL)) {
    throw new Error(inputFile + ' requests ' + requestedUrl + '. It needs to request ' + EXPECTED_URL + ' so we can capture the data it sends.')
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
      for (const part of diffLines(curlRequest, languageRequest)) {
        // green for additions, red for deletions
        // grey for common parts
        const color = part.added
          ? 'green'
          : part.removed ? 'red' : 'grey'
        process.stdout.write(colors[color](part.value))
      }
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
const tests = argv._.length ? argv._ : fs.readdirSync(path.join(fixturesDir, 'curl_commands')).filter(n => n.endsWith('.sh'))
for (const test of tests) {
  const testName = test.replace(/ /g, '_').replace(/\.sh$/, '')
  await testFile(testName)
}

process.exit(0)
