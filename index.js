'use strict';

var toPython = require('./generators/python');
var toNode = require('./generators/node');

module.exports = {
  toPython: toPython,
  toNode: toNode
};