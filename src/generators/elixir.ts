import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

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

function repr(value: string | null | (string | null)[]): string {
  // In context of url parameters, don't accept nulls and such.
  return '"' + jsesc(value, { quotes: "double", minimal: true }) + '"';
}

function getCookies(request: Request): string {
  if (!request.cookies || !request.cookies.length) {
    return "";
  }

  const cookies = [];
  for (const [cookieName, cookieValue] of request.cookies) {
    cookies.push(`${cookieName}=${cookieValue}`);
  }
  return `cookie: [${repr(cookies.join("; "))}]`;
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
  if (!request.query || !request.query.length) {
    return "[]";
  }
  let queryDict = "[\n";
  const queryDictLines = [];
  for (const [paramName, rawValue] of request.query) {
    queryDictLines.push(`    {${repr(paramName)}, ${repr(rawValue)}}`);
  }
  queryDict += queryDictLines.join(",\n");
  queryDict += "\n  ]";
  return queryDict;
}

function getHeadersDict(request: Request): string {
  if (!request.headers || !request.headers.length) {
    return "[]";
  }
  let dict = "[\n";
  const dictLines = [];
  for (const [headerName, headerValue] of request.headers) {
    dictLines.push(`    {${repr(headerName)}, ${repr(headerValue)}}`);
  }
  dict += dictLines.join(",\n");
  dict += "\n  ]";
  return dict;
}

function getBody(request: Request): string {
  const formData = getFormDataString(request);
  return formData ? formData : '""';
}

function getFormDataString(request: Request): string {
  if (request.data) {
    return getDataString(request);
  }

  if (!request.multipartUploads) {
    return "";
  }
  if (!request.multipartUploads.length) {
    return `{:multipart, []}`;
  }

  const formParams: string[] = [];
  for (const m of request.multipartUploads) {
    if ("contentFile" in m) {
      formParams.push(
        `    {:file, ${repr(m.contentFile)}, {"form-data", [{:name, ${repr(
          m.name
        )}}, {:filename, Path.basename(${repr(
          m.filename ?? m.contentFile
        )})}]}, []}`
      );
    } else {
      formParams.push(`    {${repr(m.name)}, ${repr(m.content)}}`);
    }
  }

  const formStr = formParams.join(",\n");
  if (formStr) {
    return `{:multipart, [
${formStr}
  ]}`;
  }

  return "";
}

function getDataString(request: Request): string {
  if (!request.data) {
    return "";
  }

  // TODO: JSON?

  if (!request.isDataRaw && request.data.startsWith("@")) {
    const filePath = request.data.slice(1);
    if (request.isDataBinary) {
      return `File.read!(${repr(filePath)})`;
    } else {
      return `{:file, ${repr(filePath)}}`;
    }
  }

  const [parsedQuery] = util.parseQueryString(request.data);
  if (
    !request.isDataBinary &&
    parsedQuery &&
    parsedQuery.length &&
    !parsedQuery.some((p) => p[1] === null)
  ) {
    const data = parsedQuery.map((p) => {
      const [key, value] = p;
      return `    {${repr(key)}, ${repr(value)}}`;
    });
    return `{:form, [\n${data.join(",\n")}\n  ]}`;
  }

  if (request.data.includes("|") && request.data.split("\n", 3).length > 3) {
    return "~s|" + request.data + "|";
  }
  return repr(request.data);
}

export const _toElixir = (
  request: Request,
  warnings: Warnings = []
): string => {
  if (request.cookies) {
    util.deleteHeader(request, "cookie");
  }

  // delete!(url, headers \\ [], options \\ [])
  // get!(url, headers \\ [], options \\ [])
  // head!(url, headers \\ [], options \\ [])
  // options!(url, headers \\ [], options \\ [])
  // patch!(url, body, headers \\ [], options \\ [])
  // post!(url, body, headers \\ [], options \\ [])
  // put!(url, body \\ "", headers \\ [], options \\ [])
  const methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"];
  const bodyMethods = ["PATCH", "POST", "PUT"];
  if (!methods.includes(request.method)) {
    warnings.push([
      "bad-method",
      'Unsupported method "' + request.method + '"',
    ]);
  }

  const isBodyMethod = bodyMethods.includes(request.method);
  const body = getBody(request);
  const headers = getHeadersDict(request);
  const options = getOptions(request);
  const params = getQueryDict(request);

  if (params === "[]" && (body === '""' || isBodyMethod)) {
    let s =
      "response = HTTPoison." +
      request.method.toLowerCase() +
      "! " +
      repr(request.urlWithoutQuery);
    if (
      (body === '""' || !isBodyMethod) &&
      headers === "[]" &&
      options === "[]"
    ) {
      return s + "\n";
    }
    if (isBodyMethod) {
      s += ",\n  " + body;
    }
    if (headers === "[]" && options === "[]") {
      return s + "\n";
    }
    s += ",\n  " + headers;
    if (options === "[]") {
      return s + "\n";
    }
    return s + ",\n  " + options + "\n";
  }

  return `request = %HTTPoison.Request{
  method: :${request.method.toLowerCase()},
  url: ${repr(request.urlWithoutQuery)},
  body: ${body},
  headers: ${headers},
  options: ${options},
  params: ${params}
}

response = HTTPoison.request(request)
`;
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
