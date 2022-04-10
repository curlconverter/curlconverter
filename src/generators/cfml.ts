import * as util from "../util.js";
import type { Request } from "../util.js";

import jsesc from "jsesc";

const quote = (str: string): string => {
  return jsesc(str, { quotes: "single" }).replace(/"/g, '""');
};

export const _toCFML = (request: Request): string => {
  let cfmlCode = "";

  cfmlCode += "httpService = new http();\n";
  cfmlCode += 'httpService.setUrl("' + quote(request.url as string) + '");\n';
  cfmlCode += 'httpService.setMethod("' + quote(request.method) + '");\n';

  if (request.cookies) {
    for (const [headerName, headerValue] of request.cookies) {
      cfmlCode +=
        'httpService.addParam(type="cookie", name="' +
        quote(headerName) +
        '", value="' +
        quote(headerValue) +
        '");\n';
    }
    util.deleteHeader(request, "Cookie");
  }

  if (request.headers && request.headers.length) {
    for (const [headerName, headerValue] of request.headers) {
      cfmlCode +=
        'httpService.addParam(type="header", name="' +
        quote(headerName) +
        '", value="' +
        quote(headerValue as string) +
        '");\n';
    }
  }

  if (request.timeout) {
    cfmlCode +=
      "httpService.setTimeout(" + (parseInt(request.timeout) || 0) + ");\n";
  }

  if (request.auth) {
    const [authUser, authPassword] = request.auth;
    cfmlCode += 'httpService.setUsername("' + quote(authUser) + '");\n';
    cfmlCode +=
      'httpService.setPassword("' + quote(authPassword || "") + '");\n';
  }

  if (request.proxy) {
    let proxy = request.proxy;
    let proxyPort = "1080";
    const proxyPart = (request.proxy as string).match(/:([0-9]+)/);
    if (proxyPart) {
      proxy = request.proxy.slice(0, proxyPart.index);
      proxyPort = proxyPart[1];
    }

    cfmlCode += 'httpService.setProxyServer("' + quote(proxy) + '");\n';
    cfmlCode += "httpService.setProxyPort(" + quote(proxyPort) + ");\n";

    if (request.proxyAuth) {
      const [proxyUser, proxyPassword] = request.proxyAuth.split(/:(.*)/s, 2);
      cfmlCode += 'httpService.setProxyUser("' + quote(proxyUser) + '");\n';
      cfmlCode +=
        'httpService.setProxyPassword("' + quote(proxyPassword || "") + '");\n';
    }
  }

  if (request.data || request.multipartUploads) {
    if (request.multipartUploads) {
      for (const [multipartKey, multipartValue] of request.multipartUploads) {
        if (multipartValue.charAt(0) === "@") {
          cfmlCode +=
            'httpService.addParam(type="file", name="' +
            quote(multipartKey) +
            '", file="#expandPath("' +
            quote(multipartValue.substring(1)) +
            '")#");\n';
        } else {
          cfmlCode +=
            'httpService.addParam(type="formfield", name="' +
            quote(multipartKey) +
            '", value="' +
            quote(multipartValue) +
            '");\n';
        }
      }
    } else if (
      !request.isDataRaw &&
      (request.data as string).charAt(0) === "@"
    ) {
      cfmlCode +=
        'httpService.addParam(type="body", value="#' +
        (request.isDataBinary ? "fileReadBinary" : "fileRead") +
        '(expandPath("' +
        quote((request.data as string).substring(1)) +
        '"))#");\n';
    } else {
      cfmlCode +=
        'httpService.addParam(type="body", value="' +
        quote(request.data as string) +
        '");\n';
    }
  }

  cfmlCode += "\nresult = httpService.send().getPrefix();\n";
  cfmlCode += "writeDump(result);\n";

  return cfmlCode;
};

export const toCFML = (curlCommand: string | string[]): string => {
  const request = util.parseCurlCommand(curlCommand);
  return _toCFML(request);
};
