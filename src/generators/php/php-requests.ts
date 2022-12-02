import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import { repr } from "./php.js";

const supportedArgs = new Set([
  "url",
  "request",
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
  // "form",
  // "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
]);

export const _toPhpRequests = (
  request: Request,
  warnings: Warnings = []
): string => {
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

  let optionsString;
  if (request.auth) {
    const [user, password] = request.auth;
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
    if (
      !parsedQueryString ||
      !parsedQueryString.length ||
      parsedQueryString.some((p) => p[1] === null)
    ) {
      dataString = "$data = " + repr(request.data) + ";";
    } else {
      const terms = [];
      for (const q in parsedQueryString) {
        const [key, value] = q;
        terms.push("    " + repr(key) + " => " + repr(value));
      }
      dataString += terms.join(",\n") + "\n);";
    }
  }
  let requestLine =
    "$response = Requests::" +
    request.method.toLowerCase() +
    "(" +
    repr(request.url);
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
};
export const toPhpRequestsWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const php = _toPhpRequests(request, warnings);
  return [php, warnings];
};
export const toPhpRequests = (curlCommand: string | string[]): string => {
  return toPhpRequestsWarn(curlCommand)[0];
};
