var util = require('../util')
var jsesc = require('jsesc')

var toDart = function (curlCommand) {
  var r = util.parseCurlCommand(curlCommand)
  var s =
    "import 'package:http/http.dart' as http;\n\n" +
    "void main() async {\n" +
    "  var res = await http.delete('" + r.url + "');\n" +
    "  if (res.statusCode != 200) throw Exception('" + r.method + " error: statusCode= ${res.statusCode}');\n" +
    "}";

  // var dartCode = 'var request = require(\'request\');\n\n'
  // if (request.headers || request.cookies) {
  //   dartCode += 'var headers = {\n'
  //   var headerCount = Object.keys(request.headers).length
  //   var i = 0
  //   for (var headerName in request.headers) {
  //     dartCode += '    \'' + headerName + '\': \'' + request.headers[headerName] + '\''
  //     if (i < headerCount - 1 || request.cookies) {
  //       dartCode += ',\n'
  //     } else {
  //       dartCode += '\n'
  //     }
  //     i++
  //   }
  //   if (request.cookies) {
  //     var cookieString = util.serializeCookies(request.cookies)
  //     dartCode += '    \'Cookie\': \'' + cookieString + '\'\n'
  //   }
  //   dartCode += '};\n\n'
  // }

  // if (request.data) {
  //   // escape single quotes if there are any in there
  //   if (request.data.indexOf("'") > -1) {
  //     request.data = jsesc(request.data)
  //   }
  //   dartCode += 'var dataString = \'' + request.data + '\';\n\n'
  // }

  // dartCode += 'var options = {\n'
  // dartCode += '    url: \'' + request.url + '\''
  // if (request.method !== 'get') {
  //   dartCode += ',\n    method: \'' + request.method.toUpperCase() + '\''
  // }

  // if (request.headers || request.cookies) {
  //   dartCode += ',\n'
  //   dartCode += '    headers: headers'
  // }
  // if (request.data) {
  //   dartCode += ',\n    body: dataString'
  // }

  // if (request.auth) {
  //   dartCode += ',\n'
  //   var splitAuth = request.auth.split(':')
  //   var user = splitAuth[0] || ''
  //   var password = splitAuth[1] || ''
  //   dartCode += '    auth: {\n'
  //   dartCode += "        'user': '" + user + "',\n"
  //   dartCode += "        'pass': '" + password + "'\n"
  //   dartCode += '    }\n'
  // } else {
  //   dartCode += '\n'
  // }
  // dartCode += '};\n\n'

  // dartCode += 'function callback(error, response, body) {\n'
  // dartCode += '    if (!error && response.statusCode == 200) {\n'
  // dartCode += '        console.log(body);\n'
  // dartCode += '    }\n'
  // dartCode += '}\n\n'
  // dartCode += 'request(options, callback);'

  return s + "\n";
}

module.exports = toDart;