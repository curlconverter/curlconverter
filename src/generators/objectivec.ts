import { CCError } from "../utils.js";
import { Word, eq } from "../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";

const supportedArgs = new Set([...COMMON_SUPPORTED_ARGS]);

// Presumably the same as C strings
// https://en.wikipedia.org/wiki/Escape_sequences_in_C#Table_of_escape_sequences
const regexEscape = /"|\\|\p{C}|[^ \P{Z}]/gu;
export function reprStr(s: string): string {
  return (
    '@"' +
    s.replace(regexEscape, (c: string) => {
      switch (c) {
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
      const hex = (c.codePointAt(0) as number).toString(16);
      if (hex.length <= 2) {
        return "\\x" + hex.padStart(2, "0");
      }
      if (hex.length <= 4) {
        return "\\u" + hex.padStart(4, "0");
      }
      return "\\U" + hex.padStart(8, "0");
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
      // TODO: does this error if variable doesn't exist?
      args.push(
        "[[[NSProcessInfo processInfo] environment] objectForKey:@" +
          reprStr(t.value) +
          "]"
      );
    } else if (t.type === "command") {
      // TODO: doesn't return the output
      args.push("system(" + reprStr(t.value) + ")");
    }
  }
  if (args.length === 1) {
    return args[0];
  }
  return args.join(" + ");
}

const reservedHeaders = [
  "Content-Length",
  "Authorization",
  "Connection",
  "Host",
  "Proxy-Authenticate",
  "Proxy-Authorization",
  "WWW-Authenticate",
].map((h) => h.toLowerCase());

export function _toObjectiveC(
  requests: Request[],
  warnings: Warnings = []
): string {
  const request = getFirst(requests, warnings);
  let code = "";
  code += "#import <Foundation/Foundation.h>\n";
  code += "\n";
  code +=
    "NSURL *url = [NSURL URLWithString:" + repr(request.urls[0].url) + "];\n";

  if (request.headers.length) {
    const headerLines = [];
    for (const [key, value] of request.headers) {
      if (value === null) {
        continue;
      }
      if (
        key.isString() &&
        reservedHeaders.includes(key.toLowerCase().toString())
      ) {
        warnings.push([
          "reserved-header",
          key.toString() + " is a reserved header",
        ]);
      }
      headerLines.push("    " + repr(key) + ": " + repr(value));
    }
    if (headerLines.length) {
      code += "NSDictionary *headers = @{\n";
      code += headerLines.join(",\n") + "\n";
      code += "};\n";
      code += "\n";
    }
  }

  let hasData = false;
  let hasDataStream = false;
  if (request.urls[0].uploadFile) {
    code +=
      "InputStream *dataStream = [InputStream fileAtPath:" +
      // TODO: might need processing
      repr(request.urls[0].uploadFile) +
      "];";
    hasDataStream = true;
  } else if (request.dataArray) {
    if (
      request.dataArray.length === 1 &&
      !(request.dataArray[0] instanceof Word) &&
      !request.dataArray[0].name
    ) {
      // TODO: urlencode if necessary
      code +=
        "InputStream *dataStream = [InputStream fileAtPath:" +
        repr(request.dataArray[0].filename) +
        "];";
      hasDataStream = true;
    } else {
    }
  } else if (request.multipartUploads) {
  }
  if (
    request.timeout &&
    !eq(request.timeout, "60") &&
    !eq(request.timeout, "60.0")
  ) {
    code +=
      "NSMutableURLRequest *urlRequest = [NSMutableURLRequest requestWithURL:url\n";
    code +=
      "                                                          cachePolicy:NSURLRequest.CachePolicy.useProtocolCachePolicy\n";
    code +=
      "                                                      timeoutInterval:" +
      // TODO: verify/escape or parse
      request.timeout.toString() +
      "];\n";
  } else {
    code +=
      "NSMutableURLRequest *urlRequest = [NSMutableURLRequest requestWithURL:url];\n";
  }

  if (!eq(request.urls[0].method, "GET")) {
    code +=
      "[urlRequest setHTTPMethod:" + repr(request.urls[0].method) + "];\n";
  }
  if (request.headers.length) {
    code += "[urlRequest setAllHTTPHeaderFields:headers];\n";
  }
  if (hasData) {
    code += "[urlRequest setHttpBody:data];\n";
  } else if (hasDataStream) {
    // TODO: does this work?
    code += "[urlRequest setHttpBodyStream:dataStream];\n";
  }

  code += "\n";
  // TODO: TLSMinimumSupportedProtocolVersion
  // TODO: timeoutIntervalForRequest?
  // TODO: timeoutIntervalForResource?
  code +=
    "NSURLSessionConfiguration *defaultSessionConfiguration = [NSURLSessionConfiguration defaultSessionConfiguration];\n";
  code +=
    "NSURLSession *defaultSession = [NSURLSession sessionWithConfiguration:defaultSessionConfiguration];\n";
  code +=
    "NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {\n";
  code += "    if (error) {\n";
  code += '        NSLog(@"%@", error);\n';
  code += "    } else {\n";
  code +=
    "        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;\n";
  code += '        NSLog(@"%@", httpResponse);\n';
  code += "    }\n";
  code += "}];\n";
  code += "\n";
  code += "[dataTask resume];\n";

  return code;
}

export function toObjectiveCWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const code = _toObjectiveC(requests, warnings);
  return [code, warnings];
}
export function toObjectiveC(curlCommand: string | string[]): string {
  return toObjectiveCWarn(curlCommand)[0];
}
