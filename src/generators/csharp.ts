import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "compressed",
  "form",
  "form-string",
  "http0.9",
  "http1.0",
  "http1.1",
  "insecure",
  "no-compressed",
  "no-digest",
  "no-http0.9",
  "no-insecure",
  "proxy",
  "upload-file",
  // "output",
  // "proxy-user",
]);

// https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/strings/
const regexEscape = /"|\\|\p{C}|\p{Z}/gu;
export function repr(s: string): string {
  return (
    '"' +
    s.replace(regexEscape, (c: string): string => {
      switch (c) {
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
        case "\\":
          return "\\\\";
        case '"':
          return '\\"';
      }

      if (c.length === 2) {
        const first = c.charCodeAt(0);
        const second = c.charCodeAt(1);
        return (
          "\\u" +
          first.toString(16).padStart(4, "0") +
          "\\u" +
          second.toString(16).padStart(4, "0")
        );
      }

      const hex = c.charCodeAt(0).toString(16);
      if (hex.length <= 4) {
        return "\\u" + hex.padStart(4, "0");
      }
      // Shouldn't happen
      return "\\U" + hex.padStart(8, "0");
    }) +
    '"'
  );
}

export const _toCSharp = (
  request: Request,
  warnings: Warnings = []
): string => {
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  const imports = new Set();

  const methods = {
    DELETE: "Delete",
    GET: "Get",
    PATCH: "Patch",
    POST: "Post",
    PUT: "Put",
  };
  const moreMethods = {
    DELETE: "Delete",
    GET: "Get",
    HEAD: "Head",
    OPTIONS: "Options",
    PATCH: "Patch",
    POST: "Post",
    PUT: "Put",
    TRACE: "Trace",
  };
  let methodStr = "new HttpMethod(" + repr(request.method) + ")";
  if (util.has(moreMethods, request.method)) {
    methodStr = "HttpMethod." + moreMethods[request.method];
  }

  const simple =
    util.has(methods, request.method) &&
    !(
      request.headers ||
      (request.auth && request.authType === "basic") ||
      request.multipartUploads ||
      request.data ||
      request.uploadFile ||
      request.output
    );

  let s = "";

  if (request.insecure || request.proxy || request.compressed) {
    s += "HttpClientHandler handler = new HttpClientHandler();\n";
    if (request.insecure) {
      s +=
        "handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;\n";
    }
    if (request.proxy) {
      // TODO: probably need to parse the value a bit
      // TODO: , true) ?
      s += "handler.Proxy = new WebProxy(" + repr(request.proxy) + ");\n";
    }
    if (request.compressed) {
      s += "handler.AutomaticDecompression = DecompressionMethods.All;\n";
    }
    s += "\n";
    s += "HttpClient client = new HttpClient(handler);\n\n";
  } else {
    s += "HttpClient client = new HttpClient();\n\n";
  }

  if (simple) {
    if (request.method === "GET") {
      s +=
        "string responseBody = await client.GetStringAsync(" +
        repr(request.url) +
        ");\n";
    } else {
      s +=
        "HttpResponseMessage response = await client." +
        methods[request.method] +
        "Async(" +
        repr(request.url) +
        ");\n";
      s += "response.EnsureSuccessStatusCode();\n";
      s +=
        "string responseBody = await response.Content.ReadAsStringAsync();\n";
    }
    return s;
  }

  s +=
    "HttpRequestMessage request = new HttpRequestMessage(" +
    methodStr +
    ", " +
    repr(request.url) +
    ");\n";

  // https://docs.microsoft.com/en-us/dotnet/api/system.net.http.headers.httpcontentheaders
  const contentHeaders = {
    "content-length": "ContentLength",
    "content-location": "ContentLocation",
    "content-md5": "ContentMD5",
    "content-range": "ContentRange",
    "content-type": "ContentType",
    expires: "Expires",
    "last-modified": "LastModified",
  };
  const reqHeaders = (request.headers || []).filter(
    (h) => !Object.keys(contentHeaders).includes(h[0].toLowerCase())
  );
  const reqContentHeaders = (request.headers || []).filter((h) =>
    Object.keys(contentHeaders).includes(h[0].toLowerCase())
  );

  if (reqHeaders.length || (request.auth && request.authType === "basic")) {
    s += "\n";
    for (const [headerName, headerValue] of reqHeaders) {
      if (headerValue === null) {
        continue;
      }
      if (["accept-encoding"].includes(headerName.toLowerCase())) {
        s += "// ";
      }
      s +=
        "request.Headers.Add(" +
        repr(headerName) +
        ", " +
        repr(headerValue) +
        ");\n";
    }
    if (request.auth && request.authType === "basic") {
      // TODO: add request.rawAuth?
      const [user, password] = request.auth;
      s +=
        'request.Headers.Add("Authorization", "Basic " + Convert.ToBase64String(System.Text.ASCIIEncoding.ASCII.GetBytes(' +
        repr(user + ":" + password) +
        ")));\n";
    }
    s += "\n";
  }

  if (request.uploadFile) {
    s +=
      "request.Content = new ByteArrayContent(File.ReadAllBytes(" +
      repr(request.uploadFile) +
      "));\n";
  } else if (typeof request.data === "string") {
    // TODO: parse
    if (!request.isDataRaw && request.data.startsWith("@")) {
      // TODO: stdin
      s +=
        "request.Content = new StringContent(File.ReadAllText(" +
        repr(request.data.slice(1)) +
        ').Replace("\\n", string.Empty).Replace("\\r", string.Empty));\n';
    } else {
      s += "request.Content = new StringContent(" + repr(request.data) + ");\n";
    }
  } else if (request.multipartUploads) {
    s += "\n";
    // TODO: get boundary from header
    s += "MultipartFormDataContent content = new MultipartFormDataContent();\n";
    for (const m of request.multipartUploads) {
      // MultipartRequest syntax looks like this:
      //   content.Add(HttpContent(content), name, filename);
      // TODO: wrap name in extra "" to match curl?
      const name = repr(m.name); // TODO: what if name is empty string?
      const sentFilename = "filename" in m && m.filename;
      s += "content.Add(new ";
      if ("contentFile" in m) {
        if (m.contentFile === "-") {
          if (request.stdinFile) {
            s +=
              "ByteArrayContent(File.ReadAllBytes(" +
              repr(request.stdinFile) +
              ")), " +
              name;
            if (sentFilename) {
              s += ", Path.GetFileName(" + repr(sentFilename) + ")";
            }
            s += ");\n";
          } else if (request.stdin) {
            s += "StringContent(" + repr(request.stdin) + "), " + name;
            if (sentFilename) {
              s += ", Path.GetFileName(" + repr(sentFilename) + ")";
            }
            s += ");\n";
          } else {
            // TODO: read entire stdin
            s += "StringContent(Console.ReadLine()), " + name;
            if (sentFilename) {
              s += ", Path.GetFileName(" + repr(sentFilename) + ")";
            }
            s += ");\n";
          }
        } else {
          s +=
            "ByteArrayContent(File.ReadAllBytes(" +
            repr(m.contentFile) +
            ")), " +
            name;
          if (sentFilename) {
            s += ", Path.GetFileName(" + repr(sentFilename) + ")";
          }
          s += ");\n";
        }
      } else {
        s += "StringContent(" + repr(m.content) + "), " + name + ");\n";
      }
    }
    s += "request.Content = content;\n";
  } else if (util.hasHeader(request, "content-type")) {
    // This needs to be at the end.
    // If the request has no content, you can't set the content-type
    s += 'request.Content = new StringContent("");\n';
  }

  if (reqContentHeaders.length) {
    for (const [headerName, headerValue] of reqContentHeaders) {
      if (headerValue === null) {
        continue;
      }
      const headerNameLower = headerName.toLowerCase();
      if (headerNameLower === "content-type") {
        imports.add("System.Net.Http.Headers");
        if (headerValue.includes(";")) {
          s +=
            "request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse(" +
            repr(headerValue) +
            ");\n";
        } else {
          s +=
            "request.Content.Headers.ContentType = new MediaTypeHeaderValue(" +
            repr(headerValue) +
            ");\n";
        }
      } else if (headerNameLower === "content-length") {
        if (!util.isInt(headerValue)) {
          warnings.push([
            "content-length-not-int",
            "Content-Length header value is not a number: " + repr(headerValue),
          ]);
        }
        s +=
          "// request.Content.Headers.ContentLength = " +
          headerValue.split(/\r?\n/)[0] +
          ";\n";
      } else if (util.has(contentHeaders, headerNameLower)) {
        // placate type checker
        // TODO: none of these are actually strings.
        s +=
          "request.Content.Headers." +
          contentHeaders[headerNameLower] +
          " = " +
          repr(headerValue) +
          ";\n";
      }
    }
  }

  if (
    request.uploadFile ||
    request.data ||
    request.multipartUploads ||
    reqContentHeaders.length
  ) {
    s += "\n";
  }

  s += "HttpResponseMessage response = await client.SendAsync(request);\n";
  s += "response.EnsureSuccessStatusCode();\n";
  s += "string responseBody = await response.Content.ReadAsStringAsync();\n";

  if (imports.size) {
    s = "using " + [...imports].join(";\nusing ") + ";\n\n" + s;
  }
  return s;
};
export const toCSharpWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const cSharp = _toCSharp(request[0], warnings);
  return [cSharp, warnings];
};
export const toCSharp = (curlCommand: string | string[]): string => {
  return toCSharpWarn(curlCommand)[0];
};
