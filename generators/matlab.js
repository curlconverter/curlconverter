const util = require('../util')
const jsesc = require('jsesc')

function repr (value) {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''"
  } else {
    return "'" + jsesc(value, { quotes: 'single' }) + "'"
  }
}

const prepareOptions = function (options) {
  let response = '\noptions = weboptions'
  const pairValues = addCellArray(options, ['HeaderFields'], ',', 1, true)

  if (pairValues === '') return ''

  response += pairValues
  response += ';'

  return response
}

const chooseRequestFunction = function (request) {
  // Choose `webwrite` if sending a payload body
  return request.data || request.multipartUploads ? 'webwrite' : 'webread'
}

const parseWebOptions = function (request) {
  const options = {}

  // TODO: request.data is a char vector containing JSON data, use struct in MATLAB

  // Not supported by MATLAB:
  // * request.compressed - compressing the response with gzip
  // * not following redirects
  // * disabling SSL verification - workaround is to use
  //    matlab.net.http.RequestMessage and setting
  //    the matlab.net.http.HTTPOptions.VerifyServerName to false

  // MATLAB uses GET in `webread` and POST in `webwrite` by default
  // thus, it is necessary to set the method for other requests
  if (request.method !== 'get' && request.method !== 'post') {
    options['RequestMethod'] = request.method
  }

  if (request.auth) {
    const [username, password] = request.auth.split(':')
    if (username !== '') options['Username'] = `${username}`
    options['Password'] = `${password}`
  }

  if (request.cookies) {
    request.headers['Cookie'] = `char(join(join(cookies, '='), '; '))`
  }

  let headerCount = 0
  if (request.headers) {
    const headers = {}
    for (const [key, value] of Object.entries(request.headers)) {
      switch (key) {
        case 'User-Agent':
          options['UserAgent'] = value
          break
        case 'Content-Type':
          options['MediaType'] = value
          break
        case 'Cookie':
          headers['Cookie'] = value
          ++headerCount
          break
        case 'Accept':
          switch (value) {
            case 'application/json':
              options['ContentType'] = 'json'
              break
            case 'text/csv':
              options['ContentType'] = 'table'
              break
            case 'text/plain':
            case 'text/html':
            case 'application/javascript':
            case 'application/x-javascript':
            case 'application/x-www-form-urlencoded':
              options['ContentType'] = 'text'
              break
            case 'text/xml':
            case 'application/xml':
              options['ContentType'] = 'xmldom'
              break
            case 'application/octet-stream':
              options['ContentType'] = 'binary'
              break
            default:
              if (value.startsWith('image/')) {
                options['ContentType'] = 'image'
              } else if (value.startsWith('audio/')) {
                options['ContentType'] = 'audio'
              } else {
                headers[key] = value
                ++headerCount
              }
          }
          break
        default:
          headers[key] = value
          ++headerCount
      }
    }

    if (headerCount > 0) {
      options['HeaderFields'] = addCellArray(headers, ['Cookie'], '', 2)
    }
  }

  return options
}

function prepareRequest (request, func, options) {
  let response = `\nresponse = ${func}(url`
  let fullResponse = `\nfullUrl = '${request.url}';`
  fullResponse += `\nresponse = ${func}(fullUrl`

  if (request.query) {
    response += `, params{:}`
    // fullResponse: it is already in the fullUrl
  }

  if (request.data) {
    response += `, body`
    fullResponse += `, body`
  } else if (request.multipartUploads) {
    response += `, files{:}`
    fullResponse += `, files{:}`
  }

  if (Object.keys(options).length > 0) {
    response += `, options`
    fullResponse += `, options`
  }
  response += ');'
  fullResponse += ');'

  if (request.query) {
    response += `\n\n% NB. Original query string below. It seems impossible to parse and`
    response += `\n% reproduce query strings 100% accurately so the one below is given`
    response += `\n% in case the reproduced version is not "correct".`
    response += fullResponse
  }
  return response
}

function parseCommand (curlCommand) {
  const request = util.parseCurlCommand(curlCommand)

  // Check whether to use `webread` or `webwrite`
  const func = chooseRequestFunction(request)

  // Parse request for weboptions
  const options = parseWebOptions(request)

  return [request, func, options]
}

function addCellArray (mapping, keysNotToQuote, keyValSeparator, indentLevel, pairs) {
  const indentUnit = ' '.repeat(4)
  const indent = indentUnit.repeat(indentLevel)
  const indentPrevLevel = indentUnit.repeat(indentLevel - 1)

  const entries = Object.entries(mapping)
  if (entries.length === 0) return ''

  let response = pairs ? '(' : '{'
  if (entries.length === 1) {
    let [key, value] = entries.pop()
    if (keysNotToQuote && !keysNotToQuote.includes(key)) value = `${repr(value)}`
    response += `${repr(key)}${keyValSeparator} ${value}`
  } else {
    if (pairs) response += '...'
    let counter = entries.length
    for (let [key, value] of entries) {
      --counter
      if (keysNotToQuote && !keysNotToQuote.includes(key)) {
        if (typeof value === 'object') {
          value = `[${value.map(repr).join()}]`
        } else {
          value = `${repr(value)}`
        }
      }
      response += `\n${indent}${repr(key)}${keyValSeparator} ${value}`
      if (pairs) {
        if (counter !== 0) response += ','
        response += `...`
      }
    }
    response += `\n${indentPrevLevel}`
  }
  response += pairs ? ')' : '}'
  return response
}

function prepareQueryString (request) {
  let response = ''
  if (request.query) {
    response += '\nparams = '
    response += addCellArray(request.query, [], ';', 1)
    response += ';'
  }
  return response
}

function prepareBody (request) {
  let response = ''
  if (request.data) {
    if (typeof request.data === 'boolean') {
      response += `\nbody = ''`
    } else if (request.data[0] === '@') {
      request.b64fileupload = true
      response += `\nbody = getB64File(${repr(request.data.slice(1))});`
    } else {
      response += `\nbody = ${repr(request.data)};`
    }
  }
  return response
}

function prepareCookies (request) {
  let cookies = ''
  if (request.cookies) {
    cookies = '\ncookies = '
    cookies += addCellArray(request.cookies, [], '', 1)
    cookies += ';'
  }
  // cookie string: char(join(join(cookies, '='), '; '))
  return cookies
}

function prepareFiles (request) {
  let files = ''

  if (request.multipartUploads) {
    const keysNotToQuote = []
    files += '\nfiles = '
    for (const [key, value] of Object.entries(request.multipartUploads)) {
      if (value[0] === '@') {
        request.b64fileupload = true
        keysNotToQuote.push(key)
        request.multipartUploads[key] = `getB64File(${repr(value.slice(1))})`
      }
    }
    files += addCellArray(request.multipartUploads, keysNotToQuote, ';', 1)
    files += ';'
  }
  return files
}

function prepareB64FileFunc (request) {
  if (!request.b64fileupload) { return '' }

  return `\n\nfunction b64file = getB64File(filename)` +
      `\n    fid = fopen(filename, 'rb');` +
      `\n    bytes = fread(fid);` +
      `\n    fclose(fid);` +
      `\n    encoder = org.apache.commons.codec.binary.Base64;` +
      `\n    b64file = char(encoder.encode(bytes))';` +
      `\nend`
}

function prepareResponse (request, func, options) {
  // Set URL of the request
  let response = `url = '${request.urlWithoutQuery}';`

  response += prepareCookies(request) // add cookies
  response += prepareQueryString(request) // query string
  response += prepareFiles(request) // form fields
  response += prepareBody(request) // payload data

  // Add weboptions if necessary
  response += prepareOptions(options)

  // Make a request
  response += prepareRequest(request, func, options)

  response += prepareB64FileFunc(request)
  return response + '\n'
}

const toMATLAB = function (curlCommand) {
  const [request, func, options] = parseCommand(curlCommand)
  return prepareResponse(request, func, options)
}

module.exports = toMATLAB
