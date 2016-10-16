'use strict'
var test = require('tape')
var fs = require('fs')

var utils = require('./util')
var curlconverter = require('./index.js')

// the curl_commands/ directory contains input files
// The file name is a description of the command.
// for each input file, there may be a corresponding output file in
// language-specific directories: node_output, php_output, python_output, parser_output
// we get a list of all input files, iterate over it, and if an output file exists, compare the output.

var inputFiles = fs.readdirSync('fixtures/curl_commands/')
inputFiles.forEach(function (fileName) {
  var inputFilePath = 'fixtures/curl_commands/' + fileName
  var parserTestName = 'Parser: ' + fileName.replace(/_/g, ' ').replace('.txt', '')
  var inputFileContents = fs.readFileSync(inputFilePath, 'utf-8')

  var parserFilePath = './fixtures/parser_output/' + fileName.replace('txt', 'js')
  if (fs.existsSync(parserFilePath)) {
    var goodParserOutput = require(parserFilePath)
    var parsedCommand = utils.parseCurlCommand(inputFileContents)
    test(parserTestName, function (t) {
      t.deepEquals(parsedCommand, goodParserOutput)
      t.end()
    })
  }
  var pythonFilePath = './fixtures/python_output/' + fileName.replace('txt', 'py')
  var pythonTestName = 'Python: ' + fileName.replace(/_/g, ' ').replace('.txt', '')

  if (fs.existsSync(pythonFilePath)) {
    var goodPythonCode = fs.readFileSync(pythonFilePath, 'utf-8')
    var pythonCode = curlconverter.toPython(inputFileContents)
    test(pythonTestName, function (t) {
      t.equal(pythonCode, goodPythonCode)
      t.end()
    })
  }

  var nodeFilePath = './fixtures/node_output/' + fileName.replace('txt', 'js')
  var nodeTestName = 'Node: ' + fileName.replace(/_/g, ' ').replace('.txt', '')

  if (fs.existsSync(nodeFilePath)) {
    var goodNodeCode = fs.readFileSync(nodeFilePath, 'utf-8')
    var nodeCode = curlconverter.toNode(inputFileContents)
    test(nodeTestName, function (t) {
      t.equal(nodeCode, goodNodeCode)
      t.end()
    })
  }
})

