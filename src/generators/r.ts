// Author: Bob Rudis (bob@rud.is)

import * as util from "../util.js";
import type { Request, Cookie, QueryDict, Warnings } from "../util.js";

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
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "insecure",
  "no-insecure",
  "user",
]);

function reprn(value: string | null): string {
  // back-tick quote names
  if (!value) {
    return "``";
  } else {
    return "`" + value + "`";
  }
}

function repr(value: string): string {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''";
  } else {
    return "'" + jsesc(value, { quotes: "single" }) + "'";
  }
}

function getQueryDict(request: Request): string | undefined {
  if (request.queryDict === undefined) {
    return undefined;
  }

  let queryDict = "params = list(\n";
  queryDict += Object.keys(request.queryDict)
    .map((paramName) => {
      const rawValue = (request.queryDict as QueryDict)[paramName];
      let paramValue;
      if (Array.isArray(rawValue)) {
        paramValue = "c(" + (rawValue as string[]).map(repr).join(", ") + ")";
      } else {
        paramValue = repr(rawValue as string);
      }
      return "  " + reprn(paramName) + " = " + paramValue;
    })
    .join(",\n");
  queryDict += "\n)\n";
  return queryDict;
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
        // filesString += '    ' + reprn(multipartKey) + ' (' + repr(fileName) + ', upload_file(' + repr(fileName) + '))'
        fileParam =
          "  " + reprn(m.name) + " = upload_file(" + repr(m.contentFile) + ")";
      } else {
        fileParam = "  " + reprn(m.name) + " = " + repr(m.content) + "";
      }
      return fileParam;
    })
    .join(",\n");
  filesString += "\n)\n";

  return filesString;
}

export const _toR = (request: Request, warnings: Warnings = []): string => {
  let cookieDict;
  if (request.cookies) {
    cookieDict = "cookies = c(\n";
    cookieDict += request.cookies
      .map((c: Cookie) => "  " + repr(c[0]) + " = " + repr(c[1]))
      .join(",\n");
    // TODO: isn't this an extra \n?
    cookieDict += "\n)\n";
    util.deleteHeader(request, "Cookie");
  }
  let headerDict;
  if (request.headers) {
    const hels = [];
    headerDict = "headers = c(\n";
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue !== null) {
        hels.push("  " + reprn(headerName) + " = " + repr(headerValue));
      }
    }
    headerDict += hels.join(",\n");
    headerDict += "\n)\n";
  }

  const queryDict = getQueryDict(request);

  let dataString;
  let dataIsList;
  let filesString;
  if (request.data) {
    if (request.data.startsWith("@") && !request.isDataRaw) {
      const filePath = request.data.slice(1);
      dataString = "data = upload_file('" + filePath + "')";
    } else {
      const [parsedQueryString] = util.parseQueryString(request.data);
      // repeat to satisfy type checker
      dataIsList =
        parsedQueryString &&
        parsedQueryString.length &&
        (parsedQueryString.length > 1 || parsedQueryString[0][1] !== null);
      if (dataIsList) {
        dataString = "data = list(\n";
        dataString += (parsedQueryString as util.Query)
          .map((q) => {
            const [key, value] = q;
            // Converting null to "" causes the generated code to send a different request,
            // with a = where there was none. This is hopefully more useful though than just
            // outputing the data as a string in the generated code.
            // TODO: add the orginal data commented out as a string explaining the above
            // situation.
            return (
              "  " + reprn(key) + " = " + repr(value === null ? "" : value)
            );
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
  const url = request.queryDict ? request.urlWithoutQuery : request.url;

  let requestLine = "res <- httr::";

  // TODO: GET() doesn't support sending data, detect and use VERB() instead
  if (
    ["GET", "HEAD", "PATCH", "PUT", "DELETE", "POST"].includes(
      request.method.toUpperCase()
    )
  ) {
    requestLine += request.method.toUpperCase() + "(";
  } else {
    requestLine += "VERB(" + repr(request.method) + ", ";
  }
  requestLine += "url = '" + url + "'";

  let requestLineBody = "";
  if (request.headers) {
    requestLineBody += ", httr::add_headers(.headers=headers)";
  }
  if (request.queryDict) {
    requestLineBody += ", query = params";
  }
  if (request.cookies) {
    requestLineBody += ", httr::set_cookies(.cookies = cookies)";
  }
  if (request.data) {
    requestLineBody += ", body = data";
    if (dataIsList) {
      requestLineBody += ", encode = 'form'";
    }
  } else if (request.multipartUploads) {
    requestLineBody += ", body = files, encode = 'multipart'";
  }
  if (request.insecure) {
    requestLineBody += ", config = httr::config(ssl_verifypeer = FALSE)";
  }
  if (request.auth) {
    const [user, password] = request.auth;
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
  if (queryDict !== undefined) {
    rstatsCode += queryDict + "\n";
  }
  if (dataString) {
    rstatsCode += dataString + "\n";
  } else if (filesString) {
    rstatsCode += filesString + "\n";
  }
  rstatsCode += requestLine;

  return rstatsCode + "\n";
};
export const toRWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const r = _toR(request, warnings);
  return [r, warnings];
};
export const toR = (curlCommand: string | string[]): string => {
  return toRWarn(curlCommand)[0];
};
