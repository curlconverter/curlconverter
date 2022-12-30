// Author: Bob Rudis (bob@rud.is)

import * as util from "../util.js";
import type {
  Request,
  Cookie,
  QueryList,
  QueryDict,
  Warnings,
} from "../util.js";

import { repr as pyrepr } from "./python.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",
  "insecure",
  "no-insecure",
]);

function reprn(value: string | null): string {
  // back-tick quote names
  if (!value) {
    return "``";
  } else {
    return "`" + value + "`";
  }
}

// https://stat.ethz.ch/R-manual/R-devel/doc/manual/R-lang.html#Literal-constants
function repr(value: string): string {
  // TODO: do R programmers prefer double quotes?
  // const quote = value.includes('"') && !value.includes("'") ? "'" : '"';
  const quote = value.includes("'") && !value.includes('"') ? '"' : "'";
  return pyrepr(value, quote);
}

function getQueryDict(request: Request): string | undefined {
  if (request.urls[0].queryDict === undefined) {
    return undefined;
  }

  let queryDict = "params = list(\n";
  queryDict += Object.keys(request.urls[0].queryDict)
    .map((paramName) => {
      const rawValue = (request.urls[0].queryDict as QueryDict)[paramName];
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

export const _toR = (requests: Request[], warnings: Warnings = []): string => {
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

  let cookieDict;
  if (request.cookies) {
    cookieDict = "cookies = c(\n";
    cookieDict += request.cookies
      .map((c: Cookie) => "  " + repr(c[0]) + " = " + repr(c[1]))
      .join(",\n");
    cookieDict += "\n)\n";
    util.deleteHeader(request, "Cookie");
  }
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  let headerDict;
  if (request.headers && request.headers.length) {
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
            return "  " + reprn(key) + " = " + repr(value);
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
  const url = request.urls[0].queryDict
    ? request.urls[0].urlWithoutQueryList
    : request.urls[0].url;

  let requestLine = "res <- httr::";

  // TODO: GET() doesn't support sending data, detect and use VERB() instead
  if (
    ["GET", "HEAD", "PATCH", "PUT", "DELETE", "POST"].includes(
      request.urls[0].method.toUpperCase()
    )
  ) {
    requestLine += request.urls[0].method.toUpperCase() + "(";
  } else {
    requestLine += "VERB(" + repr(request.urls[0].method) + ", ";
  }
  requestLine += "url = " + repr(url);

  let requestLineBody = "";
  if (request.headers) {
    requestLineBody += ", httr::add_headers(.headers=headers)";
  }
  if (request.urls[0].queryDict) {
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
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const r = _toR(requests, warnings);
  return [r, warnings];
};
export const toR = (curlCommand: string | string[]): string => {
  return toRWarn(curlCommand)[0];
};
