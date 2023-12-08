import { Word, eq, mergeWords } from "../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "max-time",
  "no-compressed",
  "insecure",
  "no-insecure",
  "upload-file",
  "connect-timeout",
  "timeout",
  "retry",
  "location",
  "max-redirs",

  "form",
  "form-string",
]);

// https://docs.julialang.org/en/v1/manual/strings/
// https://en.wikipedia.org/wiki/C_syntax#Backslash_escapes
const regexEscape = /\$|\\|"|\p{C}|[^ \P{Z}]/gu;
const regexHexDigit = /[0-9a-fA-F]/;
export function reprStr(s: string): string {
  return (
    '"' +
    s.replace(regexEscape, (c: string, index: number, string: string) => {
      switch (c) {
        case "$":
          return "\\$";
        case "\\":
          return "\\\\";
        case "\x07":
          return "\\a";
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
        case '"':
          return '\\"';
      }

      const hex = (c.codePointAt(0) as number).toString(16);
      if (hex.length <= 2) {
        return "\\x" + hex.padStart(2, "0");
      }
      if (hex.length <= 4) {
        return "\\u" + hex.padStart(4, "0");
      }
      if (regexHexDigit.test(string.charAt(index + 1))) {
        return "\\U" + hex.padStart(8, "0");
      }
      return "\\U" + hex;
    }) +
    '"'
  );
}

export function repr(w: Word): string {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      args.push("ENV[" + reprStr(t.value) + "]");
    } else {
      // TODO: escape
      args.push("read(`" + t.value.toString() + "`, String)");
    }
  }
  return args.join(" * ");
}

export function _toJulia(requests: Request[], warnings: Warnings = []): string {
  const request = getFirst(requests, warnings, { dataReadsFile: true });
  let code = "";

  const imports = new Set<string>(["HTTP"]);

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"];
  const method = request.urls[0].method;
  let fn = "HTTP.request";
  const args = [];
  if (method.isString() && methods.includes(method.toString())) {
    fn = "HTTP." + method.toString().toLowerCase();
  } else {
    args.push(repr(method));
  }

  let url = repr(request.urls[0].url);
  let hasQuery = false;
  if (request.urls[0].queryList) {
    // TODO: use Dict() when no repeated keys
    code += "query = [\n";
    for (const [k, v] of request.urls[0].queryList) {
      code += "    " + repr(k) + " => " + repr(v) + ",\n";
    }
    if (code.endsWith(",\n")) {
      code = code.slice(0, -2) + "\n";
    }
    code += "]\n\n";

    url = repr(request.urls[0].urlWithoutQueryList);
    hasQuery = true;
  }
  args.push(url);

  const hasHeaders = request.headers.length || request.urls[0].auth;
  if (hasHeaders) {
    code += "headers = Dict(\n";
    for (const [k, v] of request.headers) {
      if (v === null) {
        continue;
      }
      code += "    " + repr(k) + " => " + repr(v) + ",\n";
    }
    if (request.urls[0].auth) {
      code +=
        '    "Authorization" => "Basic " * base64encode(' +
        repr(
          mergeWords(request.urls[0].auth[0], ":", request.urls[0].auth[1])
        ) +
        "),\n";
      imports.add("Base64");
    }
    if (code.endsWith(",\n")) {
      code = code.slice(0, -2) + "\n";
    }
    code += ")\n\n";
    args.push("headers");
  }

  let bodyArg = null;
  if (request.urls[0].uploadFile) {
    if (eq(request.urls[0].uploadFile, "-")) {
      bodyArg = "stdin";
    } else {
      code += "body = open(" + repr(request.urls[0].uploadFile) + ', "r")\n\n';
      bodyArg = "body";
    }
  } else if (request.dataArray && request.dataArray.length) {
    // TODO: parseQueryString
    // TODO: JSON
    const formattedItems = [];
    for (const item of request.dataArray) {
      if (item instanceof Word) {
        formattedItems.push(repr(item));
      } else {
        let formattedItem = "";
        if (item.name) {
          formattedItem += repr(mergeWords(item.name, "=")) + " * ";
        }
        const filename = eq(item.filename, "-") ? "stdin" : repr(item.filename);
        formattedItem += "read(" + filename + ", String)";
        formattedItems.push(formattedItem);
      }
    }
    code += "body = " + formattedItems.join(" * \n    ") + "\n\n";
    bodyArg = "body";
  } else if (request.multipartUploads) {
    code += "form = HTTP.Form(\n";
    code += "    Dict(\n";
    for (const f of request.multipartUploads) {
      code += "        " + repr(f.name) + " => ";
      if ("content" in f) {
        code += repr(f.content) + ",\n";
      } else {
        if (!f.contentType && f.filename && eq(f.contentFile, f.filename)) {
          code += "open(" + repr(f.contentFile) + "),\n";
        } else if (!f.filename) {
          // There's no way to change Content-Type without sending a filename
          code += "read(" + repr(f.contentFile) + ", String),\n";
        } else {
          code += "HTTP.Multipart(";
          if (eq(f.contentFile, f.filename)) {
            code += repr(f.filename);
          } else {
            code += repr(f.contentFile);
          }
          code += ", open(" + repr(f.contentFile) + ")";
          if (f.contentType) {
            code += ", " + repr(f.contentType);
          }
          code += "),\n";
        }
      }
    }
    if (code.endsWith(",\n")) {
      code = code.slice(0, -2) + "\n";
    }
    code += "    )\n";
    code += ")\n\n";
    bodyArg = "form";
  }
  if (bodyArg) {
    if (!hasHeaders) {
      args.push("[]");
    }
    args.push(bodyArg);
  }

  if (hasQuery) {
    args.push("query=query");
  }

  if (request.timeout) {
    args.push("readtimeout=" + request.timeout.toString());
    warnings.push([
      "not-read-timeout",
      "curl has no read timeout, using Julia's `readtimeout` instead",
    ]);
  }
  if (request.compressed === false) {
    args.push("decompress=false");
  }
  if (request.retry) {
    args.push("retries=" + request.retry.toString());
  }
  if (request.followRedirects === false) {
    args.push("redirect=false");
  }
  if (request.maxRedirects) {
    args.push("redirect_limit=" + request.maxRedirects.toString());
  }
  if (request.insecure) {
    args.push("require_ssl_verification=false");
  }

  if (request.verbose) {
    args.push("verbose=1");
  }

  code += "resp = " + fn + "(";
  const oneLineArgs = args.join(", ");
  if (
    ((fn === "HTTP.request" && args.length > 2) ||
      (fn !== "HTTP.request" && args.length > 1)) &&
    oneLineArgs.length > 70
  ) {
    code += "\n    " + args.join(",\n    ");
    code += "\n)\n";
  } else {
    code += oneLineArgs + ")\n";
  }

  let importCode = "";
  if (imports.size) {
    importCode = "using " + Array.from(imports).sort().join(", ") + "\n\n";
  }

  return importCode + code;
}

export function toJuliaWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const code = _toJulia(requests, warnings);
  return [code, warnings];
}
export function toJulia(curlCommand: string | string[]): string {
  return toJuliaWarn(curlCommand)[0];
}
