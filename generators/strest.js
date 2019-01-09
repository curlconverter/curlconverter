var util = require('../util')
var yaml = require('yamljs')
var jsesc = require('jsesc')
var querystring = require('querystring')

function getDataString (request) {
  if (typeof request.data === 'number') {
    request.data = request.data.toString()
  }
  if (request.data.indexOf("'") > -1) {
    request.data = jsesc(request.data)
  }
  var parsedQueryString = querystring.parse(request.data)
  var keyCount = Object.keys(parsedQueryString).length
  var singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  var singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
      return {
        'mimeType': 'application/json',
        'text': JSON.parse(request.data)
      }
    }  else {
    return {
      'mimeType': 'NOT YET HANDLED',
      'text': 'NOT YET HANDLED'
    }
  }
}

var toStrest = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  var response = {'version': 2}
  if (request.insecure) {
    response.allowInsecure = true
  }
  if (request.urlWithoutQuery.indexOf('http') !== 0) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }
  console.log(request.urlWithoutQuery.toString())
  response.requests = {
    'curl_converter': {
      'request': {
        'url': request.urlWithoutQuery.toString(),
        'method': request.method.toUpperCase()
      }
    }
  }
  if (typeof request.data === 'string' || typeof request.data === 'number') {
    response.requests.curl_converter.request.postData = getDataString(request)
  }

  if (request.headers) {
    response.requests.curl_converter.request.headers = []
    for (var prop in request.headers) {
      response.requests.curl_converter.request.headers.push({
        'name': prop,
        'value': request.headers[prop]
      })
    }
  }
  if (request.auth) {
    response.requests.curl_converter.auth = {
      'basic': {}
    }
    if (request.auth.split(':')[0]) {
      response.requests.curl_converter.auth.basic.username = request.auth.split(':')[0]
    }
    response.requests.curl_converter.auth.basic.password = request.auth.split(':')[1]
  }
  var yamlString = yaml.stringify(response, 100, 2)
  console.log(yamlString)
  return yamlString
}

module.exports = toStrest
