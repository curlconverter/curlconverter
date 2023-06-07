import { eq, mergeWords, joinWords } from "../../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../../parse.js";
import type { Request, Warnings } from "../../parse.js";

import {
  repr,
  asParseFloatTimes1000,
  type JSImports,
  reprImports,
} from "./javascript.js";

// TODO: these need to be modified
import { dedent, getDataString, getFormString } from "./jquery.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  // "form",
  // "form-string",
  "max-time",
]);

export function _toNodeHttp(
  requests: Request[],
  warnings: Warnings = []
): string {
  const request = getFirst(requests, warnings);
  const imports: JSImports = [];

  let code = "";
  let options = "";

  // TODO: check sending data with GET
  const method = request.urls[0].method;
  if (!eq(method, "GET")) {
    options += "  method: " + repr(method, imports) + ",\n";
  }

  if (!eq(request.urls[0].method.toUpperCase(), method)) {
    warnings.push([
      "method-case",
      "http uppercases the method, so it will be changed to " +
        JSON.stringify(method.toUpperCase().toString()),
    ]);
  }

  const url = request.urls[0].url;

  let dataString, commentedOutDataString;
  const contentType = request.headers.getContentType();
  let exactContentType = request.headers.get("content-type");
  if (request.data) {
    // might delete content-type header
    [exactContentType, dataString, commentedOutDataString] = getDataString(
      request.data,
      contentType,
      exactContentType,
      imports
    );
  }

  if (request.urls[0].auth) {
    const [username, password] = request.urls[0].auth;
    options +=
      "  auth: " + repr(joinWords([username, password], ":"), imports) + ",\n";
  }

  // TODO: warn about unsent headers
  if (request.headers.length) {
    options += "  headers: {\n";
    for (const [key, value] of request.headers) {
      if (value === null) {
        continue;
      }
      options +=
        "    " + repr(key, imports) + ": " + repr(value, imports) + ",\n";
    }
    if (options.endsWith(",\n")) {
      options = options.slice(0, -2);
      options += "\n";
    }
    options += "  },\n";
  }

  if (request.timeout) {
    options +=
      "  timeout: " + asParseFloatTimes1000(request.timeout, imports) + ";\n";
    // TODO: warn about differences from curl
  }

  if (options.endsWith(",\n")) {
    options = options.slice(0, -2);
    options += "\n";
  }

  const urlObj = request.urls[0].urlObj;
  let optArg = repr(url, imports);
  if (options) {
    code += "const options = {\n";
    code += "  hostname: " + repr(urlObj.host, imports) + ",\n";
    // TODO
    // code += "  port: " + repr(request.urls[0].urlObj.port, imports) + ",\n";
    const path = mergeWords([urlObj.path, urlObj.query]);
    if (path.toBool()) {
      code += "  path: " + repr(path, imports) + ",\n";
    }
    // code += "  protocol: " + repr(urlObj.scheme, imports) + ",\n";
    code += options;
    code += "};\n";
    code += "\n";

    optArg = "options";
  }

  const module = urlObj.scheme.toString() === "https" ? "https" : "http";
  const fn = eq(method, "GET") ? "get" : "request";
  code +=
    "const req = " + module + "." + fn + "(" + optArg + ", function (res) {\n";
  code += "  const chunks = [];\n";
  code += "\n";
  code += "  res.on('data', function (chunk) {\n";
  code += "    chunks.push(chunk);\n";
  code += "  });\n";
  code += "\n";
  code += "  res.on('end', function () {\n";
  code += "    const body = Buffer.concat(chunks);\n";
  code += "    console.log(body.toString());\n";
  code += "  });\n";
  code += "});\n";

  if (commentedOutDataString) {
    code += "\n// req.write(" + commentedOutDataString + ");";
  }
  if (dataString) {
    code += "\nreq.write(" + dedent(dataString) + ");\n";
  }
  if (fn !== "get") {
    code += "req.end();\n";
  }

  let importCode = "import " + module + " from '" + module + "';\n";
  importCode += reprImports(imports);
  importCode += "\n";

  return importCode + code;
}

export function toNodeHttpWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const code = _toNodeHttp(requests, warnings);
  return [code, warnings];
}
export function toNodeHttp(curlCommand: string | string[]): string {
  return toNodeHttpWarn(curlCommand)[0];
}
