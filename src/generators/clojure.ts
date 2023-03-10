import { CCError } from "../util.js";
import { Word, eq } from "../shell/Word.js";
import { parseCurlCommand, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";
import type { QueryList, QueryDict } from "../Query.js";
import { Headers } from "../Headers.js";
import type { DataParam } from "../Request.js";
import type { FormParam } from "../curl/form.js";
import { parseQueryString } from "../Query.js";

// "Clojure strings are Java Strings."
// https://clojure.org/reference/data_structures#Strings
import { reprStr } from "./java.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",
  // "http0.9",
  // "http1.0",
  // "http1.1",
  // "no-http0.9",
  "insecure",
  "no-insecure",
  "compressed",
  "no-compressed",

  "max-time",
  "connect-timeout",

  // "anyauth",
  // "no-anyauth",
  "digest",
  "no-digest",
  // "aws-sigv4",
  // "negotiate",
  // "no-negotiate",
  // "delegation", // GSS/kerberos
  // "service-name", // GSS/kerberos, not supported
  "ntlm",
  "no-ntlm",
  "ntlm-wb",
  "no-ntlm-wb",

  // "upload-file",
  // "output",
  // "proxy",
  // "proxy-user",
]);

export function repr(w: Word, importLines: Set<string>): string {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      // (str) to return empty string if var missing
      // TODO: is there a better way?
      args.push("(str (System/getenv " + reprStr(t.value) + "))");
      // Seems to be unnecessary
      // importLines.add("(import 'java.lang.System)");
    } else {
      importLines.add("(use '[clojure.java.shell :only [sh]])");
      args.push('(sh "bash" "-c" ' + reprStr(t.value) + ")");
    }
  }
  if (args.length > 1) {
    // TODO: format on multiple lines if it's long enough?
    return "(str " + args.join(" ") + ")";
  }
  return args[0];
}

// https://clojure.org/reference/reader#_symbols
// https://clojure.org/reference/reader#_literals
function safeAsKeyword(s: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9*+!\-_'?<>=]*$/.test(s);
}

function reprQueryDict(query: QueryDict, importLines: Set<string>): string {
  return (
    "{" +
    query
      .map(
        (q) =>
          repr(q[0], importLines) + // TODO: as keyword
          " " +
          (Array.isArray(q[1])
            ? "[" + q[1].map((qq) => repr(qq, importLines)) + "]"
            : repr(q[1], importLines))
      )
      .join("\n ") +
    "}"
  );
}

function reprQueryList(query: QueryList, importLines: Set<string>): string {
  // TODO: this is only necessary if there are repeated keys
  return (
    "[" +
    query
      .map(
        (q) =>
          "[" + repr(q[0], importLines) + " " + repr(q[1], importLines) + "]"
      )
      .join(" ") +
    "]"
  );
}

function reprHeaders(headers: Headers, importLines: Set<string>): string {
  const lines = headers.headers
    // Can't be null
    .map(
      // TODO: convert to keywords and lowercase known headers
      // TODO: :content-type is a top-level key and changes how the body is interpreted
      (h) => repr(h[0], importLines) + " " + repr(h[1] as Word, importLines)
    );
  const joiner = lines.length < 3 ? ", " : ",\n ";
  return "{" + lines.join(joiner) + "}";
}

function indent(s: string, indent: number): string {
  const withSpaces = "\n" + " ".repeat(indent);
  return s.replace(/\n/g, withSpaces);
}

function reprJson(
  obj: string | number | boolean | object | null,
  level = 0,
  importLines?: Set<string>
): string {
  if (importLines && obj instanceof Word) {
    return repr(obj, importLines);
  }
  switch (typeof obj) {
    case "string":
      return reprStr(obj);
    case "number":
      return obj.toString(); // TODO
    case "boolean":
      return obj ? "true" : "false";
    case "object":
      if (obj === null) {
        return "nil";
      }
      if (Array.isArray(obj)) {
        const objReprs = obj.map((o) => reprJson(o));
        const totalLength = objReprs.reduce((a, b) => a + b.length, 0);
        if (totalLength < 100) {
          return "[" + objReprs.join(" ") + "]";
        }
        return "[" + indent(objReprs.join("\n"), level + 1) + "]";
      } else {
        const objReprs = Object.entries(obj).map(([k, v]) => {
          if (!safeAsKeyword(k)) {
            throw new CCError(
              "can't use JSON key as Clojure keyword: " + JSON.stringify(k)
            );
          }
          // TODO: indent logic is wrong?
          return ":" + k + " " + reprJson(v, level + 1 + k.length + 1);
        });
        const totalLength = objReprs.reduce((a, b) => a + b.length, 0);
        if (totalLength < 100 && objReprs.every((o) => !o.includes("\n"))) {
          return "{" + objReprs.join(" ") + "}";
        }
        return "{" + indent(objReprs.join("\n"), level + 1) + "}";
      }
    default:
      throw new CCError("unexpect type in JSON: " + typeof obj);
  }
}

function reprDataString(
  request: Request,
  data: Word,
  importLines: Set<string>
): [string, null | string] {
  const contentType = request.headers.getContentType();
  const exactContentType = request.headers.get("content-type");
  if (contentType === "application/json") {
    const dataStr = data.toString();
    const parsed = JSON.parse(dataStr);
    // TODO: probably not true
    // Only arrays and {} can be encoded as JSON
    if (typeof parsed !== "object" || parsed === null) {
      return [repr(data, importLines), null];
    }
    const roundtrips = JSON.stringify(parsed) === dataStr;
    const jsonAsClojure = reprJson(parsed);
    if (
      roundtrips &&
      // TODO: check if it's set and to this?
      eq(exactContentType, "application/json") &&
      // TODO: check if it's set and to this?
      eq(request.headers.get("accept"), "application/json, text/plain, */*")
    ) {
      request.headers.delete("content-type");
      request.headers.delete("accept");
    }
    return [jsonAsClojure, roundtrips ? null : repr(data, importLines)];
  }

  if (contentType === "application/x-www-form-urlencoded") {
    const [queryList, queryDict] = parseQueryString(data);
    if (queryDict) {
      try {
        const formParams = reprQueryDict(queryDict, importLines);
        // TODO: what exactly is sent?
        if (eq(exactContentType, "application/x-www-form-urlencoded")) {
          request.headers.delete("content-type");
        }
        // TODO: check roundtrip, add a comment
        return [formParams, null];
      } catch {}
    }
    if (queryList) {
      try {
        const formParams = reprQueryList(queryList, importLines);
        // TODO: what exactly is sent?
        if (eq(exactContentType, "application/x-www-form-urlencoded")) {
          request.headers.delete("content-type");
        }
        // TODO: check roundtrip, add a comment
        return [formParams, null];
      } catch {}
    }
  }

  return [repr(data, importLines), null];
}

function reprData(
  request: Request,
  data: DataParam[],
  importLines: Set<string>
): [string, null | string] {
  if (data.length === 1 && data[0] instanceof Word && data[0].isString()) {
    try {
      return reprDataString(request, data[0], importLines);
    } catch {}
  }

  const parts = [];
  for (const d of data) {
    if (d instanceof Word) {
      parts.push(repr(d, importLines));
    } else {
      const [filetype, name, filename] = d;
      if (filetype === "urlencode" && name) {
        // TODO: add this to the previous Word
        parts.push(repr(name, importLines));
      }
      parts.push("(clojure.java.io/file " + repr(filename, importLines) + ")");
    }
  }
  if (parts.length === 1) {
    return [parts[0], null];
  }
  // TODO: this probably doesn't work with files
  // TODO: this needlessly nests str if there are variables/subcommands
  return ["(str " + parts.join(" ") + ")", null];
}
function reprMultipart(form: FormParam[], importLines: Set<string>): string {
  const parts = [];
  for (const f of form) {
    let part = "{:name " + repr(f.name, importLines);
    if ("content" in f) {
      part += " :content " + repr(f.content, importLines);
    } else {
      part +=
        " :content (clojure.java.io/file " +
        repr(f.contentFile, importLines) +
        ")";
      if (f.filename && !eq(f.filename, f.contentFile)) {
        // TODO: is this a real argument?
        part += " :filename " + repr(f.filename, importLines);
      }
    }
    parts.push(part + "}");
  }
  return "[" + parts.join("\n ") + "]";
}

export function _toClojure(
  requests: Request[],
  warnings: Warnings = []
): string {
  const request = getFirst(requests, warnings, { dataReadsFile: true });

  const importLines = new Set<string>([
    "(require '[clj-http.client :as client])",
  ]);

  const methods = new Set([
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS",
    "COPY",
    "MOVE",
    "PATCH",
  ]);

  const method = request.urls[0].method;
  const methodStr = method.toString();
  const params: { [key: string]: string } = {};
  let fn;
  if (method.isString() && methods.has(methodStr)) {
    fn = "client/" + methodStr.toLowerCase();
  } else {
    // TODO: do all the other params still work?
    fn = "client/request";
    params["method"] = repr(method, importLines);
  }

  let url = request.urls[0].url; // TODO: .urlWithOriginalQuery?
  if (request.urls[0].queryDict) {
    url = request.urls[0].urlWithoutQueryList;
    params["query-params"] = reprQueryDict(
      request.urls[0].queryDict,
      importLines
    );
  } else if (request.urls[0].queryList) {
    url = request.urls[0].urlWithoutQueryList;
    params["query-params"] = reprQueryList(
      request.urls[0].queryList,
      importLines
    );
  }

  if (request.headers.length) {
    // TODO: clojure http supports duplicate headers, they don't need to be merged
    params["headers"] = reprHeaders(request.headers, importLines);
  }

  if (request.urls[0].auth) {
    const [user, pass] = request.urls[0].auth;
    const authParam = {
      basic: "basic-auth",
      digest: "digest-auth",
      ntlm: "ntlm-auth",
      "ntlm-wb": "ntlm-auth",

      // TODO: error
      negotiate: "basic-auth",
      bearer: "basic-auth",
      "aws-sigv4": "basic-auth",
      none: "basic-auth",
    }[request.authType];

    params[authParam] =
      "[" + repr(user, importLines) + " " + repr(pass, importLines) + "]";
  }

  if (request.dataArray && request.data) {
    const [body, altBody] = reprData(request, request.dataArray, importLines);
    params["body"] = body;
    if (altBody) {
      // TODO: add as a comment
    }
  } else if (request.multipartUploads) {
    params["multipart"] = reprMultipart(request.multipartUploads, importLines);
  }

  if (request.compressed === false) {
    params[":decompress-body"] = "false";
  }

  if (request.insecure) {
    params["insecure?"] = "true";
  }

  if (request.followRedirects === false) {
    params["redirect-strategy"] = ":none";
  } else if (request.followRedirects) {
    if (request.followRedirectsTrusted) {
      // TODO: is this right? Docs link 404's
      params["redirect-strategy"] = ":lax";
    }
  }
  if (request.maxRedirects) {
    params["max-redirects"] = request.maxRedirects.toString();
  }

  if (request.timeout) {
    // TODO: *1000
    // TODO: warn that this is wrong
    params["socket-timeout"] = request.timeout.toString();
    params["connection-timeout"] = request.timeout.toString();
  }
  if (request.connectTimeout) {
    params["connection-timeout"] = request.connectTimeout.toString();
  }

  let code = "(" + fn + " " + repr(url, importLines);

  const paramLines = [];
  for (const [param, value] of Object.entries(params)) {
    const key = ":" + param + " ";
    paramLines.push(key + indent(value, key.length));
  }
  if (paramLines.length) {
    let paramStart = code.length + 1;
    if (code.length > 70) {
      paramStart = 1 + fn.length + 1;
      code += "\n" + " ".repeat(paramStart);
    } else {
      code += " ";
    }
    // +1 for the outer "{"
    code += indent("{" + paramLines.join("\n") + "}", paramStart + 1);
  }

  return [...importLines].sort().join("\n") + "\n\n" + code + ")";
}

export function toClojureWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parseCurlCommand(curlCommand, supportedArgs, warnings);
  const cSharp = _toClojure(requests, warnings);
  return [cSharp, warnings];
}
export function toClojure(curlCommand: string | string[]): string {
  return toClojureWarn(curlCommand)[0];
}
