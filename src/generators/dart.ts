import * as util from "../util.js";
import { Word } from "../util.js";
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
function reprStr(value: string): string {
  const quote = value.includes("'") && !value.includes('"') ? '"' : "'";
  return quote + escape(value, quote) + quote;
}
function repr(value: Word): string {
  const ret: string[] = [];
  for (const t of value.tokens) {
    if (typeof t === "string") {
      ret.push(reprStr(t));
    } else if (t.type === "variable") {
      // TODO: import 'dart:io' show Platform;
      ret.push("Platform.environment[" + reprStr(t.value) + "]");
    } else {
      // TODO: import 'dart:io';
      ret.push(
        "Process.run(" + reprStr(t.value) + ", runInShell: true).stdout"
      );
    }
  }
  return ret.join(" + ");
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
        request.urls
          .map((u) => JSON.stringify(u.originalUrl.toString()))
          .join(", "),
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
        request.cookieFiles.map((c) => JSON.stringify(c.toString())).join(", "),
    ]);
  }

  const imports = new Set<string>();

  if (request.urls[0].auth || request.isDataBinary) imports.add("dart:convert");

  let s = "void main() async {\n";

  if (request.urls[0].auth) {
    const [uname, pword] = request.urls[0].auth;

    s +=
      "  var uname = " +
      repr(uname) +
      ";\n" +
      "  var pword = " +
      repr(pword) +
      ";\n" +
      "  var authn = 'Basic ' + base64Encode(utf8.encode('$uname:$pword'));\n" +
      "\n";
  }

  const methods = ["HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"];
  const rawRequestObj =
    request.multipartUploads ||
    !methods.includes(request.urls[0].method.toString());
  const hasHeaders =
    request.headers ||
    request.compressed ||
    request.isDataBinary ||
    request.urls[0].method.toLowerCase().toString() === "put";
  if (hasHeaders && !rawRequestObj) {
    s += "  var headers = {\n";
    for (const [hname, hval] of request.headers || []) {
      s += "    " + repr(hname) + ": " + repr(hval ?? new Word()) + ",\n";
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
      const paramValue = repr(rawValue ?? new Word());
      s += "    " + repr(paramName) + ": " + paramValue + ",\n";
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
    const [parsedQuery] = util.parseQueryString(request.data);
    if (parsedQuery && parsedQuery.length) {
      s += "  var data = {\n";
      for (const param of parsedQuery) {
        const [key, val] = param;
        s += "    " + repr(key) + ": " + repr(val) + ",\n";
      }
      s += "  };\n";
      s += "\n";
    } else {
      s += `  var data = ${repr(request.data)};\n\n`;
    }
  }

  if (queryIsRepresentable) {
    let urlString = repr(request.urls[0].urlWithoutQueryList);
    // Use Dart's $var interpolation for the query
    if (urlString.endsWith("'") || urlString.endsWith('"')) {
      urlString = urlString.slice(0, -1) + "?$query" + urlString.slice(-1);
    } else {
      urlString += " + '?$query'";
    }
    s += "  var url = Uri.parse(" + urlString + ");\n";
  } else {
    s += "  var url = Uri.parse(" + repr(request.urls[0].url) + ");\n";
  }

  if (rawRequestObj) {
    let multipart = "http.";
    if (request.multipartUploads) {
      multipart += "MultipartRequest";
    } else {
      multipart += "Request";
    }
    multipart += "(" + repr(request.urls[0].method) + ", url)\n";

    for (const m of request.multipartUploads || []) {
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
        if (util.eq(m.contentFile, "-")) {
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

    if (hasHeaders || request.urls[0].auth) {
      s += "  var req = new " + multipart;
      for (const [hname, hval] of request.headers || []) {
        s +=
          "  req.headers[" +
          repr(hname) +
          "] = " +
          repr(hval || new Word()) +
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
