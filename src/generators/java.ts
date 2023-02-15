import { Word, joinWords } from "../shell/Word.js";
import { parseCurlCommand, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  // TODO
  // "form",
  // "form-string",
]);

// https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.10.6
// https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.3
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

type Vars = { [key: string]: string };
function repr(w: Word, imports: Set<string>): string {
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

export function _toJava(requests: Request[], warnings: Warnings = []): string {
  const request = getFirst(requests, warnings);

  const imports = new Set<string>([
    "java.io.IOException",
    "java.io.InputStream",
    "java.net.HttpURLConnection",
    "java.net.URL",
    "java.util.Scanner",
  ]);
  const vars: Vars = {};
  let javaCode = "";

  javaCode +=
    "\t\tURL url = new URL(" + repr(request.urls[0].url, imports) + ");\n";
  javaCode +=
    "\t\tHttpURLConnection httpConn = (HttpURLConnection) url.openConnection();\n";
  javaCode +=
    "\t\thttpConn.setRequestMethod(" +
    repr(request.urls[0].method, imports) +
    ");\n\n";

  let gzip = false;
  if (request.headers.length) {
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue;
      }
      javaCode +=
        "\t\thttpConn.setRequestProperty(" +
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
      "\t\tbyte[] message = (" +
      repr(joinWords(request.urls[0].auth, ":"), imports) +
      ').getBytes("UTF-8");\n';
    javaCode +=
      "\t\tString basicAuth = DatatypeConverter.printBase64Binary(message);\n";
    javaCode +=
      '\t\thttpConn.setRequestProperty("Authorization", "Basic " + basicAuth);\n';
    javaCode += "\n";

    imports.add("javax.xml.bind.DatatypeConverter");
  }

  if (request.data) {
    javaCode += "\t\thttpConn.setDoOutput(true);\n";
    javaCode +=
      "\t\tOutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());\n";
    javaCode += "\t\twriter.write(" + repr(request.data, imports) + ");\n";
    javaCode += "\t\twriter.flush();\n";
    javaCode += "\t\twriter.close();\n";
    javaCode += "\t\thttpConn.getOutputStream().close();\n";
    javaCode += "\n";

    imports.add("java.io.OutputStreamWriter");
  }

  javaCode +=
    "\t\tInputStream responseStream = httpConn.getResponseCode() / 100 == 2\n";
  javaCode += "\t\t\t\t? httpConn.getInputStream()\n";
  javaCode += "\t\t\t\t: httpConn.getErrorStream();\n";
  if (gzip) {
    javaCode += '\t\tif ("gzip".equals(httpConn.getContentEncoding())) {\n';
    javaCode += "\t\t\tresponseStream = new GZIPInputStream(responseStream);\n";
    javaCode += "\t\t}\n";
  }
  javaCode +=
    '\t\tScanner s = new Scanner(responseStream).useDelimiter("\\\\A");\n';
  javaCode += '\t\tString response = s.hasNext() ? s.next() : "";\n';
  javaCode += "\t\tSystem.out.println(response);\n";

  javaCode += "\t}\n";
  javaCode += "}";

  let preambleCode = "";
  for (const imp of Array.from(imports).sort()) {
    preambleCode += "import " + imp + ";\n";
  }
  if (imports.size) {
    preambleCode += "\n";
  }

  for (const [name, expr] of Array.from(Object.entries(vars)).sort()) {
    preambleCode += "\t" + name + ", err := " + expr + "\n";
  }
  for (const varExpr of Array.from(Object.values(vars)).sort()) {
    preambleCode += "\t" + varExpr + "\n";
  }
  if (Object.values(vars).length) {
    preambleCode += "\n";
  }

  preambleCode += "class Main {\n";
  preambleCode += "\n";
  if (imports.has("java.lang.Runtime")) {
    // Helper function that runs a bash command and always returns a string
    preambleCode += "\tpublic static String exec(String cmd) {\n";
    preambleCode += "\t\ttry {\n";
    preambleCode += "\t\t\tProcess p = Runtime.getRuntime().exec(cmd);\n";
    preambleCode += "\t\t\tp.waitFor();\n";
    preambleCode +=
      '\t\t\tScanner s = new Scanner(p.getInputStream()).useDelimiter("\\\\A");\n';
    preambleCode += '\t\t\treturn s.hasNext() ? s.next() : "";\n';
    preambleCode += "\t\t} catch (Exception e) {\n";
    preambleCode += '\t\t\treturn "";\n';
    preambleCode += "\t\t}\n";
    preambleCode += "\t}\n";
    preambleCode += "\n";
  }
  preambleCode +=
    "\tpublic static void main(String[] args) throws IOException {\n";

  return preambleCode + javaCode + "\n";
}
export function toJavaWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parseCurlCommand(curlCommand, supportedArgs, warnings);
  const java = _toJava(requests, warnings);
  return [java, warnings];
}

export function toJava(curlCommand: string | string[]): string {
  return toJavaWarn(curlCommand)[0];
}
