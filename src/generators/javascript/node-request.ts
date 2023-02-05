import * as util from "../../util.js";
import { Word } from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import { repr } from "./javascript.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  // "form",
  // "form-string",
  "next",
]);

const requestToNodeRequest = (
  request: Request,
  requestIndex: number,
  definedVariables: Set<string>,
  warnings: Warnings = []
): string => {
  if (request.urls.length > 1) {
    warnings.push([
      "multiple-urls",
      "found " +
        request.urls.length +
        " URLs, only the first one will be used: " +
        request.urls.map((u) => JSON.stringify(u.originalUrl)).join(", "),
    ]);
  }
  if (request.dataReadsFile) {
    warnings.push([
      "unsafe-data",
      // TODO: better wording
      "the data is not correct, " +
        JSON.stringify("@" + request.dataReadsFile) +
        " means it should read the file " +
        JSON.stringify(request.dataReadsFile),
    ]);
  }
  if (request.urls[0].queryReadsFile) {
    warnings.push([
      "unsafe-query",
      // TODO: better wording
      "the URL query string is not correct, " +
        JSON.stringify("@" + request.urls[0].queryReadsFile) +
        " means it should read the file " +
        JSON.stringify(request.urls[0].queryReadsFile),
    ]);
  }
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  let nodeRequestCode = "";
  if (request.headers) {
    nodeRequestCode += defVar(definedVariables, "headers", "{\n");
    const headerCount = request.headers ? request.headers.length : 0;
    let i = 0;
    for (const [headerName, headerValue] of request.headers || []) {
      nodeRequestCode +=
        "    " + repr(headerName) + ": " + repr(headerValue || new Word()) + "";
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
    nodeRequestCode += defVar(
      definedVariables,
      "dataString",
      repr(request.data) + ";\n\n"
    );
  }

  nodeRequestCode += defVar(definedVariables, "options", "{\n");
  nodeRequestCode += "    url: " + repr(request.urls[0].url);
  if (!util.eq(request.urls[0].method.toUpperCase(), "GET")) {
    nodeRequestCode +=
      ",\n    method: " + repr(request.urls[0].method.toUpperCase());
  }

  if (request.headers) {
    nodeRequestCode += ",\n";
    nodeRequestCode += "    headers: headers";

    const h = util.getHeader(request, "accept-encoding");
    if (h) {
      const acceptedEncodings = h
        .split(",")
        .map((s) => s.trim().toLowerCase().toString());
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

  if (request.urls[0].auth) {
    nodeRequestCode += ",\n";
    const [user, password] = request.urls[0].auth;
    nodeRequestCode += "    auth: {\n";
    nodeRequestCode += "        'user': " + repr(user) + ",\n";
    nodeRequestCode += "        'pass': " + repr(password) + "\n";
    nodeRequestCode += "    }\n";
  } else {
    nodeRequestCode += "\n";
  }
  nodeRequestCode += "};\n\n";

  if (requestIndex === 0) {
    nodeRequestCode += "function callback(error, response, body) {\n";
    nodeRequestCode += "    if (!error && response.statusCode == 200) {\n";
    nodeRequestCode += "        console.log(body);\n";
    nodeRequestCode += "    }\n";
    nodeRequestCode += "}\n\n";
  }
  nodeRequestCode += "request(options, callback);";

  return nodeRequestCode + "\n";
};

const defVar = (
  variables: Set<string>,
  name: string,
  value: string
): string => {
  if (!variables.has(name)) {
    variables.add(name);
    name = "var " + name;
  }
  return `${name} = ${value}`;
};

export const _toNodeRequest = (
  requests: Request[],
  warnings: Warnings = []
): string => {
  const code = "var request = require('request');\n\n";
  const definedVariables = new Set(["request"]);

  const requestCode = requests.map((r, i) =>
    requestToNodeRequest(r, i, definedVariables, warnings)
  );
  return code + requestCode.join("\n\n");
};

export const toNodeRequestWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  warnings.unshift(["node-request", "the request package is deprecated"]);

  const nodeRequests = _toNodeRequest(requests, warnings);
  return [nodeRequests, warnings];
};
export const toNodeRequest = (curlCommand: string | string[]): string => {
  return toNodeRequestWarn(curlCommand)[0];
};
