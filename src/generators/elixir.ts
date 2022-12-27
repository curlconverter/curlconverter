import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",
  "insecure",
  "no-insecure",
  "next",
]);

const regexEscape = /"|\\|\p{C}|\p{Z}|#\{/gu;

export function repr(s: string | null): string {
  if (s === null) {
    s = "";
  }

  return (
    '"' +
    s.replace(regexEscape, (c: string): string => {
      switch (c[0]) {
        case " ":
          return " ";
        case "\x00":
          return "\\0";
        case "\x07":
          return "\\a";
        case "\b":
          return "\\b";
        case "\f":
          return "\\f";
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
        case "\\":
          return "\\\\";
        case '"':
          return '\\"';
        case "#":
          return "\\" + c;
      }
      const hex = (c.codePointAt(0) as number).toString(16);
      if (hex.length <= 4) {
        return "\\u" + hex.padStart(4, "0");
      }
      return "\\u{" + hex + "}";
    }) +
    '"'
  );
}

function addIndent(value: string): string {
  // split on new lines and add 2 spaces of indentation to each line, except empty lines
  return value
    .split("\n")
    .map((line) => (line ? "  " + line : line))
    .join("\n");
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

function getOptions(request: Request, params: string): [string, string] {
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
  if (hackneyOptions.length > 1) {
    hackneyOptionsString = `hackney: [\n    ${hackneyOptions.join(
      ",\n    "
    )}\n  ]`;
  } else if (hackneyOptions.length) {
    hackneyOptionsString = `hackney: [${hackneyOptions[0]}]`;
  }

  const optionsWithoutParams = `[${hackneyOptionsString}]`;
  let options = optionsWithoutParams;
  if (params !== "[]") {
    options = "";
    options += "[\n";
    options += "    params: " + addIndent(params).trim();
    if (hackneyOptionsString) {
      options += ",\n";
      options += "    " + addIndent(hackneyOptionsString).trim();
    }
    options += "\n";
    options += "  ]";
  }
  return [options, optionsWithoutParams];
}

function getBasicAuth(request: Request): string {
  if (!request.urls[0].auth) {
    return "";
  }

  const [user, password] = request.urls[0].auth;
  return `basic_auth: {${repr(user)}, ${repr(password)}}`;
}

function getQueryDict(request: Request): string {
  if (!request.urls[0].queryList || !request.urls[0].queryList.length) {
    return "[]";
  }
  let queryDict = "[\n";
  const queryDictLines = [];
  for (const [paramName, rawValue] of request.urls[0].queryList) {
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

  // TODO: JSON with Poison

  if (!request.isDataRaw && request.data.startsWith("@")) {
    const filePath = request.data.slice(1);
    if (request.isDataBinary) {
      return `File.read!(${repr(filePath)})`;
    } else {
      return `{:file, ${repr(filePath)}}`;
    }
  }

  const [parsedQuery] = util.parseQueryString(request.data);
  if (parsedQuery && parsedQuery.length) {
    const data = parsedQuery.map((p) => {
      const [key, value] = p;
      return `    {${repr(key)}, ${repr(value)}}`;
    });
    return `{:form, [\n${data.join(",\n")}\n  ]}`;
  }

  if (
    !request.data.includes("|") &&
    request.data.split("\n", 4).length > 3 &&
    // No trailing whitespace, except possibly on the last line
    !request.data.match(/[^\S\r\n]\n/)
  ) {
    return "~s|" + request.data + "|";
  }
  return repr(request.data);
}

const requestToElixir = (request: Request, warnings: Warnings = []): string => {
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

  if (request.cookies) {
    util.deleteHeader(request, "cookie");
  }
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
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
  if (!methods.includes(request.urls[0].method)) {
    warnings.push([
      "bad-method",
      "Unsupported method " + JSON.stringify(request.urls[0].method),
    ]);
  }

  const isBodyMethod = bodyMethods.includes(request.urls[0].method);
  const body = getBody(request);
  const headers = getHeadersDict(request);
  const params = getQueryDict(request);
  // params can go in the options argument, but if we're using the full
  // form, put them as a separate argument.
  const [options, optionsWithoutParams] = getOptions(request, params);

  if (body === '""' || isBodyMethod) {
    // Add args backwards. As soon as we see a non-default value, we have to
    // add all preceding arguments.
    let args = [];
    let keepArgs = false;
    keepArgs ||= options !== "[]";
    if (keepArgs) {
      args.push(options);
    }
    keepArgs ||= headers !== "[]";
    if (keepArgs) {
      args.push(headers);
    }
    keepArgs ||= body !== '""';
    if (keepArgs && isBodyMethod) {
      args.push(body);
    }
    args.push(repr(request.urls[0].urlWithoutQueryList));
    args = args.reverse();

    let s =
      "response = HTTPoison." + request.urls[0].method.toLowerCase() + "!(";
    if (args.length === 1) {
      // If we just need the method+URL, keep it all on one line
      s += args[0];
    } else {
      s += "\n";
      s += "  " + args.join(",\n  ");
      s += "\n";
    }
    return s + ")\n";
  }

  return `request = %HTTPoison.Request{
  method: :${request.urls[0].method.toLowerCase()},
  url: ${repr(request.urls[0].urlWithoutQueryList)},
  body: ${body},
  headers: ${headers},
  options: ${optionsWithoutParams},
  params: ${params}
}

response = HTTPoison.request(request)
`;
};

export const _toElixir = (
  requests: Request[],
  warnings: Warnings = []
): string => {
  return requests.map((r) => requestToElixir(r, warnings)).join("\n");
};

export const toElixirWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const elixir = _toElixir(requests, warnings);
  return [elixir, warnings];
};

export const toElixir = (curlCommand: string | string[]): string => {
  return toElixirWarn(curlCommand)[0];
};
