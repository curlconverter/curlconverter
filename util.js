var cookie = require('cookie')
var yargs = require('yargs')

/**
 * given this: [ 'msg1=value1', 'msg2=value2' ]
 * output this: 'msg1=value1&msg2=value2'
 * @param dataArguments
 */
var joinDataArguments = function (dataArguments) {
  var data = ''
  dataArguments.forEach(function (argument, i) {
    if (i === 0) {
      data += argument
    } else {
      data += '&' + argument
    }
  })
  return data
}

var parseCurlCommand = function (curlCommand) {
  var newlineFound = /\r|\n/.exec(curlCommand)
  if (newlineFound) {
        // remove newlines
    curlCommand = curlCommand.replace(/\\\r|\\\n/g, '')
  }
  var yargObject = yargs(curlCommand.trim())
  var parsedArguments = yargObject.argv
  var cookieString
  var cookies
  var url = parsedArguments._[1]
    // if url argument wasn't where we expected it, check other places
    // it shows up
  if (!url && parsedArguments['L']) {
    url = parsedArguments['L']
  }
  if (!url && parsedArguments['compressed']) {
    url = parsedArguments['compressed']
  }
  var headers
  if (parsedArguments.H) {
    headers = {}
    if (!Array.isArray(parsedArguments.H)) {
      parsedArguments.H = [parsedArguments.H]
    }
    parsedArguments.H.forEach(function (header) {
      if (header.indexOf('Cookie') !== -1) {
        cookieString = header
      } else {
        var colonIndex = header.indexOf(':')
        var headerName = header.substring(0, colonIndex)
        var headerValue = header.substring(colonIndex + 1).trim()
        headers[headerName] = headerValue
      }
    })
  }
  var multipartUploads
  if (parsedArguments.F) {
    multipartUploads = {}
    if (!Array.isArray(parsedArguments.F)) {
      parsedArguments.F = [parsedArguments.F]
    }
    parsedArguments.F.forEach(function (multipartArgument) {
      // input looks like key=value. value could be json or a file path prepended with an @
      var splitArguments = multipartArgument.split('=', 2)
      var key = splitArguments[0]
      var value = splitArguments[1]
      multipartUploads[key] = value
    })
  }
  if (cookieString) {
    var cookieParseOptions = {
      decode: function (s) { return s }
    }
    cookies = cookie.parse(cookieString.replace('Cookie: ', ''), cookieParseOptions)
  }
  var method
  if (parsedArguments.X === 'POST') {
    method = 'post'
  } else if (parsedArguments.X === 'PUT') {
    method = 'put'
  } else if (parsedArguments.d || parsedArguments.data || parsedArguments['data-binary']) {
    method = 'post'
  } else {
    method = 'get'
  }
  var request = {
    url: url,
    method: method
  }
  if (headers) {
    request.headers = headers
  }
  if (cookies) {
    request.cookies = cookies
  }
  if (multipartUploads) {
    request.multipartUploads = multipartUploads
  }
  if (parsedArguments.data) {
    request.data = parsedArguments.data
  } else if (parsedArguments['data-binary']) {
    request.data = parsedArguments['data-binary']
    request.isDataBinary = true
  } else if (parsedArguments['d']) {
    request.data = parsedArguments['d']
  }

  if (parsedArguments['u']) {
    request.auth = parsedArguments['u']
  }
  if (parsedArguments['user']) {
    request.auth = parsedArguments['user']
  }
  if (Array.isArray(request.data)) {
    request.data = joinDataArguments(request.data)
  }

  if (parsedArguments['k'] || parsedArguments['insecure']) {
    request.insecure = true
  }
  return request
}

var serializeCookies = function (cookieDict) {
  var cookieString = ''
  var i = 0
  var cookieCount = Object.keys(cookieDict).length
  for (var cookieName in cookieDict) {
    var cookieValue = cookieDict[cookieName]
    cookieString += cookieName + '=' + cookieValue
    if (i < cookieCount - 1) {
      cookieString += '; '
    }
    i++
  }
  return cookieString
}

module.exports = {
  parseCurlCommand: parseCurlCommand,
  serializeCookies: serializeCookies
}

