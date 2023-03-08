import { has, isInt } from "../util.js";
import { Word, eq, joinWords } from "../shell/Word.js";
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
  // "compressed",
  // "no-compressed",
  // "no-digest",
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
    return "(str " + args.join(" ") + ")";
  }
  return args[0];
}

// https://clojure.org/reference/reader#_symbols
// https://clojure.org/reference/reader#_literals
function safeAsKeyword(s: Word): boolean {
  return (
    s.isString() && /^[a-zA-Z_][a-zA-Z0-9*+!\-_'?<>=]*$/.test(s.toString())
  );
}

function reprQueryDict(query: QueryDict, importLines: Set<string>): string {
  return (
    "{" +
    query
      .map(
        (q) =>
          repr(q[0], importLines) +
          " " +
          (Array.isArray(q[1])
            ? "[" + q[1].map((qq) => repr(qq, importLines)) + "]"
            : repr(q[1], importLines))
      )
      .join(" ") +
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
  return (
    "{" +
    headers.headers
      .map((h) => repr(h[0], importLines) + " " + repr(h[1], importLines))
      .join(" ") +
    "}"
  );
}

function reprJson(data: object, indent = 0): string {}

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
    if (queryList) {
      // TODO: what exactly is sent?
      if (eq(exactContentType, "application/x-www-form-urlencoded")) {
        request.headers.delete("content-type");
      }

      const queryObj =
        queryDict && queryDict.every((q) => !Array.isArray(q[1]))
          ? reprAsStringToStringDict(queryDict as [Word, Word][], 1, imports)
          : reprAsStringTuples(queryList, 1, imports);
      // TODO: check roundtrip, add a comment
      return ["new URLSearchParams(" + queryObj + ")", null];
    } else {
      return [repr(data, importLines), null];
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
function reprMultipart(form: FormParam[], importLines: Set<string>): string {}

export function _toClojure(
  requests: Request[],
  warnings: Warnings = []
): string {
  const request = getFirst(requests, warnings);

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

  if (request.dataArray && request.data) {
    const [body, altBody] = reprData(request, request.dataArray, importLines);
    params["body"] = body;
    if (altBody) {
      // TODO: add as a comment
    }
  } else if (request.multipartUploads) {
    params["multipart"] = reprMultipart(request.multipartUploads, importLines);
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

  const firstLine = "(" + fn + " " + repr(url, importLines);

  let paramsStr = "";
  for (const [param, value] of Object.entries(params)) {
    paramsStr += ":" + param + " " + value + "\n";
  }
  if (paramsStr) {
    paramsStr = wrap(paramsStr, "{}");
    paramsStr =
      "\n" + " ".repeat(firstLine.length) + "{" + paramsStr.trim() + "}";
  }

  return (
    [...importLines].sort().join("\n") + "\n" + firstLine + paramsStr + ")"
  );
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
