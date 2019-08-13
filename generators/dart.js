var util = require('../util')
var jsesc = require('jsesc')

var toDart = function (curlCommand) {
  var r = util.parseCurlCommand(curlCommand)
  var s = ''

  if (r.auth || r.isDataBinary) s += "import 'dart:convert';\n"

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
      "  var authn = 'Basic ' + base64Encode(utf8.encode('$uname:$pword'));\n" +
      '\n'
  }

  var hasHeaders = r.headers || r.cookies || r.compressed || r.isDataBinary || r.method === 'put'
  if (hasHeaders) {
    s += '  var headers = {\n'
    for (var hname in r.headers) s += "    '" + hname + "': '" + r.headers[hname] + "',\n"

    if (r.cookies) {
      var cookiestr = util.serializeCookies(r.cookies)
      s += "    'Cookie': '" + cookiestr + "',\n"
    }

    if (r.auth) s += "    'authorization': authn,\n"
    if (r.compressed) s += "    'accept-encoding': 'gzip',\n"
    if (r.isDataBinary || r.method === 'put') s += "    'content-type': 'application/x-www-form-urlencoded',\n"

    s += '  };\n'
    s += '\n'
  }

  var hasData = r.data
  if (hasData) {
    // escape single quotes if there're not already escaped
    if (r.data.indexOf("'") !== -1 && r.data.indexOf("\\'") === -1) r.data = jsesc(r.data)

    if (r.dataArray) {
      s += '  var data = {\n'
      for (var i = 0; i !== r.dataArray.length; ++i) {
        var kv = r.dataArray[i]
        var splitKv = kv.replace(/\\"/g, '"').split('=')
        var key = splitKv[0] || ''
        var val = splitKv[1] || ''
        s += "    '" + key + "': '" + val + "',\n"
      };
      s += '  };\n'
      s += '\n'
    } else if (r.isDataBinary) {
      s += `  var data = utf8.encode('${r.data}');\n\n`
    } else {
      s += `  var data = '${r.data.replace(/\^\&/g,"&")}';\n\n`
    }
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
