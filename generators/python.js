var util = require('../util')
var jsesc = require('jsesc')
var querystring = require('querystring')

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
  var filesString
  if (request.data) {
    if (request.data.startsWith('@')) {
      var filePath = request.data.slice(1)
      if (request.isDataBinary) {
        dataString = 'data = open(\'' + filePath + '\', \'rb\').read()'
      } else {
        dataString = 'data = open(\'' + filePath + '\')'
      }
    } else {
      var escapedData = request.data.replace(/'/g, "\\'")
      if (escapedData.indexOf("'") > -1) {
        escapedData = jsesc(request.data)
      }
      var parsedQueryString = querystring.parse(escapedData)
      dataString = 'data = {\n'
      var dataCount = Object.keys(parsedQueryString).length
      if (dataCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]) {
        dataString = "data = '" + request.data + "'\n"
      } else {
        var dataIndex = 0
        for (var key in parsedQueryString) {
          var value = parsedQueryString[key]
          dataString += "  '" + key + "': '" + value + "'"
          if (dataIndex < dataCount - 1) {
            dataString += ',\n'
          }
          dataIndex++
        }
        dataString += '\n}\n'
      }
    }
  } else if (request.multipartUploads) {
    // http://docs.python-requests.org/en/master/user/quickstart/#post-a-multipart-encoded-file
    filesString = 'files = {\n'
    var filesIndex = 0
    var filesCount = Object.keys(request.multipartUploads).length
    for (var multipartKey in request.multipartUploads) {
      var multipartValue = request.multipartUploads[multipartKey]
      if (multipartValue.startsWith('@')) {
        filesString += "    '" + multipartKey + "': open('" + multipartValue.slice(1) + "', 'rb')"
      } else {
        filesString += "    '" + multipartKey + "': '" + multipartValue + "'"
      }
      if (filesIndex < filesCount - 1) {
        filesString += ',\n'
      }
      filesIndex++
    }
    filesString += '\n}\n'
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
  } else if (request.multipartUploads) {
    requestLine += ', files=files'
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
  pythonCode += 'import requests\n\n'
  if (cookieDict) {
    pythonCode += cookieDict + '\n'
  }
  if (headerDict) {
    pythonCode += headerDict + '\n'
  }
  if (dataString) {
    pythonCode += dataString + '\n'
  } else if (filesString) {
    pythonCode += filesString + '\n'
  }
  pythonCode += requestLine

  return pythonCode
}

module.exports = toPython
