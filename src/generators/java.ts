import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  // TODO
  // "form",
  // "form-string",
]);

// https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.10.6
// https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.3
const regexEscape = /"|\\|\p{C}|\p{Z}/gu;
const regexDigit = /[0-9]/; // it's 0-7 actually but that would generate confusing code
export const repr = (s: string): string =>
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
  '"';

export const _toJava = (
  requests: Request[],
  warnings: Warnings = []
): string => {
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
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  let javaCode = "";

  if (request.auth) {
    javaCode += "import javax.xml.bind.DatatypeConverter;\n";
  }
  javaCode += "import java.io.IOException;\n";
  javaCode += "import java.io.InputStream;\n";
  if (request.data) {
    javaCode += "import java.io.OutputStreamWriter;\n";
  }

  javaCode += "import java.net.HttpURLConnection;\n";

  javaCode += "import java.net.URL;\n";
  javaCode += "import java.util.Scanner;\n";

  javaCode += "\nclass Main {\n\n";

  javaCode += "\tpublic static void main(String[] args) throws IOException {\n";
  javaCode += "\t\tURL url = new URL(" + repr(request.url) + ");\n";
  javaCode +=
    "\t\tHttpURLConnection httpConn = (HttpURLConnection) url.openConnection();\n";
  javaCode +=
    "\t\thttpConn.setRequestMethod(" + repr(request.method) + ");\n\n";

  let gzip = false;
  if (request.headers) {
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue;
      }
      javaCode +=
        "\t\thttpConn.setRequestProperty(" +
        repr(headerName) +
        ", " +
        repr(headerValue) +
        ");\n";
      if (headerName.toLowerCase() === "accept-encoding" && headerValue) {
        gzip = headerValue.indexOf("gzip") !== -1;
      }
    }
    javaCode += "\n";
  }

  if (request.auth) {
    javaCode +=
      "\t\tbyte[] message = (" +
      repr(request.auth.join(":")) +
      ').getBytes("UTF-8");\n';
    javaCode +=
      "\t\tString basicAuth = DatatypeConverter.printBase64Binary(message);\n";
    javaCode +=
      '\t\thttpConn.setRequestProperty("Authorization", "Basic " + basicAuth);\n';
    javaCode += "\n";
  }

  if (request.data) {
    javaCode += "\t\thttpConn.setDoOutput(true);\n";
    javaCode +=
      "\t\tOutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());\n";
    javaCode += "\t\twriter.write(" + repr(request.data) + ");\n";
    javaCode += "\t\twriter.flush();\n";
    javaCode += "\t\twriter.close();\n";
    javaCode += "\t\thttpConn.getOutputStream().close();\n";
    javaCode += "\n";
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

  return javaCode + "\n";
};
export const toJavaWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const java = _toJava(requests, warnings);
  return [java, warnings];
};

export const toJava = (curlCommand: string | string[]): string => {
  return toJavaWarn(curlCommand)[0];
};
