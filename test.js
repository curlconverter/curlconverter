'use strict'
const test = require('tape')
const fs = require('fs')

const utils = require('./util')
const curlconverter = require('./index.js')
const yargs = require('yargs')

// the curl_commands/ directory contains input files
// The file name is a description of the command.
// for each input file, there may be a corresponding output file in
// language-specific directories: node_output, php_output, python_output, parser_output
// we get a list of all input files, iterate over it, and if an output file exists, compare the output.

const outputs = [
  {
    name: 'Ansible',
    extension: 'yml',
    command: curlconverter.toAnsible
  }, {
    name: 'R',
    extension: 'R',
    command: curlconverter.toR
  },
  {
    name: 'Python',
    extension: 'py',
    command: curlconverter.toPython
  },
  {
    name: 'Node',
    extension: 'js',
    command: curlconverter.toNode
  },
  {
    name: 'PHP',
    extension: 'php',
    command: curlconverter.toPhp
  },
  {
    name: 'Go',
    extension: 'go',
    command: curlconverter.toGo
  },

  {
    name: 'Rust',
    extension: 'rs',
    command: curlconverter.toRust
  },
  {
    name: 'Strest',
    extension: 'strest.yml',
    command: curlconverter.toStrest
  },
  {
    name: 'Json',
    extension: 'json',
    command: curlconverter.toJsonString
  },
  {
    name: 'Dart',
    extension: 'dart',
    command: curlconverter.toDart
  },
  {
    name: 'Elixir',
    extension: 'ex',
    command: curlconverter.toElixir
  }
]

const testFile = fileName => {
  const inputFilePath = 'fixtures/curl_commands/' + fileName
  const inputFileContents = fs.readFileSync(inputFilePath, 'utf-8')

  const parserTestName = 'Parser: ' + fileName.replace(/_/g, ' ').replace('.txt', '')
  const parserFilePath = './fixtures/parser_output/' + fileName.replace('txt', 'js')
  if (fs.existsSync(parserFilePath)) {
    const goodParserOutput = require(parserFilePath)
    const parsedCommand = utils.parseCurlCommand(inputFileContents)
    test(parserTestName, t => {
      t.deepEquals(parsedCommand, goodParserOutput)
      t.end()
    })
  }

  outputs.forEach(output => {
    if (language && language !== output.name) {
      console.log(`skipping language: ${output.name}`)
    } else {
      const directory = './fixtures/' + output.name.toLowerCase() + '_output/'

      const filePath = directory + fileName.replace('txt', output.extension)
      const testName = output.name + ': ' + fileName.replace(/_/g, ' ').replace('.txt', '')

      if (fs.existsSync(filePath)) {
        // normalize code for just \n line endings (aka fix input under Windows)
        const goodCode = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n')
        const code = output.command(inputFileContents)
        test(testName, t => {
          t.equal(code, goodCode)
          t.end()
        })
      }
    }
  })
}
// get --test=test_name parameter and just run that test on its own
const testName = yargs.argv.test
var language = yargs.argv.language
if (testName) {
  const fileName = testName + '.txt'
  testFile(fileName)
} else {
  // otherwise, run them all
  const inputFiles = fs.readdirSync('fixtures/curl_commands/')
  inputFiles.forEach(testFile)
}
