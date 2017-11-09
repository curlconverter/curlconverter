const util = require('../util')
const jsesc = require('jsesc')

function toFetch(curlCommand) {
  const request = util.parseCurlCommand(curlCommand)
  let code = "// Remove if using browsers fetch\n"
  let options = {}
  code += "const fetch = require('node-fetch');\n"

  if (request.headers) {
    // TODO: requires issue https://github.com/NickCarneiro/curlconverter/issues/70
    // request.headers must be a 2D array first
    options.headers = request.headers
  }

  // TODO: require "multipartUploads" to also be a 2D array [[name, value]]
  // One problem with it beeing an object is that it can't handle:
  // -F key1=value1 -F key1=value1
  // for instances:
  /*
    fd = new FormData()
    fd.append('item', 'd')
    fd.append('item', 'd')
    fetch('/', {method: 'post', body: fd})
   */
  if (request.multipartUploads) {
    code += "const FormData = require('form-data');\n\n"
    code += "const fd = new FormData();\n\n"

    for (let [name, value] of request.multipartUploads) {
      code += `fd.append(${JSON.stringify(name)}, ${JSON.stringify(value)});\n`
    }

    options.body = 'fd'
  }

  code += `\n`

  if (request.cookies) {
    options.headers = options.headers || []

    var cookieString = util.serializeCookies(request.cookies)
    options.headers.push(['Cookie', cookieString])
    options.credentials = 'include'
  }

  if (typeof request.data === 'string') {
    // escape single quotes if there are any in there
    if (request.data.indexOf("'") > -1) {
      request.data = jsesc(request.data)
    }

    options.body = request.data
  }

  if (request.method !== 'get') {
    options.method = request.method.toUpperCase()
  }

  if (request.auth) {
    const [user='', password=''] = request.auth.split(':')

    options.headers.push([
      'Authorization',
      `Basic ${Buffer.from(username + ":" + password).toString('base64')}`
    ]);
  }

  options = Object.keys(options).length
    ? ', ' + JSON.stringify(options, null, 2)
    : ''

  if (request.multipartUploads) {
    options = options.replace('"body": "fd"', '"body": fd')
  }

  code += `fetch("${request.url}"${options})`

  return code + '\n'
}

module.exports = toFetch
