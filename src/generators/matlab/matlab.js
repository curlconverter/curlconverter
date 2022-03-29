import * as util from '../../util.js'

import { toWebServices } from './webservices.js'
import { toHTTPInterface } from './httpinterface.js'

export const _toMATLAB = request => {
  const lines = toWebServices(request).concat('', toHTTPInterface(request))
  return lines.flat().filter(line => line !== null).join('\n')
}
export const toMATLAB = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toMATLAB(request)
}
