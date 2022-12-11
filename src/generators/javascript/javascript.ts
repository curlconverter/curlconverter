import * as util from "../../util.js";
import type { Warnings } from "../../util.js";
import type { Request } from "../../util.js";

import jsescObj from "jsesc";

const javaScriptSupportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "upload-file",
  "form",
  "form-string",
  "digest",
  "no-digest",
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

export const repr = (s: string, quote?: "'" | '"'): string => {
  if (quote === undefined) {
    quote = "'";
    if (s.includes("'") && !s.includes('"')) {
      quote = '"';
    }
  }
  return quote + esc(s, quote) + quote;
};

export const bySecondElem = (
  a: [string, string],
  b: [string, string]
): number => a[1].localeCompare(b[1]);

const getDataString = (request: Request): [string, string | null] => {
  if (!request.data) {
    return ["", null];
  }
  const originalStringRepr = repr(request.data);

  const contentType = util.getContentType(request);
  if (contentType === "application/json") {
    try {
      const parsed = JSON.parse(request.data);
      // Only bother for arrays and {}
      if (typeof parsed !== "object" || parsed === null) {
        return [originalStringRepr, null];
      }
      const roundtrips = JSON.stringify(parsed) === request.data;
      const jsonAsJavaScript = reprObj(parsed, 1);

      const dataString = "JSON.stringify(" + jsonAsJavaScript + ")";
      return [dataString, roundtrips ? null : originalStringRepr];
    } catch {
      return [originalStringRepr, null];
    }
  }
  if (contentType === "application/x-www-form-urlencoded") {
    try {
      const query = util.parseQueryString(request.data);
      const queryDict = query[1];
      if (
        queryDict &&
        Object.values(queryDict).every((v) => typeof v === "string")
      ) {
        // Technically node-fetch sends
        // application/x-www-form-urlencoded;charset=utf-8
        // TODO: handle repeated content-type header
        if (
          util.getHeader(request, "content-type") ===
          "application/x-www-form-urlencoded"
        ) {
          util.deleteHeader(request, "content-type");
        }
        // TODO: check roundtrip, add a comment
        return ["new URLSearchParams(" + reprObj(queryDict, 1) + ")", null];
      }
      return [originalStringRepr, null];
    } catch {
      return [originalStringRepr, null];
    }
  }
  return [originalStringRepr, null];
};

export const _toJavaScriptOrNode = (
  request: Request,
  warnings: Warnings,
  isNode: boolean
): string => {
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  const fetchImports: Set<string> = new Set();
  const imports: Set<[string, string]> = new Set();

  let code = "";

  if (request.multipartUploads) {
    if (isNode) {
      fetchImports.add("FormData");
    }
    code += "const form = new FormData();\n";
    for (const m of request.multipartUploads) {
      // TODO: use .set() if all names are unique?
      code += "form.append(" + repr(m.name) + ", ";
      if ("contentFile" in m) {
        if (isNode) {
          if (m.contentFile === "-") {
            imports.add(["fs", "fs"]);
            code += "fs.readFileSync(0).toString()";
            if (m.filename) {
              code += ", " + repr(m.filename);
            }
          } else {
            fetchImports.add("fileFromSync");
            // TODO: do this in a way that doesn't set filename="" if we don't have filename
            code += "fileFromSync(" + repr(m.contentFile) + ")";
          }
        } else {
          // TODO: does the second argument get sent as filename="" ?
          code += "File(['<data goes here>'], " + repr(m.contentFile) + ")";
          // TODO: (massive todo) we could read the file if we're running in the command line
          warnings.push([
            "--form",
            "you can't read a file for --form/-F in the browser",
          ]);
        }
      } else {
        code += repr(m.content);
      }
      code += ");\n";
    }
    code += "\n";
  }

  // Can delete content-type header
  const [dataString, commentedOutDataString] = getDataString(request);

  if (request.auth && request.authType === "digest") {
    // TODO: if 'Authorization:' header is specified, don't set this
    const [user, password] = request.auth;
    imports.add(["* as DigestFetch", "digest-fetch"]);
    code +=
      "const client = new DigestFetch(" +
      repr(user) +
      ", " +
      repr(password) +
      ");\n";
    code += "client.";
  }
  code += "fetch(" + repr(request.url);

  const method = request.method.toLowerCase();

  if (
    method !== "get" ||
    (request.headers && request.headers.length) ||
    (request.auth && request.authType === "basic") ||
    request.data ||
    request.multipartUploads ||
    (isNode && request.proxy)
  ) {
    code += ", {\n";

    if (method !== "get") {
      // TODO: If you pass a weird method to fetch() it won't uppercase it
      // const methods = []
      // const method = methods.includes(request.method.toLowerCase()) ? request.method.toUpperCase() : request.method
      code += "    method: " + repr(request.method) + ",\n";
    }

    if (
      (request.headers && request.headers.length) ||
      (request.auth && request.authType === "basic")
    ) {
      code += "    headers: {\n";
      for (const [headerName, headerValue] of request.headers || []) {
        code +=
          "        " +
          repr(headerName) +
          ": " +
          repr(headerValue || "") +
          ",\n";
      }
      if (request.auth && request.authType === "basic") {
        // TODO: if -H 'Authorization:' is passed, don't set this
        const [user, password] = request.auth;
        code +=
          "        'Authorization': 'Basic ' + btoa(" +
          repr(user + ":" + password) +
          "),\n";
      }

      if (code.endsWith(",\n")) {
        code = code.slice(0, -2);
        code += "\n";
      }
      code += "    },\n";
    }

    if (request.data) {
      if (commentedOutDataString) {
        code += "    // body: " + commentedOutDataString + ",\n";
      }
      code += "    body: " + dataString + ",\n";
    } else if (request.multipartUploads) {
      code += "    body: form,\n";
    } else if (request.uploadFile) {
      if (isNode) {
        fetchImports.add("fileFromSync");
        code += "    body: fileFromSync(" + repr(request.uploadFile) + "),\n";
      } else {
        code +=
          "    body: File(['<data goes here>'], " +
          repr(request.uploadFile) +
          "),\n";
        warnings.push([
          "--form",
          "you can't read a file for --upload-file/-F in the browser",
        ]);
      }
    }

    if (isNode && request.proxy) {
      // TODO: do this parsing in utils.ts
      const proxy = request.proxy.includes("://")
        ? request.proxy
        : "http://" + request.proxy;
      // TODO: could be more accurate
      let [protocol] = proxy.split(/:\/\/(.*)/s, 2);
      protocol = protocol.toLowerCase();

      if (!protocol) {
        protocol = "http";
      }
      if (protocol === "socks") {
        protocol = "socks4";
        proxy.replace(/^socks/, "socks4");
      }

      switch (protocol) {
        case "socks4":
        case "socks5":
        case "socks5h":
        case "socks4a":
          imports.add(["{ SocksProxyAgent }", "socks-proxy-agent"]);
          code += "    agent: new SocksProxyAgent(" + repr(proxy) + "),\n";
          break;
        case "http":
        case "https":
          imports.add(["HttpsProxyAgent", "https-proxy-agent"]);
          code += "    agent: new HttpsProxyAgent(" + repr(proxy) + "),\n";
          break;
        default:
          warnings.push([
            "--proxy",
            "failed to parse --proxy/-x or unknown protocol: " + protocol,
          ]);
          break;
        // default:
        //   throw new CCError('Unsupported proxy scheme for ' + repr(request.proxy))
      }
    }

    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
    }
    code += "\n}";
  }
  code += ");";

  // TODO: generate some code for the output, like .json() if 'Accept': 'application/json'

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
      importCode += "import " + varName + " from " + repr(imp) + ";\n";
    }
  }

  if (importCode) {
    code = importCode + "\n" + code;
  }
  return code + "\n";
};

export const _toJavaScript = (
  request: Request,
  warnings: Warnings = []
): string => {
  return _toJavaScriptOrNode(request, warnings, false);
};
export const _toNode = (request: Request, warnings: Warnings = []): string => {
  return _toJavaScriptOrNode(request, warnings, true);
};

export const toJavaScriptWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(
    curlCommand,
    javaScriptSupportedArgs,
    warnings
  );
  return [_toJavaScript(request[0], warnings), warnings];
};
export const toJavaScript = (curlCommand: string | string[]): string => {
  return toJavaScriptWarn(curlCommand)[0];
};

export const toNodeWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(
    curlCommand,
    nodeSupportedArgs,
    warnings
  );
  return [_toNode(request[0], warnings), warnings];
};
export const toNode = (curlCommand: string | string[]): string => {
  return toNodeWarn(curlCommand)[0];
};
