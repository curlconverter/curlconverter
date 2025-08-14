import { Word, eq } from "../../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../../parse.js";
import type { Request, Warnings } from "../../parse.js";
import { parseQueryString } from "../../Query.js";

export const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "max-time",
  "connect-timeout",
  "location",
  "location-trusted",
  "upload-file",
  "form",
  "form-string",
]);

// The only difference from Java is that in Kotlin the $ needs to be escaped
// https://kotlinlang.org/docs/java-to-kotlin-idioms-strings.html#concatenate-strings
// https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.10.6
// https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.3
const regexEscape = /\$|"|\\|\p{C}|[^ \P{Z}]/gu;
const regexDigit = /[0-9]/; // it's 0-7 actually but that would generate confusing code
export function reprStr(s: string): string {
  return (
    '"' +
    s.replace(regexEscape, (c: string, index: number, string: string) => {
      switch (c) {
        case "$":
          return "\\$";
        case "\\":
          return "\\\\";
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
        case '"':
          return '\\"';
      }

      if (c.length === 2) {
        const first = c.charCodeAt(0);
        const second = c.charCodeAt(1);
        return (
          "\\u" +
          first.toString(16).padStart(4, "0") +
          "\\u" +
          second.toString(16).padStart(4, "0")
        );
      }

      if (c === "\0" && !regexDigit.test(string.charAt(index + 1))) {
        return "\\0";
      }
      return "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
    }) +
    '"'
  );
}

// TODO: anything different here?
export function repr(w: Word, imports: Set<string>): string {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      args.push("System.getenv(" + reprStr(t.value) + ') ?: ""');
      imports.add("java.lang.System");
    } else {
      args.push("exec(" + reprStr(t.value) + ")");
      imports.add("java.lang.Runtime");
      imports.add("java.util.Scanner");
    }
  }
  return args.join(" + ");
}

export function _toKotlinKtor(
  requests: Request[],
  warnings: Warnings = [],
): string {
  const request = getFirst(requests, warnings);
  const url = request.urls[0];

  const imports = new Set<string>([
    "io.ktor.client.HttpClient",
    "io.ktor.http.isSuccess",
    "io.ktor.client.statement.bodyAsText",
    "kotlinx.coroutines.runBlocking",
  ]);

  let kotlinCode = "";

  kotlinCode += "val client = HttpClient";
  const clientLines = [];

  if (request.timeout || request.connectTimeout) {
    imports.add("io.ktor.client.plugins.HttpTimeout");
    clientLines.push("    install(HttpTimeout) {\n");

    if (request.timeout) {
      clientLines.push(
        "        requestTimeoutMillis = " +
          (parseInt(request.timeout.toString()) * 1000).toString() +
          "\n",
      );
    }

    if (request.connectTimeout) {
      clientLines.push(
        "        connectTimeoutMillis = " +
          (parseInt(request.connectTimeout.toString()) * 1000).toString() +
          "\n",
      );
    }

    clientLines.push("    }\n");
  }

  if (request.followRedirects === false) {
    clientLines.push("    followRedirects = false\n");
  }

  if (url.auth) {
    clientLines.push(
      "    // requires the io.ktor:ktor-client-auth dependency\n",
    );
    imports.add("io.ktor.client.plugins.auth.Auth");
    imports.add("io.ktor.client.plugins.auth.providers.BasicAuthCredentials");
    imports.add("io.ktor.client.plugins.auth.providers.basic");

    const [name, password] = url.auth;
    clientLines.push("    install(Auth) {\n");
    clientLines.push("        basic {\n");
    clientLines.push("            credentials {\n");
    clientLines.push(
      "                BasicAuthCredentials(" +
        repr(name, imports) +
        ", " +
        repr(password, imports) +
        ")\n",
    );
    clientLines.push("            }\n");
    clientLines.push("            realm = \"Access to the '/' path\"");
    clientLines.push("        }\n");
    clientLines.push("    }\n");

    if (request.authType !== "basic") {
      warnings.push([
        "ktor-unsupported-auth-type",
        "Ktor doesn't support auth type " + request.authType,
      ]);
    }
  }

  if (clientLines.length) {
    kotlinCode += "{\n";
    for (const line of clientLines) {
      kotlinCode += line;
    }
    kotlinCode += "}";
  } else {
    kotlinCode += "()";
  }
  kotlinCode += "\n\n";

  const body = [];

  if (url.uploadFile) {
    if (eq(url.uploadFile, "-") || eq(url.uploadFile, ".")) {
      warnings.push(["upload-stdin", "uploading from stdin isn't supported"]);
    }
    body.push("File(" + repr(url.uploadFile, imports) + ").readChannel()");
    imports.add("java.io.File");
    imports.add("io.ktor.util.cio.readChannel");
  } else if (request.multipartUploads) {
    body.push("\n    MultiPartFormDataContent(\n" + "        formData {\n");

    for (const m of request.multipartUploads) {
      const args = [repr(m.name, imports)];
      if ("content" in m) {
        args.push(repr(m.content, imports));
      } else if ("filename" in m && m.filename) {
        args.push(repr(m.filename, imports));
        args.push(
          "InputProvider { File(" +
            repr(m.contentFile, imports) +
            ").inputStream().asInput().buffered() }", // TODO: content type here
        );
        imports.add("java.io.File");
        imports.add("io.ktor.utils.io.streams.asInput");
        imports.add("kotlinx.io.buffered");
      }
      body.push("            append(" + args.join(", ") + ")\n");
    }

    body.push("        }\n" + "    )\n");
  } else if (
    request.dataArray &&
    request.dataArray.length === 1 &&
    !(request.dataArray[0] instanceof Word) &&
    !request.dataArray[0].name
  ) {
    // TODO: surely --upload-file and this can't be identical,
    // doesn't this ignore url encoding?
    body.push(
      "File(" +
        repr(request.dataArray[0].filename, imports) +
        ").readChannel()",
    );
    imports.add("java.io.File");
    imports.add("io.ktor.util.cio.readChannel");
  } else if (request.data) {
    if (
      request.headers.getContentType() === "application/x-www-form-urlencoded"
    ) {
      const [queryList] = parseQueryString(request.data);
      if (!queryList) {
        body.push(repr(request.data, imports));
      } else {
        body.push("\n    FormDataContent(\n" + "        formData {\n");
        for (const [name, value] of queryList) {
          body.push(
            "            append(" +
              repr(name, imports) +
              ", " +
              repr(value, imports) +
              ")\n",
          );
        }
        body.push("        }\n" + "    )\n");
        imports.add("io.ktor.client.request.forms.FormDataContent");
      }
    } else {
      body.push(repr(request.data, imports));
    }
  }

  kotlinCode += "runBlocking {\n";

  kotlinCode += "    val response = client";
  const methodStr = url.method.toString().toLowerCase();

  imports.add("io.ktor.client.request." + methodStr);
  kotlinCode += "." + methodStr + "(" + repr(url.url, imports) + ")";

  if (request.headers.length || body.length) kotlinCode += " {\n";

  if (body.length) {
    imports.add("io.ktor.client.request.setBody");
    kotlinCode += "        setBody(" + body.join("    ") + ")\n";
  }

  if (request.headers.length) {
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue;
      }
      kotlinCode +=
        "        header(" +
        repr(headerName, imports) +
        ", " +
        repr(headerValue, imports) +
        ")\n";
    }

    imports.add("io.ktor.client.request.header");
  }

  if (request.headers.length || body.length) kotlinCode += "    }";

  kotlinCode +=
    '\n    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")\n\n';
  kotlinCode += "    println(response.bodyAsText())\n";

  kotlinCode += "}\n";

  let preambleCode = "";
  for (const imp of Array.from(imports).sort()) {
    preambleCode += "import " + imp + "\n";
  }
  if (imports.size) {
    preambleCode += "\n";
  }

  // TODO
  if (imports.has("java.lang.Runtime")) {
    // Helper function that runs a bash command and always returns a string
    preambleCode += "fun exec(cmd: String): String {\n";
    preambleCode += "  try {\n";
    preambleCode += "    val p = Runtime.getRuntime().exec(cmd)\n";
    preambleCode += "    p.waitFor()\n";
    preambleCode +=
      '    val s = Scanner(p.getInputStream()).useDelimiter("\\\\A")\n';
    preambleCode += '    return s.hasNext() ? s.next() : ""\n';
    preambleCode += "  } catch (Exception e) {\n";
    preambleCode += '    return ""\n';
    preambleCode += "  }\n";
    preambleCode += "}\n";
    preambleCode += "\n";
  }

  return preambleCode + kotlinCode;
}
export function toKotlinKtorWarn(
  curlCommand: string | string[],
  warnings: Warnings = [],
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const kotlin = _toKotlinKtor(requests, warnings);
  return [kotlin, warnings];
}

export function toKotlinKtor(curlCommand: string | string[]): string {
  return toKotlinKtorWarn(curlCommand)[0];
}
