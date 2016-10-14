'use strict'
var test = require('tape')
var fs = require('fs')
var utils = require('./util')

// the curl_commands/ directory contains input files
// The file name is a description of the command.
// for each input file, there may be a corresponding output file in
// language-specific directories: node_output, php_output, python_output, parser_output
// we get a list of all input files, iterate over it, and if an output file exists, compare the output.

var inputFiles = fs.readdirSync('fixtures/curl_commands/')
inputFiles.forEach(function (fileName) {
  var inputFilePath = 'fixtures/curl_commands/' + fileName
  var testName = fileName.replace('_', ' ')
  var inputFileContents = fs.readFileSync(inputFilePath, 'utf-8')

  var parserFilePath = './fixtures/parser_output/' + fileName.replace('txt', 'js')
  if (fs.existsSync(parserFilePath)) {
    var goodParserOutput = require(parserFilePath)
    var parsedCommand = utils.parseCurlCommand(inputFileContents)
    test(testName, function (t) {
      t.deepEquals(parsedCommand, goodParserOutput)
      t.end()
    })
  }
})

