var util = require('../util')
var jsesc = require('jsesc')

require('string.prototype.startswith')

var toPython = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  var cookieDict
  if (request.cookies) {
    cookieDict = 'cookies = {\n'
    for (var cookieName in request.cookies) {
      cookieDict += "    '" + cookieName + "': '" + request.cookies[cookieName] + "',\n"
    }
    cookieDict += '}\n'
  }
  var headerDict
  if (request.headers) {
    headerDict = 'headers = {\n'
    for (var headerName in request.headers) {
      headerDict += "    '" + headerName + "': '" + request.headers[headerName] + "',\n"
    }
    headerDict += '}\n'
  }

  var dataString
  if (request.data) {
    if (request.data.startsWith('@')) {
      var filePath = request.data.slice(1)
      dataString = 'data = open(\'' + filePath + '\')'
    } else {
      var escapedData = request.data.replace(/'/g, "\\'")
      if (escapedData.indexOf("'") > -1) {
        escapedData = jsesc(request.data)
      }
      dataString = 'data = \'' + escapedData + '\'\n'
    }
  }
  var requestLine = 'requests.' + request.method + '(\'' + request.url + '\''
  if (request.headers) {
    requestLine += ', headers=headers'
  }
  if (request.cookies) {
    requestLine += ', cookies=cookies'
  }
  if (request.data) {
    requestLine += ', data=data'
  }
  if (request.insecure) {
    requestLine += ', verify=False'
  }
  if (request.auth) {
    var splitAuth = request.auth.split(':')
    var user = splitAuth[0] || ''
    var password = splitAuth[1] || ''
    requestLine += ", auth=('" + user + "', '" + password + "')"
  }
  requestLine += ')'

  var pythonCode = ''
  if (cookieDict) {
    pythonCode += cookieDict + '\n'
  }
  if (headerDict) {
    pythonCode += headerDict + '\n'
  }
  if (dataString) {
    pythonCode += dataString + '\n'
  }
  pythonCode += requestLine

  return pythonCode
}

module.exports = toPython
