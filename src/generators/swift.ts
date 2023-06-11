import { Word, eq } from "../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";

const supportedArgs = new Set([...COMMON_SUPPORTED_ARGS]);

// https://docs.swift.org/swift-book/documentation/the-swift-programming-language/stringsandcharacters/
const regexEscape = /"|\\|\p{C}|\p{Z}/gu;
export function reprStr(s: string): string {
  return (
    '"' +
    s.replace(regexEscape, (c: string): string => {
      switch (c) {
        case " ":
          return " ";
        case "\x00":
          return "\\0";
        case "\\":
          return "\\\\";
        case "\t":
          return "\\t";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        // Possible but unnecessary
        // case "'":
        //   return "\\'";
        case '"':
          return '\\"';
      }
      const hex = (c.codePointAt(0) as number).toString(16);
      return "\\u{" + hex + "}";
    }) +
    '"'
  );
}

export function repr(w: Word): string {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      args.push(
        "ProcessInfo.processInfo.environment[" + reprStr(t.value) + "]"
      );
    } else {
      args.push("exec(" + reprStr(t.value) + ")");
      // TODO: add exec()
    }
  }
  return args.join(" + ");
}

export function _toSwift(requests: Request[], warnings: Warnings = []): string {
  const request = getFirst(requests, warnings);

  let code = "import Foundation\n\n";

  code += "let url = URL(string: " + repr(request.urls[0].url) + ")!\n";
  code += "\n";
  code += "var request = URLRequest(url: url)\n";
  if (!eq(request.urls[0].method, "GET")) {
    code += "request.httpMethod = " + repr(request.urls[0].method) + "\n";
  }

  if (request.headers) {
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue;
      }
      code +=
        "request.setValue(" +
        repr(headerValue) +
        ", forHTTPHeaderField: " +
        repr(headerName) +
        ")\n";
    }
  }

  if (request.urls[0].auth) {
    const [username, password] = request.urls[0].auth;
    code += "\n";
    code += "let username = " + repr(username) + "\n";
    code += "let password = " + repr(password) + "\n";
    code +=
      'let loginString = String(format: "\\(username):\\(password)", username, password)\n';
    code += "let loginData = loginString.data(using: String.Encoding.utf8)!\n";
    code += "let base64LoginString = loginData.base64EncodedString()\n";
    code +=
      'request.setValue("Basic \\(base64LoginString)", forHTTPHeaderField: "Authorization")\n';
    code += "\n";
  }

  if (request.data) {
    code +=
      "request.httpBody = " + repr(request.data) + ".data(using: .utf8)\n";
    code += "\n";
  }

  code +=
    "let task = URLSession.shared.dataTask(with: request) { (data, response, error) in\n";
  code += "    if let error = error {\n";
  code += '        print("Error: \\(error)")\n';
  code += "    } else if let data = data {\n";
  code += "        let str = String(data: data, encoding: .utf8)\n";
  code += '        print("Received data:\\n\\(str ?? "")")\n';
  code += "    }\n";
  code += "}\n";
  code += "\n";
  code += "task.resume()\n";

  return code;
}

export function toSwiftWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const code = _toSwift(requests, warnings);
  return [code, warnings];
}
export function toSwift(curlCommand: string | string[]): string {
  return toSwiftWarn(curlCommand)[0];
}
