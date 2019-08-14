var util = require('../util')
var yaml = require('yamljs')
var jsesc = require('jsesc')
var querystring = require('querystring')

function getDataString (request) {
  let bodyFormat = 'json'
  if (typeof request.data === 'number') {
    request.data = request.data.toString()
    bodyFormat = 'raw'
  }
  if (request.data.indexOf("'") > -1) {
    request.data = jsesc(request.data)
  }
  var parsedQueryString = querystring.parse(request.data)
  var keyCount = Object.keys(parsedQueryString).length
  var singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  var singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    return { body: JSON.parse(request.data), body_format: bodyFormat }
  } else {
    return { body: request.data, body_format: bodyFormat }
  }
}

var toAnsible = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  var responses = []
  var response = { name: request.urlWithoutQuery }
  if (request.url.indexOf('http') !== 0) {
    request.url = 'http://' + request.url
  }
  response.uri = {
    url: request.url.toString(),
    method: request.method.toUpperCase()
  }
  response.register = 'result'
  if (request.insecure) {
    response.uri.validate_certs = 'no'
  }
  if (typeof request.data === 'string' || typeof request.data === 'number') {
    var convertedData = getDataString(request)
    response.uri.body = convertedData.body
    response.uri.body_format = convertedData.body_format
  }
  if (request.headers) {
    response.uri.headers = {}
    for (var prop in request.headers) {
      response.uri.headers[prop] = request.headers[prop]
    }
  }
  if (request.cookieString) {
    response.uri.headers['Cookie'] = request.cookieString
  }
  if (request.auth) {
    if (request.auth.split(':')[0]) {
      response.uri.url_username = request.auth.split(':')[0]
    }
    response.uri.url_password = request.auth.split(':')[1]
  }

  responses.push(response)
  var yamlString = yaml.stringify(responses, 100, 2)
  return yamlString
}

module.exports = toAnsible
