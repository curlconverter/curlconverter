import { Word, eq, joinWords } from "../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";

import { reprStr as pyreprStr } from "./python/python.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  // "insecure",
  // "no-insecure",
  // "compressed",
  // "no-compressed",
  // "max-time",
  // "form",
  // "form-string",
]);

function reprStr(s: string): string {
  if (s.includes('"') && !s.includes("'")) {
    return pyreprStr(s, "'");
  }
  return pyreprStr(s, '"');
}
function repr(w: Word): string {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      args.push("os.getenv(" + reprStr(t.value) + ")");
    } else {
      args.push("io.popen(" + reprStr(t.value) + '):read("*a")');
    }
  }
  return args.join(" .. ");
}

export function _toLua(requests: Request[], warnings: Warnings = []): string {
  const request = getFirst(requests, warnings);

  const imports: Set<string> = new Set(["http"]);

  let code = "";
  code += "local body, code, headers, status = http.request";

  if (
    eq(request.urls[0].method, "GET") &&
    !request.data &&
    !request.headers.length &&
    !request.urls[0].auth
  ) {
    code += "(" + repr(request.urls[0].originalUrl) + ")\n";
  } else if (
    eq(request.urls[0].method, "POST") &&
    request.data &&
    !request.urls[0].auth &&
    request.headers.length === 1 &&
    request.headers.has("content-type") &&
    eq(request.headers.get("content-type"), "application/x-www-form-urlencoded")
  ) {
    code += "(\n";
    code += "\t" + repr(request.urls[0].originalUrl) + "\n";
    code += "\t" + repr(request.data) + "\n";
    code += ")\n";
  } else {
    code += "{\n";
    if (!eq(request.urls[0].method, "GET")) {
      code += "\tmethod = " + repr(request.urls[0].method) + ",\n";
    }
    code += "\turl = " + repr(request.urls[0].originalUrl) + ",\n";

    if (request.data) {
      code += "\tsource = ltn12.source.string(" + repr(request.data) + "),\n";
      imports.add("ltn12");
    }

    if (request.headers.length > 0 || request.urls[0].auth) {
      code += "\theaders = {\n";
      for (const [name, value] of request.headers) {
        if (value === null) {
          continue;
        }
        if (name.isString() && /^[a-zA-Z]+$/.test(name.toString())) {
          code += "\t\t" + name.toString() + " = " + repr(value) + ",\n";
        } else {
          code += "\t\t[" + repr(name) + "] = " + repr(value) + ",\n";
        }
      }
      if (request.urls[0].auth) {
        code +=
          '\t\tauthentication = "Basic " .. (mime.b64(' +
          repr(joinWords(request.urls[0].auth, ":")) +
          ")),\n";
        imports.add("mime");
      }
      if (code.endsWith(",\n")) {
        code = code.slice(0, -2) + "\n";
      }
      code += "\t},\n";
    }

    // code += "\tsink = ltn12.sink.table(respbody)\n";

    code += "}\n";
  }

  let importCode = "";
  if (imports.size) {
    for (const imp of Array.from(imports).sort()) {
      if (imp === "http") {
        importCode += 'local http = require("socket.http")\n';
      } else {
        importCode += "local " + imp + ' = require("' + imp + '")\n';
      }
    }
  }

  return importCode + "\n" + code;
}

export function toLuaWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const lua = _toLua(requests, warnings);
  return [lua, warnings];
}
export function toLua(curlCommand: string | string[]): string {
  return toLuaWarn(curlCommand)[0];
}
