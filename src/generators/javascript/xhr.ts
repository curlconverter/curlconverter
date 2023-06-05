import { eq } from "../../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../../parse.js";
import type { Request, Warnings } from "../../parse.js";

import {
  repr,
  asParseFloatTimes1000,
  type JSImports,
  reprImports,
} from "./javascript.js";

// TODO: these need to be modified
import { dedent, getDataString, getFormString } from "./jquery.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",
  "max-time",
]);

export function _toJavaScriptXHR(
  requests: Request[],
  warnings: Warnings = []
): string {
  const request = getFirst(requests, warnings);
  const imports: JSImports = [];

  let code = "";

  // data: passed with these methods is ignored
  const nonDataMethods = ["GET", "HEAD"];
  const method = request.urls[0].method;
  const methodStr = method.toString();

  // TODO: check this
  if (!eq(request.urls[0].method.toUpperCase(), method)) {
    warnings.push([
      "method-case",
      "XHR converts method names to uppercase, so the method name will be changed to " +
        method.toUpperCase().toString(),
    ]);
  }

  const hasData = request.data || request.multipartUploads;

  const url = request.urls[0].url;

  let dataString, commentedOutDataString;

  let exactContentType = request.headers.get("content-type");
  const contentType = request.headers.getContentType();
  if (request.data) {
    // might delete content-type header
    [exactContentType, dataString, commentedOutDataString] = getDataString(
      request,
      contentType,
      exactContentType,
      imports
    );
    if (commentedOutDataString) {
      code += "// const data = " + commentedOutDataString + ";\n";
    }
    if (dataString) {
      code += "const data = " + dedent(dataString) + ";\n\n";
    }
  } else if (request.multipartUploads) {
    let formCode;
    [dataString, formCode] = getFormString(request.multipartUploads, imports);
    code += formCode;
  }
  if (nonDataMethods.includes(methodStr) && hasData) {
    warnings.push([
      "data-with-get",
      "XHR doesn't send data with GET or HEAD requests",
    ]);
  }

  code += "let xhr = new XMLHttpRequest();\n";
  code += "xhr.withCredentials = true;\n";
  code += "xhr.open(";
  const openArgs = [repr(method, imports), repr(url, imports)];
  if (request.urls[0].auth) {
    const [username, password] = request.urls[0].auth;
    openArgs.push("true", repr(username, imports), repr(password, imports));
    code += "\n  ";
    code += openArgs.join(",\n  ");
    code += "\n";
  } else {
    code += openArgs.join(", ");
  }
  code += ");\n";

  // TODO: keep content-type header if it's not multipart/form-data
  // TODO: warn about unsent headers
  if (request.headers.length) {
    for (const [key, value] of request.headers) {
      if (value === null) {
        continue;
      }
      code +=
        "xhr.setRequestHeader(" +
        repr(key, imports) +
        ", " +
        repr(value, imports) +
        ");\n";
    }
  }

  if (request.timeout) {
    code +=
      "xhr.timeout = " +
      asParseFloatTimes1000(request.timeout, imports) +
      ";\n";
  }

  code += "\n";
  code += "xhr.onload = function() {\n";
  code += "  console.log(xhr.response);\n";
  code += "};\n";
  code += "\n";

  if (hasData) {
    if (request.multipartUploads) {
      // TODO: generate code using this variable
      code += "xhr.send(form);\n";
    } else {
      code += "xhr.send(data);\n";
    }
  } else {
    code += "xhr.send();\n";
  }

  let importCode = reprImports(imports);
  if (importCode) {
    importCode += "\n";
  }

  return importCode + code;
}

export function toJavaScriptXHRWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const code = _toJavaScriptXHR(requests, warnings);
  return [code, warnings];
}
export function toJavaScriptXHR(curlCommand: string | string[]): string {
  return toJavaScriptXHRWarn(curlCommand)[0];
}
