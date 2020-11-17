const util = require('../util')
const jsesc = require('jsesc')
const querystring = require('query-string')

require('string.prototype.startswith')

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

function getQueryDict (request) {
  let queryDict = 'params = (\n'
  for (const paramName in request.query) {
    const rawValue = request.query[paramName]
    let paramValue
    if (Array.isArray(rawValue)) {
      paramValue = '[' + rawValue.map(repr).join(', ') + ']'
    } else {
      paramValue = repr(rawValue)
    }
    queryDict += '    (' + repr(paramName) + ', ' + paramValue + '),\n'
  }
  queryDict += ')\n'
  return queryDict
}

function getDataString (request) {
  if (typeof request.data === 'number') {
    request.data = request.data.toString()
  }
  if (!request.isDataRaw && request.data.startsWith('@')) {
    const filePath = request.data.slice(1)
    if (request.isDataBinary) {
      return 'data = open(\'' + filePath + '\', \'rb\').read()'
    } else {
      return 'data = open(\'' + filePath + '\')'
    }
  }

  const parsedQueryString = querystring.parse(request.data, { sort: false })
  const keyCount = Object.keys(parsedQueryString).length
  const singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  const singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    return 'data = ' + repr(request.data) + '\n'
  } else {
    return getMultipleDataString(request, parsedQueryString)
  }
}

function getMultipleDataString (request, parsedQueryString) {
  let repeatedKey = false
  for (const key in parsedQueryString) {
    const value = parsedQueryString[key]
    if (Array.isArray(value)) {
      repeatedKey = true
    }
  }

  let dataString
  if (repeatedKey) {
    dataString = 'data = [\n'
    for (const key in parsedQueryString) {
      const value = parsedQueryString[key]
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          dataString += '  (' + repr(key) + ', ' + repr(value[i]) + '),\n'
        }
      } else {
        dataString += '  (' + repr(key) + ', ' + repr(value) + '),\n'
      }
    }
    dataString += ']\n'
  } else {
    dataString = 'data = {\n'
    const elementCount = Object.keys(parsedQueryString).length
    let i = 0
    for (const key in parsedQueryString) {
      const value = parsedQueryString[key]
      dataString += '  ' + repr(key) + ': ' + repr(value)
      if (i === elementCount - 1) {
        dataString += '\n'
      } else {
        dataString += ',\n'
      }
      ++i
    }
    dataString += '}\n'
  }

  return dataString
}

function getFilesString (request) {
  // http://docs.python-requests.org/en/master/user/quickstart/#post-a-multipart-encoded-file
  let filesString = 'files = {\n'
  for (const multipartKey in request.multipartUploads) {
    const multipartValue = request.multipartUploads[multipartKey]
    if (multipartValue.startsWith('@')) {
      const fileName = multipartValue.slice(1)
      filesString += '    ' + repr(multipartKey) + ': (' + repr(fileName) + ', open(' + repr(fileName) + ", 'rb')),\n"
    } else {
      filesString += '    ' + repr(multipartKey) + ': (None, ' + repr(multipartValue) + '),\n'
    }
  }
  filesString += '}\n'

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

  const whiteSpaceSet = new Set()
  whiteSpaceSet.add(' ')
  whiteSpaceSet.add('\n')
  whiteSpaceSet.add('\t')

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

const toPython = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)

  // Currently, only assuming that the env-var only used in
  // the value part of cookies, params, or body
  const osVariables = new Set()

  let cookieDict
  if (request.cookies) {
    cookieDict = 'cookies = {\n'
    for (const cookieName in request.cookies) {
      const [detectedVars, modifiedString] = detectEnvVar(request.cookies[cookieName])

      const hasEnvironmentVariable = detectedVars.size > 0

      for (const newVar of detectedVars) {
        osVariables.add(newVar)
      }

      cookieDict += '    ' + repr(cookieName) + ': ' + reprWithVariable(modifiedString, hasEnvironmentVariable) + ',\n'
    }
    cookieDict += '}\n'
  }
  let headerDict
  if (request.headers) {
    headerDict = 'headers = {\n'
    for (const headerName in request.headers) {
      const [detectedVars, modifiedString] = detectEnvVar(request.headers[headerName])

      const hasVariable = detectedVars.size > 0

      for (const newVar of detectedVars) {
        osVariables.add(newVar)
      }

      headerDict += '    ' + repr(headerName) + ': ' + reprWithVariable(modifiedString, hasVariable) + ',\n'
    }
    headerDict += '}\n'
  }

  let queryDict
  if (request.query) {
    queryDict = getQueryDict(request)
  }

  let dataString
  let filesString
  if (typeof request.data === 'string' || typeof request.data === 'number') {
    dataString = getDataString(request)
  } else if (request.multipartUploads) {
    filesString = getFilesString(request)
  }
  // curl automatically prepends 'http' if the scheme is missing, but python fails and returns an error
  // we tack it on here to mimic curl
  if (!request.url.match(/https?:/)) {
    request.url = 'http://' + request.url
  }
  if (!request.urlWithoutQuery.match(/https?:/)) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }
  let requestLineWithUrlParams = 'response = requests.' + request.method + '(\'' + request.urlWithoutQuery + '\''
  let requestLineWithOriginalUrl = 'response = requests.' + request.method + '(\'' + request.url + '\''

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
  if (typeof request.data === 'string') {
    requestLineBody += ', data=data'
  } else if (request.multipartUploads) {
    requestLineBody += ', files=files'
  }
  if (request.insecure) {
    requestLineBody += ', verify=False'
  }
  if (request.auth) {
    const splitAuth = request.auth.split(':')
    const user = splitAuth[0] || ''
    const password = splitAuth[1] || ''
    requestLineBody += ', auth=(' + repr(user) + ', ' + repr(password) + ')'
  }
  requestLineBody += ')'

  requestLineWithOriginalUrl += requestLineBody.replace(', params=params', '')
  requestLineWithUrlParams += requestLineBody

  let pythonCode = ''

  // Sort import by name
  if (osVariables.size > 0) {
    pythonCode += 'import os\n'
  }

  pythonCode += 'import requests\n\n'

  if (osVariables.size > 0) {
    for (const osVar of osVariables) {
      const line = `${osVar} = os.getenv('${osVar}')\n`
      pythonCode += line
    }

    pythonCode += '\n'
  }

  if (cookieDict) {
    pythonCode += cookieDict + '\n'
  }
  if (headerDict) {
    pythonCode += headerDict + '\n'
  }
  if (queryDict) {
    pythonCode += queryDict + '\n'
  }
  if (dataString) {
    pythonCode += dataString + '\n'
  } else if (filesString) {
    pythonCode += filesString + '\n'
  }
  pythonCode += requestLineWithUrlParams

  if (request.query) {
    pythonCode += '\n\n' +
            '#NB. Original query string below. It seems impossible to parse and\n' +
            '#reproduce query strings 100% accurately so the one below is given\n' +
            '#in case the reproduced version is not "correct".\n'
    pythonCode += '# ' + requestLineWithOriginalUrl
  }

  return pythonCode + '\n'
}

module.exports = toPython
