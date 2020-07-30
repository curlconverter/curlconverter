const util = require('../util')
const querystring = require('query-string')
const jsesc = require('jsesc')
const quote = str => jsesc(str, { quotes: 'single' })

const toPhp = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)

  let headerString = false
  if (request.headers) {
    headerString = '$headers = array(\n'
    let i = 0
    const headerCount = Object.keys(request.headers).length
    for (const headerName in request.headers) {
      headerString += "    '" + headerName + "' => '" + quote(request.headers[headerName]) + "'"
      if (i < headerCount - 1) {
        headerString += ',\n'
      }
      i++
    }
    if (request.cookies) {
      const cookieString = quote(util.serializeCookies(request.cookies))
      headerString += ",\n    'Cookie' => '" + cookieString + "'"
    }
    headerString += '\n);'
  } else {
    headerString = '$headers = array();'
  }

  let optionsString = false
  if (request.auth) {
    const splitAuth = request.auth.split(':').map(quote)
    const user = splitAuth[0] || ''
    const password = splitAuth[1] || ''
    optionsString = "$options = array('auth' => array('" + user + "', '" + password + "'));"
  }

  let dataString = false
  if (request.data) {
    if (typeof request.data === 'number') {
      request.data = request.data.toString()
    }
    const parsedQueryString = querystring.parse(request.data, { sort: false })
    dataString = '$data = array(\n'
    const dataCount = Object.keys(parsedQueryString).length
    if (dataCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]) {
      dataString = "$data = '" + quote(request.data) + "';"
    } else {
      let dataIndex = 0
      for (const key in parsedQueryString) {
        const value = parsedQueryString[key]
        dataString += "    '" + key + "' => '" + quote(value) + "'"
        if (dataIndex < dataCount - 1) {
          dataString += ',\n'
        }
        dataIndex++
      }
      dataString += '\n);'
    }
  }
  let requestLine = '$response = Requests::' + request.method + '(\'' + request.url + '\''
  requestLine += ', $headers'
  if (dataString) {
    requestLine += ', $data'
  }
  if (optionsString) {
    requestLine += ', $options'
  }
  requestLine += ');'

  let phpCode = '<?php\n'
  phpCode += 'include(\'vendor/rmccue/requests/library/Requests.php\');\n'
  phpCode += 'Requests::register_autoloader();\n'
  phpCode += headerString + '\n'
  if (dataString) {
    phpCode += dataString + '\n'
  }
  if (optionsString) {
    phpCode += optionsString + '\n'
  }

  phpCode += requestLine

  return phpCode + '\n'
}

module.exports = toPhp
