'use strict';
var test = require('tape');
var fs = require('fs');
var utils = require('./util');

var curlconverter = require('.');

test('http get - parser', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl1.txt', 'utf-8');
  var parsedCommand = utils.parseCurlCommand(curlHttpGetCommand);
  var goodParserOutput = require('./fixtures/parser_output1.js');
  t.deepEquals(parsedCommand, goodParserOutput);
  t.end();
});

test('http post - parser', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl2.txt', 'utf-8');
  var parsedCommand = utils.parseCurlCommand(curlHttpGetCommand);
  var goodParserOutput = require('./fixtures/parser_output2.js');
  t.deepEquals(parsedCommand, goodParserOutput);
  t.end();
});

test('http post with data - parser', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl3.txt', 'utf-8');
  var parsedCommand = utils.parseCurlCommand(curlHttpGetCommand);
  var goodParserOutput = require('./fixtures/parser_output3.js');
  t.deepEquals(parsedCommand, goodParserOutput);
  t.end();
});

test('http get - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl1.txt', 'utf-8');
  var pythonCode = curlconverter.toPython(curlHttpGetCommand);
  var goodPythonCode = fs.readFileSync('fixtures/python_output1.py', 'utf-8');
  t.equal(pythonCode, goodPythonCode);
  t.end();
});


test('http post - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl2.txt', 'utf-8');
  var pythonCode = curlconverter.toPython(curlHttpGetCommand);
  var goodPythonCode = fs.readFileSync('fixtures/python_output2.py', 'utf-8');
  t.equal(pythonCode, goodPythonCode);
  t.end();
});


test('http post with data - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl3.txt', 'utf-8');
  var pythonCode = curlconverter.toPython(curlHttpGetCommand);
  var goodPythonCode = fs.readFileSync('fixtures/python_output3.py', 'utf-8');
  t.equal(pythonCode, goodPythonCode);
  t.end();
});

test('basic http get with no headers - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl4.txt', 'utf-8');
  var nodeCode = curlconverter.toPython(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync('fixtures/python_output4.py', 'utf-8');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('http get - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl1.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync('fixtures/node_output1.js', 'utf-8');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});


test('http post - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl2.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync('fixtures/node_output2.js', 'utf-8');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});


test('http post with data - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl3.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync('fixtures/node_output3.js', 'utf-8').replace(/\n$/, '');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('http post with data and headers - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl6.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync('fixtures/node_output5.js', 'utf-8').replace(/\n$/, '');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('http post with data and headers - python', function (t) {
    var curlHttpGetCommand = fs.readFileSync('fixtures/curl6.txt', 'utf-8');
    var pythonCode = curlconverter.toPython(curlHttpGetCommand);
    var goodPythonCode = fs.readFileSync('fixtures/python_output6.py', 'utf-8').trim();
    t.equal(pythonCode, goodPythonCode);
    t.end();
});

test('basic http get with no headers - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl4.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync('fixtures/node_output4.js', 'utf-8').replace(/\n$/, '');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('basic http get with no headers - python', function (t) {
    var curlHttpGetCommand = fs.readFileSync('fixtures/curl5.txt', 'utf-8');
    var pythonCode = curlconverter.toPython(curlHttpGetCommand);
    var goodPythonCode = fs.readFileSync('fixtures/python_output5.py', 'utf-8').trim();
    t.equal(pythonCode, goodPythonCode);
    t.end();
});

test('post with data-binary - node', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl7.txt', 'utf-8');
  var nodeCode = curlconverter.toNode(curlHttpGetCommand);
  var goodNodeCode = fs.readFileSync('fixtures/node_output7.js', 'utf-8').replace(/\n$/, '');
  t.equal(nodeCode, goodNodeCode);
  t.end();
});

test('post with data-binary - python', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl7.txt', 'utf-8');
  var pythonCode = curlconverter.toPython(curlHttpGetCommand);
  var goodPythonCode = fs.readFileSync('fixtures/python_output7.py', 'utf-8').trim();
  t.equal(pythonCode, goodPythonCode);
  t.end();
});


test('http get - php', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl1.txt', 'utf-8');
  var phpCode = curlconverter.toPhp(curlHttpGetCommand);
  var goodPhpCode = fs.readFileSync('fixtures/php_output1.php', 'utf-8');
  t.equal(phpCode, goodPhpCode);
  t.end();
});


test('http post - php', function (t) {
  var curlHttpGetCommand = fs.readFileSync('fixtures/curl2.txt', 'utf-8');
  var phpCode = curlconverter.toPhp(curlHttpGetCommand);
  var goodPhpCode = fs.readFileSync('fixtures/php_output2.php', 'utf-8');
  t.equal(phpCode, goodPhpCode);
  t.end();
});


test('http post with data - php', function (t) {
  var curlHttpPostCommand = fs.readFileSync('fixtures/curl3.txt', 'utf-8');
  var phpCode = curlconverter.toPhp(curlHttpPostCommand);
  var goodPhpCode = fs.readFileSync('fixtures/php_output3.php', 'utf-8').trim();
  t.equal(phpCode, goodPhpCode);
  t.end();
});

test('http post with quotes inside data - php', function (t) {
  var curlHttpPostCommand = fs.readFileSync('fixtures/curl18.txt', 'utf-8');
  var phpCode = curlconverter.toPhp(curlHttpPostCommand);
  var goodPhpCode = fs.readFileSync('fixtures/php_output18.php', 'utf-8').trim();
  t.equal(phpCode, goodPhpCode);
  t.end();
});

test('http get with single header - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync('fixtures/curl8.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync('fixtures/node_output8.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});

test('http post with double quotes inside single quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync('fixtures/curl9.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync('fixtures/node_output9.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});

test('http post with single quotes inside double quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync('fixtures/curl10.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync('fixtures/node_output10.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});


test('http post with escaped double quotes inside single quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync('fixtures/curl12.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync('fixtures/node_output12.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});

test('http post with escaped single quotes inside double quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync('fixtures/curl13.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync('fixtures/node_output13.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});

test('http post with escaped double quotes inside double quotes body - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync('fixtures/curl11.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync('fixtures/node_output11.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});


test('http get with -L param - node', function (t) {
    var curlHttpPostCommand = fs.readFileSync('fixtures/curl14.txt', 'utf-8');
    var nodeCode = curlconverter.toNode(curlHttpPostCommand);
    var goodNodeCode = fs.readFileSync('fixtures/node_output14.js', 'utf-8').trim();
    t.equal(nodeCode, goodNodeCode);
    t.end();
});


test('http with charles syntax - python', function (t) {
    var curlHttpGetCommand = fs.readFileSync('fixtures/curl15.txt', 'utf-8');
    var pythonCode = curlconverter.toPython(curlHttpGetCommand);
    var goodPythonCode = fs.readFileSync('fixtures/python_output8.py', 'utf-8').trim();
    t.equal(pythonCode, goodPythonCode);
    t.end();
});

test('multiline http post with data - parser', function (t) {
    var curlHttpGetCommand = fs.readFileSync('fixtures/curl16.txt', 'utf-8');
    var parsedCommand = utils.parseCurlCommand(curlHttpGetCommand);
    var goodParserOutput = require('./fixtures/parser_output4.js');
    t.deepEquals(parsedCommand, goodParserOutput);
    t.end();
});

test('http put with file - python', function (t) {
    var curlHttpGetCommand = fs.readFileSync('fixtures/curl17.txt', 'utf-8');
    var pythonCode = curlconverter.toPython(curlHttpGetCommand);
    var goodPythonCode = fs.readFileSync('fixtures/python_output9.py', 'utf-8');
    t.equal(pythonCode, goodPythonCode);
    t.end();
});

test('http get with -k/--insecure - python', function (t) {
    var curlHttpGetCommand0 = fs.readFileSync('fixtures/curl20.txt', 'utf-8');
    var curlHttpGetCommand1 = fs.readFileSync('fixtures/curl21.txt', 'utf-8');
    var pythonCode0 = curlconverter.toPython(curlHttpGetCommand0);
    var pythonCode1 = curlconverter.toPython(curlHttpGetCommand1);
    var goodPythonCode = fs.readFileSync('fixtures/python_output10.py', 'utf-8').trim();
    t.equal(pythonCode0, pythonCode1, goodPythonCode);
    t.end();
});
