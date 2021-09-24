#!/usr/bin/env node

import { curlLongOpts, curlShortOpts, parseArgs, buildRequest, parseCurlCommand } from '../util.js'

import { _toAnsible } from '../generators/ansible.js'
import { _toBrowser } from '../generators/javascript/browser.js'
import { _toDart } from '../generators/dart.js'
import { _toElixir } from '../generators/elixir.js'
import { _toGo } from '../generators/go.js'
import { _toJava } from '../generators/java.js'
import { _toJsonString } from '../generators/json.js'
import { _toMATLAB } from '../generators/matlab/matlab.js'
import { _toNodeFetch } from '../generators/javascript/node-fetch.js'
import { _toNodeRequest } from '../generators/javascript/node-request.js'
import { _toPhp } from '../generators/php.js'
import { _toPython } from '../generators/python.js'
import { _toR } from '../generators/r.js'
import { _toRust } from '../generators/rust.js'
import { _toStrest } from '../generators/strest.js'

import fs from 'fs'

// sets a default in case --langauge isn't passed
const defaultLanguage = 'python'

// Maps options for --language to functions
// NOTE: make sure to update this when adding language support
const translate = {
  ansible: _toAnsible,
  browser: _toBrowser,
  dart: _toDart,
  elixir: _toElixir,
  go: _toGo,
  java: _toJava,
  json: _toJsonString,
  matlab: _toMATLAB,
  node: _toNodeFetch,
  'node-request': _toNodeRequest,
  php: _toPhp,
  python: _toPython,
  r: _toR,
  rust: _toRust,
  strest: _toStrest
}

const USAGE = `Usage: curlconverter [--language <language>] [curl_options...]

language: the language to convert the curl command to. The choices are
  ansible
  browser
  dart
  elixir
  go
  java
  json
  matlab
  node
  node-request
  php
  python (the default)
  r
  rust
  strest

If no <curl_options> are passed, the script will read from stdin.`

const curlConverterLongOpts = {
  language: { type: 'string', name: 'language' }
}

const argv = process.argv.slice(2)
const parsedArguments = parseArgs(argv, [{ ...curlLongOpts, ...curlConverterLongOpts }, curlShortOpts])
if (parsedArguments.help) {
  console.log(USAGE.trim())
  process.exit(0)
}

const language = Object.prototype.hasOwnProperty.call(parsedArguments, 'language') ? parsedArguments.language : defaultLanguage
if (!Object.prototype.hasOwnProperty.call(translate, language)) {
  console.error('error: unexpected --language: ' + JSON.stringify(language))
  console.error('error: must be one of: ' + Object.keys(translate).join(', '))
  process.exit(1)
}

// If curlConverterLongOpts were the only args passed, read from stdin
let request
for (const opt of Object.keys(curlConverterLongOpts)) {
  delete parsedArguments[opt]
}
if (!Object.keys(parsedArguments).length) {
  const input = fs.readFileSync(0, 'utf8')
  request = parseCurlCommand(input)
} else {
  request = buildRequest(parsedArguments)
}

// Warning for users using the pre-4.0 CLI
if (request.url && request.url.startsWith('curl ')) {
  console.error('warning: Passing a whole curl command as a single argument?')
  console.error('warning: Pass options to curlconverter as if it was curl instead:')
  console.error("warning: curlconverter 'curl example.com' -> curlconverter example.com")
}

const generator = translate[language]
const code = generator(request)
process.stdout.write(code)
