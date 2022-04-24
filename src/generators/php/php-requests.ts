import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import querystring from "query-string";
import jsesc from "jsesc";

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
  "referer",
  // "form",
  // "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
]);

// TODO: only string
const quote = (str: string | null | (string | null)[]): string =>
  jsesc(str, { quotes: "single" });

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
      headerString +=
        "    '" + headerName + "' => '" + quote(headerValue) + "'";
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
      "$options = array('auth' => array('" + user + "', '" + password + "'));";
  }

  let dataString;
  if (request.data) {
    const parsedQueryString = querystring.parse(request.data, { sort: false });
    dataString = "$data = array(\n";
    const dataCount = Object.keys(parsedQueryString).length;
    if (
      dataCount === 1 &&
      !parsedQueryString[Object.keys(parsedQueryString)[0]]
    ) {
      dataString = "$data = '" + quote(request.data) + "';";
    } else {
      let dataIndex = 0;
      for (const key in parsedQueryString) {
        const value = parsedQueryString[key];
        dataString += "    '" + key + "' => '" + quote(value) + "'";
        if (dataIndex < dataCount - 1) {
          dataString += ",\n";
        }
        dataIndex++;
      }
      dataString += "\n);";
    }
  }
  let requestLine =
    "$response = Requests::" +
    request.method.toLowerCase() +
    "('" +
    request.url +
    "'";
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
