const {
  repr, setVariableValue,
  callFunction, addCellArray,
  structify, containsBody,
  prepareQueryString, prepareCookies,
  cookieString, paramsString
} = require('./common')

const isSupportedByWebServices = (request) => {
  if (!new Set(['get', 'post', 'put', 'delete', 'patch']).has(request.method)) {
    return false
  }
  return !request.multipartUploads && !request.insecure
}

const parseWebOptions = (request) => {
  const options = {}

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
    // If key is on the same line as 'weboptions', there is only one parameter
    // otherwise keys are indented by one level in the next line.
    // An extra indentation level is given to the values's new lines in cell array
    const indentLevel = 1 + (Object.keys(options).length === 0 ? 0 : 1)
    options.HeaderFields = addCellArray(headers, ['Authorization', 'Cookie'], '', indentLevel)
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

const prepareBasicData = (request) => {
  let response = []
  if (request.data) {
    if (typeof request.data === 'boolean') {
      response = setVariableValue('body', repr())
    } else if (request.data[0] === '@') {
      response.push(callFunction('body', 'fileread', repr(request.data.slice(1))))

      if (!request.isDataBinary) {
        response.push(setVariableValue('body(body==13 | body==10)', '[]'))
      }
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

module.exports = toWebServices
