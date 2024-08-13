import { CCError, has } from "../../utils.js";
import { warnIfPartsIgnored } from "../../Warnings.js";
import { Word, eq } from "../../shell/Word.js";
import { parse, COMMON_SUPPORTED_ARGS } from "../../parse.js";
import type { Request, Warnings } from "../../parse.js";
import { parseQueryString, type QueryDict } from "../../Query.js";
import { repr, reprStr, getDataString, getFilesString } from "./ruby.js";

export const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
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
  "upload-file",
  "next",
]);

function requestToRubyHttparty(
  request: Request,
  warnings: Warnings,
  imports: Set<string>,
): string {
  warnIfPartsIgnored(request, warnings, { dataReadsFile: true });
  if (
    request.dataReadsFile &&
    request.dataArray &&
    request.dataArray.length &&
    (request.dataArray.length > 1 ||
      (!(request.dataArray[0] instanceof Word) && request.dataArray[0].name))
  ) {
    warnings.push([
      "unsafe-data",
      "the generated data content is wrong, " +
        // TODO: might not come from "@"
        JSON.stringify("@" + request.dataReadsFile) +
        " means read the file " +
        JSON.stringify(request.dataReadsFile),
    ]);
  }

  let code = "";
  let partyCode = "";

  const methods = {
    GET: "get",
    HEAD: "head",
    POST: "post",
    PATCH: "patch",
    PUT: "put",
    PROPPATCH: "proppatch",
    LOCK: "lock",
    UNLOCK: "unlock",
    OPTIONS: "options",
    PROPFIND: "propfind",
    DELETE: "delete",
    MOVE: "move",
    COPY: "copy",
    MKCOL: "mkcol",
    TRACE: "trace",
  };

  // https://gist.github.com/misfo/1072693 but simplified
  function validSymbol(s: Word): boolean {
    // TODO: can also start with @ $ and end with ! = ? are those special?
    return s.isString() && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s.toString());
  }

  code += "url = " + repr(request.urls[0].url) + "\n";

  const method = request.urls[0].method;
  if (method.isString() && has(methods, method.toString())) {
    partyCode += "res = HTTParty." + methods[method.toString()] + "(url";
  } else {
    partyCode += `# Generic HTTP method not supported: ${method}\nres = HTTParty.get(url`;
  }

  if (request.urls[0].auth && request.authType === "basic") {
    partyCode += ", basic_auth: basic_auth";
    code +=
      "basic_auth = {" +
      repr(request.urls[0].auth[0]) +
      ", " +
      repr(request.urls[0].auth[1]) +
      "}\n";
  }

  let reqBody;
  if (request.urls[0].uploadFile) {
    if (
      eq(request.urls[0].uploadFile, "-") ||
      eq(request.urls[0].uploadFile, ".")
    ) {
      reqBody = "body = STDIN.read\n";
    } else {
      reqBody = "body = File.read(" + repr(request.urls[0].uploadFile) + ")\n";
    }
  } else if (request.multipartUploads) {
    reqBody = getFilesString(request);
    request.headers.delete("content-type");
  } else if (request.data) {
    let importJson = false;
    [reqBody, importJson] = getDataString(request);
    if (importJson) {
      imports.add("json");
    }
  }

  if (request.headers.length) {
    partyCode += ", headers: headers";
    code += "headers = {\n";
    for (const [headerName, headerValue] of request.headers) {
      if (
        ["accept-encoding", "content-length"].includes(
          headerName.toLowerCase().toString(),
        )
      ) {
        code += "# ";
      }
      // TODO: nil?
      code +=
        "  " +
        repr(headerName) +
        ": " +
        repr(headerValue ?? new Word("nil")) +
        ",\n";
    }
    code += "}\n";
  }

  if (reqBody) {
    code += reqBody;
    partyCode += ", body: body";
  }

  if (request.insecure) {
    partyCode += ", verify: false";
  }

  partyCode += ")\n";
  code += partyCode;

  if (request.urls[0].output && !eq(request.urls[0].output, "/dev/null")) {
    if (eq(request.urls[0].output, "-")) {
      code += "\nputs res.body";
    } else {
      code += "\nFile.write(" + repr(request.urls[0].output) + ", res.body)";
    }
  }

  return code + "\n";
}

export function _toRubyHttparty(
  requests: Request[],
  warnings: Warnings = [],
): string {
  const imports = new Set<string>();

  const code = requests
    .map((r) => requestToRubyHttparty(r, warnings, imports))
    .join("\n\n");

  let prelude = "require 'httparty'\n";
  for (const imp of Array.from(imports).sort()) {
    prelude += "require '" + imp + "'\n";
  }
  return prelude + "\n" + code;
}

export function toRubyWarnHttparty(
  curlCommand: string | string[],
  warnings: Warnings = [],
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const ruby = _toRubyHttparty(requests, warnings);
  return [ruby, warnings];
}

export function toRubyHttparty(curlCommand: string | string[]): string {
  return toRubyWarnHttparty(curlCommand)[0];
}
