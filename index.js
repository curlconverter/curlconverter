'use strict'

var toAnsible = require('./generators/ansible.js')
var toDart = require('./generators/dart.js')
var toGo = require('./generators/go.js')
var toJsonString = require('./generators/json')
var toNode = require('./generators/node.js')
var toPhp = require('./generators/php.js')
var toPython = require('./generators/python.js')
var toR = require('./generators/r.js')
var toRust = require('./generators/rust')
var toStrest = require('./generators/strest.js')
var custom = require('./generators/custom.js')

module.exports = {
  toAnsible: toAnsible,
  toDart: toDart,
  toGo: toGo,
  toJsonString: toJsonString,
  toNode: toNode,
  toPhp: toPhp,
  toPython: toPython,
  toR: toR,
  toRust: toRust,
  toStrest: toStrest,
  custom: custom
}
