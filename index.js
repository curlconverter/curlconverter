'use strict'

const toAnsible = require('./generators/ansible.js')
const toDart = require('./generators/dart.js')
const toElixir = require('./generators/elixir.js')
const toGo = require('./generators/go.js')
const toJsonString = require('./generators/json')
const toNode = require('./generators/node.js')
const toPhp = require('./generators/php.js')
const toPython = require('./generators/python.js')
const toR = require('./generators/r.js')
const toRust = require('./generators/rust')
const toStrest = require('./generators/strest.js')

module.exports = {
  toAnsible: toAnsible,
  toDart: toDart,
  toGo: toGo,
  toJsonString: toJsonString,
  toNode: toNode,
  toPhp: toPhp,
  toPython: toPython,
  toElixir: toElixir,
  toR: toR,
  toRust: toRust,
  toStrest: toStrest
}
