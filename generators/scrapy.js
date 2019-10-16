var util = require('../util')
var jsesc = require('jsesc')
var querystring = require('querystring')

require('string.prototype.startswith')

function repr (value) {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''"
  } else {
    return "'" + jsesc(value, { quotes: 'single', minimal: true }) + "'"
  }
}

function getBodyString (request) {
  if (typeof request.data === 'number') {
    request.data = request.data.toString()
  }
  if (request.data.startsWith('@')) {
    var filePath = request.data.slice(1)
    if (request.isDataBinary) {
      return '        body = open(\'' + filePath + '\', \'rb\').read()\n'
    } else {
      return '        body = open(\'' + filePath + '\').read()\n'
    }
  }

  var parsedQueryString = querystring.parse(request.data)
  var keyCount = Object.keys(parsedQueryString).length
  var singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  var singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    return '        body = ' + repr(request.data) + '\n'
  } else {
    return getMultipleDataString(request, parsedQueryString)
  }
}

function getMultipleDataString (request, parsedQueryString) {
  var repeatedKey = false
  for (var key in parsedQueryString) {
    var value = parsedQueryString[key]
    if (Array.isArray(value)) {
      repeatedKey = true
    }
  }

  var dataString
  if (repeatedKey) {
    dataString = '        body = [\n'
    for (key in parsedQueryString) {
      value = parsedQueryString[key]
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          dataString += '            (' + repr(key) + ', ' + repr(value[i]) + '),\n'
        }
      } else {
        dataString += '            (' + repr(key) + ', ' + repr(value) + '),\n'
      }
    }
    dataString += '        ]\n'
    dataString += '        body = \'&\'.join(key + \'=\' + value for key, value in body)\n'
  } else {
    dataString = '        body = {\n'
    for (key in parsedQueryString) {
      value = parsedQueryString[key]
      dataString += '            ' + repr(key) + ': ' + repr(value) + ',\n'
    }
    dataString += '        }\n'
    dataString += '        body = \'&\'.join(key + \'=\' + value for key, value in body.items())\n'
  }

  return dataString
}

var toScrapy = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  var requestClass
  if (request.multipartUploads) {
    requestClass = 'FormRequest'
  } else {
    requestClass = 'Request'
  }
  var code = 'from scrapy import ' + requestClass + ', Spider\n'
  if (request.auth) {
    code += 'from w3lib.http import basic_auth_header\n'
  }
  code += '\n'
  code += '\n'
  code += 'class MySpider(Spider):\n'
  code += '    name = \'myspider\'\n'
  code += '\n'
  code += '    def start_requests(self):\n'

  if (request.multipartUploads) {
    var hasMultipartFiles = false
    var hasMultipartStrings = false
    var part
    for (part in request.multipartUploads) {
      if (part === 'image' || part === 'file' || request.multipartUploads[part].startsWith('@')) {
        hasMultipartFiles = true
      } else {
        hasMultipartStrings = true
      }
      if (hasMultipartStrings && hasMultipartFiles) {
        break
      }
    }
    if (hasMultipartFiles) {
      code += '        # To implement file uploads in Scrapy, see:\n'
      code += '        # https://stackoverflow.com/a/39312565\n'
    }
    if (hasMultipartStrings) {
      code += '        formdata = {\n'
      for (part in request.multipartUploads) {
        if (part !== 'image' && part !== 'file' && !request.multipartUploads[part].startsWith('@')) {
          if (request.multipartUploads[part].startsWith('<')) {
            code += '            ' + repr(part) + ': open(' + repr(request.multipartUploads[part]) + ', \'rb\').read(),\n'
          } else {
            code += '            ' + repr(part) + ': ' + repr(request.multipartUploads[part]) + ',\n'
          }
        }
      }
      code += '        }\n'
    } else {
      code += '        formdata = {}\n'
    }
  }

  var hasCustomHeaders = false
  var headerName
  for (headerName in request.headers) {
    if (headerName.toLowerCase() !== 'cookie') {
      hasCustomHeaders = true
      break
    }
  }
  if (request.headers || request.auth) {
    if (request.auth) {
      var splitAuth = request.auth.split(':')
      var user = splitAuth[0] || ''
      var password = splitAuth[1] || ''
      code += '        auth = basic_auth_header(\n'
      code += '            ' + repr(user) + ',\n'
      code += '            ' + repr(password) + ',\n'
      code += '        )\n'
    }
    if (hasCustomHeaders || request.auth) {
      code += '        headers = {\n'
      for (headerName in request.headers) {
        if (headerName.toLowerCase() !== 'cookie') {
          code += '            ' + repr(headerName) + ': ' + repr(request.headers[headerName]) + ',\n'
        }
      }
      if (request.auth) {
        code += '            ' + repr('Authorization') + ': auth,\n'
      }
      code += '        }\n'
    }
  }

  if (request.cookies) {
    var cookieDict = '        cookies = {\n'
    for (var cookieName in request.cookies) {
      cookieDict += '            ' + repr(cookieName) + ': ' + repr(request.cookies[cookieName]) + ',\n'
    }
    cookieDict += '        }\n'
    code += cookieDict
  }

  if (typeof request.data === 'string' || typeof request.data === 'number') {
    code += getBodyString(request)
  }

  // curl automatically prepends 'http' if the scheme is missing, but python
  // fails and returns an error we tack it on here to mimic curl
  if (request.url.indexOf('http') !== 0) {
    request.url = 'http://' + request.url
  }

  code += '        yield ' + requestClass + '(\n'
  code += '            ' + repr(request.url) + ',\n'
  if (request.multipartUploads) {
    code += '            formdata=formdata,\n'
  }
  code += '            callback=self.parse,\n'
  if ((!request.multipartUploads && request.method !== 'get') ||
      (request.multipartUploads && request.method !== 'post')) {
    code += '            method=\'' + request.method.toUpperCase() + '\',\n'
  }
  if (hasCustomHeaders || request.auth) {
    code += '            headers=headers,\n'
  }
  if (typeof request.data === 'string') {
    code += '            body=body,\n'
  }
  if (request.cookies) {
    code += '            cookies=cookies,\n'
  }
  code += '        )\n'

  code += '\n'
  code += '    def parse(self, response):\n'
  code += '        pass\n'

  if (request.insecure) {
    code += '\n'
    code += '# To disable SSL certificate verification, see:\n'
    code += '# https://stackoverflow.com/a/32951168\n'
  }

  return code
}

module.exports = toScrapy
