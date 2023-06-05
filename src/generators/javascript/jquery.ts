import { Word, eq } from "../../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../../parse.js";
import type { Request, Warnings } from "../../parse.js";
import { parseQueryString } from "../../Query.js";
import type { Query } from "../../Query.js";
import type { FormParam } from "../../curl/form.js";

import {
  repr,
  reprObj,
  asParseFloatTimes1000,
  type JSImports,
  addImport,
  reprImports,
} from "./javascript.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",
  "max-time",
]);

export function dedent(s: string): string {
  return s.replace(/^ {2}/gm, "");
}
export function indent(s: string): string {
  return s.split("\n").join("\n  ");
}

function serializeQuery(query: Query, imports: JSImports): [string, boolean] {
  const [queryList, queryDict] = query;
  let code = "";
  let traditional = false;
  if (queryDict) {
    code += "{\n";
    for (const [key, value] of queryDict) {
      code += "  " + repr(key, imports) + ": ";
      if (Array.isArray(value)) {
        code += "[" + value.map((v) => repr(v, imports)).join(", ") + "]";
        traditional = true;
      } else {
        code += repr(value, imports);
      }
      code += ",\n";
    }

    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
    }
    code += "\n}";
  } else if (queryList) {
    code += "[\n";
    for (const [key, value] of queryList) {
      code +=
        "  { name: " +
        repr(key, imports) +
        ", value: " +
        repr(value, imports) +
        " },\n";
    }
    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
    }
    code += "\n]";
  } else {
    // shouldn't happen
    return ["null", false];
  }
  return [code, traditional];
}

// TODO: @
function _getDataString(
  request: Request,
  contentType: string | null | undefined,
  exactContentType: Word | null | undefined,
  imports: JSImports
): [Word | null | undefined, string | null, string | null, boolean] {
  if (!request.data) {
    return [exactContentType, null, null, false];
  }

  let traditional = false;
  const originalStringRepr = repr(request.data, imports);

  if (contentType === "application/json" && request.data.isString()) {
    const dataStr = request.data.toString();
    const parsed = JSON.parse(dataStr);
    // Only arrays and {} can be passed to axios to be encoded as JSON
    // TODO: check this in other generators
    if (typeof parsed !== "object" || parsed === null) {
      return [exactContentType, originalStringRepr, null, traditional];
    }
    const roundtrips = JSON.stringify(parsed) === dataStr;
    const jsonAsJavaScript = "JSON.stringify(" + reprObj(parsed, 1) + ")";
    return [
      exactContentType,
      jsonAsJavaScript,
      roundtrips ? null : originalStringRepr,
      traditional,
    ];
  }
  if (contentType === "application/x-www-form-urlencoded") {
    const [queryList, queryDict] = parseQueryString(request.data);
    if (queryList) {
      if (
        eq(exactContentType, "application/x-www-form-urlencoded; charset=utf-8")
      ) {
        exactContentType = null;
      }

      let queryObj;
      [queryObj, traditional] = serializeQuery([queryList, queryDict], imports);
      // TODO: check roundtrip, add a comment
      return [exactContentType, indent(queryObj), null, traditional];
    }
  }
  return [exactContentType, originalStringRepr, null, traditional];
}

export function getDataString(
  request: Request,
  contentType: string | null | undefined,
  exactContentType: Word | null | undefined,
  imports: JSImports
): [Word | null | undefined, string | null, string | null, boolean] {
  if (!request.data) {
    return [exactContentType, null, null, false];
  }

  let traditional = false;
  let dataString: string | null = null;
  let commentedOutDataString: string | null = null;
  try {
    [exactContentType, dataString, commentedOutDataString, traditional] =
      _getDataString(request, contentType, exactContentType, imports);
  } catch {}
  if (!dataString) {
    dataString = repr(request.data, imports);
  }
  return [exactContentType, dataString, commentedOutDataString, traditional];
}

export function getFormString(
  multipartUploads: FormParam[],
  imports: JSImports
): [string, string] {
  const dataString = "form";
  let code = "const form = new FormData();\n";
  for (const m of multipartUploads) {
    code += "form.append(" + repr(m.name, imports) + ", ";
    if ("contentFile" in m) {
      // TODO: no fs in browser
      addImport(imports, "fs", "fs");
      if (eq(m.contentFile, "-")) {
        code += "fs.readFileSync(0).toString()";
      } else {
        code += "fs.readFileSync(" + repr(m.contentFile, imports) + ")";
      }
      if ("filename" in m && m.filename) {
        code += ", " + repr(m.filename, imports);
      }
    } else {
      code += repr(m.content, imports);
    }
    code += ");\n";
  }
  code += "\n";
  return [dataString, code];
}

export function _toJavaScriptJquery(
  requests: Request[],
  warnings: Warnings = []
): string {
  const request = getFirst(requests, warnings);
  const imports: JSImports = [];

  let code = "";

  // data: passed with these methods will be added to the URL instead
  const nonDataMethods = ["GET", "HEAD"];
  const method = request.urls[0].method;
  const methodStr = method.toString();
  if (!eq(request.urls[0].method.toUpperCase(), method)) {
    warnings.push([
      "method-case",
      "jQuery converts method names to uppercase, so the method name will be changed to " +
        method.toUpperCase().toString(),
    ]);
  }

  const hasData = request.data || request.multipartUploads;
  const hasSearchParams =
    nonDataMethods.includes(methodStr) && request.urls[0].queryList && !hasData;

  const url = hasSearchParams
    ? request.urls[0].urlWithoutQueryList
    : request.urls[0].url;

  let dataString, commentedOutDataString;
  let traditional = false;
  if (
    hasSearchParams &&
    request.urls[0].queryList // placate type checker
  ) {
    [dataString, traditional] = serializeQuery(
      [request.urls[0].queryList, request.urls[0].queryDict ?? null],
      imports
    );
  }

  let exactContentType = request.headers.get("content-type");
  const contentType = request.headers.getContentType();
  request.headers.delete("content-type");
  if (request.data) {
    // might delete content-type header
    [exactContentType, dataString, commentedOutDataString, traditional] =
      getDataString(request, contentType, exactContentType, imports);
  } else if (request.multipartUploads) {
    let formCode;
    [dataString, formCode] = getFormString(request.multipartUploads, imports);
    code += formCode;
  }
  if (nonDataMethods.includes(methodStr) && hasData) {
    warnings.push([
      "data-with-get",
      "jQuery doesn't allow sending data with GET or HEAD requests. The data will be sent in the URL instead.",
    ]);
  }

  const needsConfig = !!(
    request.headers.length ||
    request.urls[0].auth ||
    ((request.multipartUploads || request.data) &&
      nonDataMethods.includes(methodStr)) ||
    request.timeout ||
    (exactContentType !== null && exactContentType !== undefined) ||
    traditional
  );

  if (methodStr === "GET" && !needsConfig) {
    // TODO: .getJSON()
    code += "$.get(";
    code += repr(url, imports);
    if (dataString) {
      code += ", " + dedent(dataString);
    }
    code += ")\n";
    code += "  .done(function(response) {\n";
    code += "    console.log(response);\n";
    code += "  });\n";
  } else if (methodStr === "POST" && !needsConfig && !commentedOutDataString) {
    code += "$.post(";
    code += repr(url, imports);
    if (dataString) {
      code += ", " + dedent(dataString);
    }
    code += ")\n";
    code += "  .done(function(response) {\n";
    code += "    console.log(response);\n";
    code += "  });\n";
  } else {
    code += "$.ajax(";
    code += "{\n";
    code += "  url: " + repr(url, imports) + ",\n";

    if (methodStr !== "GET") {
      // jQuery uppercases methods
      let sentMethod = method;
      if (eq(request.urls[0].method.toUpperCase(), method)) {
        sentMethod = method.toLowerCase();
      }
      code += "  method: " + repr(sentMethod, imports) + ",\n";
    }

    if (request.headers.length) {
      code += "  headers: {\n";
      for (const [key, value] of request.headers) {
        if (value === null) {
          continue;
        }
        code +=
          "    " + repr(key, imports) + ": " + repr(value, imports) + ",\n";
      }
      if (code.endsWith(",\n")) {
        code = code.slice(0, -2);
        code += "\n";
      }
      code += "  },\n";
    }
    if (exactContentType) {
      code += "  contentType: " + repr(exactContentType, imports) + ",\n";
    }

    if (request.urls[0].auth) {
      const [username, password] = request.urls[0].auth;
      code += "  username: " + repr(username, imports) + ",\n";
      code += "  password: " + repr(password, imports) + ",\n";
    }

    if (hasData) {
      if (commentedOutDataString) {
        code += "  // data: " + commentedOutDataString + ",\n";
      }
      if (dataString) {
        code += "  data: " + dataString + ",\n";
      }
    }

    if (traditional) {
      code += "  traditional: true,\n";
    }

    if (request.timeout) {
      code +=
        "  timeout: " + asParseFloatTimes1000(request.timeout, imports) + ",\n";
    }

    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
    }
    code += "\n}";
    code += ").done(function(response) {\n";
    code += "  console.log(response);\n";
    code += "});\n";
  }

  let importCode = reprImports(imports);
  if (importCode) {
    importCode += "\n";
  }

  return importCode + code;
}

export function toJavaScriptJqueryWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const jquery = _toJavaScriptJquery(requests, warnings);
  return [jquery, warnings];
}
export function toJavaScriptJquery(curlCommand: string | string[]): string {
  return toJavaScriptJqueryWarn(curlCommand)[0];
}
