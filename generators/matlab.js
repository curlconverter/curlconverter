const util = require('../util')
const jsesc = require('jsesc')

function repr (value) {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''"
  } else {
    return "'" + jsesc(value, { quotes: 'single' }).replace(/\\'/g, `''`) + "'"
  }
}

function setVariableValue (outputVariable, value, termination) {
  let result = ''

  if (outputVariable) {
    result += outputVariable + ' = '
  }

  result += value
  result += typeof termination === 'undefined' ? ';' : termination
  return result
}

function callFunction (outputVariable, functionName, params, termination) {
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

function structify (obj, indentLevel) {
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
          response += `,...`
        }
        response += `\n${indent}`
        response += `'${k}', `
        response += structify(obj[k], indentLevel)
      }
    }
    response += `...`
    response += `\n${prevIndent})`
  } else if (typeof obj === 'number') {
    // not an Object so obj[k] here is a value
    response += `${obj}`
  } else {
    response += `${repr(obj)}`
  }

  return response
}

function prepareQueryString (request) {
  let response = null
  if (request.query) {
    const keyValSeparator = request.putQueryInUrl ? '' : ';'
    const params = addCellArray(request.query, [], keyValSeparator, 1)
    response = setVariableValue('params', params)
  }
  return response
}

function prepareCookies (request) {
  let response = null
  if (request.cookies) {
    const cookies = addCellArray(request.cookies, [], '', 1)
    response = setVariableValue('cookies', cookies)
  }
  // cookie string: char(join(join(cookies, '='), '; '))
  return response
}

function prepareHeaders (request) {
  let response = null

  if (request.headers) {
    const headerEntries = Object.entries(request.headers)

    // cookies are part of headers
    const headerCount = headerEntries.length + (request.cookies ? 1 : 0)

    const headers = []
    let header = headerCount === 1 ? '' : '['

    for (const [key, value] of headerEntries) {
      switch (key) {
        case 'Accept':
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
        default:
          headers.push(`HeaderField(${repr(key)}, ${repr(value)})`)
      }
    }

    if (headerCount === 1) {
      header += headers.pop()
    } else {
      header += '\n    ' + headers.join('\n    ')
      if (request.cookies) {
        header += `\n    field.CookieField(char(join(join(cookies, '='), '; ')))`
      }
      header += '\n]'
    }

    response = setVariableValue('header', header)
  }

  return response
}

function prepareURI (request) {
  const uriParams = [repr(request.urlWithoutQuery)]
  if (request.query) {
    uriParams.push('QueryParameter(params)')
  }
  return callFunction('uri', 'URI', uriParams)
}

function prepareAuth (request) {
  let options = null
  if (request.auth) {
    const [usr, pass] = request.auth.split(':')
    const userfield = `'Username', ${repr(usr)}`
    const passfield = `'Password', ${repr(pass)}`
    const authparams = (usr ? `${userfield}, ` : '') + passfield
    options = [
      callFunction('cred', 'Credentials', authparams),
      callFunction('options', 'HTTPOptions', ['\'Credentials\'', 'cred'])
    ]
  }

  return options
}

function containsBody (request) {
  return request.data || request.multipartUploads
}

function isJsonString(str) {
  // https://stackoverflow.com/a/3710226/5625738
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

function prepareDataProvider (value, output, termination, indentLevel) {
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

function prepareMultipartUploads (request) {
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

function prepareData (request) {
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

function prepareRequestMessage (request) {
  let response
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

  response = callFunction('response', 'RequestMessage', reqMessage,
    callFunction(null, '.send', params)
  )

  if (request.query) {
    const fullParams = ['fullURI'].concat(params.slice(1))
    response += [
      '\n\n% As there is query, a full URI may be necessary instead.',
      setVariableValue('fullURI', repr(request.url)),
      callFunction('response', 'RequestMessage', reqMessage,
        callFunction(null, '.send', fullParams))
    ].join('\n')
  }

  return response
}

function toWebServices (request) {
  let lines = []

  return lines
}

function toHTTPInterface (request) {
  const lines = [
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
    prepareRequestMessage(request)
  ]

  return lines
}

const toMATLAB = function (curlCommand) {
  const request = util.parseCurlCommand(curlCommand)
  const lines = toWebServices(request).concat(toHTTPInterface(request))
  return lines.flat().filter(inp => inp !== null).join('\n')
}

module.exports = toMATLAB
