import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import jsesc from "jsesc";

const supportedArgs = new Set([
  "url",
  "request",
  "user-agent",
  "cookie",
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "referer",
  // TODO
  // "form",
  // "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
]);

const doubleQuotes = (str: string): string => jsesc(str, { quotes: "double" });

export const _toJava = (request: Request, warnings: Warnings = []): string => {
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
  javaCode += '\t\tURL url = new URL("' + request.url + '");\n';
  javaCode +=
    "\t\tHttpURLConnection httpConn = (HttpURLConnection) url.openConnection();\n";
  javaCode += '\t\thttpConn.setRequestMethod("' + request.method + '");\n\n';

  let gzip = false;
  if (request.headers) {
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue;
      }
      javaCode +=
        '\t\thttpConn.setRequestProperty("' +
        headerName +
        '", "' +
        doubleQuotes(headerValue) +
        '");\n';
      if (headerName.toLowerCase() === "accept-encoding" && headerValue) {
        gzip = headerValue.indexOf("gzip") !== -1;
      }
    }
    javaCode += "\n";
  }

  if (request.auth) {
    javaCode +=
      '\t\tbyte[] message = ("' +
      doubleQuotes(request.auth.join(":")) +
      '").getBytes("UTF-8");\n';
    javaCode +=
      "\t\tString basicAuth = DatatypeConverter.printBase64Binary(message);\n";
    javaCode +=
      '\t\thttpConn.setRequestProperty("Authorization", "Basic " + basicAuth);\n';
    javaCode += "\n";
  }

  if (request.data) {
    request.data = doubleQuotes(request.data);
    javaCode += "\t\thttpConn.setDoOutput(true);\n";
    javaCode +=
      "\t\tOutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());\n";
    javaCode += '\t\twriter.write("' + request.data + '");\n';
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
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const java = _toJava(request, warnings);
  return [java, warnings];
};

export const toJava = (curlCommand: string | string[]): string => {
  return toJavaWarn(curlCommand)[0];
};
