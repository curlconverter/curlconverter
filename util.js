const cookie = require('cookie')
const yargs = require('@curlconverter/yargs')
const URL = require('url')
const querystring = require('query-string')
const nunjucks = require('nunjucks')

const env = nunjucks.configure(['templates/'], { // set folders with templates
  autoescape: false
})
env.addFilter('isArr', something => Array.isArray(something))
env.addFilter('isString', something => typeof something === 'string')
env.addFilter('isNumber', something => typeof something === 'number')

const parseCurlCommand = curlCommand => {
  // Remove newlines (and from continuations)
  curlCommand = curlCommand.replace(/\\\r|\\\n/g, '')

  // Remove extra whitespace
  curlCommand = curlCommand.replace(/\s+/g, ' ')

  // yargs parses -XPOST as separate arguments. just prescreen for it.
  curlCommand = curlCommand.replace(/ -XPOST/, ' -X POST')
  curlCommand = curlCommand.replace(/ -XGET/, ' -X GET')
  curlCommand = curlCommand.replace(/ -XPUT/, ' -X PUT')
  curlCommand = curlCommand.replace(/ -XPATCH/, ' -X PATCH')
  curlCommand = curlCommand.replace(/ -XDELETE/, ' -X DELETE')
  // Safari adds `-Xnull` if is unable to determine the request type, it can be ignored
  curlCommand = curlCommand.replace(/ -Xnull/, ' ')
  curlCommand = curlCommand.trim()

  // Parse with some understanding of the meanings of flags.  In particular,
  // boolean flags can be trouble if the URL to fetch follows immediately
  // after, since it will be taken as an argument to the flag rather than
  // interpreted as a positional argument.  Someone should add all the flags
  // likely to cause trouble here.
  const parsedArguments = yargs
    .boolean(['I', 'head', 'compressed', 'L', 'k', 'silent', 's'])
    .alias('H', 'header')
    .alias('A', 'user-agent')
    .parse(curlCommand)

  let cookieString
  let cookies
  let url = parsedArguments._[1]

  // if url argument wasn't where we expected it, try to find it in the other arguments
  if (!url) {
    for (const argName in parsedArguments) {
      if (typeof parsedArguments[argName] === 'string') {
        if (parsedArguments[argName].indexOf('http') === 0 || parsedArguments[argName].indexOf('www.') === 0) {
          url = parsedArguments[argName]
        }
      }
    }
  }

  let headers

  if (parsedArguments.header) {
    if (!headers) {
      headers = {}
    }
    if (!Array.isArray(parsedArguments.header)) {
      parsedArguments.header = [parsedArguments.header]
    }
    parsedArguments.header.forEach(header => {
      if (header.indexOf('Cookie') !== -1) {
        cookieString = header
      } else {
        const components = header.split(/:(.*)/)
        if (components[1]) {
          headers[components[0]] = components[1].trim()
        }
      }
    })
  }

  if (parsedArguments['user-agent']) {
    if (!headers) {
      headers = {}
    }
    headers['User-Agent'] = parsedArguments['user-agent']
  }

  if (parsedArguments.b) {
    cookieString = parsedArguments.b
  }
  if (parsedArguments.cookie) {
    cookieString = parsedArguments.cookie
  }
  let multipartUploads
  if (parsedArguments.F) {
    multipartUploads = {}
    if (!Array.isArray(parsedArguments.F)) {
      parsedArguments.F = [parsedArguments.F]
    }
    parsedArguments.F.forEach(multipartArgument => {
      // input looks like key=value. value could be json or a file path prepended with an @
      const splitArguments = multipartArgument.split('=', 2)
      const key = splitArguments[0]
      const value = splitArguments[1]
      multipartUploads[key] = value
    })
  }
  if (cookieString) {
    const cookieParseOptions = {
      decode: function (s) { return s }
    }
    // separate out cookie headers into separate data structure
    // note: cookie is case insensitive
    cookies = cookie.parse(cookieString.replace(/^Cookie: /gi, ''), cookieParseOptions)
  }
  let method
  if (parsedArguments.X === 'POST') {
    method = 'post'
  } else if (parsedArguments.X === 'PUT' ||
    parsedArguments.T) {
    method = 'put'
  } else if (parsedArguments.X === 'PATCH') {
    method = 'patch'
  } else if (parsedArguments.X === 'DELETE') {
    method = 'delete'
  } else if (parsedArguments.X === 'OPTIONS') {
    method = 'options'
  } else if ((parsedArguments.d ||
    parsedArguments.data ||
    parsedArguments['data-ascii'] ||
    parsedArguments['data-binary'] ||
    parsedArguments['data-raw'] ||
    parsedArguments.F ||
    parsedArguments.form) && !((parsedArguments.G || parsedArguments.get))) {
    method = 'post'
  } else if (parsedArguments.I ||
    parsedArguments.head) {
    method = 'head'
  } else {
    method = 'get'
  }

  const compressed = !!parsedArguments.compressed
  const urlObject = URL.parse(url) // eslint-disable-line

  // if GET request with data, convert data to query string
  // NB: the -G flag does not change the http verb. It just moves the data into the url.
  if (parsedArguments.G || parsedArguments.get) {
    urlObject.query = urlObject.query ? urlObject.query : ''
    const option = 'd' in parsedArguments ? 'd' : 'data' in parsedArguments ? 'data' : null
    if (option) {
      let urlQueryString = ''

      if (url.indexOf('?') < 0) {
        url += '?'
      } else {
        urlQueryString += '&'
      }

      if (typeof (parsedArguments[option]) === 'object') {
        urlQueryString += parsedArguments[option].join('&')
      } else {
        urlQueryString += parsedArguments[option]
      }
      urlObject.query += urlQueryString
      url += urlQueryString
      delete parsedArguments[option]
    }
  }
  if (urlObject.query && urlObject.query.endsWith('&')) {
    urlObject.query = urlObject.query.slice(0, -1)
  }
  const query = querystring.parse(urlObject.query, { sort: false })
  for (const param in query) {
    if (query[param] === null) {
      query[param] = ''
    }
  }

  urlObject.search = null // Clean out the search/query portion.
  const request = {
    url: url,
    urlWithoutQuery: URL.format(urlObject)
  }
  if (compressed) {
    request.compressed = true
  }

  if (Object.keys(query).length > 0) {
    request.query = query
  }
  if (headers) {
    request.headers = headers
  }
  request.method = method

  if (cookies) {
    request.cookies = cookies
    request.cookieString = cookieString.replace('Cookie: ', '')
  }
  if (multipartUploads) {
    request.multipartUploads = multipartUploads
  }
  if (parsedArguments.data) {
    request.data = parsedArguments.data
  } else if (parsedArguments['data-binary']) {
    request.data = parsedArguments['data-binary']
    request.isDataBinary = true
  } else if (parsedArguments.d) {
    request.data = parsedArguments.d
  } else if (parsedArguments['data-ascii']) {
    request.data = parsedArguments['data-ascii']
  } else if (parsedArguments['data-raw']) {
    request.data = parsedArguments['data-raw']
    request.isDataRaw = true
  }

  if (parsedArguments.u) {
    request.auth = parsedArguments.u
  }
  if (parsedArguments.user) {
    request.auth = parsedArguments.user
  }
  if (Array.isArray(request.data)) {
    request.dataArray = request.data
    request.data = request.data.join('&')
  }

  if (parsedArguments.k || parsedArguments.insecure) {
    request.insecure = true
  }
  return request
}

const serializeCookies = cookieDict => {
  let cookieString = ''
  let i = 0
  const cookieCount = Object.keys(cookieDict).length
  for (const cookieName in cookieDict) {
    const cookieValue = cookieDict[cookieName]
    cookieString += cookieName + '=' + cookieValue
    if (i < cookieCount - 1) {
      cookieString += '; '
    }
    i++
  }
  return cookieString
}

module.exports = {
  parseCurlCommand: parseCurlCommand,
  serializeCookies: serializeCookies
}
