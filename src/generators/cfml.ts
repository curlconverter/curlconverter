import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import { esc as jsesc } from "./javascript/javascript.js";

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
  "range",
  "referer",
  "time-cond",
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
  "proxy-user",
  "proxy",
  "max-time",
]);

const repr = (s: string): string => {
  let quote: "'" | '"' = '"';
  if (s.includes('"') && !s.includes("'")) {
    quote = "'";
  }

  // TODO: CFML doesn't support backslash escapes such as \n
  s = jsesc(s, quote).replace(/#/g, "##");
  if (quote === '"') {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return "'" + s.replace(/'/g, "''") + "'";
};

export const _toCFML = (request: Request, warnings: Warnings = []): string => {
  let cfmlCode = "";

  cfmlCode += "httpService = new http();\n";
  cfmlCode += "httpService.setUrl(" + repr(request.url as string) + ");\n";
  cfmlCode += "httpService.setMethod(" + repr(request.method) + ");\n";

  if (request.cookies) {
    for (const [headerName, headerValue] of request.cookies) {
      cfmlCode +=
        'httpService.addParam(type="cookie", name=' +
        repr(headerName) +
        ", value=" +
        repr(headerValue) +
        ");\n";
    }
    util.deleteHeader(request, "Cookie");
  }

  if (request.headers && request.headers.length) {
    for (const [headerName, headerValue] of request.headers) {
      cfmlCode +=
        'httpService.addParam(type="header", name=' +
        repr(headerName) +
        ", value=" +
        repr(headerValue as string) +
        ");\n";
    }
  }

  if (request.timeout) {
    cfmlCode +=
      "httpService.setTimeout(" + (parseInt(request.timeout) || 0) + ");\n";
  }

  if (request.auth) {
    const [authUser, authPassword] = request.auth;
    cfmlCode += "httpService.setUsername(" + repr(authUser) + ");\n";
    cfmlCode += "httpService.setPassword(" + repr(authPassword || "") + ");\n";
  }

  if (request.proxy) {
    let proxy = request.proxy;
    let proxyPort = "1080";
    const proxyPart = (request.proxy as string).match(/:([0-9]+)/);
    if (proxyPart) {
      proxy = request.proxy.slice(0, proxyPart.index);
      proxyPort = proxyPart[1];
    }

    cfmlCode += "httpService.setProxyServer(" + repr(proxy) + ");\n";
    cfmlCode += "httpService.setProxyPort(" + proxyPort.trim() + ");\n";

    if (request.proxyAuth) {
      const [proxyUser, proxyPassword] = request.proxyAuth.split(/:(.*)/s, 2);
      cfmlCode += "httpService.setProxyUser(" + repr(proxyUser) + ");\n";
      cfmlCode +=
        "httpService.setProxyPassword(" + repr(proxyPassword || "") + ");\n";
    }
  }

  if (request.data || request.multipartUploads) {
    if (request.multipartUploads) {
      for (const m of request.multipartUploads) {
        if ("contentFile" in m) {
          cfmlCode +=
            'httpService.addParam(type="file", name=' +
            repr(m.name) +
            ', file="#expandPath(' +
            repr(m.contentFile) +
            ')#");\n';
        } else {
          cfmlCode +=
            'httpService.addParam(type="formfield", name=' +
            repr(m.name) +
            ", value=" +
            repr(m.content) +
            ");\n";
        }
      }
    } else if (
      !request.isDataRaw &&
      (request.data as string).charAt(0) === "@"
    ) {
      cfmlCode +=
        'httpService.addParam(type="body", value="#' +
        (request.isDataBinary ? "fileReadBinary" : "fileRead") +
        "(expandPath(" +
        repr((request.data as string).substring(1)) +
        '))#");\n';
    } else {
      cfmlCode +=
        'httpService.addParam(type="body", value=' +
        repr(request.data as string) +
        ");\n";
    }
  }

  cfmlCode += "\nresult = httpService.send().getPrefix();\n";
  cfmlCode += "writeDump(result);\n";

  return cfmlCode;
};

export const toCFMLWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const cfml = _toCFML(request, warnings);
  return [cfml, warnings];
};

export const toCFML = (curlCommand: string | string[]): string => {
  return toCFMLWarn(curlCommand)[0];
};
