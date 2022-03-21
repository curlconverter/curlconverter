import * as util from '../util.js'

import jsesc from 'jsesc'

function reprWithVariable (value, hasEnvironmentVariable) {
  if (!value) {
    return "''"
  }

  if (!hasEnvironmentVariable) {
    return "'" + jsesc(value, { quotes: 'single' }) + "'"
  }

  return 'f"' + jsesc(value, { quotes: 'double' }) + '"'
}

function repr (value) {
  // In context of url parameters, don't accept nulls and such.
  return reprWithVariable(value, false)
}

function objToPython (obj, indent = 0) {
  let s = ''
  switch (typeof obj) {
    case 'string':
      s += repr(obj)
      break
    case 'number':
      s += obj
      break
    case 'boolean':
      s += obj ? 'True' : 'False'
      break
    case 'object':
      if (obj === null) {
        s += 'None'
      } else if (Array.isArray(obj)) {
        if (obj.length === 0) {
          s += '[]'
        } else {
          s += '[\n'
          for (const item of obj) {
            s += ' '.repeat(indent + 4) + objToPython(item, indent + 4) + ',\n'
          }
          s += ' '.repeat(indent) + ']'
        }
      } else {
        const len = Object.keys(obj).length
        if (len === 0) {
          s += '{}'
        } else {
          s += '{\n'
          for (const [k, v] of Object.entries(obj)) {
            // repr() because JSON keys must be strings.
            s += ' '.repeat(indent + 4) + repr(k) + ': ' + objToPython(v, indent + 4) + ',\n'
          }
          s += ' '.repeat(indent) + '}'
        }
      }
      break
    default:
      throw new util.CCError('unexpected object type that shouldn\'t appear in JSON: ' + typeof obj)
  }
  return s
}

function objToDictOrListOfTuples (obj) {
  if (!Array.isArray(obj)) {
    return objToPython(obj)
  }
  if (obj.length === 0) {
    return '[]'
  }
  let s = '[\n'
  for (const vals of obj) {
    s += '    (' + vals.map(objToPython).join(', ') + '),\n'
  }
  s += ']'
  return s
}

function getDataString (request) {
  if (!request.isDataRaw && request.data.startsWith('@')) {
    const filePath = request.data.slice(1)
    if (request.isDataBinary) {
      return ["data = open('" + filePath + "', 'rb').read()\n", null, null]
    } else {
      return ["data = open('" + filePath + "')\n", null, null]
    }
  }

  const dataString = 'data = ' + repr(request.data) + '\n'

  const isJson = util.hasHeader(request, 'content-type') &&
        util.getHeader(request, 'content-type').split(';')[0].trim() === 'application/json'
  if (isJson) {
    try {
      const dataAsJson = JSON.parse(request.data)
      // TODO: we actually want to know how it's serialized by
      // simplejson or Python's builtin json library,
      // which is what Requests uses
      // https://github.com/psf/requests/blob/b0e025ade7ed30ed53ab61f542779af7e024932e/requests/models.py#L473
      // but this is hopefully good enough.
      const roundtrips = JSON.stringify(dataAsJson) === request.data
      const jsonDataString = 'json_data = ' + objToPython(dataAsJson) + '\n'
      return [dataString, jsonDataString, roundtrips]
    } catch {}
  }

  const [parsedQuery, parsedQueryAsDict] = util.parseQueryString(request.data)
  if (!request.isDataBinary &&
      parsedQuery &&
      parsedQuery.length &&
      !parsedQuery.some(p => p[1] === null)) {
    const dataPythonObj = 'data = ' + objToDictOrListOfTuples(parsedQueryAsDict || parsedQuery) + '\n'
    return [dataPythonObj, null, null]
  }
  return [dataString, null, null]
}

function getFilesString (request) {
  const multipartUploads = request.multipartUploads.map(m => {
    let multipartValue
    if (m[1].startsWith('@')) {
      const fileName = m[1].slice(1)
      multipartValue = '(' + repr(fileName) + ', open(' + repr(fileName) + ", 'rb'))"
    } else {
      multipartValue = '(None, ' + repr(m[1]) + ')'
    }
    return [m[0], multipartValue]
  })

  const multipartUploadsAsDict = Object.fromEntries(multipartUploads)

  let filesString = 'files = '
  if (Object.keys(multipartUploadsAsDict).length === multipartUploads.length) {
    filesString += '{\n'
    for (const [multipartKey, multipartValue] of multipartUploads) {
      filesString += '    ' + repr(multipartKey) + ': ' + multipartValue + ',\n'
    }
    filesString += '}\n'
  } else {
    filesString += '[\n'
    for (const [multipartKey, multipartValue] of multipartUploads) {
      filesString += '    (' + repr(multipartKey) + ', ' + multipartValue + '),\n'
    }
    filesString += ']\n'
  }

  return filesString
}

// convertVarToStringFormat will convert if inputString to f"..." format
// if inputString has possible variable as its substring
function detectEnvVar (inputString) {
  // Using state machine to detect environment variable
  // Each character is an edge, state machine:
  // IN_ENV_VAR: means that currently we are iterating inside a possible environment variable
  // IN_STRING: means that currently we are iterating inside a normal string
  // For example:
  // "Hi my name is $USER_NAME !"
  // '$' --> will move state from IN_STRING to IN_ENV_VAR
  // ' ' --> will move state to IN_STRING, regardless the previous state

  const IN_ENV_VAR = 0
  const IN_STRING = 1

  // We only care for the unique element
  const detectedVariables = new Set()
  let currState = IN_STRING
  let envVarStartIndex = -1

  const whiteSpaceSet = new Set(' \n\t')

  const modifiedString = []
  for (const idx in inputString) {
    const currIdx = +idx
    const currChar = inputString[currIdx]
    if (currState === IN_ENV_VAR && whiteSpaceSet.has(currChar)) {
      const newVariable = inputString.substring(envVarStartIndex, currIdx)

      if (newVariable !== '') {
        detectedVariables.add(newVariable)

        // Change $ -> {
        // Add } after the last variable name
        modifiedString.push('{' + newVariable + '}' + currChar)
      } else {
        modifiedString.push('$' + currChar)
      }
      currState = IN_STRING
      envVarStartIndex = -1
      continue
    }

    if (currState === IN_ENV_VAR) {
      // Skip until we actually have the new variable
      continue
    }

    // currState === IN_STRING
    if (currChar === '$') {
      currState = IN_ENV_VAR
      envVarStartIndex = currIdx + 1
    } else {
      modifiedString.push(currChar)
    }
  }

  if (currState === IN_ENV_VAR) {
    const newVariable = inputString.substring(envVarStartIndex, inputString.length)

    if (newVariable !== '') {
      detectedVariables.add(newVariable)
      modifiedString.push('{' + newVariable + '}')
    } else {
      modifiedString.push('$')
    }
  }

  return [detectedVariables, modifiedString.join('')]
}

export const _toPython = request => {
  // Currently, only assuming that the env-var only used in
  // the value part of cookies, params, or body
  const osVariables = new Set()
  const commentedOutHeaders = {}
  // https://github.com/icing/blog/blob/main/curl_on_a_weekend.md
  if (util.getHeader(request, 'te') === 'trailers') {
    commentedOutHeaders.te = "Requests doesn't support trailers"
  }

  let cookieDict
  if (request.cookies) {
    // TODO: could have repeat cookies
    cookieDict = 'cookies = {\n'
    for (const [cookieName, cookieValue] of request.cookies) {
      const [detectedVars, modifiedString] = detectEnvVar(cookieValue)

      const hasEnvironmentVariable = detectedVars.size > 0

      for (const newVar of detectedVars) {
        osVariables.add(newVar)
      }

      cookieDict += '    ' + repr(cookieName) + ': ' + reprWithVariable(modifiedString, hasEnvironmentVariable) + ',\n'
    }
    cookieDict += '}\n'
    // TODO: cookieDict should too, to avoid surprises.
    commentedOutHeaders.cookie = request.cookies.length > 1 ? 'Requests sorts cookies= alphabetically' : ''
  }

  let proxyDict
  if (request.proxy) {
    const proxy = request.proxy.includes('://') ? request.proxy : 'http://' + request.proxy
    const protocol = proxy.split('://')[0].toLowerCase()

    proxyDict = 'proxies = {\n'
    switch (protocol) {
      case 'http':
      case 'https':
        // TODO: hopefully including both is right
        proxyDict += "    'http': " + repr(proxy) + ',\n'
        proxyDict += "    'https': " + repr(proxy) + ',\n'
        break
      case 'socks':
        proxyDict += "    'socks4': " + repr(proxy) + ',\n'
        break
      case 'socks4':
      case 'socks5':
      case 'socks5h':
      case 'socks4a':
      default:
        proxyDict += "    '" + protocol + "': " + repr(proxy) + ',\n'
        break
      // default:
      //   throw new CCError('Unsupported proxy scheme for ' + repr(request.proxy))
    }
    proxyDict += '}\n'
  }

  let certStr
  if (request.cert) {
    certStr = 'cert = '
    if (Array.isArray(request.cert)) {
      certStr += '(' + request.cert.map(repr).join(', ') + ')'
    } else {
      certStr += repr(request.cert)
    }
    certStr += '\n'
  }

  let queryStr
  if (request.query) {
    queryStr = 'params = ' + objToDictOrListOfTuples(request.queryDict || request.query) + '\n'
  }

  let dataString
  let jsonDataString
  let jsonDataStringRoundtrips
  let filesString
  if (request.data && typeof request.data === 'string') {
    [dataString, jsonDataString, jsonDataStringRoundtrips] = getDataString(request)
    // Remove "Content-Type" from the headers dict
    // because Requests adds it automatically when you use json=
    if (jsonDataString && util.getHeader(request, 'content-type').trim() === 'application/json') {
      commentedOutHeaders['content-type'] = 'Already added when you pass json='
      if (!jsonDataStringRoundtrips) {
        commentedOutHeaders['content-type'] += ' but not when you pass data='
      }
    }
  } else if (request.multipartUploads) {
    filesString = getFilesString(request)
    // If you pass files= then Requests adds this header and a `boundary`
    // If you manually pass a Content-Type header it won't set a `boundary`
    // wheras curl does, so the request will fail.
    // https://github.com/curlconverter/curlconverter/issues/248
    if (filesString &&
        util.hasHeader(request, 'content-type') &&
        util.getHeader(request, 'content-type').trim() === 'multipart/form-data' &&
        !util.getHeader(request, 'content-type').includes('boundary=')) {
      // TODO: better wording
      commentedOutHeaders['content-type'] = "requests won't add a boundary if this header is set when you pass files="
    }
  }

  let headerDict
  if (request.headers) {
    // TODO: what if there are repeat headers
    headerDict = 'headers = {\n'
    for (const [headerName, headerValue] of request.headers) {
      const [detectedVars, modifiedString] = detectEnvVar(headerValue)

      const hasVariable = detectedVars.size > 0

      for (const newVar of detectedVars) {
        osVariables.add(newVar)
      }

      let lineStart
      if (util.has(commentedOutHeaders, headerName.toLowerCase())) {
        if (commentedOutHeaders[headerName.toLowerCase()]) {
          headerDict += '    # ' + commentedOutHeaders[headerName.toLowerCase()] + '\n'
        }
        lineStart = '    # '
      } else {
        lineStart = '    '
      }
      headerDict += lineStart + repr(headerName) + ': ' + reprWithVariable(modifiedString, hasVariable) + ',\n'
    }
    headerDict += '}\n'
  }

  // curl automatically prepends 'http' if the scheme is missing, but python fails and returns an error
  // we tack it on here to mimic curl
  // TODO: warn users about unsupported schemes
  if (!request.url.match(/https?:/)) {
    request.url = 'http://' + request.url
  }
  if (!request.urlWithoutQuery.match(/https?:/)) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }
  let requestLine = 'response = requests.' + request.method + '(' + repr(request.urlWithoutQuery)

  let requestLineBody = ''
  if (request.headers) {
    requestLineBody += ', headers=headers'
  }
  if (request.query) {
    requestLineBody += ', params=params'
  }
  if (request.cookies) {
    requestLineBody += ', cookies=cookies'
  }
  if (request.data && typeof request.data === 'string') {
    if (jsonDataString) {
      requestLineBody += ', json=json_data'
    } else {
      requestLineBody += ', data=data'
    }
  } else if (request.multipartUploads) {
    requestLineBody += ', files=files'
  }
  if (request.proxy) {
    requestLineBody += ', proxies=proxies'
  }
  if (request.cert) {
    requestLineBody += ', cert=cert'
  }
  if (request.insecure) {
    requestLineBody += ', verify=False'
  } else if (request.cacert || request.capath) {
    requestLineBody += ', verify=' + repr(request.cacert || request.capath)
  }

  if (request.auth) {
    const [user, password] = request.auth
    const authClass = request.digest ? 'HTTPDigestAuth' : ''
    requestLineBody += ', auth=' + authClass + '(' + repr(user) + ', ' + repr(password) + ')'
  }
  requestLineBody += ')'

  requestLine += requestLineBody

  let pythonCode = ''

  // Sort import by name
  if (osVariables.size > 0) {
    pythonCode += 'import os\n'
  }

  pythonCode += 'import requests\n'
  if (request.auth && request.digest) {
    pythonCode += 'from requests.auth import HTTPDigestAuth\n'
  }
  pythonCode += '\n'

  if (osVariables.size > 0) {
    for (const osVar of osVariables) {
      const line = `${osVar} = os.getenv('${osVar}')\n`
      pythonCode += line
    }

    pythonCode += '\n'
  }

  if (proxyDict) {
    pythonCode += proxyDict + '\n'
  }

  if (cookieDict) {
    pythonCode += cookieDict + '\n'
  }
  if (headerDict) {
    pythonCode += headerDict + '\n'
  }
  if (queryStr) {
    pythonCode += queryStr + '\n'
  }
  if (certStr) {
    pythonCode += certStr + '\n'
  }
  if (jsonDataString) {
    pythonCode += jsonDataString + '\n'
  } else if (dataString) {
    pythonCode += dataString + '\n'
  } else if (filesString) {
    pythonCode += filesString + '\n'
  }

  if (request.http2 || request.http3) {
    // TODO: warn users out of band, not in the generated code
    const version = request.http2 ? '2' : '3'
    pythonCode += `# Warning: this was an HTTP/${version} request but requests only supports HTTP/1.1\n`
  }
  pythonCode += requestLine

  if (jsonDataString && !jsonDataStringRoundtrips) {
    pythonCode += '\n\n' +
            '# Note: json_data will not be serialized by requests\n' +
            '# exactly as it was in the original request.\n'
    pythonCode += '#' + dataString
    pythonCode += '#' + requestLine.replace(', json=json_data', ', data=data')
  }

  if (request.output && request.output !== '/dev/null') {
    if (request.output === '-') {
      pythonCode += '\nprint(response.text)'
    } else {
      pythonCode += '\n\nwith open(' + repr(request.output) + ", 'wb') as f:\n    f.write(response.content)"
    }
  }

  return pythonCode + '\n'
}
export const toPython = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toPython(request)
}
