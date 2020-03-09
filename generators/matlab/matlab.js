const util = require('../../util')
const toWebServices = require('./webservices')
const toHTTPInterface = require('./httpinterface')

const toMATLAB = (curlCommand) => {
  const request = util.parseCurlCommand(curlCommand)
  const lines = toWebServices(request).concat('', toHTTPInterface(request))
  return lines.flat().filter(line => line !== null).join('\n')
}

module.exports = toMATLAB
