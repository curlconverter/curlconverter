import * as util from "../util.js";
import type { Request } from "../util.js";

import jsesc from "jsesc";

const quote = function(str){
  return jsesc(str, { quotes: 'single' }).replace(/\"/g,'""');
}

export const _toCFML = (request: Request): string => {

  let cfmlCode = ''

  cfmlCode += 'httpService = new http();\n'
  cfmlCode += 'httpService.setUrl("' + request.url + '");\n'
  cfmlCode += 'httpService.setCharset("utf-8");\n'

  cfmlCode += 'httpService.setMethod("' + request.method.toUpperCase() + '");\n'

  if (request.headers) {
    for (const [headerName, headerValue] of request.headers) {
      cfmlCode += 'httpService.addParam(type="header", name="' + headerName + '", value="' + quote(headerValue) + '");\n'
    }
  }

  if (request.timeout) {
    cfmlCode += 'httpService.setTimeout("' + (parseInt(request.timeout) || 0) + '");\n'
  }

  if (request.proxy) {
    const proxyPort = (request.proxy as string).match(/:([0-9]{2,})/)[1]
    const proxy = request.proxy.replace(':' + proxyPort,"")

    cfmlCode += 'httpService.setProxyServer("' + proxy + '");\n'
    cfmlCode += 'httpService.setProxyPort("' + proxyPort + '");\n'

    if (request.proxyAuth) {
      const proxyauth = request.proxyAuth.split(':')
      cfmlCode += 'httpService.setProxyUser("' + proxyauth[0] + '");\n'
      cfmlCode += 'httpService.setProxyPassword("' + proxyauth[1] + '");\n'
    }
  }

  if (request.cookies) {
    for (const [headerName, headerValue] of request.cookies) {
      cfmlCode += 'httpService.addParam(type="cookie",name="' + headerName + '", value="' + quote(headerValue) + '");\n'
    }
  }

  if (request.auth) {
    cfmlCode += 'httpService.addParam(type="header",name="Authorization", value="' + quote(request.auth.join(':')) + '");\n'
  }


  if (request.data || request.multipartUploads) {
    if (request.multipartUploads) {
      for (const [multipartKey, multipartValue] of request.multipartUploads) {
        if (multipartValue.charAt(0) === '@') {
          cfmlCode += 'httpService.addParam(type="file" ,name="' + multipartKey + '", file="' + quote(multipartValue.substring(1)) + '");\n'
        } else {
          cfmlCode += 'httpService.addParam(type="formfield", name="' + multipartKey + '", value="' + quote(multipartValue) + '");\n'
        }
      }
    } else if (request.isDataBinary && (request.data as string).charAt(0) === '@') {
      cfmlCode += 'httpService.addParam(type="body", value="' +  quote((request.data as string).substring(1))  + '");\n'
    } else {
      cfmlCode += 'httpService.addParam(type="body", value="' +  quote(request.data) + '");\n'
    }

  }

  cfmlCode += 'result = httpService.send().getPrefix();\n'
  cfmlCode += 'writeDump(result);\n'

  return cfmlCode
}

export const toCFML = (curlCommand: string | string[]): string => {
  const request = util.parseCurlCommand(curlCommand);
  return _toCFML(request);
};
