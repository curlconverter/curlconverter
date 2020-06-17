const util = require('../../util')
const toWebServices = require('./webservices')
const toHTTPInterface = require('./httpinterface')

// We polyfill the flat function for node 10 which is still the default node version on ubuntu 20.04
if (!Array.prototype.flat) {
  Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
  });
}

const toMATLAB = (curlCommand) => {
  const request = util.parseCurlCommand(curlCommand)
  const lines = toWebServices(request).concat('', toHTTPInterface(request))
  return lines.flat().filter(line => line !== null).join('\n')
}

module.exports = toMATLAB
