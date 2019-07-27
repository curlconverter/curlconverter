var util = require('../util')

var toDart = function (curlCommand) {
  var r = util.parseCurlCommand(curlCommand)
  var s = ''

  if (r.auth) s += "import 'dart:convert' as convert;\n"

  s +=
    "import 'package:http/http.dart' as http;\n" +
    '\n' +
    'void main() async {\n'

  if (r.auth) {
    var splitAuth = r.auth.split(':')
    var uname = splitAuth[0] || ''
    var pword = splitAuth[1] || ''

    s +=
      "  var uname = '" + uname + "';\n" +
      "  var pword = '" + pword + "';\n" +
      "  var authn = 'Basic ' + convert.base64Encode(convert.utf8.encode('$uname:$pword'));\n" +
      '\n'
  }

  var hasHeaders = r.headers || r.cookies || r.compressed
  if (hasHeaders) {
    s += '  var headers = {\n'
    for (var hname in r.headers) s += "    '" + hname + "': '" + r.headers[hname] + "',\n"

    if (r.cookies) {
      var cookiestr = util.serializeCookies(r.cookies)
      s += "    'Cookie': '" + cookiestr + "',\n"
    }

    if (r.compressed) {
      s += "    'Accept-Encoding': 'gzip',\n"
    }

    if (r.auth) s += "    'authorization': authn,\n"
    s += '  };\n'
    s += '\n'
  }

  var hasData = r.dataArray;
  if (hasData) {
    s += '  var data = {\n'
    r.dataArray.forEach(function (kv) {
      var splitKv = kv.replace(/\\"/g, '"').split('=')
      var key = splitKv[0] || ''
      var val = splitKv[1] || ''
      s += "    '" + key + "': '" + val + "',\n"
    });
    s += '  };\n'
    s += '\n';
  }

  s += '  var res = await http.' + r.method + "('" + r.url + "'"
  if (hasHeaders) s += ', headers: headers'
  else if (r.auth) s += ", headers: {'authorization': authn}"
  if (hasData) s += ', body: data'

  /* eslint-disable no-template-curly-in-string */
  s +=
    ');\n' +
    "  if (res.statusCode != 200) throw Exception('" + r.method + " error: statusCode= ${res.statusCode}');\n" +
    '  print(res.body);\n' +
    '}'

  return s + '\n'
}

module.exports = toDart
