import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

const supportedArgs = new Set([
  "url",
  "request",
  "compressed",
  "no-compressed",
  "digest",
  "no-digest",
  "user-agent",
  "cookie",
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "range",
  "referer",
  "time-cond",
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "insecure",
  "no-insecure",
  "user",
  "basic",
  "no-basic",
  "oauth2-bearer",
  "proxy-user",
  "proxy",
  "max-time",
  "location",
  "no-location",
  // "location-trusted",
  // "no-location-trusted",
]);

// https://www.php.net/manual/en/language.types.string.php
// https://www.php.net/manual/en/language.types.string.php#language.types.string.details
// https://www.unicode.org/reports/tr44/#GC_Values_Table
// https://unicode.org/Public/UNIDATA/UnicodeData.txt
// https://en.wikipedia.org/wiki/Plane_(Unicode)#Overview
const regexSingleEscape = /'|\\/gu;
const regexDoubleEscape = /"|\$|\\|\p{C}|\p{Z}/gu;
export const repr = (s: string): string => {
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
};

export const _toPhp = (request: Request, warnings: Warnings = []): string => {
  let cookieString;
  if (util.hasHeader(request, "cookie")) {
    cookieString = util.getHeader(request, "cookie");
    util.deleteHeader(request, "cookie");
  }

  let phpCode = "<?php\n";
  phpCode += "$ch = curl_init();\n";
  phpCode += "curl_setopt($ch, CURLOPT_URL, " + repr(request.url) + ");\n";
  phpCode += "curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n";
  phpCode +=
    "curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '" + request.method + "');\n";

  if (request.headers || request.compressed) {
    let headersArrayCode = "[\n";

    if (request.compressed) {
      if (request.headers) {
        if (!util.hasHeader(request, "accept-encoding")) {
          request.headers.push(["Accept-Encoding", "gzip"]);
        }
      } else {
        headersArrayCode += "    'Accept-Encoding' => 'gzip',\n";
      }
    }

    for (const [headerName, headerValue] of request.headers || []) {
      if (headerValue === null) {
        continue;
      }
      headersArrayCode +=
        "    " + repr(headerName) + " => " + repr(headerValue) + ",\n";
    }

    headersArrayCode += "]";
    phpCode +=
      "curl_setopt($ch, CURLOPT_HTTPHEADER, " + headersArrayCode + ");\n";
  }

  if (cookieString) {
    phpCode +=
      "curl_setopt($ch, CURLOPT_COOKIE, " + repr(cookieString) + ");\n";
  }

  if (request.auth) {
    const authType = request.digest ? "CURLAUTH_DIGEST" : "CURLAUTH_BASIC";
    phpCode += "curl_setopt($ch, CURLOPT_HTTPAUTH, " + authType + ");\n";
    phpCode +=
      "curl_setopt($ch, CURLOPT_USERPWD, " +
      repr(request.auth.join(":")) +
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
    } else if (
      request.isDataBinary &&
      (request.data as string).charAt(0) === "@"
    ) {
      requestDataCode =
        "file_get_contents(" +
        repr((request.data as string).substring(1)) +
        ")";
    } else {
      requestDataCode = repr(request.data as string);
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
      (parseInt(request.timeout) || 0) +
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
};

export const toPhpWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const php = _toPhp(request, warnings);
  return [php, warnings];
};
export const toPhp = (curlCommand: string | string[]): string => {
  return toPhpWarn(curlCommand)[0];
};
