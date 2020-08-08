const util = require('../util')
const nunjucks = require('nunjucks')
const querystring = require('query-string')
const ansibleTemplate = require('../templates/ansible.js')
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

const toAnsible = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  var convertedData
  if (typeof request.data === 'string' || typeof request.data === 'number') {
    convertedData = getDataString(request)
  }
  var result = nunjucks.renderString(ansibleTemplate, { request: request, data: convertedData })
  return result
}

module.exports = toAnsible
