import { has, isInt } from "../util.js";
import { Word, eq, joinWords } from "../shell/Word.js";
import { parseCurlCommand, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";
import type { QueryList, QueryDict } from "../Query.js";
import { Headers } from "../Headers.js";
import type { DataParam, FormParam } from "../Request.js";

// "Clojure strings are Java Strings."
// https://clojure.org/reference/data_structures#Strings
import { reprStr } from "./java.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  // "form",
  // "form-string",
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

function reprData(data: DataParam[], importLines: Set<string>): string {}
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
  const params = {};
  let fn;
  if (method.isString() && methods.has(methodStr)) {
    fn = "client/" + methodStr.toLowerCase();
  } else {
    // TODO: do all the other params still work?
    fn = "client/request";
    params["method"] = repr(method, importLines);
  }

  if (request.urls[0].queryDict) {
    params["url"] = repr(request.urls[0].urlWithoutQueryList, importLines);
    params["query-params"] = reprQueryDict(
      request.urls[0].queryDict,
      importLines
    );
  } else if (request.urls[0].queryList) {
    params["url"] = repr(request.urls[0].urlWithoutQueryList, importLines);
    params["query-params"] = reprQueryList(
      request.urls[0].queryList,
      importLines
    );
  } else {
    params["url"] = repr(request.urls[0].url, importLines);
  }

  if (request.headers.length) {
    // TODO: clojure http supports duplicate headers, they don't need to be merged
    params["headers"] = reprHeaders(request.headers, importLines);
  }

  if (request.dataArray) {
    params["body"] = reprData(request.dataArray, importLines);
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
