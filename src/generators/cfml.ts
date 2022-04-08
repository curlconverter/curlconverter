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
  }

  if (request.cookie) {
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
      'httpService.setTimeout(' + (parseInt(request.timeout) || 0) + ');\n';
  }

  if (request.proxy) {
    const proxyPart = (request.proxy as string).match(/:([0-9]{2,})/);
    const proxyPort = proxyPart && proxyPart.length > 1 ? proxyPart[1] : "";
    const proxy = request.proxy.replace(":" + proxyPort, "");

    cfmlCode += 'httpService.setProxyServer("' + quote(proxy) + '");\n';
    cfmlCode += 'httpService.setProxyPort("' + quote(proxyPort) + '");\n';

    if (request.proxyAuth) {
      const proxyauth = request.proxyAuth.split(":");
      cfmlCode += 'httpService.setProxyUser("' + quote(proxyauth[0]) + '");\n';
      cfmlCode +=
        'httpService.setProxyPassword("' + quote(proxyauth[1]) + '");\n';
    }
  }

  if (request.auth) {
    cfmlCode +=
      'httpService.addParam(type="header", name="Authorization", value="' +
      quote(request.auth.join(":")) +
      '");\n';
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
      request.isDataBinary &&
      (request.data as string).charAt(0) === "@"
    ) {
      cfmlCode +=
        'httpService.addParam(type="body", value="#fileReadBinary(expandPath("' +
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
