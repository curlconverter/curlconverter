'use strict'

const toAnsible = require('./generators/ansible.js')
const toDart = require('./generators/dart.js')
const toElixir = require('./generators/elixir.js')
const toBrowser = require('./generators/javascript/browser.js')
const toGo = require('./generators/go.js')
const toJsonString = require('./generators/json.js')
const toNodeFetch = require('./generators/javascript/node-fetch.js')
const toNodeRequest = require('./generators/javascript/node-request.js')
const toPhp = require('./generators/php.js')
const toPython = require('./generators/python.js')
const toR = require('./generators/r.js')
const toRust = require('./generators/rust')
const toStrest = require('./generators/strest.js')
const toMATLAB = require('./generators/matlab/matlab.js')
const toJava = require('./generators/java.js')

module.exports = {
  toAnsible: toAnsible,
  toBrowser: toBrowser,
  toDart: toDart,
  toGo: toGo,
  toJsonString: toJsonString,
  toNodeFetch: toNodeFetch,
  toNodeRequest: toNodeRequest,
  toPhp: toPhp,
  toPython: toPython,
  toElixir: toElixir,
  toR: toR,
  toRust: toRust,
  toStrest: toStrest,
  toMATLAB: toMATLAB,
  toJava: toJava
}
