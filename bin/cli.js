#!/usr/bin/env node

import { curlLongOpts, curlShortOpts, parseArgs, buildRequest, parseCurlCommand, CCError } from '../util.js'

import { _toAnsible } from '../generators/ansible.js'
import { _toDart } from '../generators/dart.js'
import { _toElixir } from '../generators/elixir.js'
import { _toGo } from '../generators/go.js'
import { _toJava } from '../generators/java.js'
import { _toJavaScript } from '../generators/javascript/javascript.js'
import { _toJsonString } from '../generators/json.js'
import { _toMATLAB } from '../generators/matlab/matlab.js'
import { _toNode } from '../generators/javascript/node-fetch.js'
import { _toNodeRequest } from '../generators/javascript/node-request.js'
import { _toPhp } from '../generators/php.js'
import { _toPython } from '../generators/python.js'
import { _toR } from '../generators/r.js'
import { _toRust } from '../generators/rust.js'
import { _toStrest } from '../generators/strest.js'

import fs from 'fs'

// This line is generated by extract_curl_args.py. Do not modify it.
const VERSION = '4.0.0-alpha.9 (curl 7.79.1)'

// sets a default in case --language isn't passed
const defaultLanguage = 'python'

// Maps options for --language to functions
// NOTE: make sure to update this when adding language support
const translate = {
  ansible: _toAnsible,
  browser: _toJavaScript, // backwards compatibility, undocumented
  dart: _toDart,
  elixir: _toElixir,
  go: _toGo,
  java: _toJava,
  javascript: _toJavaScript,
  json: _toJsonString,
  matlab: _toMATLAB,
  node: _toNode,
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
  dart
  elixir
  go
  java
  javascript
  json
  matlab
  node
  node-request
  php
  python (the default)
  r
  rust
  strest

curl_options: these should be passed exactly as they would be passed to curl.
  see 'curl --help' or 'curl --manual' for which options are allowed here

If no <curl_options> are passed, the script will read from stdin.`

const curlConverterLongOpts = {
  language: { type: 'string' }
}
for (const [opt, val] of Object.entries(curlConverterLongOpts)) {
  if (!Object.prototype.hasOwnProperty.call(val, 'name')) {
    val.name = opt
  }
}
const opts = [{ ...curlLongOpts, ...curlConverterLongOpts }, curlShortOpts]

const exitWithError = (error, verbose = false) => {
  let errMsg = error
  if (!verbose) {
    if (error instanceof CCError) {
      errMsg = ''
      for (const line of error.message.toString().split('\n')) {
        errMsg += 'error: ' + line + '\n'
      }
      errMsg = errMsg.trimEnd()
    } else {
      // .toString() removes the traceback
      errMsg = error.toString()
    }
  }
  console.error(errMsg)
  process.exit(1)
}

const argv = process.argv.slice(2)
let parsedArguments
try {
  parsedArguments = parseArgs(argv, opts)
} catch (e) {
  exitWithError(e)
}
if (parsedArguments.help) {
  console.log(USAGE.trim())
  process.exit(0)
}
if (parsedArguments.version) {
  console.log('curlconverter ' + VERSION)
  process.exit(0)
}

const language = Object.prototype.hasOwnProperty.call(parsedArguments, 'language') ? parsedArguments.language : defaultLanguage
if (!Object.prototype.hasOwnProperty.call(translate, language)) {
  exitWithError(
    new CCError('unexpected --language: ' + JSON.stringify(language) + '\n' +
    'must be one of: ' + Object.keys(translate).join(', ')),
    parsedArguments.verbose
  )
}

// If curlConverterLongOpts were the only args passed, read from stdin
let request
for (const opt of Object.keys(curlConverterLongOpts)) {
  delete parsedArguments[opt]
}
if (!Object.keys(parsedArguments).length) {
  const input = fs.readFileSync(0, 'utf8')
  try {
    request = parseCurlCommand(input)
  } catch (e) {
    exitWithError(e, parsedArguments.verbose)
  }
} else {
  try {
    request = buildRequest(parsedArguments)
  } catch (e) {
    exitWithError(e, parsedArguments.verbose)
  }
}

// Warning for users using the pre-4.0 CLI
if (request.url && request.url.startsWith('curl ')) {
  console.error('warning: Passing a whole curl command as a single argument?')
  console.error('warning: Pass options to curlconverter as if it was curl instead:')
  console.error("warning: curlconverter 'curl example.com' -> curlconverter example.com")
}

const generator = translate[language]
let code
try {
  code = generator(request)
} catch (e) {
  exitWithError(e, parsedArguments.verbose)
}
process.stdout.write(code)
