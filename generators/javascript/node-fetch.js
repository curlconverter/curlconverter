import { toJsFetch } from "./fetch.js";

export const toNodeFetch = curlCommand => {
  let nodeFetchCode = 'var fetch = require(\'node-fetch\');\n\n'
  nodeFetchCode += toJsFetch(curlCommand)

  return nodeFetchCode
}
