import * as util from "../util.js";
import { Word } from "../util.js";
import type { Request, Warnings } from "../util.js";

import { reprStr as pyreprStr } from "./python.js";

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

const IF_ERR = "\tif err != nil {\n" + "\t\tlog.Fatal(err)\n" + "\t}\n";

// https://go.dev/ref/spec#String_literals
const reprMaybeBacktick = (
  s: Word,
  vars: Vars,
  imports: Set<string>
): string => {
  return s.isString() && s.includes('"')
    ? reprBacktick(s, vars, imports)
    : repr(s, vars, imports);
};
const reprBacktick = (s: Word, vars: Vars, imports: Set<string>): string => {
  return s.isString() && !s.includes("`") && !s.includes("\r")
    ? "`" + s.toString() + "`"
    : repr(s, vars, imports);
};
function reprStr(s: string): string {
  return pyreprStr(s, '"');
}
type Vars = { [key: string]: string };
const repr = (w: Word, vars: Vars, imports: Set<string>): string => {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      args.push("os.Getenv(" + reprStr(t.value) + ")");
      imports.add("os");
    } else {
      // TODO: Command takes a list of arguments .Command("ls", "-l", "-a")
      // TODO: if there's only one command, it would be nice to name the variable "cmd"
      const execCall = "exec.Command(" + reprStr(t.value) + ").Output()";
      let i = 1;
      let varName = "cmd" + i;
      // We need to check because we often try to represent the same
      // token twice and discard one of the attempts.
      // This is linear time but hopefully there's not that many subcommands.
      while (varName in vars && vars[varName] !== execCall) {
        i++;
        varName = "cmd" + i;
        if (i > Number.MAX_SAFE_INTEGER) {
          throw new util.CCError("lol");
        }
      }
      vars[varName] = execCall;
      args.push(varName);
      imports.add("os/exec");
    }
  }
  return args.join(" + ");
};

const timeoutAtoi = (w: Word, vars: Vars, imports: Set<string>): string => {
  if (w.isString()) {
    const asStr = w.toString();
    // TODO: check using curl's syntax and convert to Go's float syntax
    if (/^\d+\.?\d*$/.test(asStr)) {
      return asStr;
    }
  }
  vars["timeout"] = "strconv.Atoi(" + repr(w, vars, imports) + ")";
  imports.add("strconv");
  return "timeout";
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
        request.urls
          .map((u) => JSON.stringify(u.originalUrl.toString()))
          .join(", "),
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
        request.cookieFiles.map((c) => JSON.stringify(c.toString())).join(", "),
    ]);
  }

  const imports = new Set<string>(["fmt", "io", "log", "net/http"]);
  const vars: Vars = {};

  let goCode = "";
  if (request.multipartUploads) {
    goCode += "\tform := new(bytes.Buffer)\n";
    goCode += "\twriter := multipart.NewWriter(form)\n";
    imports.add("bytes");
    imports.add("mime/multipart");

    let firstFile = true;
    let firstField = true;
    for (const m of request.multipartUploads) {
      if ("contentFile" in m) {
        const op = firstFile ? ":=" : "=";
        firstFile = false;
        // TODO: Go sends name=<filename> but curl always sends name="data"
        goCode += `\tfw, err ${op} writer.CreateFormFile(${repr(
          m.contentFile,
          vars,
          imports
        )}, filepath.Base(${repr(
          m.filename ?? m.contentFile,
          vars,
          imports
        )}))\n`;
        goCode += IF_ERR;
        imports.add("path/filepath");

        goCode += `\tfd, err ${op} os.Open(${repr(
          m.contentFile,
          vars,
          imports
        )})\n`;
        goCode += IF_ERR;
        imports.add("os");
        goCode += "\tdefer fd.Close()\n";
        goCode += "\t_, err = io.Copy(fw, fd)\n";
        goCode += IF_ERR;
      } else {
        const op = firstField ? ":=" : "=";
        firstField = false;
        goCode += `\tformField, err ${op} writer.CreateFormField(${repr(
          m.name,
          vars,
          imports
        )})\n`;
        goCode += IF_ERR;
        goCode += `\t_, err = formField.Write([]byte(${reprMaybeBacktick(
          m.content,
          vars,
          imports
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
      imports.add("crypto/tls");
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
    goCode +=
      "\t\tTimeout: " +
      timeoutAtoi(request.timeout, vars, imports) +
      " * time.Second,\n";
    goCode += "\t";
    imports.add("time");
  } else if (request.insecure || request.compressed === false) {
    goCode += "Transport: tr";
  }
  goCode += "}\n";

  if (request.data) {
    goCode +=
      "\tvar data = strings.NewReader(" +
      reprBacktick(request.data, vars, imports) +
      ")\n";
    imports.add("strings");
  }

  goCode +=
    "\treq, err := http.NewRequest(" +
    repr(request.urls[0].method, vars, imports) +
    ", " +
    repr(request.urls[0].url, vars, imports);
  goCode +=
    ", " +
    (request.data ? "data" : request.multipartUploads ? "form" : "nil") +
    ")\n";
  goCode += IF_ERR;

  if (request.headers) {
    for (const [headerName, headerValue] of request.headers || []) {
      let start = "\t";
      if (
        headerName.toLowerCase().toString() === "accept-encoding" &&
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
        repr(headerName, vars, imports) +
        ", " +
        reprMaybeBacktick(headerValue || new Word(), vars, imports) +
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
      "\treq.SetBasicAuth(" +
      repr(user, vars, imports) +
      ", " +
      repr(password, vars, imports) +
      ")\n";
  }

  goCode += "\tresp, err := client.Do(req)\n";
  goCode += IF_ERR;
  goCode += "\tdefer resp.Body.Close()\n";
  goCode += "\tbodyText, err := io.ReadAll(resp.Body)\n";
  goCode += IF_ERR;
  goCode += '\tfmt.Printf("%s\\n", bodyText)\n';
  goCode += "}";

  let preamble = "package main\n\n";
  preamble += "import (\n";
  for (const imp of Array.from(imports).sort()) {
    preamble += '\t"' + imp + '"\n';
  }
  preamble += ")\n\n";
  preamble += "func main() {\n";
  // TODO: sorts wrong when >9 commands
  for (const [name, expr] of Array.from(Object.entries(vars)).sort()) {
    preamble += "\t" + name + ", err := " + expr + "\n";
    preamble += IF_ERR;
  }
  if (Object.values(vars).length) {
    preamble += "\n";
  }

  return preamble + goCode + "\n";
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
