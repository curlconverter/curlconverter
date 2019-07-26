var util = require('../util')
var jsesc = require('jsesc')

var toDart = function (curlCommand) {
  var r = util.parseCurlCommand(curlCommand)
  var s = "";

  if (r.auth) s += "import 'dart:convert' as convert;\n";

  s +=
    "import 'package:http/http.dart' as http;\n" +
    "\n" +
    "void main() async {\n";

  if (r.auth) {
    var splitAuth = r.auth.split(':');
    var uname = splitAuth[0] || '';
    var pword = splitAuth[1] || '';

    s +=
      "  var uname = '" + uname + "';\n" +
      "  var pword = '" + pword + "';\n" +
      "  var authn = 'Basic ' + convert.base64Encode(convert.utf8.encode('$uname:$pword'));\n" +
      "\n";
  }

  var hasHeaders = r.headers || r.cookies;
  if (hasHeaders) {
    s += "  var headers = {\n";
    for (var hname in r.headers) s += "    '" + hname + "': '" + r.headers[hname] + "',\n";

    if (r.cookies) {
      var cookiestr = util.serializeCookies(r.cookies)
      s += "    'Cookie': '" + cookiestr + "'\n";
    }

    if (r.auth) s += "    'Authentication': authn,\n";
    s += "  };\n";
    s += "\n";
  }

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

  // if (request.data) {
  //   dartCode += ',\n    body: dataString'
  // }


  s += "  var res = await http." + r.method + "('" + r.url + "'"
  if (hasHeaders) s += ", headers: headers";
  else if (r.auth) s += ", headers: {'Authentication': authn}";

  s +=
    ");\n" +
    "  if (res.statusCode != 200) throw Exception('" + r.method + " error: statusCode= ${res.statusCode}');\n" +
    "}";

  return s + "\n";
}

module.exports = toDart;