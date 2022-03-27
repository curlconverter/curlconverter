import * as util from '../util.js'

import jsesc from 'jsesc'
import querystring from 'query-string'

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

  const cookies = []
  for (const [cookieName, cookieValue] of request.cookies) {
    cookies.push(`${cookieName}=${cookieValue}`)
  }
  return `cookies: [~s|${cookies.join('; ')}|]`
}

function getOptions (request) {
  const hackneyOptions = []

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

  let hackneyOptionsString = ''
  if (hackneyOptions.length) {
    hackneyOptionsString = `hackney: [${hackneyOptions.join(', ')}]`
  }

  return `[${hackneyOptionsString}]`
}

function getBasicAuth (request) {
  if (!request.auth) {
    return ''
  }

  const [user, password] = request.auth
  return `basic_auth: {${repr(user)}, ${repr(password)}}`
}

function getQueryDict (request) {
  if (!request.query) {
    return '[]'
  }
  let queryDict = '[\n'
  for (const [paramName, rawValue] of request.query) {
    queryDict += `    {${repr(paramName)}, ${repr(rawValue)}},\n`
  }
  queryDict += '  ]'
  return queryDict
}

function getHeadersDict (request) {
  if (!request.headers) {
    return '[]'
  }
  let dict = '[\n'
  for (const [headerName, headerValue] of request.headers) {
    dict += `    {${repr(headerName)}, ${repr(headerValue)}},\n`
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
  if (request.data && typeof request.data === 'string') {
    return getDataString(request)
  }

  if (!request.multipartUploads) {
    return ''
  }

  let fileArgs = []
  let dataArgs = []
  for (const [multipartKey, multipartValue] of request.multipartUploads) {
    if (multipartValue.startsWith('@')) {
      const fileName = multipartValue.slice(1)
      fileArgs.push(`    {:file, ~s|${fileName}|}`)
    } else {
      dataArgs.push(`    {${repr(multipartKey)}, ${repr(multipartValue)}}`)
    }
  }

  let content = []
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
  if (!request.isDataRaw && request.data.startsWith('@')) {
    const filePath = request.data.slice(1)
    if (request.isDataBinary) {
      return `File.read!("${filePath}")`
    } else {
      return `{:file, ~s|${filePath}|}`
    }
  }

  const parsedQueryString = querystring.parse(request.data, { sort: false })
  const keyCount = Object.keys(parsedQueryString).length
  const singleKeyOnly =
    keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  const singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    return `~s|${request.data}|`
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
    const data = []
    for (const key in parsedQueryString) {
      const value = parsedQueryString[key]
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
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
    for (const key in parsedQueryString) {
      const value = parsedQueryString[key]
      data.push(`    {${repr(key)}, ${repr(value)}}`)
    }
    dataString = `[
${data.join(',\n')}
  ]`
  }

  return dataString
}

export const _toElixir = request => {
  // curl automatically prepends 'http' if the scheme is missing, but python fails and returns an error
  // we tack it on here to mimic curl
  if (!request.url.match(/https?:/)) {
    request.url = 'http://' + request.url
  }
  if (!request.urlWithoutQuery.match(/https?:/)) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }
  if (request.cookies) {
    util.deleteHeader(request, 'cookie')
  }

  const template = `request = %HTTPoison.Request{
  method: :${request.method.toLowerCase()},
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
export const toElixir = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toElixir(request)
}
