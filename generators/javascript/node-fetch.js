import * as util from '../../util.js'
import { _toJavaScript } from './javascript.js'

const importStatement = 'var fetch = require(\'node-fetch\');\n\n'

export const _toNode = request => {
  return importStatement + _toJavaScript(request)
}
export const toNode = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toNode(request)
}
