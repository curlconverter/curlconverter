import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import jsesc from "jsesc";

const supportedArgs = new Set([
  "url",
  "request",
  "compressed",
  "no-compressed",
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
function repr(value: string): string {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''";
  } else {
    return "'" + jsesc(value, { quotes: "single" }) + "'";
  }
}

export const _toDart = (
  request: Request,
  warnings?: Warnings
): [string, Warnings] => {
  warnings = warnings || [];
  let s = "";

  if (request.auth || request.isDataBinary) s += "import 'dart:convert';\n";

  s +=
    "import 'package:http/http.dart' as http;\n" +
    "\n" +
    "void main() async {\n";

  if (request.auth) {
    const [uname, pword] = request.auth;

    s +=
      "  var uname = '" +
      uname +
      "';\n" +
      "  var pword = '" +
      pword +
      "';\n" +
      "  var authn = 'Basic ' + base64Encode(utf8.encode('$uname:$pword'));\n" +
      "\n";
  }

  const hasHeaders =
    request.headers ||
    request.compressed ||
    request.isDataBinary ||
    request.method.toLowerCase() === "put";
  if (hasHeaders) {
    s += "  var headers = {\n";
    for (const [hname, hval] of request.headers || []) {
      s += "    '" + hname + "': '" + hval + "',\n";
    }

    if (request.auth) s += "    'Authorization': authn,\n";
    if (request.compressed) s += "    'Accept-Encoding': 'gzip',\n";
    if (
      !util.hasHeader(request, "content-type") &&
      (request.isDataBinary || request.method.toLowerCase() === "put")
    ) {
      s += "    'Content-Type': 'application/x-www-form-urlencoded',\n";
    }

    s += "  };\n";
    s += "\n";
  }

  if (request.query) {
    // TODO: dict won't work with repeated keys
    s += "  var params = {\n";
    for (const [paramName, rawValue] of request.query) {
      const paramValue = repr(rawValue === null ? "" : rawValue);
      s += "    " + repr(paramName) + ": " + paramValue + ",\n";
    }
    s += "  };\n";
    /* eslint-disable no-template-curly-in-string */
    s +=
      "  var query = params.entries.map((p) => '${p.key}=${p.value}').join('&');\n";
    s += "\n";
  }

  const hasData = request.data;
  if (request.data) {
    // escape single quotes if there're not already escaped
    if (request.data.indexOf("'") !== -1 && request.data.indexOf("\\'") === -1)
      request.data = jsesc(request.data);

    if (request.dataArray) {
      s += "  var data = {\n";
      for (let i = 0; i !== request.dataArray.length; ++i) {
        const kv = request.dataArray[i];
        const splitKv = kv.replace(/\\"/g, '"').split("=");
        const key = splitKv[0] || "";
        const val = splitKv[1] || "";
        s += "    '" + key + "': '" + val + "',\n";
      }
      s += "  };\n";
      s += "\n";
    } else if (request.isDataBinary) {
      s += `  var data = utf8.encode('${request.data}');\n\n`;
    } else {
      s += `  var data = '${request.data}';\n\n`;
    }
  }

  if (request.query) {
    s += "  var url = Uri.parse('" + request.urlWithoutQuery + "?$query');\n";
  } else {
    s += "  var url = Uri.parse('" + request.url + "');\n";
  }
  s += "  var res = await http." + request.method.toLowerCase() + "(url";

  if (hasHeaders) s += ", headers: headers";
  else if (request.auth) s += ", headers: {'Authorization': authn}";
  if (hasData) s += ", body: data";

  /* eslint-disable no-template-curly-in-string */
  s +=
    ");\n" +
    "  if (res.statusCode != 200) throw Exception('http." +
    request.method.toLowerCase() +
    " error: statusCode= ${res.statusCode}');\n" +
    "  print(res.body);\n" +
    "}";

  return [s + "\n", warnings];
};
export const toDartWarn = (
  curlCommand: string | string[]
): [string, Warnings] => {
  const [request, warnings] = util.parseCurlCommand(curlCommand, supportedArgs);
  return _toDart(request, warnings);
};
export const toDart = (curlCommand: string | string[]): string => {
  return toDartWarn(curlCommand)[0];
};
