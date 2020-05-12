const {
  repr, setVariableValue,
  callFunction,
  structify, containsBody,
  prepareQueryString, prepareCookies,
  cookieString
} = require('./common')

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
        const cookieFieldParams = callFunction(null, 'cellfun', [
          '@(x) Cookie(x{:})', callFunction(null, 'num2cell', ['cookies', '2'], '')
        ], '')
        header += '\n    ' + callFunction(null, 'field.CookieField', cookieFieldParams, '')
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
  let options = []
  let optionsParams = []
  if (request.auth) {
    const [usr, pass] = request.auth.split(':')
    const userfield = `'Username', ${repr(usr)}`
    const passfield = `'Password', ${repr(pass)}`
    const authparams = (usr ? `${userfield}, ` : '') + passfield
    optionsParams.push(repr('Credentials'), 'cred')
    options.push(callFunction('cred', 'Credentials', authparams))
  }

  if (request.insecure) {
    optionsParams.push(repr('VerifyServerName'), 'false')
  }

  if (optionsParams.length > 0) {
    options.push(callFunction('options', 'HTTPOptions', optionsParams))
  }

  return options
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

const isJsonString = (str) => {
  // Source: https://stackoverflow.com/a/3710226/5625738
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

const prepareDataProvider = (value, output, termination, indentLevel, isDataBinary, isDataRaw) => {
  if (typeof indentLevel === 'undefined' || indentLevel === null) indentLevel = 0
  if (typeof isDataBinary === 'undefined') isDataBinary = true
  if (!isDataRaw && value[0] === '@') {
    const filename = value.slice(1)
    // >> imformats % for seeing MATLAB supported image formats
    const isImageProvider = new Set(['jpeg', 'jpg', 'png', 'tif', 'gif']).has(filename.split('.')[1])
    const provider = isImageProvider ? 'ImageProvider' : 'FileProvider'
    if (!isDataBinary) {
      return [
        callFunction(output, 'fileread', repr(filename)),
        setVariableValue(`${output}(${output}==13 | ${output}==10)`, '[]')
      ]
    }
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

const prepareData = (request) => {
  let response = null
  if (request.dataArray) {
    const data = request.dataArray.map(x => x.split('=').map(x => {
      let ans = repr(x)
      try {
        const jsonData = JSON.parse(x)
        if (typeof jsonData === 'object') {
          ans = callFunction(null, 'JSONProvider', structify(jsonData, 1), '')
        }
      } catch (e) {}

      return ans
    }))

    response = callFunction('body', 'FormProvider', data)
  } else if (request.data) {
    response = prepareDataProvider(request.data, 'body', ';', 0, !!request.isDataBinary, !!request.isDataRaw)
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
  if (request.auth || request.insecure) {
    params.push('options')
  }

  const response = [callFunction('response', 'RequestMessage', reqMessage,
    callFunction(null, '.send', params)
  )]

  return response.join('\n')
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

module.exports = toHTTPInterface
