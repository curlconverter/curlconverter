var util = require('../util')
var jsesc = require('jsesc')

var toNode = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  var nodeCode = 'var request = require(\'request\');\n\n'
  if (request.headers || request.cookies) {
    nodeCode += 'var headers = {\n'
    var headerCount = Object.keys(request.headers).length
    var i = 0
    for (var headerName in request.headers) {
      nodeCode += '    \'' + headerName + '\': \'' + request.headers[headerName] + '\''
      if (i < headerCount - 1 || request.cookies) {
        nodeCode += ',\n'
      } else {
        nodeCode += '\n'
      }
      i++
    }
    if (request.cookies) {
      var cookieString = util.serializeCookies(request.cookies)
      nodeCode += '    \'Cookie\': \'' + cookieString + '\'\n'
    }
    nodeCode += '};\n\n'
  }

  if (request.data) {
        // escape single quotes if there are any in there
    if (request.data.indexOf("'") > -1) {
      request.data = jsesc(request.data)
    }
    nodeCode += 'var dataString = \'' + request.data + '\';\n\n'
  }

  nodeCode += 'var options = {\n'
  nodeCode += '    url: \'' + request.url + '\''
  if (request.method !== 'get') {
    nodeCode += ',\n    method: \'' + request.method.toUpperCase() + '\''
  }

  if (request.headers || request.cookies) {
    nodeCode += ',\n'
    nodeCode += '    headers: headers'
  }
  if (request.data) {
    nodeCode += ',\n    body: dataString'
  }

  if (request.auth) {
    nodeCode += ',\n'
    var splitAuth = request.auth.split(':')
    var user = splitAuth[0] || ''
    var password = splitAuth[1] || ''
    nodeCode += '    auth: {\n'
    nodeCode += "        'user': '" + user + "',\n"
    nodeCode += "        'pass': '" + password + "'\n"
    nodeCode += '    }\n'
  } else {
    nodeCode += '\n'
  }
  nodeCode += '};\n\n'

  nodeCode += 'function callback(error, response, body) {\n'
  nodeCode += '    if (!error && response.statusCode == 200) {\n'
  nodeCode += '        console.log(body);\n'
  nodeCode += '    }\n'
  nodeCode += '}\n\n'
  nodeCode += 'request(options, callback);'

  return nodeCode + '\n'
}

module.exports = toNode
