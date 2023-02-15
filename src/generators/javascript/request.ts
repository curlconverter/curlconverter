import { warnIfPartsIgnored } from "../../Warnings.js";
import { Word, eq } from "../../shell/Word.js";
import { parseCurlCommand, COMMON_SUPPORTED_ARGS } from "../../parse.js";
import type { Request, Warnings } from "../../parse.js";

import { repr, type JSImports, reprImportsRequire } from "./javascript.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  // "form",
  // "form-string",
  "next",
]);

function requestToNodeRequest(
  request: Request,
  requestIndex: number,
  definedVariables: Set<string>,
  imports: JSImports,
  warnings: Warnings = []
): string {
  warnIfPartsIgnored(request, warnings);

  let nodeRequestCode = "";
  if (request.headers.length) {
    nodeRequestCode += defVar(definedVariables, "headers", "{\n");
    let i = 0;
    for (const [headerName, headerValue] of request.headers) {
      nodeRequestCode +=
        "    " +
        repr(headerName, imports) +
        ": " +
        repr(headerValue || new Word(), imports) +
        "";
      nodeRequestCode += i < request.headers.length - 1 ? ",\n" : "\n";
      i++;
    }
    nodeRequestCode += "};\n\n";
  }

  if (request.data) {
    nodeRequestCode += defVar(
      definedVariables,
      "dataString",
      repr(request.data, imports) + ";\n\n"
    );
  }

  nodeRequestCode += defVar(definedVariables, "options", "{\n");
  nodeRequestCode += "    url: " + repr(request.urls[0].url, imports);
  if (!eq(request.urls[0].method.toUpperCase(), "GET")) {
    nodeRequestCode +=
      ",\n    method: " + repr(request.urls[0].method.toUpperCase(), imports);
  }

  if (request.headers.length) {
    nodeRequestCode += ",\n";
    nodeRequestCode += "    headers: headers";

    const h = request.headers.get("accept-encoding");
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
    nodeRequestCode += "        'user': " + repr(user, imports) + ",\n";
    nodeRequestCode += "        'pass': " + repr(password, imports) + "\n";
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
}

function defVar(variables: Set<string>, name: string, value: string): string {
  if (!variables.has(name)) {
    variables.add(name);
    name = "var " + name;
  }
  return `${name} = ${value}`;
}

export function _toNodeRequest(
  requests: Request[],
  warnings: Warnings = []
): string {
  const code = "var request = require('request');\n";
  const definedVariables = new Set(["request"]);

  const imports: JSImports = [];
  const requestCode = requests.map((r, i) =>
    requestToNodeRequest(r, i, definedVariables, imports, warnings)
  );
  return code + reprImportsRequire(imports) + "\n" + requestCode.join("\n\n");
}

export function toNodeRequestWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parseCurlCommand(curlCommand, supportedArgs, warnings);
  warnings.unshift(["node-request", "the request package is deprecated"]);

  const nodeRequests = _toNodeRequest(requests, warnings);
  return [nodeRequests, warnings];
}
export function toNodeRequest(curlCommand: string | string[]): string {
  return toNodeRequestWarn(curlCommand)[0];
}
