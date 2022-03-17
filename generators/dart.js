import * as util from '../util.js'
import jsesc from 'jsesc'

function repr (value) {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''"
  } else {
    return "'" + jsesc(value, { quotes: 'single' }) + "'"
  }
}

export const _toDart = r => {
  let s = ''

  if (r.auth || r.isDataBinary) s += "import 'dart:convert';\n"

  s +=
    "import 'package:http/http.dart' as http;\n" +
    '\n' +
    'void main() async {\n'

  if (r.auth) {
    const [uname, pword] = r.auth

    s +=
      "  var uname = '" + uname + "';\n" +
      "  var pword = '" + pword + "';\n" +
      "  var authn = 'Basic ' + base64Encode(utf8.encode('$uname:$pword'));\n" +
      '\n'
  }

  const hasHeaders = r.headers || r.cookies || r.compressed || r.isDataBinary || r.method === 'put'
  if (hasHeaders) {
    s += '  var headers = {\n'
    for (const [hname, hval] of (r.headers || [])) {
      s += "    '" + hname + "': '" + hval + "',\n"
    }

    if (r.cookies) {
      const cookiestr = util.serializeCookies(r.cookies)
      s += "    'Cookie': '" + cookiestr + "',\n"
    }

    if (r.auth) s += "    'Authorization': authn,\n"
    if (r.compressed) s += "    'Accept-Encoding': 'gzip',\n"
    if (!util.hasHeader(r, 'content-type') && (r.isDataBinary || r.method === 'put')) {
      s += "    'Content-Type': 'application/x-www-form-urlencoded',\n"
    }

    s += '  };\n'
    s += '\n'
  }

  const hasQuery = r.query
  if (hasQuery) {
    // TODO: dict won't work with repeated keys
    s += '  var params = {\n'
    for (const [paramName, rawValue] of r.query) {
      const paramValue = repr(rawValue === null ? '' : rawValue)
      s += '    ' + repr(paramName) + ': ' + paramValue + ',\n'
    }
    s += '  };\n'
    /* eslint-disable no-template-curly-in-string */
    s += "  var query = params.entries.map((p) => '${p.key}=${p.value}').join('&');\n"
    s += '\n'
  }

  const hasData = r.data
  if (hasData) {
    // escape single quotes if there're not already escaped
    if (r.data.indexOf("'") !== -1 && r.data.indexOf("\\'") === -1) r.data = jsesc(r.data)

    if (r.dataArray) {
      s += '  var data = {\n'
      for (let i = 0; i !== r.dataArray.length; ++i) {
        const kv = r.dataArray[i]
        const splitKv = kv.replace(/\\"/g, '"').split('=')
        const key = splitKv[0] || ''
        const val = splitKv[1] || ''
        s += "    '" + key + "': '" + val + "',\n"
      }
      s += '  };\n'
      s += '\n'
    } else if (r.isDataBinary) {
      s += `  var data = utf8.encode('${r.data}');\n\n`
    } else {
      s += `  var data = '${r.data}';\n\n`
    }
  }

  if (hasQuery) {
    s += '  var res = await http.' + r.method + "('" + r.urlWithoutQuery + "?$query'"
  } else {
    s += '  var res = await http.' + r.method + "('" + r.url + "'"
  }

  if (hasHeaders) s += ', headers: headers'
  else if (r.auth) s += ", headers: {'Authorization': authn}"
  if (hasData) s += ', body: data'

  /* eslint-disable no-template-curly-in-string */
  s +=
    ');\n' +
    "  if (res.statusCode != 200) throw Exception('http." + r.method + " error: statusCode= ${res.statusCode}');\n" +
    '  print(res.body);\n' +
    '}'

  return s + '\n'
}
export const toDart = curlCommand => {
  const r = util.parseCurlCommand(curlCommand)
  return _toDart(r)
}
