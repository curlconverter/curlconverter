const toJsFetch = require('./fetch')

const toBrowser = curlCommand => {
  const browserCode = toJsFetch(curlCommand)

  return browserCode
}

module.exports = toBrowser
