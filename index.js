'use strict'

var toR = require('./generators/r.js')
var toPython = require('./generators/python.js')
var toNode = require('./generators/node.js')
var toPhp = require('./generators/php.js')
var toGo = require('./generators/go.js')

module.exports = {
  toR: toR,
  toPhp: toPhp,
  toPython: toPython,
  toNode: toNode,
  toGo: toGo
}
