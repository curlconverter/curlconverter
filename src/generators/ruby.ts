import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

// https://ruby-doc.org/stdlib-2.7.0/libdoc/net/http/rdoc/Net/HTTP.html
// https://github.com/ruby/net-http/tree/master/lib/net
// https://github.com/augustl/net-http-cheat-sheet

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",
  "http0.9",
  "http1.0",
  "http1.1",
  "insecure",
  "no-digest",
  "no-http0.9",
  "no-insecure",
  "output",
  "proxy",
  "proxy-user",
  "upload-file",
  "next",
]);

// https://docs.ruby-lang.org/en/3.1/syntax/literals_rdoc.html#label-Strings
const regexSingleEscape = /'|\\/gu;
const regexDoubleEscape = /"|\\|\p{C}|\p{Z}|#[{@$]/gu;
const regexDigit = /[0-9]/;
export function repr(s: string): string {
  let quote = "'";
  if (
    [...s.matchAll(/\p{C}|\p{Z}/gu)].some((m) => m[0] !== " ") ||
    (s.includes("'") && !s.includes('"'))
  ) {
    quote = '"';
  }

  const regexEscape = quote === "'" ? regexSingleEscape : regexDoubleEscape;

  return (
    quote +
    s.replace(regexEscape, (c: string, index: number, string: string) => {
      switch (c[0]) {
        case " ":
          return " ";
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
        case "'":
          return "\\'";
        case '"':
          return '\\"';
        case "#":
          return "\\" + c;
        case "\0":
          // \0 is null but \01 would be an octal escape
          if (!regexDigit.test(string.charAt(index + 1))) {
            return "\\0";
          }
          break;
      }

      const codePoint = c.codePointAt(0) as number;
      const hex = codePoint.toString(16);
      if (hex.length <= 2 && codePoint < 0x7f) {
        return "\\x" + hex.padStart(2, "0");
      }
      if (hex.length <= 4) {
        return "\\u" + hex.padStart(4, "0");
      }
      return "\\u{" + hex + "}";
    }) +
    quote
  );
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
          for (const [i, item] of obj.entries()) {
            s += " ".repeat(indent + 2) + objToRuby(item, indent + 2);
            s += i === obj.length - 1 ? "\n" : ",\n";
          }
          s += " ".repeat(indent) + "]";
        }
      } else {
        const len = Object.keys(obj).length;
        if (len === 0) {
          s += "{}";
        } else {
          s += "{\n";
          const objEntries = Object.entries(obj);
          for (const [i, [k, v]] of objEntries.entries()) {
            // repr() because JSON keys must be strings.
            s +=
              " ".repeat(indent + 2) +
              repr(k) +
              " => " +
              objToRuby(v, indent + 2);
            s += i === objEntries.length - 1 ? "\n" : ",\n";
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
        // TODO: What's the difference between binread() and read()?
        // TODO: .delete("\\r\\n") ?
        return [
          "req.body = File.binread(" + repr(filePath) + ').delete("\\n")\n',
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, parsedQueryAsDict] = util.parseQueryString(request.data);
  if (!request.isDataBinary && parsedQueryAsDict) {
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
          if (request.stdinFile) {
            return [
              name,
              "File.open(" + repr(request.stdinFile) + ")",
              sentFilename,
            ];
          } else if (request.stdin) {
            return [name, repr(request.stdin), sentFilename];
          }
          // TODO: does this work?
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
    for (const [i, [name, content, filename]] of multipartUploads.entries()) {
      filesString += "    [\n";
      filesString += "      " + name + ",\n";
      filesString += "      " + content;
      if (typeof filename === "string") {
        filesString += ",\n";
        filesString += "      {filename: " + filename + "}\n";
      } else {
        filesString += "\n";
      }
      if (i === multipartUploads.length - 1) {
        filesString += "    ]\n";
      } else {
        filesString += "    ],\n";
      }
    }
    filesString += "  ],\n";
  }
  // TODO: what if there's other stuff in the content type?
  filesString += "  'multipart/form-data'\n";
  // TODO: charset
  filesString += ")\n";

  return filesString;
}

const requestToRuby = (
  request: Request,
  warnings: Warnings,
  imports: Set<string>
): string => {
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
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

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
  const empty = (v: string | null | Array<string | null>): boolean => {
    return (
      v === null ||
      v === undefined ||
      (Array.isArray(v) && v.some((x) => x === null))
    );
  };

  if (
    request.urls[0].queryDict &&
    Object.keys(request.urls[0].queryDict).every(validSymbol) &&
    !Object.values(request.urls[0].queryDict).some(empty)
  ) {
    code += "uri = URI(" + repr(request.urls[0].urlWithoutQueryList) + ")\n";
    code += "params = {\n";
    for (const [key, value] of Object.entries(request.urls[0].queryDict)) {
      code += "  :" + key + " => " + objToRuby(value) + ",\n";
    }
    code += "}\n";
    code += "uri.query = URI.encode_www_form(params)\n\n";
  } else {
    code += "uri = URI(" + repr(request.urls[0].url) + ")\n";
  }

  const simple = !(
    request.headers ||
    request.urls[0].auth ||
    request.multipartUploads ||
    request.data ||
    request.urls[0].uploadFile ||
    request.insecure ||
    request.proxy ||
    request.urls[0].output
  );
  if (util.has(methods, request.urls[0].method)) {
    if (request.urls[0].method === "GET" && simple) {
      code += "res = Net::HTTP.get_response(uri)\n";
      return code;
    } else {
      code +=
        "req = Net::HTTP::" + methods[request.urls[0].method] + ".new(uri)\n";
    }
  } else {
    code +=
      "req = Net::HTTPGenericRequest.new(" +
      repr(request.urls[0].method) +
      ", true, true, uri)\n";
  }

  if (request.urls[0].auth && request.authType === "basic") {
    code +=
      "req.basic_auth " +
      repr(request.urls[0].auth[0]) +
      ", " +
      repr(request.urls[0].auth[1]) +
      "\n";
  }

  let reqBody;
  if (request.urls[0].uploadFile) {
    if (
      request.urls[0].uploadFile === "-" ||
      request.urls[0].uploadFile === "."
    ) {
      reqBody = "req.body = STDIN.read\n";
    } else {
      reqBody =
        "req.body = File.read(" + repr(request.urls[0].uploadFile) + ")\n";
    }
  } else if (request.data) {
    let importJson = false;
    [reqBody, importJson] = getDataString(request);
    if (importJson) {
      imports.add("json");
    }
  } else if (request.multipartUploads) {
    reqBody = getFilesString(request);
    util.deleteHeader(request, "content-type");
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
  if (request.proxy) {
    const proxy = request.proxy.includes("://")
      ? request.proxy
      : "http://" + request.proxy;
    code += "proxy = URI(" + repr(proxy) + ")\n";
  }
  code += "req_options = {\n";
  code += "  use_ssl: uri.scheme == 'https'";
  if (request.insecure) {
    imports.add("openssl");
    code += ",\n";
    code += "  verify_mode: OpenSSL::SSL::VERIFY_NONE\n";
  } else {
    code += "\n";
  }
  code += "}\n";
  if (!request.proxy) {
    code +=
      "res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|\n";
  } else {
    if (request.proxyAuth) {
      const [proxyUser, proxyPassword] = request.proxyAuth.split(/:(.*)/s, 2);
      code +=
        "res = Net::HTTP.start(uri.hostname, uri.port, proxy.hostname, proxy.port, " +
        repr(proxyUser) +
        ", " +
        repr(proxyPassword || "") +
        ", req_options) do |http|\n";
    } else {
      code +=
        "res = Net::HTTP.new(uri.hostname, uri.port, proxy.hostname, proxy.port, req_options).start do |http|\n";
    }
  }
  code += "  http.request(req)\n";
  code += "end";

  if (request.urls[0].output && request.urls[0].output !== "/dev/null") {
    if (request.urls[0].output === "-") {
      code += "\nputs res.body";
    } else {
      code += "\nFile.write(" + repr(request.urls[0].output) + ", res.body)";
    }
  }

  return code + "\n";
};

export const _toRuby = (
  requests: Request[],
  warnings: Warnings = []
): string => {
  const imports = new Set<string>();

  const code = requests
    .map((r) => requestToRuby(r, warnings, imports))
    .join("\n\n");

  let prelude = "require 'net/http'\n";
  for (const imp of Array.from(imports).sort()) {
    prelude += "require '" + imp + "'\n";
  }
  return prelude + "\n" + code;
};

export const toRubyWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const ruby = _toRuby(requests, warnings);
  return [ruby, warnings];
};

export const toRuby = (curlCommand: string | string[]): string => {
  return toRubyWarn(curlCommand)[0];
};
