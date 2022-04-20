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
  "get",
  "header",
  "head",
  "no-head",
  "user",
  // TODO: proxy
  // TODO: timeout?
]);

const repr = (value: string | object, indentLevel?: number): string => {
  const escaped = jsesc(value, {
    quotes: "single",
    minimal: false,
    compact: false,
    indent: "    ",
    indentLevel: indentLevel ? indentLevel : 0,
  });
  if (typeof value === "string") {
    return "'" + escaped + "'";
  }
  return escaped;
};

export const _toJavaScriptAxios = (
  request: Request,
  warnings?: Warnings
): [string, Warnings] => {
  warnings = warnings || [];
  warnings = warnings || [];
  let code = "const axios = require('axios');\n\n";

  if (
    request.method.toLowerCase() === "get" &&
    !request.queryDict &&
    !request.headers &&
    !request.auth &&
    !request.data
  ) {
    code += "const response = await axios(" + repr(request.url) + ");\n";
    return [code, warnings];
  }

  // TODO: keep JSON as-is
  // if (request.data) {
  //   // escape single quotes if there are any in there
  //   if (request.data.indexOf("'") > -1) {
  //     request.data = jsesc(request.data);
  //   }
  //   try {
  //     JSON.parse(request.data);
  //     if (!request.headers) {
  //       request.headers = [];
  //     }
  //     if (!util.hasHeader(request, "Content-Type")) {
  //       request.headers.push([
  //         "Content-Type",
  //         "application/json; charset=UTF-8",
  //       ]);
  //     }
  //     request.data = "JSON.stringify(" + request.data.trim() + ")";
  //   } catch {
  //     request.data = repr(request.data);
  //   }
  // }

  const methods = ["get", "delete", "head", "options", "post", "put", "patch"];
  let fn = "request";
  if (methods.includes(request.method.toLowerCase())) {
    fn = request.method.toLowerCase();
  }

  code += "const response = await axios." + fn + "(";
  code += repr(request.queryDict ? request.urlWithoutQuery : request.url);

  if (
    fn === "request" ||
    request.queryDict ||
    request.headers ||
    request.auth ||
    request.data
    // TODO: proxy
  ) {
    code += ", {\n";
    if (fn === "request") {
      // Axios uppercases methods
      code += "    method: " + repr(request.method.toLowerCase()) + ",\n";
    }
    if (request.queryDict) {
      code += "    params: " + repr(request.queryDict, 1) + ",\n";
    }

    if (request.headers) {
      code +=
        "    headers: " + repr(Object.fromEntries(request.headers), 1) + ",\n";
    }

    if (request.auth) {
      const [username, password] = request.auth;
      const auth = { username, password };
      if (password) {
        auth.password = password;
      }
      code += "    auth: {\n";
      code += "        username: " + repr(username);
      if (password) {
        code += ",\n";
        code += "        password: " + repr(password) + ",\n";
      } else {
        code += "\n";
      }
      code += "    },\n";
    }

    if (request.data) {
      // TODO: make this a dict if possible
      code += "    data: " + repr(request.data) + ",\n";
    }

    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
    }
    code += "\n}";
  }

  code += ");\n";

  return [code, warnings];
};
export const toJavaScriptAxiosWarn = (
  curlCommand: string | string[]
): [string, Warnings] => {
  const [request, warnings] = util.parseCurlCommand(curlCommand, supportedArgs);
  return _toJavaScriptAxios(request, warnings);
};
export const toJavaScriptAxios = (curlCommand: string | string[]): string => {
  return toJavaScriptAxiosWarn(curlCommand)[0];
};
