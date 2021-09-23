#!/usr/bin/env node

import * as curlconverter from '../index.js'

import fs from 'fs'

// used to map languages to functions
// NOTE: make sure to update this when adding language support
const translate = {
  ansible: 'toAnsible',
  browser: 'toBrowser',
  dart: 'toDart',
  elixir: 'toElixir',
  go: 'toGo',
  java: 'toJava',
  json: 'toJsonString',
  matlab: 'toMATLAB',
  node: 'toNodeFetch',
  'node-request': 'toNodeRequest',
  php: 'toPhp',
  python: 'toPython',
  r: 'toR',
  rust: 'toRust',
  strest: 'toStrest'
}

const USAGE = `Usage: curlconverter [<language>] [curl_options...]

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

let language = 'python'
let argv = process.argv.slice(2)
if (argv.includes('--help') || argv.includes('-h')) {
  console.log(USAGE.trim())
  process.exit(0)
}
if (Object.prototype.hasOwnProperty.call(translate, argv[0])) {
  [language, ...argv] = argv
}

// Warning for users using the pre-4.0 CLI
if (argv.length === 1 && argv[0].startsWith('curl ')) {
  console.error('warning: Passing a whole curl command as a single argument?')
  console.error('warning: Pass options to curlconverter as if it was curl instead:')
  console.error("warning: curlconverter 'curl example.com' -> curlconverter example.com")
}
const curl = argv.length ? ['curl', ...argv] : fs.readFileSync(0, 'utf8')
const generator = curlconverter[translate[language]]
const code = generator(curl)
process.stdout.write(code)
