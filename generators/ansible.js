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
    try {
      // This doesn't work with --data-binary ''
      return JSON.parse(request.data)
    } catch (e) {}
  }
  return request.data
}

export const toAnsible = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  var convertedData
  if (request.data && typeof request.data === 'string') {
    convertedData = getDataString(request)
  }
  var result = nunjucks.renderString(ansibleTemplate, { request: request, data: convertedData })
  return result
}
