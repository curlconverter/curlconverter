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


test('http get - php', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl1.txt', 'utf-8');
  var phpCode = curlconverter.toPhp(curlHttpGetCommand);
  var goodPhpCode = fs.readFileSync(__dirname + '/php_output1.php', 'utf-8');
  t.equal(phpCode, goodPhpCode);
  t.end();
});


test('http post - php', function (t) {
  var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl2.txt', 'utf-8');
  var phpCode = curlconverter.toPhp(curlHttpGetCommand);
  var goodPhpCode = fs.readFileSync(__dirname + '/php_output2.php', 'utf-8');
  t.equal(phpCode, goodPhpCode);
  t.end();
});


test('http post with data - php', function (t) {
  var curlHttpPostCommand = fs.readFileSync(__dirname + '/curl3.txt', 'utf-8');
  var phpCode = curlconverter.toPhp(curlHttpPostCommand);
  var goodPhpCode = fs.readFileSync(__dirname + '/php_output3.php', 'utf-8').trim();
  t.equal(phpCode, goodPhpCode);
  t.end();
});

test('http post with quotes inside data - php', function (t) {
  var curlHttpPostCommand = fs.readFileSync(__dirname + '/curl18.txt', 'utf-8');
  var phpCode = curlconverter.toPhp(curlHttpPostCommand);
  var goodPhpCode = fs.readFileSync(__dirname + '/php_output18.php', 'utf-8').trim();
  t.equal(phpCode, goodPhpCode);
  t.end();
});

test('http get with single header - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync(__dirname + '/curl8.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync(__dirname + '/node_output8.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});

test('http post with double quotes inside single quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync(__dirname + '/curl9.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync(__dirname + '/node_output9.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});

test('http post with single quotes inside double quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync(__dirname + '/curl10.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync(__dirname + '/node_output10.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});


test('http post with escaped double quotes inside single quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync(__dirname + '/curl12.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync(__dirname + '/node_output12.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});

test('http post with escaped single quotes inside double quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync(__dirname + '/curl13.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync(__dirname + '/node_output13.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});

test('http post with escaped double quotes inside double quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync(__dirname + '/curl11.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync(__dirname + '/node_output11.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});


test('http get with -L param - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync(__dirname + '/curl14.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync(__dirname + '/node_output14.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});


test('http with charles syntax - python', function (t) {
    var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl15.txt', 'utf-8');
    var pythonCode = curlconverter.toPython(curlHttpGetCommand);
    var goodPythonCode = fs.readFileSync(__dirname + '/python_output8.py', 'utf-8').trim();
    t.equal(pythonCode, goodPythonCode);
    t.end();
});

test('multiline http post with data - parser', function (t) {
    var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl16.txt', 'utf-8');
    var parsedCommand = utils.parseCurlCommand(curlHttpGetCommand);
    var goodParserOutput = require('./parser_output4.js');
    t.deepEquals(parsedCommand, goodParserOutput);
    t.end();
});

test('http put with file - python', function (t) {
    var curlHttpGetCommand = fs.readFileSync(__dirname + '/curl17.txt', 'utf-8');
    var pythonCode = curlconverter.toPython(curlHttpGetCommand);
    var goodPythonCode = fs.readFileSync(__dirname + '/python_output9.py', 'utf-8');
    t.equal(pythonCode, goodPythonCode);
    t.end();
});
