import * as util from "../../util.js";
import type { Warnings } from "../../util.js";
import type { Request } from "../../util.js";

import jsesc from "jsesc";

const javaScriptSupportedArgs = new Set([
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
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
  "upload-file",
]);

const nodeSupportedArgs = new Set([
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
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
  "upload-file",
  "proxy",
]);

export const repr = (value: string | object, indentLevel?: number): string => {
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
      const jsonAsJavaScript = repr(parsed, 1);

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
        return ["new URLSearchParams(" + repr(queryDict, 1) + ")", null];
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

  code += "fetch(" + repr(request.url);

  const method = request.method.toLowerCase();

  if (
    method !== "get" ||
    (request.headers && request.headers.length) ||
    request.auth ||
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

    if ((request.headers && request.headers.length) || request.auth) {
      code += "    headers: {\n";
      for (const [headerName, headerValue] of request.headers || []) {
        code +=
          "        " +
          repr(headerName) +
          ": " +
          repr(headerValue || "") +
          ",\n";
      }
      if (request.auth) {
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
  return [_toJavaScript(request, warnings), warnings];
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
  return [_toNode(request, warnings), warnings];
};
export const toNode = (curlCommand: string | string[]): string => {
  return toNodeWarn(curlCommand)[0];
};
