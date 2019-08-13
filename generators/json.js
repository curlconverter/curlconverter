// Author: ssi-anik (sirajul.islam.anik@gmail.com)

var util = require('../util')
var querystring = require('querystring')
var jsesc = require('jsesc')

require('string.prototype.startswith')

function repr (value, isKey) {
  // In context of url parameters, don't accept nulls and such.
  /*
    if ( !value ) {
   return ""
   } else {
   return "'" + jsesc(value, { quotes: 'single' }) + "'"
   } */
  return isKey ? "'" + jsesc(value, { quotes: 'single' }) + "'" : value
}

function getQueries (request) {
  var queries = {}
  for (var paramName in request.query) {
    var rawValue = request.query[paramName]
    var paramValue
    if (Array.isArray(rawValue)) {
      paramValue = rawValue.map(repr)
    } else {
      paramValue = repr(rawValue)
    }
    queries[repr(paramName)] = paramValue
  }

  return queries
}

function getDataString (request) {
  if (typeof request.data === 'number') {
    request.data = request.data.toString()
  }

  /*
    if ( request.data.startsWith('@') ) {
   var filePath = request.data.slice(1);
   return filePath;
   }
   */

  var parsedQueryString = querystring.parse(request.data)
  var keyCount = Object.keys(parsedQueryString).length
  var singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  var singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    var data = {}
    data[repr(request.data)] = ''
    return { data: data }
  } else {
    return getMultipleDataString(request, parsedQueryString)
  }
}

function getMultipleDataString (request, parsedQueryString) {
  var data = {}

  for (var key in parsedQueryString) {
    var value = parsedQueryString[key].replace(/\^$/,"")
    if (Array.isArray(value)) {
      data[repr(key)] = value
    } else {
      data[repr(key)] = repr(value)
    }
  }

  return { data: data }
}

function getFilesString (request) {
  var data = {}

  data['files'] = {}
  data['data'] = {}

  for (var multipartKey in request.multipartUploads) {
    var multipartValue = request.multipartUploads[multipartKey]
    if (multipartValue.startsWith('@')) {
      var fileName = multipartValue.slice(1)
      data['files'][repr(multipartKey)] = repr(fileName)
    } else {
      data['data'][repr(multipartKey)] = repr(multipartValue)
    }
  }

  if (Object.keys(data['files']).length === 0) {
    delete data['files']
  }

  if (Object.keys(data['data']).length === 0) {
    delete data['data']
  }

  return data
}

var toJsonString = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)

  var requestJson = {}

  // curl automatically prepends 'http' if the scheme is missing, but python fails and returns an error
  // we tack it on here to mimic curl
  if (request.url.indexOf('http') !== 0) {
    request.url = 'http://' + request.url
  }

  if (request.urlWithoutQuery.indexOf('http') !== 0) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }

  requestJson['url'] = request.urlWithoutQuery.replace(/\/$/, '')
  requestJson['raw_url'] = request.url
  requestJson['method'] = request.method

  if (request.cookies) {
    var cookies = {}
    for (var cookieName in request.cookies) {
      cookies[repr(cookieName)] = repr(request.cookies[cookieName])
    }

    requestJson['cookies'] = cookies
  }

  if (request.headers) {
    var headers = {}
    for (var headerName in request.headers) {
      headers[repr(headerName)] = repr(request.headers[headerName])
    }

    requestJson['headers'] = headers
  }

  if (request.query) {
    requestJson['queries'] = getQueries(request)
  }

  if (typeof request.data === 'string' || typeof request.data === 'number') {
    Object.assign(requestJson, getDataString(request))
  } else if (request.multipartUploads) {
    Object.assign(requestJson, getFilesString(request))
  }

  if (request.insecure) {
    requestJson['insecure'] = false
  }

  if (request.auth) {
    var splitAuth = request.auth.split(':')
    var user = splitAuth[0] || ''
    var password = splitAuth[1] || ''

    requestJson['auth'] = {
      user: repr(user),
      password: repr(password)
    }
  }

  return JSON.stringify(Object.keys(requestJson).length ? requestJson : '{}') + '\n'
}

module.exports = toJsonString
