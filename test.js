'use strict'
var test = require('tape')
var fs = require('fs')

var utils = require('./util')
var curlconverter = require('./index.js')
var yargs = require('yargs')

// the curl_commands/ directory contains input files
// The file name is a description of the command.
// for each input file, there may be a corresponding output file in
// language-specific directories: node_output, php_output, python_output, parser_output
// we get a list of all input files, iterate over it, and if an output file exists, compare the output.

const outputs = [
  {
    name: 'R',
    extension: 'R',
    command: curlconverter.toR
  },
  {
    name: 'Python',
    extension: 'py',
    command: curlconverter.toPython
  },
  {
    name: 'Node',
    extension: 'js',
    command: curlconverter.toNode
  },
  {
    name: 'PHP',
    extension: 'php',
    command: curlconverter.toPhp
  },
  {
    name: 'Go',
    extension: 'go',
    command: curlconverter.toGo
  }

]

var testFile = function (fileName) {
  var inputFilePath = 'fixtures/curl_commands/' + fileName
  var inputFileContents = fs.readFileSync(inputFilePath, 'utf-8')

  var parserTestName = 'Parser: ' + fileName.replace(/_/g, ' ').replace('.txt', '')
  var parserFilePath = './fixtures/parser_output/' + fileName.replace('txt', 'js')
  if (fs.existsSync(parserFilePath)) {
    var goodParserOutput = require(parserFilePath)
    var parsedCommand = utils.parseCurlCommand(inputFileContents)
    test(parserTestName, function (t) {
      t.deepEquals(parsedCommand, goodParserOutput)
      t.end()
    })
  }

  outputs.forEach(function (output) {
    var directory = './fixtures/' + output.name.toLowerCase() + '_output/'

    var filePath = directory + fileName.replace('txt', output.extension)
    var testName = output.name + ': ' + fileName.replace(/_/g, ' ').replace('.txt', '')

    if (fs.existsSync(filePath)) {
      var goodCode = fs.readFileSync(filePath, 'utf-8')
      var code = output.command(inputFileContents)
      test(testName, function (t) {
        t.equal(code, goodCode)
        t.end()
      })
    }
  })
}
// get --test=test_name parameter and just run that test on its own
var testName = yargs.argv.test
if (testName) {
  var fileName = testName + '.txt'
  testFile(fileName)
} else {
  // otherwise, run them all
  var inputFiles = fs.readdirSync('fixtures/curl_commands/')
  inputFiles.forEach(testFile)
}
