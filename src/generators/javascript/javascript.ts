import * as util from "../../util.js";
import type { Warnings } from "../../util.js";
import type { Request } from "../../util.js";

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
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
  "upload-file",
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
      } else {
        return [originalStringRepr, null];
      }
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
): [string, Warnings] => {
  const fetchImports: Set<string> = new Set();
  const imports: Set<string> = new Set();

  let code = "";

  if (request.multipartUploads) {
    if (isNode) {
      fetchImports.add("FormData");
    }
    code += "const form = new FormData();\n";
    for (const f of request.multipartUploads) {
      // TODO: use .set() if all names are unique?
      code += "form.append(" + repr(f.name) + ", ";
      if ("contentFile" in f) {
        if (isNode) {
          if (f.contentFile === "-") {
            imports.add("fs");
            code += "fs.readFileSync(0).toString()";
          } else {
            fetchImports.add("fileFromSync");
            code += "fileFromSync(" + repr(f.contentFile) + ")";
          }
        } else {
          code += "File(['<data goes here>'], " + repr(f.contentFile) + ")";
          // TODO: (massive todo) we could read the file if we're running in the command line
          warnings.push([
            "--form",
            "you can't read a file for --form/-F in the browser",
          ]);
        }
        if (f.filename && f.filename !== f.name) {
          code += ", " + repr(f.filename);
        }
      } else {
        code += repr(f.content);
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
    request.multipartUploads
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

    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
    }
    code += "\n}";
  }
  code += ");";

  let importCode = "";
  if (isNode) {
    importCode += "import fetch";
    if (fetchImports.size) {
      importCode += ", { " + Array.from(fetchImports).sort().join(", ") + " }";
    }
    importCode += " from 'node-fetch';\n";
  }
  if (imports.size) {
    for (const imp of Array.from(imports).sort()) {
      importCode += "import " + imp + " from " + repr(imp) + ";\n";
    }
  }

  if (importCode) {
    code = importCode + "\n" + code;
  }
  return [code + "\n", warnings];
};

export const _toJavaScript = (
  request: Request,
  warnings?: Warnings
): [string, Warnings] => {
  warnings = warnings || [];
  return _toJavaScriptOrNode(request, warnings, false);
};

export const toJavaScriptWarn = (
  curlCommand: string | string[]
): [string, Warnings] => {
  const [request, warnings] = util.parseCurlCommand(curlCommand, supportedArgs);
  return _toJavaScript(request, warnings);
};

export const toJavaScript = (curlCommand: string | string[]): string => {
  return toJavaScriptWarn(curlCommand)[0];
};

export const _toNode = (
  request: Request,
  warnings?: Warnings
): [string, Warnings] => {
  warnings = warnings || [];
  return _toJavaScriptOrNode(request, warnings, true);
};

export const toNodeWarn = (
  curlCommand: string | string[]
): [string, Warnings] => {
  const [request, warnings] = util.parseCurlCommand(curlCommand, supportedArgs);
  return _toNode(request, warnings);
};
export const toNode = (curlCommand: string | string[]): string => {
  return toNodeWarn(curlCommand)[0];
};
