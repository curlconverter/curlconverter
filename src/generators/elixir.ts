import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import jsesc from "jsesc";
import querystring from "query-string";

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

// TODO: I bet elixir's array syntax is different and if the query string
// values are arrays that actually generates broken code.
function repr(value: string | null | (string | null)[]): string {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return '""';
  } else {
    return `~s|${jsesc(value, { quotes: "backtick" })}|`;
  }
}

function getCookies(request: Request): string {
  if (!request.cookies) {
    return "";
  }

  const cookies = [];
  for (const [cookieName, cookieValue] of request.cookies) {
    cookies.push(`${cookieName}=${cookieValue}`);
  }
  return `cookies: [~s|${cookies.join("; ")}|]`;
}

function getOptions(request: Request): string {
  const hackneyOptions = [];

  const auth = getBasicAuth(request);
  if (auth) {
    hackneyOptions.push(auth);
  }

  if (request.insecure) {
    hackneyOptions.push(":insecure");
  }

  const cookies = getCookies(request);
  if (cookies) {
    hackneyOptions.push(cookies);
  }

  let hackneyOptionsString = "";
  if (hackneyOptions.length) {
    hackneyOptionsString = `hackney: [${hackneyOptions.join(", ")}]`;
  }

  return `[${hackneyOptionsString}]`;
}

function getBasicAuth(request: Request): string {
  if (!request.auth) {
    return "";
  }

  const [user, password] = request.auth;
  return `basic_auth: {${repr(user)}, ${repr(password)}}`;
}

function getQueryDict(request: Request): string {
  if (!request.query) {
    return "[]";
  }
  let queryDict = "[\n";
  for (const [paramName, rawValue] of request.query) {
    queryDict += `    {${repr(paramName)}, ${repr(rawValue)}},\n`;
  }
  queryDict += "  ]";
  return queryDict;
}

function getHeadersDict(request: Request): string {
  if (!request.headers) {
    return "[]";
  }
  let dict = "[\n";
  for (const [headerName, headerValue] of request.headers) {
    dict += `    {${repr(headerName)}, ${repr(headerValue)}},\n`;
  }
  dict += "  ]";
  return dict;
}

function getBody(request: Request): string {
  const formData = getFormDataString(request);

  if (formData) {
    return formData;
  }

  return '""';
}

function getFormDataString(request: Request): string {
  if (request.data) {
    return getDataString(request);
  }

  if (!request.multipartUploads) {
    return "";
  }

  let fileArgs: string[] | string = [];
  let dataArgs: string[] | string = [];
  for (const m of request.multipartUploads) {
    if ("contentFile" in m) {
      // TODO: quote
      fileArgs.push(`    {:file, ~s|${m.contentFile}|}`);
    } else {
      dataArgs.push(`    {${repr(m.name)}, ${repr(m.content)}}`);
    }
  }

  let content: string[] | string = [];
  fileArgs = fileArgs.join(",\n");
  if (fileArgs) {
    content.push(fileArgs);
  }

  dataArgs = dataArgs.join(",\n");
  if (dataArgs) {
    content.push(dataArgs);
  }

  content = content.join(",\n");
  if (content) {
    return `{:multipart, [
${content}
]}`;
  }

  return "";
}

function getDataString(request: Request): string {
  if (!request.data) {
    return "";
  }

  if (!request.isDataRaw && request.data.startsWith("@")) {
    const filePath = request.data.slice(1);
    if (request.isDataBinary) {
      return `File.read!("${filePath}")`;
    } else {
      return `{:file, ~s|${filePath}|}`;
    }
  }

  const parsedQueryString = querystring.parse(request.data, { sort: false });
  const keyCount = Object.keys(parsedQueryString).length;
  const singleKeyOnly =
    keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]];
  const singularData = request.isDataBinary || singleKeyOnly;
  if (singularData) {
    return `~s|${request.data}|`;
  } else {
    return getMultipleDataString(request, parsedQueryString);
  }
}

function getMultipleDataString(
  request: Request,
  parsedQueryString: querystring.ParsedQuery<string>
): string {
  let repeatedKey = false;
  for (const key in parsedQueryString) {
    const value = parsedQueryString[key];
    if (Array.isArray(value)) {
      repeatedKey = true;
    }
  }

  let dataString;
  if (repeatedKey) {
    const data = [];
    for (const key in parsedQueryString) {
      const value = parsedQueryString[key];
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          data.push(`    {${repr(key)}, ${repr(value[i])}}`);
        }
      } else {
        data.push(`    {${repr(key)}, ${repr(value)}}`);
      }
    }
    dataString = `[
${data.join(",\n")}
  ]`;
  } else {
    const data = [];
    for (const key in parsedQueryString) {
      const value = parsedQueryString[key];
      data.push(`    {${repr(key)}, ${repr(value)}}`);
    }
    dataString = `[
${data.join(",\n")}
  ]`;
  }

  return dataString;
}

export const _toElixir = (
  request: Request,
  warnings: Warnings = []
): string => {
  if (request.cookies) {
    util.deleteHeader(request, "cookie");
  }

  const template = `request = %HTTPoison.Request{
  method: :${request.method.toLowerCase()},
  url: "${request.urlWithoutQuery}",
  options: ${getOptions(request)},
  headers: ${getHeadersDict(request)},
  params: ${getQueryDict(request)},
  body: ${getBody(request)}
}

response = HTTPoison.request(request)
`;

  return template;
};
export const toElixirWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const elixir = _toElixir(request, warnings);
  return [elixir, warnings];
};

export const toElixir = (curlCommand: string | string[]): string => {
  return toElixirWarn(curlCommand)[0];
};
