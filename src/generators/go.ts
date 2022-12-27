import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import { repr as pyrepr } from "./python.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "insecure",
  "no-insecure",
  "compressed",
  "no-compressed",
  "max-time",
  // TODO
  // "form",
  // "form-string",
]);

// https://go.dev/ref/spec#String_literals
const reprMaybeBacktick = (s: string): string => {
  return s.includes('"') ? reprBacktick(s) : repr(s);
};
const reprBacktick = (s: string): string => {
  return !s.includes("`") && !s.includes("\r") ? "`" + s + "`" : repr(s);
};
const repr = (s: string): string => {
  return pyrepr(s, '"');
};

export const _toGo = (requests: Request[], warnings: Warnings = []): string => {
  if (requests.length > 1) {
    warnings.push([
      "next",
      "got " +
        requests.length +
        " configs because of --next, using the first one",
    ]);
  }
  const request = requests[0];
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

  let goCode = "package main\n\n";

  goCode += "import (\n";
  goCode += '\t"fmt"\n';
  goCode += '\t"io/ioutil"\n';
  goCode += '\t"log"\n';
  goCode += '\t"net/http"\n';
  if (request.insecure) {
    goCode += '\t"crypto/tls"\n';
  }
  if (request.data) {
    goCode += '\t"strings"\n';
  }
  if (request.timeout) {
    goCode += '\t"time"\n';
  }
  goCode += ")\n\n";

  goCode += "func main() {\n";

  if (request.insecure || request.compressed === false) {
    goCode += "\ttr := &http.Transport{\n";
    if (request.insecure) {
      goCode += "\t\tTLSClientConfig: &tls.Config{InsecureSkipVerify: true},\n";
    }
    if (request.compressed === false) {
      goCode += "\t\tDisableCompression: true,\n";
    }
    goCode += "\t}\n";
  }

  goCode += "\tclient := &http.Client{";
  if (request.timeout) {
    goCode += "\n";
    if (request.insecure || request.compressed === false) {
      goCode += "\t\tTransport: tr,\n";
    }
    if (request.timeout) {
      goCode += "\t\tTimeout: " + request.timeout + " * time.Second,\n";
    }
    goCode += "\t";
  } else if (request.insecure || request.compressed === false) {
    goCode += "Transport: tr";
  }
  goCode += "}\n";

  if (request.data) {
    goCode +=
      "\tvar data = strings.NewReader(" + reprBacktick(request.data) + ")\n";
  }

  goCode +=
    "\treq, err := http.NewRequest(" +
    repr(request.urls[0].method) +
    ", " +
    repr(request.urls[0].url);
  goCode += ", " + (request.data ? "data" : "nil") + ")\n";
  goCode += "\tif err != nil {\n";
  goCode += "\t\tlog.Fatal(err)\n";
  goCode += "\t}\n";

  if (request.headers) {
    for (const [headerName, headerValue] of request.headers || []) {
      let start = "\t";
      if (
        headerName.toLowerCase() === "accept-encoding" &&
        // By default Go will automatically decompress gzip,
        // unless you set DisableCompression to true on the Transport
        // or pass a custom Accept-Encoding header.
        // By default curl won't automatically decompress gzip unless
        // you pass --compressed, but we comment out the header in that
        // case (request.compressed = undefined) too.
        request.compressed !== false
      ) {
        start += "// ";
      }
      goCode +=
        start +
        "req.Header.Set(" +
        repr(headerName) +
        ", " +
        reprMaybeBacktick(headerValue ?? "") +
        ")\n";
    }
  }

  if (request.urls[0].auth && request.authType === "basic") {
    const [user, password] = request.urls[0].auth;
    goCode +=
      "\treq.SetBasicAuth(" + repr(user) + ", " + repr(password) + ")\n";
  }

  goCode += "\tresp, err := client.Do(req)\n";
  goCode += "\tif err != nil {\n";
  goCode += "\t\tlog.Fatal(err)\n";
  goCode += "\t}\n";
  goCode += "\tdefer resp.Body.Close()\n";
  goCode += "\tbodyText, err := ioutil.ReadAll(resp.Body)\n";
  goCode += "\tif err != nil {\n";
  goCode += "\t\tlog.Fatal(err)\n";
  goCode += "\t}\n";
  goCode += '\tfmt.Printf("%s\\n", bodyText)\n';
  goCode += "}";

  return goCode + "\n";
};
export const toGoWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const go = _toGo(requests, warnings);
  return [go, warnings];
};
export const toGo = (curlCommand: string | string[]): string => {
  return toGoWarn(curlCommand)[0];
};
