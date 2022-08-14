// This code is adapted from curl-to-ruby, which is a fork of curl-to-go,
// which is licensed under the MIT license.
// https://github.com/jhawthorn/curl-to-ruby/blob/24abdb538dd269161ee9ad6c2658e7e37d37332e/src/curlToRuby.js
/*
The MIT License (MIT)

Copyright (c) 2016 Matthew Holt

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as util from "../util.js";
import type { Warnings } from "../util.js";

import jsesc from "jsesc";
import type { Request, Query, QueryDict } from "../util.js";

// https://ruby-doc.org/stdlib-2.7.0/libdoc/net/http/rdoc/Net/HTTP.html
// https://github.com/ruby/net-http/tree/master/lib/net

const supportedArgs = new Set([
  "url",
  "request",
  "no-digest",
  "http1.0",
  "http1.1",
  "http0.9",
  "no-http0.9",
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
  "output",
  "user",
  "upload-file",
]);

function repr(value: string): string {
  return "'" + jsesc(value, { quotes: "single", minimal: true }) + "'";
}

function objToRuby(
  obj: string | number | boolean | object | null,
  indent = 0
): string {
  let s = "";
  switch (typeof obj) {
    case "string":
      s += repr(obj);
      break;
    case "number":
      s += obj;
      break;
    case "boolean":
      s += obj ? "true" : "false";
      break;
    case "object":
      if (obj === null) {
        s += "nil";
      } else if (Array.isArray(obj)) {
        if (obj.length === 0) {
          s += "[]";
        } else {
          s += "[\n";
          for (const item of obj) {
            s += " ".repeat(indent + 4) + objToRuby(item, indent + 4) + ",\n";
          }
          s += " ".repeat(indent) + "]";
        }
      } else {
        const len = Object.keys(obj).length;
        if (len === 0) {
          s += "{}";
        } else {
          s += "{\n";
          for (const [k, v] of Object.entries(obj)) {
            // repr() because JSON keys must be strings.
            s +=
              " ".repeat(indent + 4) +
              repr(k) +
              " => " +
              objToRuby(v, indent + 4) +
              ",\n";
          }
          s += " ".repeat(indent) + "}";
        }
      }
      break;
    default:
      throw new util.CCError(
        "unexpected object type that shouldn't appear in JSON: " + typeof obj
      );
  }
  return s;
}

function getDataString(request: Request): [string, boolean] {
  if (!request.data) {
    return ["", false];
  }

  if (!request.isDataRaw && request.data.startsWith("@")) {
    let filePath = request.data.slice(1);
    if (filePath === "-") {
      if (request.stdinFile) {
        filePath = request.stdinFile;
      } else if (request.stdin) {
        request.data = request.stdin;
      } else {
        if (request.isDataBinary) {
          // TODO: read in binary
          // TODO: .delete("\\r\\n") ?
          return ['req.body = STDIN.read.delete("\\n")\n', false];
        } else {
          return ['req.body = STDIN.read.delete("\\n")\n', false];
        }
      }
    }
    if (!request.stdin) {
      if (request.isDataBinary) {
        // TODO: I bet the way Ruby treats file paths is not identical to curl's
        // TODO: .delete("\\r\\n") ?
        return [
          "req.body = File.open(" + repr(filePath) + ').read.delete("\\n")\n',
          false,
        ];
      } else {
        return [
          "req.body = File.read(" + repr(filePath) + ').delete("\\n")\n',
          false,
        ];
      }
    }
  }

  const contentTypeHeader = util.getHeader(request, "content-type");
  const isJson =
    contentTypeHeader &&
    contentTypeHeader.split(";")[0].trim() === "application/json";
  if (isJson) {
    try {
      const dataAsJson = JSON.parse(request.data);
      if (typeof dataAsJson === "object" && dataAsJson !== null) {
        // TODO: we actually want to know how it's serialized by Ruby's builtin
        // JSON formatter but this is hopefully good enough.
        const roundtrips = JSON.stringify(dataAsJson) === request.data;
        let code = "";
        if (!roundtrips) {
          code += "# The object won't be serialized exactly like this\n";
          code += "# req.body = " + repr(request.data) + "\n";
        }
        code += "req.body = " + objToRuby(dataAsJson) + ".to_json\n";
        return [code, true];
      }
    } catch {}
  }

  const [parsedQueryAsList, parsedQueryAsDict] = util.parseQueryString(
    request.data
  );
  if (
    !request.isDataBinary &&
    parsedQueryAsList &&
    parsedQueryAsDict &&
    !(parsedQueryAsList.length === 1 && parsedQueryAsList[0][1] === null)
  ) {
    // If the original request contained %20, Ruby will encode them as "+"
    return ["req.set_form_data(" + objToRuby(parsedQueryAsDict) + ")\n", false];
  }

  return ["req.body = " + repr(request.data) + "\n", false];
}

function getFilesString(request: Request): string {
  if (!request.multipartUploads) {
    return "";
  }

  const multipartUploads = request.multipartUploads.map(
    (m): [string, string, (string | false)?] => {
      // https://github.com/psf/requests/blob/2d5517682b3b38547634d153cea43d48fbc8cdb5/requests/models.py#L117
      //
      // net/http's multipart syntax looks like this:
      // [[name, file, {filename: filename}]]
      const name = repr(m.name); // TODO: what if name is empty string?
      const sentFilename = "filename" in m && m.filename && repr(m.filename);
      if ("contentFile" in m) {
        if (m.contentFile === "-") {
          // TODO: use piped stdin if we have it
          return [name, "STDIN", sentFilename];
        } else if (m.contentFile === m.filename) {
          // TODO: curl will look at the file extension to determine each content-type
          return [name, "File.open(" + repr(m.contentFile) + ")"];
        }
        return [name, "File.open(" + repr(m.contentFile) + ")", sentFilename];
      }
      return [name, repr(m.content), sentFilename];
    }
  );

  let filesString = "req.set_form(\n";
  if (multipartUploads.length === 0) {
    filesString += "  [],\n";
  } else {
    filesString += "  [\n";
    for (const [name, content, filename] of multipartUploads) {
      filesString += "    [\n";
      filesString += "      " + name + ",\n";
      filesString += "      " + content;
      if (typeof filename === "string") {
        filesString += ",\n";
        filesString += "      {filename: " + filename + "}\n";
      } else {
        filesString += "\n";
      }
      filesString += "    ],\n";
    }
    filesString += "  ],\n";
  }
  // TODO: what if there's other stuff in the content type?
  filesString += "  'multipart/form-data'\n";
  // TODO: charset
  filesString += ")\n";

  return filesString;
}

export const _toRuby = (request: Request, warnings: Warnings = []): string => {
  let prelude = "require 'net/http'\n";
  let code = "";

  const methods = {
    GET: "Get",
    HEAD: "Head",
    POST: "Post",
    PATCH: "Patch",
    PUT: "Put",
    PROPPATCH: "Proppatch",
    LOCK: "Lock",
    UNLOCK: "Unlock",
    OPTIONS: "Options",
    PROPFIND: "Propfind",
    DELETE: "Delete",
    MOVE: "Move",
    COPY: "Copy",
    MKCOL: "Mkcol",
    TRACE: "Trace",
  };

  // https://gist.github.com/misfo/1072693 but simplified
  const validSymbol = (s: string): boolean => {
    // TODO: can also start with @ $ and end with ! = ? are those special?
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s);
  };
  const emptyValue = (v: string | null | Array<string | null>): boolean => {
    return (
      v === null ||
      v === undefined ||
      (Array.isArray(v) && v.some((x) => x === null))
    );
  };

  if (
    request.queryDict &&
    Object.keys(request.queryDict).every(validSymbol) &&
    !Object.values(request.queryDict).some(emptyValue)
  ) {
    code += "uri = URI(" + repr(request.urlWithoutQuery) + ")\n";
    // TODO: this needs to be :symbols and they need to be escaped
    code += "params = {\n";
    for (const [key, value] of Object.entries(request.queryDict)) {
      code += "  :" + key + " => " + objToRuby(value) + ",\n";
    }
    code += "}\n";
    code += "uri.query = URI.encode_www_form(params)\n\n";
  } else {
    code += "uri = URI(" + repr(request.url) + ")\n";
  }

  const simple = !(
    request.headers ||
    request.auth ||
    request.multipartUploads ||
    request.data ||
    request.uploadFile
  );
  if (util.has(methods, request.method)) {
    if (request.method === "GET" && simple) {
      code += "res = Net::HTTP.get_response(uri)\n";
      return prelude + "\n" + code;
    } else {
      code += "req = Net::HTTP::" + methods[request.method] + ".new(uri)\n";
    }
  } else {
    code +=
      "req = Net::HTTPGenericRequest.new(" +
      repr(request.method) +
      ", true, true, uri)\n";
  }

  if (request.auth && !request.digest) {
    code +=
      "req.basic_auth " +
      repr(request.auth[0]) +
      ", " +
      repr(request.auth[1]) +
      "\n";
  }

  let reqBody;
  if (request.uploadFile) {
    if (request.uploadFile === "-" || request.uploadFile === ".") {
      reqBody = "req.body = STDIN.read\n";
    } else {
      reqBody = "req.body = File.read(" + repr(request.uploadFile) + ")\n";
    }
  } else if (request.data) {
    let importJson = false;
    [reqBody, importJson] = getDataString(request);
    if (importJson) {
      prelude += "require 'json'\n";
    }
  } else if (request.multipartUploads) {
    reqBody = getFilesString(request);
  }

  const contentType = util.getHeader(request, "content-type");
  if (typeof contentType === "string") {
    // If the content type has stuff after the content type, like
    // application/x-www-form-urlencoded; charset=UTF-8
    // then we generate misleading code here because the charset won't be sent.
    code += "req.content_type = " + repr(contentType) + "\n";
    util.deleteHeader(request, "content-type");
  }
  if (request.headers && request.headers.length) {
    for (const [headerName, headerValue] of request.headers) {
      if (
        ["accept-encoding", "content-length"].includes(headerName.toLowerCase())
      ) {
        code += "# ";
      }
      // TODO: nil?
      code +=
        "req[" + repr(headerName) + "] = " + repr(headerValue ?? "nil") + "\n";
    }
  }

  if (reqBody) {
    code += "\n" + reqBody;
  }

  code += "\n";
  code += "req_options = {\n";
  code += '  use_ssl: uri.scheme == "https",\n';
  if (request.insecure) {
    prelude += "require 'openssl'\n";
    code += "  verify_mode: OpenSSL::SSL::VERIFY_NONE,\n";
  }
  code += "}\n";
  code +=
    "res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|\n";
  code += "  http.request(req)\n";
  code += "end";

  if (request.output && request.output !== "/dev/null") {
    if (request.output === "-") {
      code += "\nputs res.body";
    } else {
      code += "\nFile.write(" + repr(request.output) + ", res.body)";
    }
  }

  return prelude + "\n" + code + "\n";
};

export const toRubyWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const ruby = _toRuby(request, warnings);
  return [ruby, warnings];
};

export const toRuby = (curlCommand: string | string[]): string => {
  return toRubyWarn(curlCommand)[0];
};
