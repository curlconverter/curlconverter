import * as util from '../../util.js'
import jsesc from 'jsesc'

export const _toJavaScript = request => {
  let jsFetchCode = ''

  if (request.data) {
    // escape single quotes if there are any in there
    if (request.data.indexOf("'") > -1) {
      request.data = jsesc(request.data)
    }

    try {
      JSON.parse(request.data)

      if (!request.headers) {
        request.headers = []
      }

      if (!util.hasHeader(request, 'Content-Type')) {
        request.headers.push(['Content-Type', 'application/json; charset=UTF-8'])
      }

      request.data = 'JSON.stringify(' + request.data + ')'
    } catch {
      request.data = '\'' + request.data + '\''
    }
  }

  jsFetchCode += 'fetch(\'' + request.url + '\''

  if (request.method.toUpperCase() !== 'GET' || request.headers || request.auth || request.body) {
    jsFetchCode += ', {\n'

    if (request.method.toUpperCase() !== 'GET') {
      // TODO: If you pass a weird method to fetch() it won't uppercase it
      // const methods = []
      // const method = methods.includes(request.method.toLowerCase()) ? request.method.toUpperCase() : request.method
      jsFetchCode += '    method: \'' + request.method.toUpperCase() + '\''
    }

    if (request.headers || request.auth) {
      if (request.method.toUpperCase() !== 'GET') {
        jsFetchCode += ',\n'
      }
      jsFetchCode += '    headers: {\n'
      const headerCount = request.headers ? request.headers.length : 0
      let i = 0
      for (const [headerName, headerValue] of (request.headers || [])) {
        jsFetchCode += '        \'' + headerName + '\': \'' + headerValue + '\''
        if (i < headerCount - 1 || request.auth) {
          jsFetchCode += ',\n'
        }
        i++
      }
      if (request.auth) {
        const [user, password] = request.auth
        jsFetchCode += '        \'Authorization\': \'Basic \' + btoa(\'' + user + ':' + password + '\')'
      }

      jsFetchCode += '\n    }'
    }

    if (request.data) {
      jsFetchCode += ',\n    body: ' + request.data
    }

    jsFetchCode += '\n}'
  }

  jsFetchCode += ');'

  return jsFetchCode + '\n'
}

export const toJavaScript = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toJavaScript(request)
}
