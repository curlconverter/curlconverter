import * as util from '../util.js'
import nunjucks from 'nunjucks'
import querystring from 'query-string'
import { ansibleTemplate } from '../templates/ansible.js'
function getDataString (request) {
  const parsedQueryString = querystring.parse(request.data, { sort: false })
  const keyCount = Object.keys(parsedQueryString).length
  const singleKeyOnly = keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]]
  const singularData = request.isDataBinary || singleKeyOnly
  if (singularData) {
    return JSON.parse(request.data)
  } else {
    return request.data
  }
}

export const toAnsible = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  var convertedData
  if (typeof request.data === 'string' || typeof request.data === 'number') {
    convertedData = getDataString(request)
  }
  var result = nunjucks.renderString(ansibleTemplate, { request: request, data: convertedData })
  return result
}
