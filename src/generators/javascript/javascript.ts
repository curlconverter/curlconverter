import * as util from "../../util.js";
import { Word } from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import jsescObj from "jsesc";

const javaScriptSupportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "upload-file",
  "form",
  "form-string",
  "digest",
  "no-digest",
  "next",
]);

const nodeSupportedArgs = new Set([...javaScriptSupportedArgs, "proxy"]);

// TODO: implement
export const reprObj = (value: object, indentLevel?: number): string => {
  const escaped = jsescObj(value, {
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

export const reprPairs = (
  d: [Word, Word][],
  indentLevel = 0,
  indent = "    ",
  list = true
): string => {
  if (d.length === 0) {
    return list ? "[]" : "{}";
  }

  let code = list ? "[\n" : "{\n";
  for (const [i, [key, value]] of d.entries()) {
    code += indent.repeat(indentLevel + 1);
    if (list) {
      code += "[" + repr(key) + ", " + repr(value) + "]";
    } else {
      code += repr(key) + ": " + repr(value);
    }
    code += i < d.length - 1 ? ",\n" : "\n";
  }
  code += indent.repeat(indentLevel) + (list ? "]" : "}");
  return code;
};
export const reprAsStringToStringDict = (
  d: [Word, Word][],
  indentLevel = 0,
  indent = "    "
): string => {
  return reprPairs(d, indentLevel, indent, false);
};

export const reprAsStringTuples = (
  d: [Word, Word][],
  indentLevel = 0,
  indent = "    "
): string => {
  return reprPairs(d, indentLevel, indent, true);
};

export const reprStringToStringList = (
  d: [Word, Word | Word[]][],
  indentLevel = 0,
  indent = "    ",
  list = true
): string => {
  if (d.length === 0) {
    return list ? "[]" : "{}";
  }

  let code = "{\n";
  for (const [i, [key, value]] of d.entries()) {
    let valueStr;
    if (Array.isArray(value)) {
      valueStr = "[" + value.map((v) => repr(v)).join(", ") + "]";
    } else {
      valueStr = repr(value);
    }

    code += indent.repeat(indentLevel + 1);
    code += repr(key) + ": " + valueStr;
    code += i < d.length - 1 ? ",\n" : "\n";
  }
  code += indent.repeat(indentLevel) + "}";
  return code;
};

// Backtick quotes are not supported
const regexEscape = /'|"|\\|\p{C}|\p{Z}/gu;
const regexDigit = /[0-9]/;
export const esc = (s: string, quote: "'" | '"' = "'"): string =>
  s.replace(regexEscape, (c: string, index: number, string: string) => {
    switch (c[0]) {
      // https://mathiasbynens.be/notes/javascript-escapes#single
      case " ":
        return " ";
      case "\\":
        return "\\\\";
      case "\b":
        return "\\b";
      case "\f":
        return "\\f";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\t":
        return "\\t";
      case "\v":
        return "\\v";
      case "'":
      case '"':
        return c === quote ? "\\" + c : c;
      case "\0":
        // \0 is null but \01 is an octal escape
        // if we have ['\0', '1', '2']
        // and we converted it to '\\012', it would be interpreted as octal
        // so it needs to be converted to '\\x0012'
        if (!regexDigit.test(string.charAt(index + 1))) {
          return "\\0";
        }
        break;
    }

    if (c.length === 2) {
      const first = c.charCodeAt(0);
      const second = c.charCodeAt(1);
      return (
        "\\u" +
        first.toString(16).padStart(4, "0") +
        "\\u" +
        second.toString(16).padStart(4, "0")
      );
    }

    const hex = c.charCodeAt(0).toString(16);
    if (hex.length > 2) {
      return "\\u" + hex.padStart(4, "0");
    }
    return "\\x" + hex.padStart(2, "0");
  });

export function reprStr(s: string, quote?: "'" | '"'): string {
  if (quote === undefined) {
    quote = "'";
    if (s.includes("'") && !s.includes('"')) {
      quote = '"';
    }
  }
  return quote + esc(s, quote) + quote;
}

export function repr(w: Word, quote?: "'" | '"'): string {
  const ret: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      ret.push(reprStr(t, quote));
    } else if (t.type === "variable") {
      // TODO: can't be done on browser JS
      ret.push("process.env[" + reprStr(t.value, quote) + "]");
    } else {
      // TODO: can't be done on browser JS
      // TODO:
      // const util = require('node:util');
      // const exec = util.promisify(require('node:child_process').exec);
      ret.push("await exec(" + reprStr(t.value, quote) + ").stdout");
    }
  }
  return ret.join(" + ");
}

export function reprFetch(w: Word, isNode: boolean): string {
  if (!isNode) {
    // TODO: warn
    return reprStr(w.toString());
  }
  return repr(w);
}

export const asParseFloat = (w: Word): string => {
  if (w.isString()) {
    const originalValue = w.toString();
    // TODO: reimplement curl's float parsing instead of parseFloat()
    const asFloat = parseFloat(originalValue);
    if (!isNaN(asFloat)) {
      return originalValue;
    }
  }
  return "parseFloat(" + repr(w) + ")";
};
export const asParseFloatTimes1000 = (w: Word): string => {
  if (w.isString()) {
    const originalValue = w.toString();
    // TODO: reimplement curl's float parsing instead of parseFloat()
    // TODO: check overflow
    const asFloat = parseFloat(originalValue) * 1000;
    if (!isNaN(asFloat)) {
      return asFloat.toString();
    }
  }
  return "parseFloat(" + repr(w) + ") * 1000";
};
export const asParseInt = (w: Word): string => {
  if (w.isString()) {
    const originalValue = w.toString();
    // TODO: reimplement curl's float parsing instead of parseInt()
    const asInt = parseInt(originalValue);
    if (!isNaN(asInt)) {
      return originalValue;
    }
  }
  return "parseInt(" + repr(w) + ")";
};

export const bySecondElem = (
  a: [string, string],
  b: [string, string]
): number => a[1].localeCompare(b[1]);

const getDataString = (
  request: Request,
  isNode: boolean
): [string, string | null] => {
  if (!request.data) {
    return ["", null];
  }
  const originalStringRepr = reprFetch(request.data, isNode);

  const contentType = util.getContentType(request);
  if (contentType === "application/json" && request.data.isString()) {
    try {
      const dataStr = request.data.toString();
      const parsed = JSON.parse(dataStr);
      // Only bother for arrays and {}
      if (typeof parsed !== "object" || parsed === null) {
        return [originalStringRepr, null];
      }
      const roundtrips = JSON.stringify(parsed) === dataStr;
      const jsonAsJavaScript = reprObj(parsed, 1);

      const dataString = "JSON.stringify(" + jsonAsJavaScript + ")";
      return [dataString, roundtrips ? null : originalStringRepr];
    } catch {
      return [originalStringRepr, null];
    }
  }
  if (contentType === "application/x-www-form-urlencoded") {
    try {
      const [queryList, queryDict] = util.parseQueryString(request.data);
      if (queryList) {
        // Technically node-fetch sends
        // application/x-www-form-urlencoded;charset=utf-8
        // TODO: handle repeated content-type header
        if (
          util.eq(
            util.getHeader(request, "content-type"),
            "application/x-www-form-urlencoded"
          )
        ) {
          util.deleteHeader(request, "content-type");
        }

        const queryObj =
          queryDict && queryDict.every((q) => !Array.isArray(q[1]))
            ? reprAsStringToStringDict(queryDict as [Word, Word][], 1)
            : reprAsStringTuples(queryList, 1);
        // TODO: check roundtrip, add a comment
        // TODO: this isn't a dict anymore
        return ["new URLSearchParams(" + queryObj + ")", null];
      }
      return [originalStringRepr, null];
    } catch {
      return [originalStringRepr, null];
    }
  }
  return [originalStringRepr, null];
};

const requestToJavaScriptOrNode = (
  request: Request,
  warnings: Warnings,
  fetchImports: Set<string>,
  imports: Set<[string, string]>,
  isNode: boolean
): string => {
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
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  let code = "";

  if (request.multipartUploads) {
    if (isNode) {
      // TODO: remove once Node 16 is EOL'd on 2023-09-11
      fetchImports.add("FormData");
    }
    code += "const form = new FormData();\n";
    for (const m of request.multipartUploads) {
      // TODO: use .set() if all names are unique?
      code += "form.append(" + reprFetch(m.name, isNode) + ", ";
      if ("contentFile" in m) {
        if (isNode) {
          if (util.eq(m.contentFile, "-")) {
            imports.add(["fs", "fs"]);
            code += "fs.readFileSync(0).toString()";
            if (m.filename) {
              code += ", " + reprFetch(m.filename, isNode);
            }
          } else {
            fetchImports.add("fileFromSync");
            // TODO: do this in a way that doesn't set filename="" if we don't have filename
            code += "fileFromSync(" + reprFetch(m.contentFile, isNode) + ")";
          }
        } else {
          // TODO: does the second argument get sent as filename="" ?
          code +=
            "File(['<data goes here>'], " +
            reprFetch(m.contentFile, isNode) +
            ")";
          // TODO: (massive todo) we could read the file if we're running in the command line
          warnings.push([
            "--form",
            "you can't read a file for --form/-F in the browser",
          ]);
        }
      } else {
        code += reprFetch(m.content, isNode);
      }
      code += ");\n";
    }
    code += "\n";
  }

  // Can delete content-type header
  const [dataString, commentedOutDataString] = getDataString(request, isNode);

  if (request.urls[0].auth && request.authType === "digest") {
    // TODO: if 'Authorization:' header is specified, don't set this
    const [user, password] = request.urls[0].auth;
    imports.add(["* as DigestFetch", "digest-fetch"]);
    code +=
      "const client = new DigestFetch(" +
      reprFetch(user, isNode) +
      ", " +
      reprFetch(password, isNode) +
      ");\n";
    code += "client.";
  }

  for (const urlObj of request.urls) {
    code += "fetch(" + reprFetch(urlObj.url, isNode);
    if (urlObj.queryReadsFile) {
      warnings.push([
        "unsafe-query",
        // TODO: better wording
        "the URL query string is not correct, " +
          JSON.stringify("@" + urlObj.queryReadsFile) +
          " means it should read the file " +
          JSON.stringify(urlObj.queryReadsFile),
      ]);
    }
    const method = urlObj.method.toLowerCase();

    if (
      !util.eq(method, "get") ||
      (request.headers && request.headers.length) ||
      // TODO: should authType be per-url too?
      (urlObj.auth && request.authType === "basic") ||
      request.data ||
      request.multipartUploads ||
      (isNode && request.proxy)
    ) {
      code += ", {\n";

      if (!util.eq(method, "get")) {
        // TODO: If you pass a weird method to fetch() it won't uppercase it
        // const methods = []
        // const method = methods.includes(request.method.toLowerCase()) ? request.method.toUpperCase() : request.method
        code +=
          "    method: " + reprFetch(request.urls[0].method, isNode) + ",\n";
      }

      if (
        (request.headers && request.headers.length) ||
        (urlObj.auth && request.authType === "basic")
      ) {
        code += "    headers: {\n";
        for (const [headerName, headerValue] of request.headers || []) {
          code +=
            "        " +
            reprFetch(headerName, isNode) +
            ": " +
            reprFetch(headerValue || new Word(), isNode) +
            ",\n";
        }
        if (urlObj.auth && request.authType === "basic") {
          // TODO: if -H 'Authorization:' is passed, don't set this
          code +=
            "        'Authorization': 'Basic ' + btoa(" +
            reprFetch(util.joinWords(urlObj.auth, ":"), isNode) +
            "),\n";
        }

        if (code.endsWith(",\n")) {
          code = code.slice(0, -2);
          code += "\n";
        }
        code += "    },\n";
      }

      if (urlObj.uploadFile) {
        if (isNode) {
          fetchImports.add("fileFromSync");
          code +=
            "    body: fileFromSync(" +
            reprFetch(urlObj.uploadFile, isNode) +
            "),\n";
        } else {
          code +=
            "    body: File(['<data goes here>'], " +
            reprFetch(urlObj.uploadFile, isNode) +
            "),\n";
          warnings.push([
            "--form",
            "you can't read a file for --upload-file/-F in the browser",
          ]);
        }
      } else if (request.data) {
        if (commentedOutDataString) {
          code += "    // body: " + commentedOutDataString + ",\n";
        }
        code += "    body: " + dataString + ",\n";
      } else if (request.multipartUploads) {
        code += "    body: form,\n";
      }

      if (isNode && request.proxy) {
        // TODO: do this parsing in utils.ts
        const proxy = request.proxy.includes("://")
          ? request.proxy
          : request.proxy.prepend("http://");
        // TODO: could be more accurate
        let [protocol] = proxy.split("://", 2);
        protocol = protocol.toLowerCase();

        if (!protocol.toBool()) {
          protocol = new Word("http");
        }
        if (util.eq(protocol, "socks")) {
          protocol = new Word("socks4");
          proxy.replace(/^socks/, "socks4");
        }

        if (
          util.eq(protocol, "socks4") ||
          util.eq(protocol, "socks5") ||
          util.eq(protocol, "socks5h") ||
          util.eq(protocol, "socks4a")
        ) {
          imports.add(["{ SocksProxyAgent }", "socks-proxy-agent"]);
          code +=
            "    agent: new SocksProxyAgent(" +
            reprFetch(proxy, isNode) +
            "),\n";
        } else if (util.eq(protocol, "http") || util.eq(protocol, "https")) {
          imports.add(["HttpsProxyAgent", "https-proxy-agent"]);
          code +=
            "    agent: new HttpsProxyAgent(" +
            reprFetch(proxy, isNode) +
            "),\n";
        } else {
          warnings.push([
            "--proxy",
            "failed to parse --proxy/-x or unknown protocol: " + protocol,
          ]);
          // or this?
          //   throw new CCError('Unsupported proxy scheme for ' + reprFetch(request.proxy))
        }
      }

      if (code.endsWith(",\n")) {
        code = code.slice(0, -2);
      }
      code += "\n}";
    }
    code += ");\n";
  }

  // TODO: generate some code for the output, like .json() if 'Accept': 'application/json'

  return code;
};

export const _toJavaScriptOrNode = (
  requests: Request[],
  warnings: Warnings,
  isNode: boolean
): string => {
  const fetchImports = new Set<string>();
  const imports = new Set<[string, string]>();

  const code = requests
    .map((r) =>
      requestToJavaScriptOrNode(r, warnings, fetchImports, imports, isNode)
    )
    .join("\n");

  let importCode = "";
  if (isNode) {
    importCode += "import fetch";
    if (fetchImports.size) {
      importCode += ", { " + Array.from(fetchImports).sort().join(", ") + " }";
    }
    importCode += " from 'node-fetch';\n";
  }
  if (imports.size) {
    for (const [varName, imp] of Array.from(imports).sort(bySecondElem)) {
      importCode += "import " + varName + " from " + reprStr(imp) + ";\n";
    }
  }

  if (importCode) {
    return importCode + "\n" + code;
  }
  return code;
};

export const _toJavaScript = (
  requests: Request[],
  warnings: Warnings = []
): string => {
  return _toJavaScriptOrNode(requests, warnings, false);
};
export const _toNode = (
  requests: Request[],
  warnings: Warnings = []
): string => {
  return _toJavaScriptOrNode(requests, warnings, true);
};

export const toJavaScriptWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(
    curlCommand,
    javaScriptSupportedArgs,
    warnings
  );
  return [_toJavaScript(requests, warnings), warnings];
};
export const toJavaScript = (curlCommand: string | string[]): string => {
  const [result] = toJavaScriptWarn(curlCommand);
  return result;
};

export const toNodeWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(
    curlCommand,
    nodeSupportedArgs,
    warnings
  );
  return [_toNode(requests, warnings), warnings];
};
export const toNode = (curlCommand: string | string[]): string => {
  return toNodeWarn(curlCommand)[0];
};
