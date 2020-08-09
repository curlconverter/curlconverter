const util = require('../util')
const yaml = require('yamljs')
const jsesc = require('jsesc')
const querystring = require('query-string')

function getDataString (request) {
  let mimeType = 'application/json'
  if (typeof request.data === 'number') {
    request.data = request.data.toString()
    mimeType = 'text/plain'
  }
  if (request.data.indexOf("'") > -1) {
    request.data = jsesc(request.data)
  }
  const parsedQueryString = querystring.parse(request.data, { sort: false })
  const keyCount = Object.keys(parsedQueryString).length
  const singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  const singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    return {
      mimeType: mimeType,
      text: JSON.parse(request.data)
    }
  } else {
    for (const paramName in request.headers) {
      if (paramName === 'Content-Type') {
        mimeType = request.headers[paramName]
      }
    }
    return {
      mimeType: mimeType,
      text: request.data
    }
  }
}

function getQueryList (request) {
  const queryList = []
  for (const paramName in request.query) {
    const rawValue = request.query[paramName]
    queryList.push({ name: paramName, value: rawValue })
  }
  return queryList
}

const toStrest = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
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
  if (typeof request.data === 'string' || typeof request.data === 'number') {
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
    response.requests.curl_converter.auth = {
      basic: {}
    }
    if (request.auth.split(':')[0]) {
      response.requests.curl_converter.auth.basic.username = request.auth.split(':')[0]
    }
    response.requests.curl_converter.auth.basic.password = request.auth.split(':')[1]
  }

  let queryList
  if (request.query) {
    queryList = getQueryList(request)
    response.requests.curl_converter.request.queryString = queryList
  }

  const yamlString = yaml.stringify(response, 100, 2)
  return yamlString
}

module.exports = toStrest
