const util = require('../../util')
const jsesc = require('jsesc')

const toNodeRequest = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  let nodeRequestCode = 'var request = require(\'request\');\n\n'
  if (request.headers || request.cookies) {
    nodeRequestCode += 'var headers = {\n'
    const headerCount = Object.keys(request.headers).length
    let i = 0
    for (const headerName in request.headers) {
      nodeRequestCode += '    \'' + headerName + '\': \'' + request.headers[headerName] + '\''
      if (i < headerCount - 1 || request.cookies) {
        nodeRequestCode += ',\n'
      } else {
        nodeRequestCode += '\n'
      }
      i++
    }
    if (request.cookies) {
      const cookieString = util.serializeCookies(request.cookies)
      nodeRequestCode += '    \'Cookie\': \'' + cookieString + '\'\n'
    }
    nodeRequestCode += '};\n\n'
  }

  if (request.data === true) {
    request.data = ''
  }
  if (request.data) {
    if (typeof request.data === 'number') {
      request.data = request.data.toString()
    }
    // escape single quotes if there are any in there
    if (request.data.indexOf("'") > -1) {
      request.data = jsesc(request.data)
    }
    nodeRequestCode += 'var dataString = \'' + request.data + '\';\n\n'
  }

  nodeRequestCode += 'var options = {\n'
  nodeRequestCode += '    url: \'' + request.url + '\''
  if (request.method !== 'get') {
    nodeRequestCode += ',\n    method: \'' + request.method.toUpperCase() + '\''
  }

  if (request.headers || request.cookies) {
    nodeRequestCode += ',\n'
    nodeRequestCode += '    headers: headers'
  }
  if (request.data) {
    nodeRequestCode += ',\n    body: dataString'
  }

  if (request.auth) {
    nodeRequestCode += ',\n'
    const splitAuth = request.auth.split(':')
    const user = splitAuth[0] || ''
    const password = splitAuth[1] || ''
    nodeRequestCode += '    auth: {\n'
    nodeRequestCode += "        'user': '" + user + "',\n"
    nodeRequestCode += "        'pass': '" + password + "'\n"
    nodeRequestCode += '    }\n'
  } else {
    nodeRequestCode += '\n'
  }
  nodeRequestCode += '};\n\n'

  nodeRequestCode += 'function callback(error, response, body) {\n'
  nodeRequestCode += '    if (!error && response.statusCode == 200) {\n'
  nodeRequestCode += '        console.log(body);\n'
  nodeRequestCode += '    }\n'
  nodeRequestCode += '}\n\n'
  nodeRequestCode += 'request(options, callback);'

  return nodeRequestCode + '\n'
}

module.exports = toNodeRequest
