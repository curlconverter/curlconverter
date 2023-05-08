import { Word, joinWords } from "../../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../../parse.js";
import type { Request, Warnings } from "../../parse.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  // TODO
  // "form",
  // "form-string",
]);

// https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.10.6
// https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.3
// Also used for Clojure
const regexEscape = /"|\\|\p{C}|\p{Z}/gu;
const regexDigit = /[0-9]/; // it's 0-7 actually but that would generate confusing code
export function reprStr(s: string): string {
  return (
    '"' +
    s.replace(regexEscape, (c: string, index: number, string: string) => {
      switch (c) {
        case " ":
          return " ";
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

export function repr(w: Word, imports: Set<string>): string {
  const args: string[] = [];
  for (const t of w.tokens) {
    if (typeof t === "string") {
      args.push(reprStr(t));
    } else if (t.type === "variable") {
      args.push("System.getenv(" + reprStr(t.value) + ")");
      imports.add("java.lang.System");
    } else {
      args.push("exec(" + reprStr(t.value) + ")");
      imports.add("java.lang.Runtime");
      imports.add("java.util.Scanner");
    }
  }
  return args.join(" + ");
}

export function _toJavaHttpUrlConnection(
  requests: Request[],
  warnings: Warnings = []
): string {
  const request = getFirst(requests, warnings);

  const imports = new Set<string>([
    "java.io.IOException",
    "java.io.InputStream",
    "java.net.HttpURLConnection",
    "java.net.URL",
    "java.util.Scanner",
  ]);

  let javaCode = "";

  javaCode +=
    "        URL url = new URL(" + repr(request.urls[0].url, imports) + ");\n";
  javaCode +=
    "        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();\n";
  javaCode +=
    "        httpConn.setRequestMethod(" +
    repr(request.urls[0].method, imports) +
    ");\n\n";

  let gzip = false;
  if (request.headers.length) {
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue;
      }
      javaCode +=
        "        httpConn.setRequestProperty(" +
        repr(headerName, imports) +
        ", " +
        repr(headerValue, imports) +
        ");\n";
      if (
        headerName.toLowerCase().toString() === "accept-encoding" &&
        headerValue
      ) {
        gzip = headerValue.indexOf("gzip") !== -1;
      }
    }
    javaCode += "\n";
  }

  if (request.urls[0].auth) {
    javaCode +=
      "        byte[] message = (" +
      repr(joinWords(request.urls[0].auth, ":"), imports) +
      ').getBytes("UTF-8");\n';
    javaCode +=
      "        String basicAuth = DatatypeConverter.printBase64Binary(message);\n";
    javaCode +=
      '        httpConn.setRequestProperty("Authorization", "Basic " + basicAuth);\n';
    javaCode += "\n";

    imports.add("javax.xml.bind.DatatypeConverter");
  }

  if (request.data) {
    javaCode += "        httpConn.setDoOutput(true);\n";
    javaCode +=
      "        OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());\n";
    javaCode += "        writer.write(" + repr(request.data, imports) + ");\n";
    javaCode += "        writer.flush();\n";
    javaCode += "        writer.close();\n";
    javaCode += "        httpConn.getOutputStream().close();\n";
    javaCode += "\n";

    imports.add("java.io.OutputStreamWriter");
  }

  javaCode +=
    "        InputStream responseStream = httpConn.getResponseCode() / 100 == 2\n";
  javaCode += "                ? httpConn.getInputStream()\n";
  javaCode += "                : httpConn.getErrorStream();\n";
  if (gzip) {
    javaCode += '        if ("gzip".equals(httpConn.getContentEncoding())) {\n';
    javaCode +=
      "            responseStream = new GZIPInputStream(responseStream);\n";
    javaCode += "        }\n";
  }
  javaCode +=
    '        Scanner s = new Scanner(responseStream).useDelimiter("\\\\A");\n';
  javaCode += '        String response = s.hasNext() ? s.next() : "";\n';
  javaCode += "        System.out.println(response);\n";

  javaCode += "    }\n";
  javaCode += "}";

  let preambleCode = "";
  for (const imp of Array.from(imports).sort()) {
    preambleCode += "import " + imp + ";\n";
  }
  if (imports.size) {
    preambleCode += "\n";
  }

  preambleCode += "class Main {\n";
  preambleCode += "\n";
  if (imports.has("java.lang.Runtime")) {
    // Helper function that runs a bash command and always returns a string
    preambleCode += "    public static String exec(String cmd) {\n";
    preambleCode += "        try {\n";
    preambleCode += "            Process p = Runtime.getRuntime().exec(cmd);\n";
    preambleCode += "            p.waitFor();\n";
    preambleCode +=
      '            Scanner s = new Scanner(p.getInputStream()).useDelimiter("\\\\A");\n';
    preambleCode += '            return s.hasNext() ? s.next() : "";\n';
    preambleCode += "        } catch (Exception e) {\n";
    preambleCode += '            return "";\n';
    preambleCode += "        }\n";
    preambleCode += "    }\n";
    preambleCode += "\n";
  }
  preambleCode +=
    "    public static void main(String[] args) throws IOException {\n";

  return preambleCode + javaCode + "\n";
}
export function toJavaHttpUrlConnectionWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const java = _toJavaHttpUrlConnection(requests, warnings);
  return [java, warnings];
}

export function toJavaHttpUrlConnection(
  curlCommand: string | string[]
): string {
  return toJavaHttpUrlConnectionWarn(curlCommand)[0];
}
