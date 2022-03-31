import * as util from '../util.js'
import type { Request} from '../util.js'
import { ansibleTemplate } from '../templates/ansible.js'

import nunjucks from 'nunjucks'
import querystring from 'query-string'

function getDataString (request: Request): any {
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

export const _toAnsible = (request: Request): string => {
  let convertedData
  if (request.data && typeof request.data === 'string') {
    convertedData = getDataString(request)
  }
  const result = nunjucks.renderString(ansibleTemplate, { request, data: convertedData })
  return result
}
export const toAnsible = (curlCommand: string | string[]): string => {
  const request = util.parseCurlCommand(curlCommand)
  return _toAnsible(request)
}
