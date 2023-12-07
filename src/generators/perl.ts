import { CCError } from "../utils.js";
import { Word, eq, mergeWords } from "../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";

import { reprStr } from "./kotlin.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "max-time",
  "insecure",
  "no-insecure",
  // "upload-file",
]);

export function repr(w: Word): string {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      // TODO: dedicated fn
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      // TODO: put in string?
      args.push("$ENV{" + t.value + "}");
    } else {
      // TODO: use `
      args.push("`" + t.value + "`");
    }
  }
  return args.join(" + ");
}

export function _toPerl(requests: Request[], warnings: Warnings = []): string {
  const request = getFirst(requests, warnings);
  const method = request.urls[0].method;
  const methodStr = method.toString();

  if (
    method.isString() &&
    ["GET", "HEAD"].includes(methodStr) &&
    !request.data
    // TODO: more checks
  ) {
    let code = "use LWP::Simple;\n";
    code +=
      "$content = " +
      methodStr.toLowerCase() +
      "(" +
      repr(request.urls[0].url) +
      ");\n";
    return code;
  }

  const methods = ["DELETE", "GET", "HEAD", "PATCH", "POST", "PUT"];
  const helperFunction = method.isString() && methods.includes(methodStr);

  let code = "use LWP::UserAgent;\n";
  if (!helperFunction) {
    code += "require HTTP::Request;\n";
  }
  code += "\n";

  code += "$ua = LWP::UserAgent->new(";
  const uaArgs = [];
  if (request.insecure) {
    uaArgs.push("ssl_opts => { verify_hostname => 0 }");
  }
  if (request.timeout) {
    uaArgs.push("timeout => " + request.timeout);
  }
  if (request.maxRedirects) {
    uaArgs.push("max_redirect => " + request.maxRedirects);
  }
  if (uaArgs.length > 1) {
    code += "\n    " + uaArgs.join(",\n    ") + "\n";
  } else {
    code += uaArgs.join(", ");
  }
  code += ");\n";
  // code += "$ua->env_proxy;\n\n";

  const args = [];
  if (!helperFunction) {
    code += "$request = HTTP::Request->new(";
    args.push(repr(method));
    args.push(repr(request.urls[0].url));
  } else {
    code += "$response = $ua->" + methodStr.toLowerCase() + "(";
    args.push(repr(request.urls[0].url));
    if (request.headers.length) {
      for (const [k, v] of request.headers) {
        if (v === null) {
          continue;
        }
        args.push(repr(k) + " => " + repr(v));
      }
    }
    if (request.data) {
      args.push("Content => " + repr(request.data));
    }
  }

  if (
    (!helperFunction && args.length > 2) ||
    (helperFunction && args.length > 1)
  ) {
    code += "    " + args.join(",\n    ") + "\n";
  } else {
    code += args.join(", ");
  }
  code += ");\n";

  if (!helperFunction) {
    code += "$response = $ua->request($request);\n";
  }

  return code;
}

export function toPerlWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const code = _toPerl(requests, warnings);
  return [code, warnings];
}
export function toPerl(curlCommand: string | string[]): string {
  return toPerlWarn(curlCommand)[0];
}
