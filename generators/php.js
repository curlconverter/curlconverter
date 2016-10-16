var util = require('../util')
var querystring = require('querystring')

var toPhp = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)

  var headerString = false
  if (request.headers) {
    headerString = '$headers = array(\n'
    var i = 0
    var headerCount = Object.keys(request.headers).length
    for (var headerName in request.headers) {
      headerString += "    '" + headerName + "' => '" + request.headers[headerName] + "'"
      if (i < headerCount - 1) {
        headerString += ',\n'
      }
      i++
    }
    if (request.cookies) {
      var cookieString = util.serializeCookies(request.cookies)
      headerString += ",\n    'Cookie' => '" + cookieString + "'"
    }
    headerString += '\n);'
  } else {
    headerString = '$headers = array();'
  }

  var optionsString = false
  if (request.auth) {
    var splitAuth = request.auth.split(':')
    var user = splitAuth[0] || ''
    var password = splitAuth[1] || ''
    optionsString = "$options = array('auth' => array('" + user + "', '" + password + "'));"
  }

  var dataString = false
  if (request.data) {
    var parsedQueryString = querystring.parse(request.data)
    dataString = '$data = array(\n'
    var dataCount = Object.keys(parsedQueryString).length
    if (dataCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]) {
      dataString = "$data = '" + request.data + "';"
    } else {
      var dataIndex = 0
      for (var key in parsedQueryString) {
        var value = parsedQueryString[ key ]
        dataString += "    '" + key + "' => '" + value.replace(/[\\"']/g, '\\$&') + "'"
        if (dataIndex < dataCount - 1) {
          dataString += ',\n'
        }
        dataIndex++
      }
      dataString += '\n);'
    }
  }
  var requestLine = '$response = Requests::' + request.method + '(\'' + request.url + '\''
  requestLine += ', $headers'
  if (dataString) {
    requestLine += ', $data'
  }
  if (optionsString) {
    requestLine += ', $options'
  }
  requestLine += ');'

  var phpCode = '<?php\n'
  phpCode += 'include(\'vendor/rmccue/requests/library/Requests.php\');\n'
  phpCode += 'Requests::register_autoloader();\n'
  phpCode += headerString + '\n'
  if (dataString) {
    phpCode += dataString + '\n'
  }
  if (optionsString) {
    phpCode += optionsString + '\n'
  }

  phpCode += requestLine

  return phpCode
}

module.exports = toPhp
