import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import jsesc from "jsesc";

const supportedArgs = new Set([
  "url",
  "request",
  "user-agent",
  "cookie",
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "referer",
  // "form",
  // "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
]);

export const _toNodeRequest = (
  request: Request,
  warnings: Warnings = []
): string => {
  let nodeRequestCode = "var request = require('request');\n\n";
  if (request.headers) {
    nodeRequestCode += "var headers = {\n";
    const headerCount = request.headers ? request.headers.length : 0;
    let i = 0;
    for (const [headerName, headerValue] of request.headers || []) {
      nodeRequestCode += "    '" + headerName + "': '" + headerValue + "'";
      if (i < headerCount - 1) {
        nodeRequestCode += ",\n";
      } else {
        nodeRequestCode += "\n";
      }
      i++;
    }
    nodeRequestCode += "};\n\n";
  }

  if (request.data) {
    // escape single quotes if there are any in there
    if (request.data.indexOf("'") > -1) {
      request.data = jsesc(request.data);
    }
    nodeRequestCode += "var dataString = '" + request.data + "';\n\n";
  }

  nodeRequestCode += "var options = {\n";
  nodeRequestCode += "    url: '" + request.url + "'";
  if (request.method.toUpperCase() !== "GET") {
    nodeRequestCode += ",\n    method: '" + request.method.toUpperCase() + "'";
  }

  if (request.headers) {
    nodeRequestCode += ",\n";
    nodeRequestCode += "    headers: headers";

    const h = util.getHeader(request, "accept-encoding");
    if (h) {
      const acceptedEncodings = h.split(",").map((s) => s.trim().toLowerCase());
      if (
        acceptedEncodings.includes("gzip") ||
        acceptedEncodings.includes("deflate")
      ) {
        nodeRequestCode += ",\n    gzip: true";
      }
    }
  }
  if (request.data) {
    nodeRequestCode += ",\n    body: dataString";
  }

  if (request.auth) {
    nodeRequestCode += ",\n";
    const [user, password] = request.auth;
    nodeRequestCode += "    auth: {\n";
    nodeRequestCode += "        'user': '" + user + "',\n";
    nodeRequestCode += "        'pass': '" + password + "'\n";
    nodeRequestCode += "    }\n";
  } else {
    nodeRequestCode += "\n";
  }
  nodeRequestCode += "};\n\n";

  nodeRequestCode += "function callback(error, response, body) {\n";
  nodeRequestCode += "    if (!error && response.statusCode == 200) {\n";
  nodeRequestCode += "        console.log(body);\n";
  nodeRequestCode += "    }\n";
  nodeRequestCode += "}\n\n";
  nodeRequestCode += "request(options, callback);";

  return nodeRequestCode + "\n";
};
export const toNodeRequestWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  warnings.unshift(["node-request", "the request package is deprecated"]);

  const nodeRequests = _toNodeRequest(request, warnings);
  return [nodeRequests, warnings];
};
export const toNodeRequest = (curlCommand: string | string[]): string => {
  return toNodeRequestWarn(curlCommand)[0];
};
