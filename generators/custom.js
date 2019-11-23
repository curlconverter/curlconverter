var util = require('../util')
var jsesc = require('jsesc')

var custom = function (curlCommand, cb) {
  if (cb && typeof cb === 'function') cb(util.parseCurlCommand(curlCommand), util, jsesc)
}

module.exports = custom
