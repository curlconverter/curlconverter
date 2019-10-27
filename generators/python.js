const util = require('../util')
const jsesc = require('jsesc')
const querystring = require('querystring')

require('string.prototype.startswith')

function repr (value) {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''"
  } else {
    return "'" + jsesc(value, { quotes: 'single' }) + "'"
  }
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
  if (request.data.startsWith('@')) {
    const filePath = request.data.slice(1)
    if (request.isDataBinary) {
      return 'data = open(\'' + filePath + '\', \'rb\').read()'
    } else {
      return 'data = open(\'' + filePath + '\')'
    }
  }

  const parsedQueryString = querystring.parse(request.data)
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

const toPython = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  let cookieDict
  if (request.cookies) {
    cookieDict = 'cookies = {\n'
    for (const cookieName in request.cookies) {
      cookieDict += '    ' + repr(cookieName) + ': ' + repr(request.cookies[cookieName]) + ',\n'
    }
    cookieDict += '}\n'
  }
  let headerDict
  if (request.headers) {
    headerDict = 'headers = {\n'
    for (const headerName in request.headers) {
      headerDict += '    ' + repr(headerName) + ': ' + repr(request.headers[headerName]) + ',\n'
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
  if (request.url.indexOf('http') !== 0) {
    request.url = 'http://' + request.url
  }
  if (request.urlWithoutQuery.indexOf('http') !== 0) {
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
  pythonCode += 'import requests\n\n'
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
