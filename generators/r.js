// Author: Bob Rudis (bob@rud.is)

var util = require('../util')
var jsesc = require('jsesc')
var querystring = require('querystring')

require('string.prototype.startswith')

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
  var queryDict = 'params = list(\n'
  queryDict += Object.keys(request.query).map((paramName) => {
    var rawValue = request.query[paramName]
    var paramValue
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
  if (typeof request.data === 'number') {
    request.data = request.data.toString()
  }
  if (request.data.startsWith('@')) {
    var filePath = request.data.slice(1)
    return 'data = upload_file(\'' + filePath + '\')'
  }

  var parsedQueryString = querystring.parse(request.data)
  var keyCount = Object.keys(parsedQueryString).length
  var singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  var singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    return 'data = ' + repr(request.data) + '\n'
  } else {
    return getMultipleDataString(request, parsedQueryString)
  }
}

function getMultipleDataString (request, parsedQueryString) {
  var repeatedKey = false
  for (var key in parsedQueryString) {
    var value = parsedQueryString[key]
    if (Array.isArray(value)) {
      repeatedKey = true
    }
  }

  var dataString
  if (repeatedKey) {
    var els = []
    dataString = 'data = list(\n'
    for (key in parsedQueryString) {
      value = parsedQueryString[key]
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
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
      value = parsedQueryString[key]
      return ('  ' + reprn(key) + ' = ' + repr(value))
    }).join(',\n')
    dataString += '\n)\n'
  }

  return dataString
}

function getFilesString (request) {
  // http://docs.rstats-requests.org/en/master/user/quickstart/#post-a-multipart-encoded-file
  var filesString = 'files = list(\n'
  filesString += Object.keys(request.multipartUploads).map((multipartKey) => {
    var multipartValue = request.multipartUploads[multipartKey]
    var fileParam
    if (multipartValue.startsWith('@')) {
      var fileName = multipartValue.slice(1)
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

var torstats = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  var cookieDict
  if (request.cookies) {
    cookieDict = 'cookies = c(\n'
    cookieDict += Object.keys(request.cookies).map((cookieName) => {
      return ('  ' + repr(cookieName) + ' = ' + repr(request.cookies[cookieName]))
    }).join(',\n')
    cookieDict += '\n)\n'
  }
  var headerDict
  if (request.headers) {
    var hels = []
    headerDict = 'headers = c(\n'
    for (var headerName in request.headers) {
      hels.push('  ' + reprn(headerName) + ' = ' + repr(request.headers[headerName]))
    }
    headerDict += hels.join(',\n')
    headerDict += '\n)\n'
  }

  var queryDict
  if (request.query) {
    queryDict = getQueryDict(request)
  }

  var dataString
  var filesString
  if (typeof request.data === 'string' || typeof request.data === 'number') {
    dataString = getDataString(request)
  } else if (request.multipartUploads) {
    filesString = getFilesString(request)
  }
  // curl automatically prepends 'http' if the scheme is missing, but rstats fails and returns an error
  // we tack it on here to mimic curl
  if (request.url.indexOf('http') !== 0) {
    request.url = 'http://' + request.url
  }
  if (request.urlWithoutQuery.indexOf('http') !== 0) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }
  var requestLineWithUrlParams = 'res <- httr::' + request.method.toUpperCase() + '(url = \'' + request.urlWithoutQuery + '\''
  var requestLineWithOriginalUrl = 'res <- httr::' + request.method.toUpperCase() + '(url = \'' + request.url + '\''

  var requestLineBody = ''
  if (request.headers) {
    requestLineBody += ', httr::add_headers(.headers=headers)'
  }
  if (request.query) {
    requestLineBody += ', query = params'
  }
  if (request.cookies) {
    requestLineBody += ', httr::set_cookies(.cookies = cookies)'
  }
  if (typeof request.data === 'string') {
    requestLineBody += ', body = data'
  } else if (request.multipartUploads) {
    requestLineBody += ', body = files'
  }
  if (request.insecure) {
    requestLineBody += ', config = httr::config(ssl_verifypeer = FALSE)'
  }
  if (request.auth) {
    var splitAuth = request.auth.split(':')
    var user = splitAuth[0] || ''
    var password = splitAuth[1] || ''
    requestLineBody += ', httr::authenticate(' + repr(user) + ', ' + repr(password) + ')'
  }
  requestLineBody += ')'

  requestLineWithOriginalUrl += requestLineBody.replace(', query = params', '')
  requestLineWithUrlParams += requestLineBody

  var rstatsCode = ''
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
  rstatsCode += requestLineWithUrlParams

  if (request.query) {
    rstatsCode += '\n\n' +
            '#NB. Original query string below. It seems impossible to parse and\n' +
            '#reproduce query strings 100% accurately so the one below is given\n' +
            '#in case the reproduced version is not "correct".\n'
    rstatsCode += '# ' + requestLineWithOriginalUrl
  }

  return rstatsCode + '\n'
}

module.exports = torstats
