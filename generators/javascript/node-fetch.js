const toJsFetch = require('./fetch')

const toNodeFetch = curlCommand => {
  let nodeFetchCode = 'var fetch = require(\'node-fetch\');\n\n'
  nodeFetchCode += toJsFetch(curlCommand)

  return nodeFetchCode
}

module.exports = toNodeFetch
