'use strict'

const toPython = require('./generators/python')
const toNode = require('./generators/node')
const toFetch = require('./generators/fetch')
const toPhp = require('./generators/php')

module.exports = {
  toPhp,
  toPython,
  toNode,
  toFetch
}
