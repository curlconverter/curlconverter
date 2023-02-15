import { Word, eq } from "../shell/Word.js";
import { parseCurlCommand, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";
import { parseQueryString } from "../Query.js";

import { esc as jsesc } from "./javascript/javascript.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
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
function reprStr(value: string): string {
  const quote = value.includes("'") && !value.includes('"') ? '"' : "'";
  return quote + escape(value, quote) + quote;
}
function repr(value: Word, imports: Set<string>): string {
  const ret: string[] = [];
  for (const t of value.tokens) {
    if (typeof t === "string") {
      ret.push(reprStr(t));
    } else if (t.type === "variable") {
      ret.push("(Platform.environment[" + reprStr(t.value) + "] ?? '')");
      imports.add("dart:io");
    } else {
      ret.push(
        "(await Process.run(" + reprStr(t.value) + ", runInShell: true)).stdout"
      );
      imports.add("dart:io");
    }
  }
  return ret.join(" + ");
}

export function _toDart(requests: Request[], warnings: Warnings = []): string {
  const request = getFirst(requests, warnings);

  const imports = new Set<string>();

  if (request.urls[0].auth || request.isDataBinary) imports.add("dart:convert");

  let s = "void main() async {\n";

  if (request.urls[0].auth) {
    const [uname, pword] = request.urls[0].auth;

    s +=
      "  var uname = " +
      repr(uname, imports) +
      ";\n" +
      "  var pword = " +
      repr(pword, imports) +
      ";\n" +
      "  var authn = 'Basic ' + base64Encode(utf8.encode('$uname:$pword'));\n" +
      "\n";
  }

  const methods = ["HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"];
  const rawRequestObj =
    request.multipartUploads ||
    !methods.includes(request.urls[0].method.toString());
  const hasHeaders =
    request.headers.length ||
    request.compressed ||
    request.isDataBinary ||
    request.urls[0].method.toLowerCase().toString() === "put";
  if (hasHeaders && !rawRequestObj) {
    s += "  var headers = {\n";
    for (const [hname, hval] of request.headers) {
      s +=
        "    " +
        repr(hname, imports) +
        ": " +
        repr(hval ?? new Word(), imports) +
        ",\n";
    }

    if (request.urls[0].auth) s += "    'Authorization': authn,\n";
    // TODO: headers might already have Accept-Encoding
    if (request.compressed) s += "    'Accept-Encoding': 'gzip',\n";

    s += "  };\n";
    s += "\n";
  }

  // TODO: Uri() can accept a params dict
  const queryIsRepresentable =
    request.urls[0].queryList &&
    request.urls[0].queryDict &&
    Object.values(request.urls[0].queryDict).every((v) => !Array.isArray(v));
  if (queryIsRepresentable && request.urls[0].queryList) {
    // TODO: dict won't work with repeated keys
    s += "  var params = {\n";
    for (const [paramName, rawValue] of request.urls[0].queryList) {
      const paramValue = repr(rawValue ?? new Word(), imports);
      s += "    " + repr(paramName, imports) + ": " + paramValue + ",\n";
    }
    s += "  };\n";
    // TODO: Uri() can accept a queryParameters dict, requires parsing out the port
    /* eslint-disable no-template-curly-in-string */
    s +=
      "  var query = params.entries.map((p) => '${p.key}=${p.value}').join('&');\n";
    s += "\n";
  }

  const hasData = request.data;
  if (request.data) {
    const [parsedQuery] = parseQueryString(request.data);
    if (parsedQuery && parsedQuery.length) {
      s += "  var data = {\n";
      for (const param of parsedQuery) {
        const [key, val] = param;
        s += "    " + repr(key, imports) + ": " + repr(val, imports) + ",\n";
      }
      s += "  };\n";
      s += "\n";
    } else {
      s += `  var data = ${repr(request.data, imports)};\n\n`;
    }
  }

  if (queryIsRepresentable) {
    let urlString = repr(request.urls[0].urlWithoutQueryList, imports);
    // Use Dart's $var interpolation for the query
    if (urlString.endsWith("'") || urlString.endsWith('"')) {
      urlString = urlString.slice(0, -1) + "?$query" + urlString.slice(-1);
    } else {
      urlString += " + '?$query'";
    }
    s += "  var url = Uri.parse(" + urlString + ");\n";
  } else {
    s += "  var url = Uri.parse(" + repr(request.urls[0].url, imports) + ");\n";
  }

  if (rawRequestObj) {
    let multipart = "http.";
    if (request.multipartUploads) {
      multipart += "MultipartRequest";
    } else {
      multipart += "Request";
    }
    multipart += "(" + repr(request.urls[0].method, imports) + ", url)\n";

    for (const m of request.multipartUploads || []) {
      // MultipartRequest syntax looks like this:
      //   ..fields['user'] = 'nweiz@google.com'
      // or
      // ..files.add(await http.MultipartFile.fromPath(
      //   'package', 'build/package.tar.gz',
      //   contentType: MediaType('application', 'x-tar')));
      const name = repr(m.name, imports); // TODO: what if name is empty string?
      const sentFilename = "filename" in m && m.filename;
      if ("contentFile" in m) {
        multipart += "    ..files.add(await http.MultipartFile.";
        if (eq(m.contentFile, "-")) {
          if (request.stdinFile) {
            multipart += "fromPath(\n";
            multipart +=
              "      " + name + ", " + repr(request.stdinFile, imports);
            if (sentFilename && request.stdinFile !== sentFilename) {
              multipart += ",\n";
              multipart += "      filename: " + repr(sentFilename, imports);
            }
            multipart += "))\n";
          } else if (request.stdin) {
            multipart += "fromString(\n";
            multipart += "      " + name + ", " + repr(request.stdin, imports);
            if (sentFilename) {
              multipart += ",\n";
              multipart += "      filename: " + repr(sentFilename, imports);
            }
            multipart += "))\n";
          } else {
            multipart += "fromString(\n";
            // TODO: read the entire thing, not one line.
            multipart +=
              "      " + name + ", stdin.readLineSync(encoding: utf8)";
            if (sentFilename) {
              multipart += ",\n";
              multipart += "      filename: " + repr(sentFilename, imports);
            }
            multipart += "))\n";
            imports.add("dart:io");
            imports.add("dart:convert");
          }
        } else {
          multipart += "fromPath(\n";
          multipart += "      " + name + ", " + repr(m.contentFile, imports);
          if (sentFilename && m.contentFile !== sentFilename) {
            multipart += ",\n";
            multipart += "      filename: " + repr(sentFilename, imports);
          }
          multipart += "))\n";
        }
      } else {
        multipart +=
          "    ..fields[" + name + "] = " + repr(m.content, imports) + "\n";
      }
    }

    if (hasHeaders || request.urls[0].auth) {
      s += "  var req = new " + multipart;
      for (const [hname, hval] of request.headers) {
        s +=
          "  req.headers[" +
          repr(hname, imports) +
          "] = " +
          repr(hval || new Word(), imports) +
          ";\n";
      }
      if (request.urls[0].auth) {
        s += "  req.headers['Authorization'] = authn;\n";
      }
      s += "  var res = await req.send();\n";
    } else {
      // TODO: this might not work, I think it's client.send(req)
      s += "  var res = await " + multipart;
    }

    /* eslint-disable no-template-curly-in-string */
    s +=
      "  if (res.statusCode != 200) throw Exception('http.send" +
      " error: statusCode= ${res.statusCode}');\n" +
      "  print(res.body);\n" +
      "}";
  } else {
    s +=
      "  var res = await http." +
      request.urls[0].method.toLowerCase().toString() +
      "(url";

    if (hasHeaders) s += ", headers: headers";
    else if (request.urls[0].auth) s += ", headers: {'Authorization': authn}";
    if (hasData) s += ", body: data";
    s += ");\n";

    /* eslint-disable no-template-curly-in-string */
    s +=
      "  if (res.statusCode != 200) throw Exception('http." +
      request.urls[0].method.toLowerCase().toString() +
      " error: statusCode= ${res.statusCode}');\n" +
      "  print(res.body);\n" +
      "}";
  }

  let importString = "";
  for (const imp of Array.from(imports).sort()) {
    importString += "import '" + imp + "';\n";
  }
  importString += "import 'package:http/http.dart' as http;\n";
  return importString + "\n" + s + "\n";
}
export function toDartWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parseCurlCommand(curlCommand, supportedArgs, warnings);
  const dart = _toDart(requests, warnings);
  return [dart, warnings];
}
export function toDart(curlCommand: string | string[]): string {
  return toDartWarn(curlCommand)[0];
}
