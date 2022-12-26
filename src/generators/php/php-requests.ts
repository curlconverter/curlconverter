import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import { repr } from "./php.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  // "form",
  // "form-string",
]);

export const _toPhpRequests = (
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
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
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
    request.urls[0].method.toLowerCase() +
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
};
export const toPhpRequestsWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const php = _toPhpRequests(requests, warnings);
  return [php, warnings];
};
export const toPhpRequests = (curlCommand: string | string[]): string => {
  return toPhpRequestsWarn(curlCommand)[0];
};
