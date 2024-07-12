import { Word, eq } from "../../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../../parse.js";
import type { Request, Warnings } from "../../parse.js";
import { wordDecodeURIComponent, parseQueryString } from "../../Query.js";
import type { QueryList } from "../../Query.js";

import { reprStr as pyrepr } from "../python/python.js";

export const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",
  "insecure",
  "no-insecure",
]);

const regexBacktickEscape = /`|\\|\p{C}|[^ \P{Z}]/gu;
function reprBacktick(s: Word | string): string {
  if (s instanceof Word) {
    if (!s.isString()) {
      // TODO: warn
    }

    s = s.toString();
  }

  // back-tick quote names
  return (
    "`" +
    s.replace(regexBacktickEscape, (c: string): string => {
      switch (c) {
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
        case "\\":
          return "\\\\";
        case "`":
          return "\\`";
      }
      const hex = (c.codePointAt(0) as number).toString(16);
      if (hex.length <= 2) {
        return "\\x" + hex.padStart(2, "0");
      }
      if (hex.length <= 4) {
        return "\\u" + hex.padStart(4, "0");
      }
      return "\\U" + hex.padStart(8, "0");
    }) +
    "`"
  );
}

// https://stat.ethz.ch/R-manual/R-devel/doc/manual/R-lang.html#Literal-constants
function reprStr(s: string): string {
  // R prefers double quotes
  const quote = s.includes('"') && !s.includes("'") ? "'" : '"';
  return pyrepr(s, quote);
}

export function repr(w: Word): string {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      args.push("Sys.getenv(" + reprStr(t.value) + ")");
    } else {
      args.push("system(" + reprStr(t.value) + ", intern = TRUE)");
    }
  }
  if (args.length === 1) {
    return args[0];
  }
  return "paste(" + args.join(", ") + ', sep = "")';
}

function getCookieDict(request: Request): string | null {
  if (!request.cookies) {
    return null;
  }
  let cookieDict = "cookies = c(\n";

  const lines: string[] = [];
  for (const [key, value] of request.cookies) {
    try {
      // httr2 percent-encodes cookie values
      const decoded = wordDecodeURIComponent(value.replace(/\+/g, " "));
      lines.push("  " + reprBacktick(key) + " = " + repr(decoded));
    } catch {
      return null;
    }
  }
  cookieDict += lines.join(",\n");
  cookieDict += "\n)\n";

  request.headers.delete("Cookie");
  return cookieDict;
}

function getQueryList(request: Request): string | undefined {
  if (request.urls[0].queryList === undefined) {
    return undefined;
  }

  let queryList = "params = list(\n";
  queryList += request.urls[0].queryList
    .map((param) => {
      const [key, value] = param;
      return "  " + reprBacktick(key) + " = " + repr(value);
    })
    .join(",\n");
  queryList += "\n)\n";
  return queryList;
}

function getMultipartParams(
  request: Request,
): Array<[string, string]> | undefined {
  if (!request.multipartUploads) {
    return undefined;
  }
  let parts = request.multipartUploads.map((m): [string, string] => {
    let content;
    if ("contentFile" in m) {
      content = `curl::form_file(${repr(m.contentFile)})`;
    } else {
      content = repr(m.content);
    }
    let fileParam = `  ${reprBacktick(m.name)} = ${content}`;
    return [m.name.toString(), content];
  });

  return parts;
}

function addCurlStep(
  steps: Array<string>,
  f: string,
  mainArgs: Array<string>,
  dots: Array<[string, string]> = [],
) {
  // TODO add `keep_if_empty`?
  let dotArgs = dots.map((dot) => {
    let [name, value] = dot;
    if (name == "") {
      return value;
    } else {
      return `${reprBacktick(name)} = ${value}`;
    }
  });

  let args = mainArgs.concat(...dotArgs);
  if (args.length === 0) {
    return steps;
  }

  let newStep: string;
  if (dots.length === 0) {
    let argsString = args.join(", ");
    newStep = `${f}(${argsString})`;
  } else {
    const indent = "    ";
    let argsString = args.join(`,\n${indent}`);
    newStep = `${f}(\n${indent}${argsString}\n  )`;
  }

  return steps.concat(newStep);
}

export function _toRHttr2(
  requests: Request[],
  warnings: Warnings = [],
): string {
  const request = getFirst(requests, warnings);

  const cookieDict = getCookieDict(request);

  let headerDict;
  let contentType = request.headers.getContentType();
  request.headers.delete("Content-Type");
  if (request.headers.length) {
    const hels: string[] = [];
    headerDict = "headers = c(\n";
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue !== null) {
        hels.push("  " + reprBacktick(headerName) + " = " + repr(headerValue));
      }
    }
    headerDict += hels.join(",\n");
    headerDict += "\n)\n";
  }

  const queryList = getQueryList(request);

  const url = request.urls[0].queryList
    ? request.urls[0].urlWithoutQueryList
    : request.urls[0].url;

  // httr TODO: GET() and HEAD() don't support sending data, detect and use VERB() instead
  // -> is this still relevant for httr2?
  let method = request.urls[0].method;
  if (!eq(method, method.toUpperCase())) {
    warnings.push([
      "non-uppercase-method",
      "httr will uppercase the method: " + JSON.stringify(method.toString()),
    ]);
  }

  let steps = [`request(${repr(url)})`];
  if (method.toString() != "GET") {
    steps = addCurlStep(steps, "req_method", [repr(method)]);
  }

  if (request.insecure) {
    steps = addCurlStep(steps, "req_options", [], [["ssl_verifypeer", "0"]]);
  }

  let rstatsCode = "";
  rstatsCode += "library(httr2)\n\n";
  if (queryList !== undefined) {
    rstatsCode += queryList + "\n";
    // TODO consider inlining params
    steps = addCurlStep(steps, "req_url_query", ["!!!params"]);
  }
  if (headerDict) {
    rstatsCode += headerDict + "\n";
    // TODO consider inlining headers
    steps = addCurlStep(steps, "req_headers", ["!!!headers"]);
  }
  if (cookieDict) {
    // TODO use `req_cookie_set()` once it is added
    // https://github.com/r-lib/httr2/issues/369
    rstatsCode += cookieDict + "\n";
    steps = addCurlStep(steps, "req_headers", ["!!!cookies"]);
    // TODO support cookies from file?
    // TODO consider inlining cookies
  }

  if (request.multipartUploads) {
    let params = getMultipartParams(request);
    steps = addCurlStep(steps, "req_body_multipart", [], params);
  } else if (request.data) {
    if (request.data.startsWith("@") && !request.isDataRaw) {
      const filePath = request.data.slice(1);
      steps = addCurlStep(steps, "req_body_file", [repr(filePath)]);
    } else {
      const [parsedQueryString] = parseQueryString(request.data);
      let dataIsList = parsedQueryString && parsedQueryString.length;
      if (dataIsList) {
        let params = (parsedQueryString as QueryList).map(
          (q): [string, string] => {
            const [key, value] = q;
            return [key.toString(), repr(value)];
          },
        );
        steps = addCurlStep(steps, "req_body_form", [], params);
      } else {
        contentType = contentType || "application/x-www-form-urlencoded";
        let params = [repr(request.data), reprStr(contentType)];
        steps = addCurlStep(steps, "req_body_raw", params);
      }
    }
  }

  if (request.urls[0].auth) {
    const [user, password] = request.urls[0].auth;
    steps = addCurlStep(steps, "req_auth_basic", [repr(user), repr(password)]);
  }

  rstatsCode += steps.join(" |> \n  ") + " |> \n  ";

  // TODO add test
  if (request.verbose) {
    rstatsCode += "req_perform(verbosity = 1)";
  } else {
    rstatsCode += "req_perform()";
  }

  return rstatsCode + "\n";
}
export function toRWarnHttr2(
  curlCommand: string | string[],
  warnings: Warnings = [],
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const rHttr = _toRHttr2(requests, warnings);
  return [rHttr, warnings];
}
export function toRHttr2(curlCommand: string | string[]): string {
  return toRWarnHttr2(curlCommand)[0];
}
