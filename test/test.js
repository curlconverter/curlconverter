'use strict';
var test = require('tape');
var fs = require('fs');
var utils = require('../util');

var curlconverter = require('../');

test('http get - parser', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl1.txt', 'utf-8');
  var parsedCommand = utils.parseCurlCommand(curlHttpGetCommand);
  var goodParserOutput = require('./parser_output1.js');
  t.deepEquals(parsedCommand, goodParserOutput);
  t.end();
});

test('http post - parser', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl2.txt', 'utf-8');
  var parsedCommand = utils.parseCurlCommand(curlHttpGetCommand);
  var goodParserOutput = require('./parser_output2.js');
  t.deepEquals(parsedCommand, goodParserOutput);
  t.end();
});

test('http post with data - parser', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl3.txt', 'utf-8');
  var parsedCommand = utils.parseCurlCommand(curlHttpGetCommand);
  var goodParserOutput = require('./parser_output3.js');
  t.deepEquals(parsedCommand, goodParserOutput);
  t.end();
});

test('http get - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl1.txt', 'utf-8');
  var pythonCode = curlconverter.toPython(curlHttpGetCommand);
  var goodPythonCode = fs.readFileSync(__dirname + '/python_output1.py', 'utf-8');
  t.equal(pythonCode, goodPythonCode);
  t.end();
});


test('http post - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl2.txt', 'utf-8');
  var pythonCode = curlconverter.toPython(curlHttpGetCommand);
  var goodPythonCode = fs.readFileSync(__dirname + '/python_output2.py', 'utf-8');
  t.equal(pythonCode, goodPythonCode);
  t.end();
});


test('http post with data - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl3.txt', 'utf-8');
  var pythonCode = curlconverter.toPython(curlHttpGetCommand);
  var goodPythonCode = fs.readFileSync(__dirname + '/python_output3.py', 'utf-8');
  t.equal(pythonCode, goodPythonCode);
  t.end();
});

test('basic http get with no headers - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl4.txt', 'utf-8');
  var nodeCode = curlconverter.toPython(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync(__dirname + '/python_output4.py', 'utf-8');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('http get - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl1.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync(__dirname + '/node_output1.js', 'utf-8');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});


test('http post - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl2.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync(__dirname + '/node_output2.js', 'utf-8');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});


test('http post with data - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl3.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync(__dirname + '/node_output3.js', 'utf-8').replace(/\n$/, '');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('http post with data and headers - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl6.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync(__dirname + '/node_output5.js', 'utf-8').replace(/\n$/, '');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('http post with data and headers - python', function (t) {
    var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl6.txt', 'utf-8');
    var pythonCode = curlconverter.toPython(curlHttpGetCommand);
    var goodPythonCode = fs.readFileSync(__dirname + '/python_output6.py', 'utf-8').trim();
    t.equal(pythonCode, goodPythonCode);
    t.end();
});

test('basic http get with no headers - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl4.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync(__dirname + '/node_output4.js', 'utf-8').replace(/\n$/, '');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('basic http get with no headers - python', function (t) {
    var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl5.txt', 'utf-8');
    var pythonCode = curlconverter.toPython(curlHttpGetCommand);
    var goodPythonCode = fs.readFileSync(__dirname + '/python_output5.py', 'utf-8').trim();
    t.equal(pythonCode, goodPythonCode);
    t.end();
});

test('post with data-binary - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl7.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync(__dirname + '/node_output7.js', 'utf-8').replace(/\n$/, '');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('post with data-binary - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl7.txt', 'utf-8');
  var pythonCode = curlconverter.toPython(curlHttpGetCommand);
  var goodPythonCode = fs.readFileSync(__dirname + '/python_output7.py', 'utf-8').trim();
  t.equal(pythonCode, goodPythonCode);
  t.end();
});