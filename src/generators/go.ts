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
  "form",
  "form-string",
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

const errNil = "\tif err != nil {\n" + "\t\tlog.Fatal(err)\n" + "\t}\n";

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

  const hasMultipartFiles =
    request.multipartUploads &&
    request.multipartUploads.some((m) => "contentFile" in m);

  goCode += "import (\n";
  if (request.multipartUploads) {
    goCode += '\t"bytes"\n';
  }
  if (request.insecure) {
    goCode += '\t"crypto/tls"\n';
  }
  goCode += '\t"fmt"\n';
  if (hasMultipartFiles) {
    goCode += '\t"io"\n';
  }
  goCode += '\t"io/ioutil"\n';
  goCode += '\t"log"\n';
  if (request.multipartUploads) {
    goCode += '\t"mime/multipart"\n';
  }
  goCode += '\t"net/http"\n';
  if (hasMultipartFiles) {
    goCode += '\t"os"\n';
  }
  if (hasMultipartFiles) {
    goCode += '\t"path/filepath"\n';
  }
  if (request.data) {
    goCode += '\t"strings"\n';
  }
  if (request.timeout) {
    goCode += '\t"time"\n';
  }
  goCode += ")\n\n";

  goCode += "func main() {\n";

  if (request.multipartUploads) {
    goCode += "\tform := new(bytes.Buffer)\n";
    goCode += "\twriter := multipart.NewWriter(form)\n";
    let firstFile = true;
    let firstField = true;
    for (const m of request.multipartUploads) {
      if ("contentFile" in m) {
        const op = firstFile ? ":=" : "=";
        firstFile = false;
        // TODO: Go sends name=<filename> but curl always sends name="data"
        goCode += `\tfw, err ${op} writer.CreateFormFile(${repr(
          m.contentFile
        )}, filepath.Base(${repr(m.filename ?? m.contentFile)}))\n`;
        goCode += errNil;

        goCode += `\tfd, err ${op} os.Open(${repr(m.contentFile)})\n`;
        goCode += errNil;
        goCode += "\tdefer fd.Close()\n";
        goCode += "\t_, err = io.Copy(fw, fd)\n";
        goCode += errNil;
      } else {
        const op = firstField ? ":=" : "=";
        firstField = false;
        goCode += `\tformField, err ${op} writer.CreateFormField(${repr(
          m.name
        )})\n`;
        goCode += errNil;
        goCode += `\t_, err = formField.Write([]byte(${reprMaybeBacktick(
          m.content
        )}))\n`;
      }
      goCode += "\n";
    }
    goCode += "\twriter.Close()\n";
    goCode += "\n";

    util.deleteHeader(request, "content-type");
  }

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
  goCode +=
    ", " +
    (request.data ? "data" : request.multipartUploads ? "form" : "nil") +
    ")\n";
  goCode += errNil;

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
  if (request.multipartUploads) {
    goCode +=
      '\treq.Header.Set("Content-Type", writer.FormDataContentType())\n';
  }

  if (request.urls[0].auth && request.authType === "basic") {
    const [user, password] = request.urls[0].auth;
    goCode +=
      "\treq.SetBasicAuth(" + repr(user) + ", " + repr(password) + ")\n";
  }

  goCode += "\tresp, err := client.Do(req)\n";
  goCode += errNil;
  goCode += "\tdefer resp.Body.Close()\n";
  goCode += "\tbodyText, err := ioutil.ReadAll(resp.Body)\n";
  goCode += errNil;
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
