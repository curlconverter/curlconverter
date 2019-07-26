var util = require('../util')
var jsesc = require('jsesc')

var toDart = function (curlCommand) {
  var r = util.parseCurlCommand(curlCommand)
  var s = "";

  s +=
    "import 'package:http/http.dart' as http;\n" +
    "\n" +
    "void main() async {\n";

  var hasHeaders = r.auth;
  if (hasHeaders) s += "  var headers = Map<String, String>();\n";

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

  if (r.auth) {
    s = "import 'dart:convert' as convert;\n" + s;

    var splitAuth = r.auth.split(':');
    var uname = splitAuth[0] || '';
    var pword = splitAuth[1] || '';

    s +=
      "  var uname = '" + uname + "';\n" +
      "  var pword = '" + pword + "';\n" +
      "  headers['Authentication'] = 'Basic ' + convert.base64Encode(convert.utf8.encode('$uname:$pword'));\n" +
      "\n";
  }

  s += "  var res = await http." + r.method + "('" + r.url + "'"
  if (hasHeaders) s += ", headers: headers";

  s +=
    ");\n" +
    "  if (res.statusCode != 200) throw Exception('" + r.method + " error: statusCode= ${res.statusCode}');\n" +
    "}";

  return s + "\n";
}

module.exports = toDart;