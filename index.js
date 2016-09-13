'use strict'

var toPython = require('./generators/python.js')
var toNode = require('./generators/node.js')
var toPhp = require('./generators/php.js')

module.exports = {
  toPhp: toPhp,
  toPython: toPython,
  toNode: toNode
}
