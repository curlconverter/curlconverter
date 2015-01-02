'use strict';

var toPython = require('./generators/python.js');
var toNode = require('./generators/node.js');

module.exports = {
  toPython: toPython,
  toNode: toNode
};