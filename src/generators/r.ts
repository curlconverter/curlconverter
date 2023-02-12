import * as util from "../util.js";
import { Word } from "../util.js";
import type { Request, QueryList, Warnings } from "../util.js";

import { reprStr as pyrepr } from "./python.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",
  "insecure",
  "no-insecure",
]);

const regexBacktickEscape = /`|\\|\p{C}|\p{Z}/gu;
function reprBacktick(s: Word): string {
  if (!s.isString()) {
    // TODO: warn
  }
  // back-tick quote names
  return (
    "`" +
    s.toString().replace(regexBacktickEscape, (c: string): string => {
      switch (c) {
        case " ":
          return " ";
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
      // httr percent-encodes cookie values
      const decoded = util.wordDecodeURIComponent(value.replace(/\+/g, " "));
      lines.push("  " + reprBacktick(key) + " = " + repr(decoded));
    } catch {
      return null;
    }
  }
  cookieDict += lines.join(",\n");
  cookieDict += "\n)\n";

  util.deleteHeader(request, "Cookie");
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

function getFilesString(request: Request): string | undefined {
  if (!request.multipartUploads) {
    return undefined;
  }
  // http://docs.rstats-requests.org/en/master/user/quickstart/#post-a-multipart-encoded-file
  let filesString = "files = list(\n";
  filesString += request.multipartUploads
    .map((m) => {
      let fileParam;
      if ("contentFile" in m) {
        // filesString += "    " + reprBacktick(multipartKey) + " (" + repr(fileName) + ", upload_file(" + repr(fileName) + "))";
        fileParam =
          "  " +
          reprBacktick(m.name) +
          " = upload_file(" +
          repr(m.contentFile) +
          ")";
      } else {
        fileParam = "  " + reprBacktick(m.name) + " = " + repr(m.content) + "";
      }
      return fileParam;
    })
    .join(",\n");
  filesString += "\n)\n";

  return filesString;
}

export function _toR(requests: Request[], warnings: Warnings = []): string {
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

  const cookieDict = getCookieDict(request);
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c.toString())).join(", "),
    ]);
  }

  let headerDict;
  if (request.headers && request.headers.length) {
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

  let dataString;
  let dataIsList;
  let filesString;
  if (request.data) {
    if (request.data.startsWith("@") && !request.isDataRaw) {
      const filePath = request.data.slice(1);
      dataString = "data = upload_file(" + repr(filePath) + ")";
    } else {
      const [parsedQueryString] = util.parseQueryString(request.data);
      // repeat to satisfy type checker
      dataIsList = parsedQueryString && parsedQueryString.length;
      if (dataIsList) {
        dataString = "data = list(\n";
        dataString += (parsedQueryString as QueryList)
          .map((q) => {
            const [key, value] = q;
            return "  " + reprBacktick(key) + " = " + repr(value);
          })
          .join(",\n");
        dataString += "\n)\n";
      } else {
        dataString = "data = " + repr(request.data) + "\n";
      }
    }
  } else if (request.multipartUploads) {
    filesString = getFilesString(request);
  }
  const url = request.urls[0].queryList
    ? request.urls[0].urlWithoutQueryList
    : request.urls[0].url;

  let requestLine = "res <- httr::";

  // TODO: GET() and HEAD() don't support sending data, detect and use VERB() instead
  if (
    ["GET", "HEAD", "PATCH", "PUT", "DELETE", "POST"].includes(
      request.urls[0].method.toString()
    )
  ) {
    requestLine += request.urls[0].method.toString() + "(";
  } else {
    requestLine += "VERB(" + repr(request.urls[0].method) + ", ";
    if (
      !util.eq(request.urls[0].method, request.urls[0].method.toUpperCase())
    ) {
      warnings.push([
        "non-uppercase-method",
        "httr will uppercase the method: " +
          JSON.stringify(request.urls[0].method.toString()),
      ]);
    }
  }
  requestLine += "url = " + repr(url);

  let requestLineBody = "";
  if (request.headers) {
    requestLineBody += ", httr::add_headers(.headers=headers)";
  }
  if (request.urls[0].queryList) {
    requestLineBody += ", query = params";
  }
  if (cookieDict) {
    requestLineBody += ", httr::set_cookies(.cookies = cookies)";
  }
  if (request.data) {
    requestLineBody += ", body = data";
    if (dataIsList) {
      requestLineBody += ', encode = "form"';
    }
  } else if (request.multipartUploads) {
    requestLineBody += ', body = files, encode = "multipart"';
  }
  if (request.insecure) {
    requestLineBody += ", config = httr::config(ssl_verifypeer = FALSE)";
  }
  if (request.urls[0].auth) {
    const [user, password] = request.urls[0].auth;
    requestLineBody +=
      ", httr::authenticate(" + repr(user) + ", " + repr(password) + ")";
  }
  requestLineBody += ")";

  requestLine += requestLineBody;

  let rstatsCode = "";
  rstatsCode += "require(httr)\n\n";
  if (cookieDict) {
    rstatsCode += cookieDict + "\n";
  }
  if (headerDict) {
    rstatsCode += headerDict + "\n";
  }
  if (queryList !== undefined) {
    rstatsCode += queryList + "\n";
  }
  if (dataString) {
    rstatsCode += dataString + "\n";
  } else if (filesString) {
    rstatsCode += filesString + "\n";
  }
  rstatsCode += requestLine;

  return rstatsCode + "\n";
}
export function toRWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const r = _toR(requests, warnings);
  return [r, warnings];
}
export function toR(curlCommand: string | string[]): string {
  return toRWarn(curlCommand)[0];
}
