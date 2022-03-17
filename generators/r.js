// Author: Bob Rudis (bob@rud.is)

import * as util from '../util.js'

import jsesc from 'jsesc'
import querystring from 'query-string'

function reprn (value) { // back-tick quote names
  if (!value) {
    return '``'
  } else {
    return '`' + value + '`'
  }
}

function repr (value) {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''"
  } else {
    return "'" + jsesc(value, { quotes: 'single' }) + "'"
  }
}

function getQueryDict (request) {
  let queryDict = 'params = list(\n'
  queryDict += Object.keys(request.queryDict).map((paramName) => {
    const rawValue = request.queryDict[paramName]
    let paramValue
    if (Array.isArray(rawValue)) {
      paramValue = 'c(' + rawValue.map(repr).join(', ') + ')'
    } else {
      paramValue = repr(rawValue)
    }
    return ('  ' + reprn(paramName) + ' = ' + paramValue)
  }).join(',\n')
  queryDict += '\n)\n'
  return queryDict
}

function getDataString (request) {
  if (!request.isDataRaw && request.data.startsWith('@')) {
    const filePath = request.data.slice(1)
    return 'data = upload_file(\'' + filePath + '\')'
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
    const els = []
    dataString = 'data = list(\n'
    for (const key in parsedQueryString) {
      const value = parsedQueryString[key]
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          els.push('  ' + reprn(key) + ' = ' + repr(value[i]))
        }
      } else {
        els.push('  ' + reprn(key) + ' = ' + repr(value))
      }
    }
    dataString += els.join(',\n')
    dataString += '\n)\n'
  } else {
    dataString = 'data = list(\n'
    dataString += Object.keys(parsedQueryString).map((key) => {
      const value = parsedQueryString[key]
      return ('  ' + reprn(key) + ' = ' + repr(value))
    }).join(',\n')
    dataString += '\n)\n'
  }

  return dataString
}

function getFilesString (request) {
  // http://docs.rstats-requests.org/en/master/user/quickstart/#post-a-multipart-encoded-file
  let filesString = 'files = list(\n'
  filesString += Object.keys(request.multipartUploads).map((multipartKey) => {
    const multipartValue = request.multipartUploads[multipartKey]
    let fileParam
    if (multipartValue.startsWith('@')) {
      const fileName = multipartValue.slice(1)
      // filesString += '    ' + reprn(multipartKey) + ' (' + repr(fileName) + ', upload_file(' + repr(fileName) + '))'
      fileParam = '  ' + reprn(multipartKey) + ' = upload_file(' + repr(fileName) + ')'
    } else {
      fileParam = '  ' + reprn(multipartKey) + ' = ' + repr(multipartValue) + ''
    }
    return (fileParam)
  }).join(',\n')
  filesString += '\n)\n'

  return filesString
}

export const _toR = request => {
  let cookieDict
  if (request.cookies) {
    cookieDict = 'cookies = c(\n'
    cookieDict += Object.keys(request.cookies).map(cookieName => '  ' + repr(cookieName) + ' = ' + repr(request.cookies[cookieName])).join(',\n')
    cookieDict += '\n)\n'
  }
  let headerDict
  if (request.headers) {
    const hels = []
    headerDict = 'headers = c(\n'
    for (const headerName in request.headers) {
      hels.push('  ' + reprn(headerName) + ' = ' + repr(request.headers[headerName]))
    }
    headerDict += hels.join(',\n')
    headerDict += '\n)\n'
  }

  let queryDict
  if (request.queryDict) {
    queryDict = getQueryDict(request)
  }

  let dataString
  let filesString
  if (request.data && typeof request.data === 'string') {
    dataString = getDataString(request)
  } else if (request.multipartUploads) {
    filesString = getFilesString(request)
  }
  // curl automatically prepends 'http' if the scheme is missing, but rstats fails and returns an error
  // we tack it on here to mimic curl
  if (!request.url.match(/https?:/)) {
    request.url = 'http://' + request.url
  }
  if (!request.urlWithoutQuery.match(/https?:/)) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }
  const url = request.queryDict ? request.urlWithoutQuery : request.url
  let requestLine = 'res <- httr::' + request.method.toUpperCase() + '(url = \'' + url + '\''

  let requestLineBody = ''
  if (request.headers) {
    requestLineBody += ', httr::add_headers(.headers=headers)'
  }
  if (request.queryDict) {
    requestLineBody += ', query = params'
  }
  if (request.cookies) {
    requestLineBody += ', httr::set_cookies(.cookies = cookies)'
  }
  if (request.data && typeof request.data === 'string') {
    requestLineBody += ', body = data'
  } else if (request.multipartUploads) {
    requestLineBody += ', body = files'
  }
  if (request.insecure) {
    requestLineBody += ', config = httr::config(ssl_verifypeer = FALSE)'
  }
  if (request.auth) {
    const [user, password] = request.auth
    requestLineBody += ', httr::authenticate(' + repr(user) + ', ' + repr(password) + ')'
  }
  requestLineBody += ')'

  requestLine += requestLineBody

  let rstatsCode = ''
  rstatsCode += 'require(httr)\n\n'
  if (cookieDict) {
    rstatsCode += cookieDict + '\n'
  }
  if (headerDict) {
    rstatsCode += headerDict + '\n'
  }
  if (queryDict) {
    rstatsCode += queryDict + '\n'
  }
  if (dataString) {
    rstatsCode += dataString + '\n'
  } else if (filesString) {
    rstatsCode += filesString + '\n'
  }
  rstatsCode += requestLine

  return rstatsCode + '\n'
}
export const toR = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toR(request)
}
