import fs from 'fs'

import * as curlconverter from './index.js'
import * as utils from './util.js'

export const readInputTestFile = (filepath) => {
  let contents = fs.readFileSync(filepath, 'utf8')

  // Skip comment lines
  const inputLines = []
  for (const line of contents.split('\n')) {
    if (!line.trimStart().startsWith('#')) {
      inputLines.push(line)
    }
  }

  return inputLines.join('\n')
}

// TODO: move this (or something like this) to index.js?
const converters = {
  'ansible': {
    name: 'Ansible',
    extension: '.yml',
    converter: curlconverter.toAnsible
  },
  'r': {
    name: 'R',
    extension: '.r',
    converter: curlconverter.toR
  },
  'python': {
    name: 'Python',
    extension: '.py',
    converter: curlconverter.toPython
  },
  'browser': {
    name: 'Browser',
    extension: '.js',
    converter: curlconverter.toBrowser
  },
  'node-fetch': {
    name: 'Node',
    extension: '.js',
    converter: curlconverter.toNodeFetch
  },
  'node': {
    name: 'Node',
    extension: '.js',
    converter: curlconverter.toNodeRequest
  },
  'php': {
    name: 'PHP',
    extension: '.php',
    converter: curlconverter.toPhp
  },
  'go': {
    name: 'Go',
    extension: '.go',
    converter: curlconverter.toGo
  },
  'rust': {
    name: 'Rust',
    extension: '.rs',
    converter: curlconverter.toRust
  },
  'strest': {
    name: 'Strest',
    extension: '.strest.yml',
    converter: curlconverter.toStrest
  },
  'json': {
    name: 'Json',
    extension: '.json',
    converter: curlconverter.toJsonString
  },
  'dart': {
    name: 'Dart',
    extension: '.dart',
    converter: curlconverter.toDart
  },
  'elixir': {
    name: 'Elixir',
    extension: '.ex',
    converter: curlconverter.toElixir
  },
  'matlab': {
    name: 'MATLAB',
    extension: '.m',
    converter: curlconverter.toMATLAB
  },
  'java': {
    name: 'Java',
    extension: '.java',
    converter: curlconverter.toJava
  },
}

const testedConverters = Object.entries(converters).map(c => c[1].converter.name)
const availableConverters = Object.entries(curlconverter).map(c => c[1].name)
const missing = availableConverters.filter(c => !testedConverters.includes(c))
const extra = testedConverters.filter(c => !availableConverters.includes(c))
if (missing.length) {
  console.error('these converters are not tested: ' + missing.join(', '))
}
if (extra.length) {
  console.error('these non-existant converters are being tested: ' + extra.join(', '))
}

// Special case that returns the parsed argument object
const toParser = (curl) => {
  const parserOutput = utils.parseCurlCommand(curl)
  const code = JSON.stringify(parserOutput, null, 2)
  return code + '\n'
}
converters.parser = {
  name: 'Parser',
  extension: '.json',
  converter: toParser
}

export { converters }
