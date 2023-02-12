import * as util from "../../util.js";
import { Word } from "../../util.js";
import type { Request, Warnings } from "../../util.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "max-time",
  "insecure",
  "no-insecure",
  "compressed",
  "no-compressed",
  "digest",
  "no-digest",
  "location",
  "no-location",
  // "location-trusted",
  // "no-location-trusted",
  "form",
  "form-string",
  "proxy",
  "proxy-user",
]);

// https://www.php.net/manual/en/language.types.string.php
// https://www.php.net/manual/en/language.types.string.php#language.types.string.details
// https://www.unicode.org/reports/tr44/#GC_Values_Table
// https://unicode.org/Public/UNIDATA/UnicodeData.txt
// https://en.wikipedia.org/wiki/Plane_(Unicode)#Overview
const regexSingleEscape = /'|\\/gu;
const regexDoubleEscape = /"|\$|\\|\p{C}|\p{Z}/gu;
export function reprStr(s: string): string {
  let [quote, regex] = ["'", regexSingleEscape];
  if ((s.includes("'") && !s.includes('"')) || /[^\x20-\x7E]/.test(s)) {
    [quote, regex] = ['"', regexDoubleEscape];
  }

  return (
    quote +
    s.replace(regex, (c: string) => {
      switch (c) {
        // https://www.php.net/manual/en/language.types.string.php#language.types.string.syntax.double
        case " ":
          return " ";
        case "$":
          return quote === "'" ? "$" : "\\$";
        case "\\":
          return "\\\\";
        case "'":
        case '"':
          return c === quote ? "\\" + c : c;
        // The rest of these should not appear in single quotes
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\t":
          return "\\t";
        case "\v":
          return "\\v";
        case "\x1B":
          return "\\e";
        case "\f":
          return "\\f";
      }

      const hex = (c.codePointAt(0) as number).toString(16);
      if (hex.length > 2) {
        return "\\u{" + hex + "}";
      }
      return "\\x" + hex.padStart(2, "0");
    }) +
    quote
  );
}

export function repr(w: Word): string {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      args.push("getenv(" + reprStr(t.value) + ") ?? " + reprStr(""));
    } else if (t.type === "command") {
      // TODO: use backticks instead
      args.push("shell_exec(" + reprStr(t.value) + ")");
    }
  }
  return args.join(" . ");
}

export function _toPhp(requests: Request[], warnings: Warnings = []): string {
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

  let cookieString;
  if (util.hasHeader(request, "cookie")) {
    cookieString = util.getHeader(request, "cookie");
    util.deleteHeader(request, "cookie");
  }
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c.toString())).join(", "),
    ]);
  }

  let phpCode = "<?php\n";
  phpCode += "$ch = curl_init();\n";
  phpCode +=
    "curl_setopt($ch, CURLOPT_URL, " + repr(request.urls[0].url) + ");\n";
  phpCode += "curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n";
  phpCode +=
    "curl_setopt($ch, CURLOPT_CUSTOMREQUEST, " +
    repr(request.urls[0].method) +
    ");\n";

  if ((request.headers && request.headers.length) || request.compressed) {
    let headersArrayCode = "[\n";

    const headers = request.headers || [];
    if (request.compressed) {
      util._setHeaderIfMissing(
        headers,
        "Accept-Encoding",
        new Word("gzip"),
        request.lowercaseHeaders
      );
    }
    for (const [headerName, headerValue] of headers || []) {
      if (headerValue === null) {
        continue;
      }
      headersArrayCode +=
        "    " + repr(util.joinWords([headerName, headerValue], ": ")) + ",\n";
    }

    headersArrayCode += "]";
    phpCode +=
      "curl_setopt($ch, CURLOPT_HTTPHEADER, " + headersArrayCode + ");\n";
  }

  if (cookieString) {
    phpCode +=
      "curl_setopt($ch, CURLOPT_COOKIE, " + repr(cookieString) + ");\n";
  }

  if (request.urls[0].auth && ["basic", "digest"].includes(request.authType)) {
    const authType =
      request.authType === "digest" ? "CURLAUTH_DIGEST" : "CURLAUTH_BASIC";
    phpCode += "curl_setopt($ch, CURLOPT_HTTPAUTH, " + authType + ");\n";
    phpCode +=
      "curl_setopt($ch, CURLOPT_USERPWD, " +
      repr(util.joinWords(request.urls[0].auth, ":")) +
      ");\n";
  }

  if (request.data || request.multipartUploads) {
    let requestDataCode = "";
    if (request.multipartUploads) {
      requestDataCode = "[\n";
      for (const m of request.multipartUploads) {
        if ("contentFile" in m) {
          requestDataCode +=
            "    " +
            repr(m.name) +
            " => new CURLFile(" +
            repr(m.contentFile) +
            "),\n";
        } else {
          requestDataCode +=
            "    " + repr(m.name) + " => " + repr(m.content) + ",\n";
        }
      }
      requestDataCode += "]";
    } else if (request.isDataBinary && request.data!.charAt(0) === "@") {
      // TODO: check, used to be substring(1)
      requestDataCode =
        "file_get_contents(" + repr(request.data!.slice(1)) + ")";
    } else {
      requestDataCode = repr(request.data!);
    }
    phpCode +=
      "curl_setopt($ch, CURLOPT_POSTFIELDS, " + requestDataCode + ");\n";
  }

  if (request.proxy) {
    phpCode +=
      "curl_setopt($ch, CURLOPT_PROXY, " + repr(request.proxy) + ");\n";
    if (request.proxyAuth) {
      phpCode +=
        "curl_setopt($ch, CURLOPT_PROXYUSERPWD, " +
        repr(request.proxyAuth) +
        ");\n";
    }
  }

  if (request.timeout) {
    phpCode +=
      "curl_setopt($ch, CURLOPT_TIMEOUT, " +
      (parseInt(request.timeout.toString(), 10) || 0) +
      ");\n";
  }

  if (request.followRedirects) {
    phpCode += "curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);\n";
  }

  if (request.insecure) {
    phpCode += "curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);\n";
    phpCode += "curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);\n";
  }

  phpCode += "\n$response = curl_exec($ch);\n\n";

  phpCode += "curl_close($ch);\n";
  return phpCode;
}

export function toPhpWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const php = _toPhp(requests, warnings);
  return [php, warnings];
}
export function toPhp(curlCommand: string | string[]): string {
  return toPhpWarn(curlCommand)[0];
}
