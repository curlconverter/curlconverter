var util = require('../util')
var jsesc = require('jsesc')
var querystring = require('query-string')

require('string.prototype.startswith')

function repr (value) {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return '""'
  } else {
    return `~s|${jsesc(value, { quotes: 'backticks' })}|`
  }
}

function getCookies (request) {
  if (!request.cookies) {
    return ''
  }

  var cookies = []
  for (var cookieName in request.cookies) {
    cookies.push(`${cookieName}=${request.cookies[cookieName]}`)
  }
  return `cookies: [~s|${cookies.join('; ')}|]`
}

function getOptions (request) {
  var hackneyOptions = []

  const auth = getBasicAuth(request)
  if (auth) {
    hackneyOptions.push(auth)
  }

  if (request.insecure) {
    hackneyOptions.push(':insecure')
  }

  const cookies = getCookies(request)
  if (cookies) {
    hackneyOptions.push(cookies)
  }

  var hackneyOptionsString = ''
  if (hackneyOptions.length) {
    hackneyOptionsString = `hackney: [${hackneyOptions.join(', ')}]`
  }

  return `[${hackneyOptionsString}]`
}

function getBasicAuth (request) {
  if (!request.auth) {
    return ''
  }

  var splitAuth = request.auth.split(':')
  var user = splitAuth[0] || ''
  var password = splitAuth[1] || ''

  return `basic_auth: {${repr(user)}, ${repr(password)}}`
}

function getQueryDict (request) {
  if (!request.query) {
    return '[]'
  }
  var queryDict = '[\n'
  for (var paramName in request.query) {
    var rawValue = request.query[paramName]
    var paramValue
    if (Array.isArray(rawValue)) {
      paramValue = '[' + rawValue.map(repr).join(', ') + ']'
    } else {
      paramValue = repr(rawValue)
    }
    queryDict += `    {${repr(paramName)}, ${paramValue}},\n`
  }
  queryDict += '  ]'
  return queryDict
}

function getHeadersDict (request) {
  if (!request.headers) {
    return '[]'
  }
  var dict = '[\n'
  for (var headerName in request.headers) {
    dict += `    {${repr(headerName)}, ${repr(request.headers[headerName])}},\n`
  }
  dict += '  ]'
  return dict
}

function getBody (request) {
  const formData = getFormDataString(request)

  if (formData) {
    return formData
  }

  return '""'
}

function getFormDataString (request) {
  if (typeof request.data === 'string' || typeof request.data === 'number') {
    return getDataString(request)
  }

  if (!request.multipartUploads) {
    return ''
  }

  var fileArgs = []
  var dataArgs = []
  for (var multipartKey in request.multipartUploads) {
    var multipartValue = request.multipartUploads[multipartKey]
    if (multipartValue.startsWith('@')) {
      var fileName = multipartValue.slice(1)
      fileArgs.push(`    {:file, ~s|${fileName}|}`)
    } else {
      dataArgs.push(`    {${repr(multipartKey)}, ${repr(multipartValue)}}`)
    }
  }

  var content = []
  fileArgs = fileArgs.join(',\n')
  if (fileArgs) {
    content.push(fileArgs)
  }

  dataArgs = dataArgs.join(',\n')
  if (dataArgs) {
    content.push(dataArgs)
  }

  content = content.join(',\n')
  if (content) {
    return `{:multipart, [
${content}
]}`
  }

  return ''
}

function getDataString (request) {
  if (typeof request.data === 'number') {
    request.data = request.data.toString()
  }
  if (!request.isDataRaw && request.data.startsWith('@')) {
    var filePath = request.data.slice(1)
    if (request.isDataBinary) {
      return `File.read!("${filePath}")`
    } else {
      return `{:file, ~s|${filePath}|}`
    }
  }

  var parsedQueryString = querystring.parse(request.data, { sort: false })
  var keyCount = Object.keys(parsedQueryString).length
  var singleKeyOnly =
    keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  var singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    return `~s|${request.data}|`
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
    const data = []
    for (key in parsedQueryString) {
      value = parsedQueryString[key]
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          data.push(`    {${repr(key)}, ${repr(value[i])}}`)
        }
      } else {
        data.push(`    {${repr(key)}, ${repr(value)}}`)
      }
    }
    dataString = `[
${data.join(',\n')}
  ]`
  } else {
    const data = []
    for (key in parsedQueryString) {
      value = parsedQueryString[key]
      data.push(`    {${repr(key)}, ${repr(value)}}`)
    }
    dataString = `[
${data.join(',\n')}
  ]`
  }

  return dataString
}

var toElixir = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  // curl automatically prepends 'http' if the scheme is missing, but python fails and returns an error
  // we tack it on here to mimic curl
  if (!request.url.match(/https?:/)) {
    request.url = 'http://' + request.url
  }
  if (!request.urlWithoutQuery.match(/https?:/)) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }

  const template = `request = %HTTPoison.Request{
  method: :${request.method},
  url: "${request.urlWithoutQuery}",
  options: ${getOptions(request)},
  headers: ${getHeadersDict(request)},
  params: ${getQueryDict(request)},
  body: ${getBody(request)}
}

response = HTTPoison.request(request)
`

  return template
}

module.exports = toElixir
