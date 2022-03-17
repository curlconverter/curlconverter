import * as util from '../util.js'

import yaml from 'yamljs'
import jsesc from 'jsesc'
import querystring from 'query-string'

function getDataString (request) {
  let mimeType = 'application/json'
  if (request.data.indexOf("'") > -1) {
    request.data = jsesc(request.data)
  }
  const parsedQueryString = querystring.parse(request.data, { sort: false })
  const keyCount = Object.keys(parsedQueryString).length
  const singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  const singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    // This doesn't work with --data-binary ''
    try {
      return {
        mimeType,
        text: JSON.parse(request.data)
      }
    } catch (e) {}
  }

  for (const paramName in request.headers) {
    if (paramName === 'Content-Type') {
      mimeType = request.headers[paramName]
    }
  }
  return {
    mimeType,
    text: request.data
  }
}

function getQueryList (request) {
  // Convert nulls to empty string
  return request.query.map(p => ({ name: p[0], value: p[1] || '' }))
}

export const _toStrest = request => {
  const response = { version: 2 }
  if (request.insecure) {
    response.allowInsecure = true
  }
  if (!request.urlWithoutQuery.match(/https?:/)) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }
  response.requests = {
    curl_converter: {
      request: {
        url: request.urlWithoutQuery.toString(),
        method: request.method.toUpperCase()
      }
    }
  }
  if (request.data && typeof request.data === 'string') {
    response.requests.curl_converter.request.postData = getDataString(request)
  }

  if (request.headers) {
    response.requests.curl_converter.request.headers = []
    for (const prop in request.headers) {
      response.requests.curl_converter.request.headers.push({
        name: prop,
        value: request.headers[prop]
      })
    }
    if (request.cookieString) {
      response.requests.curl_converter.request.headers.push({
        name: 'Cookie',
        value: request.cookieString
      })
    }
  }
  if (request.auth) {
    const [username, password] = request.auth
    const basic = {}
    if (username) {
      basic.username = username
    }
    basic.password = password
    response.requests.curl_converter.auth = { basic }
  }

  let queryList
  if (request.query) {
    queryList = getQueryList(request)
    response.requests.curl_converter.request.queryString = queryList
  }

  const yamlString = yaml.stringify(response, 100, 2)
  return yamlString
}
export const toStrest = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toStrest(request)
}
