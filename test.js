import test from 'tape'
import path from 'path'
import fs from 'fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import * as utils from './util.js'
import * as curlconverter from './index.js'
import { readInputTestFile, converters } from './test-utils.js'

// The curl_commands/ directory contains input files
// The file name is a description of the command.
// For each input file, there may be a corresponding output file in
// language-specific directories: node/, php/, python/, parser/
// we get a list of all input files, iterate over it, and if an
// output file exists, compare the output.

const outputs = [
  {
    name: 'Ansible',
    extension: 'yml',
    command: curlconverter.toAnsible
  }, {
    name: 'R',
    extension: 'r',
    command: curlconverter.toR
  },
  {
    name: 'Python',
    extension: 'py',
    command: curlconverter.toPython
  },
  {
    name: 'JavaScript',
    extension: 'js',
    command: curlconverter.toJavaScript
  },
  {
    name: 'Node',
    extension: 'js',
    command: curlconverter.toNodeRequest
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
  },
  {
    name: 'MATLAB',
    extension: 'm',
    command: curlconverter.toMATLAB
  }, {
    name: 'Java',
    extension: 'java',
    command: curlconverter.toJava
  }
]

const languageNames = outputs.map(o => o.name.toLowerCase())
languageNames.push('parser')

const expectedParserOutputs = {}
for (const filename of fs.readdirSync('./fixtures/parser/')) {
  // Import expected parser outputs once. If we try to do this in the tests, tape will produce
  // "test exited without ending" errors.
  const expectedOutputJSON = fs.readFileSync('./fixtures/parser/' + filename)
  const expectedOutput = JSON.parse(expectedOutputJSON)
  expectedParserOutputs[filename.replace(/\.json$/, '')] = expectedOutput
}

const testFile = fileName => {
  const inputFilePath = 'fixtures/curl_commands/' + fileName
  let inputFileContents = fs.readFileSync(inputFilePath, 'utf-8')
  // Skip comment lines
  const inputLines = []
  for (const line of inputFileContents.split('\n')) {
    if (!line.trim().startsWith('#')) {
      inputLines.push(line)
    }
  }
  inputFileContents = inputLines.join('\n')

  const parserTestName = 'Parser: ' + fileName.replace(/_/g, ' ').replace(/\.sh$/, '')
  const parserOutName = fileName.replace(/\.sh/, '')
  if (Object.prototype.hasOwnProperty.call(expectedParserOutputs, parserOutName)) {
    const goodParserOutput = expectedParserOutputs[parserOutName]
    const parsedCommand = utils.parseCurlCommand(inputFileContents)
    test(parserTestName, t => {
      t.deepEquals(parsedCommand, goodParserOutput)
      t.end()
    })
  }

  outputs.forEach(output => {
    if (languages && !languages.includes(output.name.toLowerCase())) {
      console.log(`skipping language: ${output.name}`)
    } else {
      const directory = './fixtures/' + output.name.toLowerCase() + '/'

      const filePath = directory + fileName.replace(/\.sh$/, '.' + output.extension)
      const testName = output.name + ': ' + fileName.replace(/_/g, ' ').replace(/\.sh$/, '')

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

const testArgs = yargs(hideBin(process.argv))
  .scriptName('test.js')
  .usage('Usage: $0 [--language <language>] [--test <test_name>] [test_name...]')
  .option('l', {
    alias: 'language',
    choices: Object.keys(converters),
    demandOption: false,
    default: Object.keys(converters),
    describe: 'the language to convert the curl command to',
    type: 'string'
  })
  .option('test', {
    demandOption: false,
    describe: 'the name of a file in fixtures/curl_commands without the .sh extension',
    type: 'string'
  })
  .alias('h', 'help')
  .help()
  .argv

const languages = Array.isArray(testArgs.language) ? testArgs.language : [testArgs.language]

// Test names can be positional args or --test=<test name>. We need to merge them
let testNames = testArgs._.slice(1)
if (Array.isArray(testArgs.test)) {
  testNames = testNames.concat(testArgs.test)
} else if (typeof testArgs.test === 'string') {
  testNames.push(testArgs.test)
}

const testFileNames = testNames && testNames.length ?
  testNames.map(t => t.replace(/ /g, '_') + '.sh') :
  fs.readdirSync('./fixtures/curl_commands/') // otherwise, run them all

for (const fileName of testFileNames) {
  const inputFilePath = './fixtures/curl_commands/' + fileName
  let inputFileContents = readInputTestFile(inputFilePath)

  for (const [outputLanguage, output] of Object.entries(converters)) {
    if (!languages.includes(outputLanguage)) {
      console.log(`skipping language: ${output.name}`)
      continue
    }

    const directory = './fixtures/' + outputLanguage + '/'

    const filePath = directory + fileName.replace(/\.sh$/, output.extension)
    const testName = output.name + ': ' + fileName.replace(/_/g, ' ').replace(/\.sh$/, '')

    if (fs.existsSync(filePath)) {
      // normalize code for just \n line endings (aka fix input under Windows)
      const expected = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n')
      const actual = output.converter(inputFileContents)
      if (outputLanguage === 'parser') {
        test(testName, t => {
          // TODO: `actual` is a needless roundtrip
          t.deepEquals(JSON.parse(actual), JSON.parse(expected))
          t.end()
        })
      } else {
        test(testName, t => {
          t.equal(actual, expected)
          t.end()
        })
      }
    }
  }
}
