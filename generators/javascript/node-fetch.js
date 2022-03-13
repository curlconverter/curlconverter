import * as util from '../../util.js'
import { _toJsFetch } from './fetch.js'

export const _toNodeFetch = request => {
  let nodeFetchCode = 'var fetch = require(\'node-fetch\');\n\n'
  nodeFetchCode += _toJsFetch(request)
  return nodeFetchCode
}
export const toNodeFetch = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toNodeFetch(request)
}
