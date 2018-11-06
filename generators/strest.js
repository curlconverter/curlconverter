var util = require('../util')
var yaml = require('yamljs')

var toStrest = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  var response = {'version': 1}
  if (request.insecure) {
    response.allowInsecure = true
  }
  if (request.urlWithoutQuery.indexOf('http') !== 0) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }
  console.log(request.urlWithoutQuery.toString())
  response.requests = {
    'curl_converter': {
      'url': request.urlWithoutQuery.toString(),
      'method': request.method.toUpperCase()
    }
  }
  if (request.data) {
    response.requests.curl_converter.data = {
      'json': JSON.parse(request.data)
    }
  }
  if (request.headers) {
    response.requests.curl_converter.headers = {}
    for (var prop in request.headers) {
      response.requests.curl_converter.headers[prop] = request.headers[prop]
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
