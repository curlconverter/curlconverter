var util = require('../util')
var fs = require('fs')

var toStrest = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  var inputFileContents = fs.readFileSync('./generators/strest.hbs', 'utf-8')
  var template = util.handlebars.compile(inputFileContents)
  var strest = template(request)
  console.log(request)
  return strest
}

module.exports = toStrest
