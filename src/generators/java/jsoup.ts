import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

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
  //"form",
  //"form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
]);

const doubleQuotes = (str: string): string => jsesc(str, { quotes: "double" });

export const _toJavaJsoup = (
  request: Request,
  warnings: Warnings = []
): string => {
  let javaCode = "";

  javaCode += "import java.io.IOException;\n";
  javaCode += "import org.jsoup.Jsoup;\n";
  javaCode += "import org.jsoup.Connection;\n";
  javaCode += "\nclass Main {\n\n";

  javaCode += "\tpublic static void main(String[] args) throws IOException {\n";
  javaCode +=
    '\t\tConnection.Response response = Jsoup.connect("' + request.url + '")\n';

  let gzip = false;
  if (request.headers) {
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue;
      }

      if (headerName.toLowerCase() === "user-agent") {
        javaCode +=
          "\t\t.userAgent" + '("' + doubleQuotes(headerValue) + '")\n';
      } else if (headerName.toLowerCase() === "cookie") {
        let cookieValues = headerValue.split(";");
        for (const index in cookieValues) {
          javaCode +=
            '\t\t.cookie("' +
            cookieValues[index].split("=")[0].trim() +
            '", "' +
            cookieValues[index].split("=")[1].trim() +
            '")\n';
        }
      } else {
        javaCode +=
          '\t\t.header("' +
          headerName +
          '", "' +
          doubleQuotes(headerValue) +
          '")\n';
      }

      if (headerName.toLowerCase() === "accept-encoding" && headerValue) {
        gzip = headerValue.indexOf("gzip") !== -1;
      }
    }
  }

  if (request.auth) {
    javaCode +=
      '\t\tbyte[] message = ("' +
      doubleQuotes(request.auth.join(":")) +
      '").getBytes("UTF-8");\n';
    javaCode +=
      "\t\tString basicAuth = DatatypeConverter.printBase64Binary(message)\n";
    javaCode += '\t\t.header("Authorization", "Basic " + basicAuth)\n';
    javaCode += "\n";
  }

  if (request.data) {
    request.data = doubleQuotes(request.data);

    javaCode += '\t\t.requestBody("' + request.data + '")\n';
  }

  javaCode +=
    "\t\t.method(org.jsoup.Connection.Method." + request.method + ")\n";
  javaCode += "\t\t.ignoreContentType(true)\n";
  javaCode += "\t\t.timeout(30000)\n";
  javaCode += "\t\t.execute();\n\n";
  javaCode += "\t\tSystem.out.println(response.parse();\n";

  javaCode += "\t}\n";
  javaCode += "}";

  return javaCode + "\n";
};
export const toJavaJsoupWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const java = _toJavaJsoup(request, warnings);
  return [java, warnings];
};

export const toJavaJsoup = (curlCommand: string | string[]): string => {
  return toJavaJsoupWarn(curlCommand)[0];
};
