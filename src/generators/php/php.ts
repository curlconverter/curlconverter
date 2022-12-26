import * as util from "../../util.js";
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

export const _toPhp = (
  requests: Request[],
  warnings: Warnings = []
): string => {
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
        request.urls.map((u) => JSON.stringify(u.originalUrl)).join(", "),
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
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  let phpCode = "<?php\n";
  phpCode += "$ch = curl_init();\n";
  phpCode +=
    "curl_setopt($ch, CURLOPT_URL, " + repr(request.urls[0].url) + ");\n";
  phpCode += "curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n";
  phpCode +=
    "curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '" +
    request.urls[0].method +
    "');\n";

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

  if (request.urls[0].auth && ["basic", "digest"].includes(request.authType)) {
    const authType =
      request.authType === "digest" ? "CURLAUTH_DIGEST" : "CURLAUTH_BASIC";
    phpCode += "curl_setopt($ch, CURLOPT_HTTPAUTH, " + authType + ");\n";
    phpCode +=
      "curl_setopt($ch, CURLOPT_USERPWD, " +
      repr(request.urls[0].auth.join(":")) +
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
      (parseInt(request.timeout, 10) || 0) +
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
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const php = _toPhp(requests, warnings);
  return [php, warnings];
};
export const toPhp = (curlCommand: string | string[]): string => {
  return toPhpWarn(curlCommand)[0];
};
