// Author: ssi-anik (sirajul.islam.anik@gmail.com)

import * as util from '../util.js'

import querystring from 'query-string'
import jsesc from 'jsesc'

function repr (value, isKey) {
  // In context of url parameters, don't accept nulls and such.
  /*
    if ( !value ) {
   return ""
   } else {
   return "'" + jsesc(value, { quotes: 'single' }) + "'"
   } */
  return isKey ? "'" + jsesc(value, { quotes: 'single' }) + "'" : value
}

function getDataString (request) {
  /*
    if ( !request.isDataRaw && request.data.startsWith('@') ) {
   var filePath = request.data.slice(1);
   return filePath;
   }
   */

  const parsedQueryString = querystring.parse(request.data, { sort: false })
  const keyCount = Object.keys(parsedQueryString).length
  const singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  const singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    const data = {}
    // TODO: dataRaw = request.data ?
    data[repr(request.data)] = ''
    return { data }
  } else {
    return getMultipleDataString(request, parsedQueryString)
  }
}

function getMultipleDataString (request, parsedQueryString) {
  const data = {}

  for (const key in parsedQueryString) {
    const value = parsedQueryString[key]
    if (Array.isArray(value)) {
      data[repr(key)] = value
    } else {
      data[repr(key)] = repr(value)
    }
  }

  return { data }
}

function getFilesString (request) {
  const data = {}

  data.files = {}
  data.data = {}

  for (const [multipartKey, multipartValue] of request.multipartUploads) {
    if (multipartValue.startsWith('@')) {
      const fileName = multipartValue.slice(1)
      data.files[repr(multipartKey)] = repr(fileName)
    } else {
      data.data[repr(multipartKey)] = repr(multipartValue)
    }
  }

  if (Object.keys(data.files).length === 0) {
    delete data.files
  }

  if (Object.keys(data.data).length === 0) {
    delete data.data
  }

  return data
}

export const _toJsonString = request => {
  // curl automatically prepends 'http' if the scheme is missing, but python fails and returns an error
  // we tack it on here to mimic curl
  if (!request.url.match(/https?:/)) {
    request.url = 'http://' + request.url
  }
  if (!request.urlWithoutQuery.match(/https?:/)) {
    request.urlWithoutQuery = 'http://' + request.urlWithoutQuery
  }

  const requestJson = {
    url: (request.queryDict ? request.urlWithoutQuery : request.url).replace(/\/$/, ''),
    // url: request.queryDict ? request.urlWithoutQuery : request.url,
    raw_url: request.url,
    // TODO: move this after .query?
    method: request.method.toLowerCase() // lowercase for backwards compatibility
  }
  // if (request.queryDict) {
  //   requestJson.query = request.queryDict
  // }

  if (request.cookies) {
    // TODO: repeated cookies
    requestJson.cookies = Object.fromEntries(request.cookies)
    // Normally when a generator uses .cookies, it should delete it from
    // headers, but users of the JSON output would expect to have all the
    // headers in .headers.
  }

  if (request.headers) {
    // TODO: what if Object.keys().length !== request.headers.length?
    requestJson.headers = Object.fromEntries(request.headers)
  }

  if (request.queryDict) {
    // TODO: rename
    requestJson.queries = request.queryDict
  }

  if (request.data && typeof request.data === 'string') {
    Object.assign(requestJson, getDataString(request))
  } else if (request.multipartUploads) {
    Object.assign(requestJson, getFilesString(request))
  }

  if (request.insecure) {
    requestJson.insecure = false
  }

  if (request.auth) {
    const [user, password] = request.auth
    requestJson.auth = {
      user: repr(user),
      password: repr(password)
    }
  }

  return JSON.stringify(Object.keys(requestJson).length ? requestJson : '{}', null, 4) + '\n'
}
export const toJsonString = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toJsonString(request)
}
