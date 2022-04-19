import * as util from "../../util.js";
import type { Warnings } from "../../util.js";
import type { Request } from "../../util.js";

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

export const _toJavaScript = (
  request: Request,
  warnings?: Warnings
): [string, Warnings] => {
  warnings = warnings || [];
  let jsFetchCode = "";

  if (request.data) {
    // escape single quotes if there are any in there
    if (request.data.indexOf("'") > -1) {
      request.data = jsesc(request.data);
    }

    try {
      JSON.parse(request.data);

      if (!request.headers) {
        request.headers = [];
      }

      if (!util.hasHeader(request, "Content-Type")) {
        request.headers.push([
          "Content-Type",
          "application/json; charset=UTF-8",
        ]);
      }

      request.data = "JSON.stringify(" + request.data + ")";
    } catch {
      request.data = "'" + request.data + "'";
    }
  }

  jsFetchCode += "fetch('" + request.url + "'";

  if (
    request.method.toUpperCase() !== "GET" ||
    request.headers ||
    request.auth ||
    request.data
  ) {
    jsFetchCode += ", {\n";

    if (request.method.toUpperCase() !== "GET") {
      // TODO: If you pass a weird method to fetch() it won't uppercase it
      // const methods = []
      // const method = methods.includes(request.method.toLowerCase()) ? request.method.toUpperCase() : request.method
      jsFetchCode += "    method: '" + request.method.toUpperCase() + "'";
    }

    if (request.headers || request.auth) {
      if (request.method.toUpperCase() !== "GET") {
        jsFetchCode += ",\n";
      }
      jsFetchCode += "    headers: {\n";
      const headerCount = request.headers ? request.headers.length : 0;
      let i = 0;
      for (const [headerName, headerValue] of request.headers || []) {
        jsFetchCode += "        '" + headerName + "': '" + headerValue + "'";
        if (i < headerCount - 1 || request.auth) {
          jsFetchCode += ",\n";
        }
        i++;
      }
      if (request.auth) {
        const [user, password] = request.auth;
        jsFetchCode +=
          "        'Authorization': 'Basic ' + btoa('" +
          user +
          ":" +
          password +
          "')";
      }

      jsFetchCode += "\n    }";
    }

    if (request.data) {
      jsFetchCode += ",\n    body: " + request.data;
    }

    jsFetchCode += "\n}";
  }

  jsFetchCode += ");";

  return [jsFetchCode + "\n", warnings];
};

export const toJavaScriptWarn = (
  curlCommand: string | string[]
): [string, Warnings] => {
  const [request, warnings] = util.parseCurlCommand(curlCommand, supportedArgs);
  return _toJavaScript(request, warnings);
};

export const toJavaScript = (curlCommand: string | string[]): string => {
  return toJavaScriptWarn(curlCommand)[0];
};

const importStatement = "var fetch = require('node-fetch');\n\n";

export const _toNode = (
  request: Request,
  warnings?: Warnings
): [string, Warnings] => {
  let jsCode;
  [jsCode, warnings] = _toJavaScript(request, warnings);
  return [importStatement + jsCode, warnings];
};

export const toNodeWarn = (
  curlCommand: string | string[]
): [string, Warnings] => {
  const [request, warnings] = util.parseCurlCommand(curlCommand, supportedArgs);
  return _toNode(request, warnings);
};
export const toNode = (curlCommand: string | string[]): string => {
  return toNodeWarn(curlCommand)[0];
};
