import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import { esc as jsesc } from "./javascript/javascript.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "compressed",
  "form",
  "form-string",
  "no-compressed",
]);
function escape(value: string, quote: '"' | "'"): string {
  // Escape Dart's $string interpolation syntax
  // TODO: does Dart have the same escape sequences as JS?
  return jsesc(value, quote).replace(/\$/g, "\\$");
}
function repr(value: string): string {
  const quote = value.includes("'") && !value.includes('"') ? '"' : "'";
  return quote + escape(value, quote) + quote;
}

export const _toDart = (
  requests: Request[],
  warnings: Warnings = []
): string => {
  if (requests.length > 1) {
    warnings.push([
      "next",
      "got " +
        requests.length +
        " configs because of --next, using the first one",
    ]);
  }
  const request = requests[0];
  if (request.urls.length > 1) {
    warnings.push([
      "multiple-urls",
      "found " +
        request.urls.length +
        " URLs, only the first one will be used: " +
        request.urls.map((u) => JSON.stringify(u.originalUrl)).join(", "),
    ]);
  }
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  const imports = new Set<string>();

  if (request.auth || request.isDataBinary) imports.add("dart:convert");

  let s = "void main() async {\n";

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
  if (hasHeaders && !request.multipartUploads) {
    s += "  var headers = {\n";
    for (const [hname, hval] of request.headers || []) {
      s += "    " + repr(hname) + ": " + repr(hval ?? "") + ",\n";
    }

    if (request.auth) s += "    'Authorization': authn,\n";
    // TODO: headers might already have Accept-Encoding
    if (request.compressed) s += "    'Accept-Encoding': 'gzip',\n";

    s += "  };\n";
    s += "\n";
  }

  // TODO: Uri() can accept a params dict
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
    const [parsedQuery] = util.parseQueryString(request.data);
    if (
      parsedQuery &&
      parsedQuery.length &&
      !parsedQuery.some((p) => p[1] === null)
    ) {
      s += "  var data = {\n";
      for (const param of parsedQuery) {
        const [key, val] = param;
        s += "    " + repr(key) + ": " + repr(val ?? "") + ",\n";
      }
      s += "  };\n";
      s += "\n";
    } else {
      s += `  var data = ${repr(request.data)};\n\n`;
    }
  }

  if (request.query) {
    s +=
      "  var url = Uri.parse('" +
      escape(request.urlWithoutQuery, "'") +
      "?$query" +
      "');\n";
  } else {
    s += "  var url = Uri.parse(" + repr(request.url) + ");\n";
  }

  if (request.multipartUploads) {
    let multipart =
      "http.MultipartRequest(" + repr(request.method) + ", url)\n";

    for (const m of request.multipartUploads) {
      // MultipartRequest syntax looks like this:
      //   ..fields['user'] = 'nweiz@google.com'
      // or
      // ..files.add(await http.MultipartFile.fromPath(
      //   'package', 'build/package.tar.gz',
      //   contentType: MediaType('application', 'x-tar')));
      const name = repr(m.name); // TODO: what if name is empty string?
      const sentFilename = "filename" in m && m.filename;
      if ("contentFile" in m) {
        multipart += "    ..files.add(await http.MultipartFile.";
        if (m.contentFile === "-") {
          if (request.stdinFile) {
            multipart += "fromPath(\n";
            multipart += "      " + name + ", " + repr(request.stdinFile);
            if (sentFilename && request.stdinFile !== sentFilename) {
              multipart += ",\n";
              multipart += "      filename: " + repr(sentFilename);
            }
            multipart += "))\n";
          } else if (request.stdin) {
            multipart += "fromString(\n";
            multipart += "      " + name + ", " + repr(request.stdin);
            if (sentFilename) {
              multipart += ",\n";
              multipart += "      filename: " + repr(sentFilename);
            }
            multipart += "))\n";
          } else {
            multipart += "fromString(\n";
            // TODO: read the entire thing, not one line.
            multipart +=
              "      " + name + ", stdin.readLineSync(encoding: utf8)";
            if (sentFilename) {
              multipart += ",\n";
              multipart += "      filename: " + repr(sentFilename);
            }
            multipart += "))\n";
            imports.add("dart:io");
            imports.add("dart:convert");
          }
        } else {
          multipart += "fromPath(\n";
          multipart += "      " + name + ", " + repr(m.contentFile);
          if (sentFilename && m.contentFile !== sentFilename) {
            multipart += ",\n";
            multipart += "      filename: " + repr(sentFilename);
          }
          multipart += "))\n";
        }
      } else {
        multipart += "    ..fields[" + name + "] = " + repr(m.content) + "\n";
      }
    }

    if (hasHeaders || request.auth) {
      s += "  var req = new " + multipart;
      for (const [hname, hval] of request.headers || []) {
        s += "  req.headers[" + repr(hname) + "] = " + repr(hval || "") + ";\n";
      }
      if (request.auth) {
        s += "  req.headers['Authorization'] = authn;\n";
      }
      s += "  var res = await req.send();\n";
    } else {
      s += "  var res = await " + multipart;
    }
  } else {
    s += "  var res = await http." + request.method.toLowerCase() + "(url";

    if (hasHeaders) s += ", headers: headers";
    else if (request.auth) s += ", headers: {'Authorization': authn}";
    if (hasData) s += ", body: data";
    s += ");\n";
  }

  /* eslint-disable no-template-curly-in-string */
  s +=
    "  if (res.statusCode != 200) throw Exception('http." +
    request.method.toLowerCase() +
    " error: statusCode= ${res.statusCode}');\n" +
    "  print(res.body);\n" +
    "}";

  let importString = "";
  for (const imp of Array.from(imports).sort()) {
    importString += "import '" + imp + "';\n";
  }
  importString += "import 'package:http/http.dart' as http;\n";
  return importString + "\n" + s + "\n";
};
export const toDartWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const dart = _toDart(requests, warnings);
  return [dart, warnings];
};
export const toDart = (curlCommand: string | string[]): string => {
  return toDartWarn(curlCommand)[0];
};
