const util = require('../util')
const jsesc = require('jsesc')

const repr = (value) => {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''"
  } else {
    return "'" + jsesc(value, { quotes: 'single' }).replace(/\\'/g, "''") + "'"
  }
}

const setVariableValue = (outputVariable, value, termination) => {
  let result = ''

  if (outputVariable) {
    result += outputVariable + ' = '
  }

  result += value
  result += typeof termination === 'undefined' ? ';' : termination
  return result
}

const callFunction = (outputVariable, functionName, params, termination) => {
  // TODO: split key, val pairs into multiple lines
  let functionCall = functionName + '('
  if (Array.isArray(params)) {
    const singleLine = params.map(x => Array.isArray(x) ? x.join(', ') : x).join(', ')
    const indentLevel = 1
    const indent = ' '.repeat(4 * indentLevel)
    const skipToNextLine = '...\n' + indent
    let multiLine = skipToNextLine
    multiLine += params.map(x => Array.isArray(x) ? x.join(', ') : x)
      .join(',' + skipToNextLine)
    multiLine += '...\n'
    // Split the params in multiple lines - if one line is not enough
    const combinedSingleLineLength = [outputVariable, functionName, singleLine]
      .map(x => x ? x.length : 0).reduce((x, y) => x + y) +
      (outputVariable ? 3 : 0) + 2 + (termination ? termination.length : 1)
    functionCall += combinedSingleLineLength < 120 ? singleLine : multiLine
  } else {
    functionCall += params
  }
  functionCall += ')'
  return setVariableValue(outputVariable, functionCall, termination)
}

const addCellArray = (mapping, keysNotToQuote, keyValSeparator, indentLevel, pairs) => {
  const indentUnit = ' '.repeat(4)
  const indent = indentUnit.repeat(indentLevel)
  const indentPrevLevel = indentUnit.repeat(indentLevel - 1)

  const entries = Object.entries(mapping)
  if (entries.length === 0) return ''

  let response = pairs ? '' : '{'
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
        response += '...'
      }
    }
    response += `\n${indentPrevLevel}`
  }
  response += pairs ? '' : '}'
  return response
}

const structify = (obj, indentLevel) => {
  // TODO: make simple ones in one line {"name":"tigers.jpeg", "parent":{"id":"11446498"}}
  let response = ''
  indentLevel = !indentLevel ? 1 : ++indentLevel
  const indent = ' '.repeat(4 * indentLevel)
  const prevIndent = ' '.repeat(4 * (indentLevel - 1))

  if (obj instanceof Array) {
    const list = []
    let listContainsNumbers = true
    for (const k in obj) {
      if (listContainsNumbers && typeof obj[k] !== 'number') {
        listContainsNumbers = false
      }
      const value = structify(obj[k], indentLevel)
      list.push(`${value}`)
    }
    if (listContainsNumbers) {
      const listString = list.join(' ')
      response += `[${listString}]`
    } else {
      list.unshift('{{')
      const listString = list.join(`\n${indent}`)
      response += `${listString}\n${prevIndent}}}`
    }
  } else if (obj instanceof Object) {
    response += 'struct(...'
    let first = true
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        if (!k[0].match(/[a-z]/i)) {
          throw Error('MATLAB structs do not support keys starting with non-alphabet symbols')
        }
        // recursive call to scan property
        if (first) { first = false } else {
          response += ',...'
        }
        response += `\n${indent}`
        response += `'${k}', `
        response += structify(obj[k], indentLevel)
      }
    }
    response += '...'
    response += `\n${prevIndent})`
  } else if (typeof obj === 'number') {
    // not an Object so obj[k] here is a value
    response += `${obj}`
  } else {
    response += `${repr(obj)}`
  }

  return response
}

const prepareQueryString = (request) => {
  let response = null
  if (request.query) {
    // const keyValSeparator = containsBody(request) ? '' : ';'
    const params = addCellArray(request.query, [], '', 1)
    response = setVariableValue('params', params)
  }
  return response
}

const prepareCookies = (request) => {
  let response = null
  if (request.cookies) {
    const cookies = addCellArray(request.cookies, [], '', 1)
    response = setVariableValue('cookies', cookies)
  }
  return response
}

const prepareHeaders = (request) => {
  let response = null

  if (request.headers) {
    const headerEntries = Object.entries(request.headers)

    // cookies are part of headers
    const headerCount = headerEntries.length + (request.cookies ? 1 : 0)

    const headers = []
    let header = headerCount === 1 ? '' : '['

    for (const [key, value] of headerEntries) {
      switch (key) {
        case 'Cookie':
          break
        case 'Accept': {
          const accepts = value.split(',')
          if (accepts.length === 1) {
            headers.push(`field.AcceptField(MediaType(${repr(value)}))`)
          } else {
            let acceptheader = 'field.AcceptField(['
            for (const accept of accepts) {
              acceptheader += `\n        MediaType(${repr(accept.trim())})`
            }
            acceptheader += '\n    ])'
            headers.push(acceptheader)
          }
          break
        }
        default:
          headers.push(`HeaderField(${repr(key)}, ${repr(value)})`)
      }
    }

    if (headerCount === 1) {
      header += headers.pop()
    } else {
      header += '\n    ' + headers.join('\n    ')
      if (request.cookies) {
        header += `\n    field.CookieField(${cookieString})`
      }
      header += '\n]\''
    }

    response = setVariableValue('header', header)
  }

  return response
}

const prepareURI = (request) => {
  const uriParams = [repr(request.urlWithoutQuery)]
  if (request.query) {
    uriParams.push('QueryParameter(params\')')
  }
  return callFunction('uri', 'URI', uriParams)
}

const prepareAuth = (request) => {
  let options = null
  if (request.auth) {
    const [usr, pass] = request.auth.split(':')
    const userfield = `'Username', ${repr(usr)}`
    const passfield = `'Password', ${repr(pass)}`
    const authparams = (usr ? `${userfield}, ` : '') + passfield
    const optionsParams = [repr('Credentials'), 'cred']

    if (request.insecure) {
      optionsParams.push(repr('VerifyServerName'), 'false')
    }
    options = [
      callFunction('cred', 'Credentials', authparams),
      callFunction('options', 'HTTPOptions', optionsParams)
    ]
  }

  return options
}

const containsBody = (request) => {
  return request.data || request.multipartUploads
}

const isJsonString = (str) => {
  // https://stackoverflow.com/a/3710226/5625738
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

const prepareDataProvider = (value, output, termination, indentLevel) => {
  if (typeof indentLevel === 'undefined') indentLevel = 0
  if (value[0] === '@') {
    const filename = value.slice(1)
    // >> imformats % for seeing MATLAB supported image formats
    const isImageProvider = new Set(['jpeg', 'jpg', 'png', 'tif', 'gif']).has(filename.split('.')[1])
    const provider = isImageProvider ? 'ImageProvider' : 'FileProvider'
    return callFunction(output, provider, repr(filename), termination)
  }

  if (value === true) {
    return callFunction(output, 'FileProvider', '', termination)
  }

  if (typeof value !== 'number' && isJsonString(value)) {
    const obj = JSON.parse(value)
    // If fail to create a struct for the JSON, then return a string
    try {
      const structure = structify(obj, indentLevel)
      return callFunction(output, 'JSONProvider', structure, termination)
    } catch (e) {
      return callFunction(output, 'StringProvider', repr(value), termination)
    }
  }

  if (typeof value === 'number') {
    return callFunction(output, 'FormProvider', repr(value), termination)
  }
  const formValue = value.split('&').map(x => x.split('=').map(x => repr(x)))
  return callFunction(output, 'FormProvider', formValue, termination)
}

const prepareMultipartUploads = (request) => {
  let response = null
  if (request.multipartUploads) {
    const params = []
    for (const [key, value] of Object.entries(request.multipartUploads)) {
      const pair = []
      pair.push(repr(key))
      const fileProvider = prepareDataProvider(value, null, '', 1)
      pair.push(fileProvider)
      params.push(pair)
    }
    response = callFunction('body', 'MultipartFormProvider', params)
  }

  return response
}

const prepareData = (request) => {
  let response = null
  if (request.dataArray) {
    const data = request.dataArray.map(x => x.split('=').map(x => repr(x)))
    response = callFunction('body', 'FormProvider', data)
  } else if (request.data) {
    response = prepareDataProvider(request.data, 'body')
    if (!response) {
      response = setVariableValue('body', repr(request.data))
    }
  }
  return response
}

const prepareRequestMessage = (request) => {
  let reqMessage = [repr(request.method)]
  if (request.cookie || request.headers) {
    reqMessage.push('header')
  } else if (request.method === 'get') {
    reqMessage = ''
  }
  if (containsBody(request)) {
    if (reqMessage.length === 1) {
      reqMessage.push('[]')
    }
    reqMessage.push('body')
  }

  // list as many params as necessary
  const params = ['uri.EncodedURI']
  if (request.auth) {
    params.push('options')
  }

  const response = [callFunction('response', 'RequestMessage', reqMessage,
    callFunction(null, '.send', params)
  )]

  if (request.query) {
    const fullParams = ['fullURI'].concat(params.slice(1))
    response.push('',
      '% As there is a query, a full URI may be necessary instead.',
      setVariableValue('fullURI', repr(request.url)),
      callFunction('response', 'RequestMessage', reqMessage,
        callFunction(null, '.send', fullParams))
    )
  }

  return response.join('\n')
}

const isSupportedByWebServices = (request) => {
  if (!new Set(['get', 'post', 'put', 'delete', 'patch']).has(request.method)) {
    return false
  }
  return !request.multipartUploads
}

const parseWebOptions = (request) => {
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
    options.RequestMethod = request.method
  }

  const headers = {}
  if (request.auth) {
    const [username, password] = request.auth.split(':')
    if (username !== '') {
      options.Username = username
      options.Password = password
    } else {
      headers.Authorization = `['Basic ' matlab.net.base64encode(${repr(username + ':' + password)})]`
    }
  }

  if (request.headers) {
    for (const [key, value] of Object.entries(request.headers)) {
      switch (key) {
        case 'User-Agent':
          options.UserAgent = value
          break
        case 'Content-Type':
          options.MediaType = value
          break
        case 'Cookie':
          headers.Cookie = value
          break
        case 'Accept':
          switch (value) {
            case 'application/json':
              options.ContentType = 'json'
              break
            case 'text/csv':
              options.ContentType = 'table'
              break
            case 'text/plain':
            case 'text/html':
            case 'application/javascript':
            case 'application/x-javascript':
            case 'application/x-www-form-urlencoded':
              options.ContentType = 'text'
              break
            case 'text/xml':
            case 'application/xml':
              options.ContentType = 'xmldom'
              break
            case 'application/octet-stream':
              options.ContentType = 'binary'
              break
            default:
              if (value.startsWith('image/')) {
                options.ContentType = 'image'
              } else if (value.startsWith('audio/')) {
                options.ContentType = 'audio'
              } else {
                headers[key] = value
              }
          }
          break
        default:
          headers[key] = value
      }
    }
  }

  if (request.cookies) {
    headers.Cookie = cookieString
  }

  if (Object.entries(headers).length > 0) {
    options.HeaderFields = addCellArray(headers, ['Authorization', 'Cookie'], '', 2)
  }

  return options
}

const prepareOptions = (request, options) => {
  const lines = []
  if (Object.keys(options).length === 0) {
    return lines
  }
  const pairValues = addCellArray(options, ['HeaderFields'], ',', 1, true)
  lines.push(callFunction('options', 'weboptions', pairValues))

  return lines
}

const cookieString = 'char(join(join(cookies, \'=\'), \'; \'))'
const paramsString = 'char(join(join(params, \'=\'), \'&\'))'
const prepareBasicURI = (request) => {
  const response = []
  if (request.query) {
    response.push(setVariableValue('baseURI', repr(request.urlWithoutQuery)))
    response.push(setVariableValue('uri', `[baseURI '?' ${paramsString}]`))
  } else {
    response.push(setVariableValue('uri', repr(request.url)))
  }
  return response
}

const prepareWebCall = (request, options) => {
  const lines = []
  const webFunction = containsBody(request) ? 'webwrite' : 'webread'

  const params = ['uri']
  if (containsBody(request)) {
    params.push('body')
  }
  if (Object.keys(options).length > 0) {
    params.push('options')
  }
  lines.push(callFunction('response', webFunction, params))

  if (request.query) {
    params[0] = 'fullURI'
    lines.push('',
      '% As there is a query, a full URI may be necessary instead.',
      setVariableValue('fullURI', repr(request.url)),
      callFunction('response', webFunction, params)
    )
  }
  return lines
}

const prepareBasicData = (request) => {
  let response = []
  if (request.data) {
    if (typeof request.data === 'boolean') {
      response = setVariableValue('body', repr())
    } else if (request.data[0] === '@') {
      response = callFunction('body', 'fileread', repr(request.data.slice(1)))
    } else {
      // if the data is in JSON, store it as struct in MATLAB
      // otherwise just keep it as a char vector
      try {
        const jsonData = JSON.parse(request.data)
        if (typeof jsonData === 'object') {
          let jsonText = structify(jsonData)
          if (!jsonText.startsWith('struct')) jsonText = repr(jsonText)
          response = setVariableValue('body', jsonText)
        } else {
          response = setVariableValue('body', repr(request.data))
        }
      } catch (e) {
        response = setVariableValue('body', repr(request.data))
      }
    }
  }
  return response
}

const toWebServices = (request) => {
  let lines = [
    '%% Web Access using Data Import and Export API'
  ]

  if (!isSupportedByWebServices(request)) {
    lines.push('% This is not possible with the webread/webwrite API')
    return lines
  }

  const options = parseWebOptions(request)
  lines = lines.concat([
    prepareQueryString(request),
    prepareCookies(request),
    prepareBasicURI(request),
    prepareBasicData(request),
    prepareOptions(request, options),
    prepareWebCall(request, options)
  ])

  return lines
}

const toHTTPInterface = (request) => {
  return [
    '%% HTTP Interface',
    'import matlab.net.*',
    'import matlab.net.http.*',
    (containsBody(request) ? 'import matlab.net.http.io.*' : null),
    '',
    prepareQueryString(request),
    prepareCookies(request),
    prepareHeaders(request),
    prepareURI(request),
    prepareAuth(request),
    prepareMultipartUploads(request),
    prepareData(request),
    prepareRequestMessage(request),
    ''
  ]
}

const toMATLAB = (curlCommand) => {
  const request = util.parseCurlCommand(curlCommand)
  const lines = toWebServices(request).concat('', toHTTPInterface(request))
  return lines.flat().filter(line => line !== null).join('\n')
}

module.exports = toMATLAB
