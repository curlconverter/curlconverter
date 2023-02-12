import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import { repr } from "./php.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  // "form",
  // "form-string",
]);

export function _toPhpRequests(
  requests: Request[],
  warnings: Warnings = []
): string {
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

  let headerString: string;
  if (request.headers) {
    headerString = "$headers = array(\n";
    let i = 0;
    const headerCount = request.headers ? request.headers.length : 0;
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue; // TODO: this could miss not adding a trailing comma
      }
      headerString += "    " + repr(headerName) + " => " + repr(headerValue);
      if (i < headerCount - 1) {
        headerString += ",\n";
      }
      i++;
    }
    headerString += "\n);";
  } else {
    headerString = "$headers = array();";
  }
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c.toString())).join(", "),
    ]);
  }

  let optionsString;
  if (request.urls[0].auth) {
    const [user, password] = request.urls[0].auth;
    optionsString =
      "$options = array('auth' => array(" +
      repr(user) +
      ", " +
      repr(password) +
      "));";
  }

  let dataString;
  if (request.data) {
    const [parsedQueryString] = util.parseQueryString(request.data);
    dataString = "$data = array(\n";
    if (!parsedQueryString || !parsedQueryString.length) {
      dataString = "$data = " + repr(request.data) + ";";
    } else {
      const terms: string[] = [];
      for (const q of parsedQueryString) {
        const [key, value] = q;
        terms.push("    " + repr(key) + " => " + repr(value));
      }
      dataString += terms.join(",\n") + "\n);";
    }
  }
  let requestLine =
    "$response = Requests::" +
    request.urls[0].method.toLowerCase().toString() +
    "(" +
    repr(request.urls[0].url);
  requestLine += ", $headers";
  if (dataString) {
    requestLine += ", $data";
  }
  if (optionsString) {
    requestLine += ", $options";
  }
  requestLine += ");";

  let phpCode = "<?php\n";
  phpCode += "include('vendor/rmccue/requests/library/Requests.php');\n";
  phpCode += "Requests::register_autoloader();\n";
  phpCode += headerString + "\n";
  if (dataString) {
    phpCode += dataString + "\n";
  }
  if (optionsString) {
    phpCode += optionsString + "\n";
  }

  phpCode += requestLine;

  return phpCode + "\n";
}
export function toPhpRequestsWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const php = _toPhpRequests(requests, warnings);
  return [php, warnings];
}
export function toPhpRequests(curlCommand: string | string[]): string {
  return toPhpRequestsWarn(curlCommand)[0];
}
