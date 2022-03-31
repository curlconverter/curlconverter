import * as util from '../../util.js'
import type { Request} from '../../util.js'

import jsesc from 'jsesc'

const quote = (str: string): string => jsesc(str, { quotes: 'single' })

export const _toPhp = (request: Request): string => {
  let cookieString
  if (util.hasHeader(request, 'cookie')) {
    cookieString = util.getHeader(request, 'cookie')
    util.deleteHeader(request, 'cookie')
  }

  let phpCode = '<?php\n'
  phpCode += '$ch = curl_init();\n'
  phpCode += "curl_setopt($ch, CURLOPT_URL, '" + quote(request.url) + "');\n"
  phpCode += 'curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n'
  phpCode += "curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '" + request.method + "');\n"

  if (request.headers || request.compressed) {
    let headersArrayCode = '[\n'

    if (request.compressed) {
      if (request.headers) {
        if (!util.hasHeader(request, 'accept-encoding')) {
          request.headers.push(['Accept-Encoding', 'gzip'])
        }
      } else {
        headersArrayCode += "    'Accept-Encoding' => 'gzip',\n"
      }
    }

    for (const [headerName, headerValue] of (request.headers || [])) {
      if (headerValue === null) {
        continue
      }
      headersArrayCode += "    '" + quote(headerName) + "' => '" + quote(headerValue) + "',\n"
    }

    headersArrayCode += ']'
    phpCode += 'curl_setopt($ch, CURLOPT_HTTPHEADER, ' + headersArrayCode + ');\n'
  }

  if (cookieString) {
    phpCode += "curl_setopt($ch, CURLOPT_COOKIE, '" + quote(cookieString) + "');\n"
  }

  if (request.auth) {
    const authType = request.digest ? 'CURLAUTH_DIGEST' : 'CURLAUTH_BASIC'
    phpCode += 'curl_setopt($ch, CURLOPT_HTTPAUTH, ' + authType + ');\n'
    phpCode += "curl_setopt($ch, CURLOPT_USERPWD, '" + quote(request.auth.join(':')) + "');\n"
  }

  if (request.data || request.multipartUploads) {
    let requestDataCode = ''
    if (request.multipartUploads) {
      requestDataCode = '[\n'
      for (const [multipartKey, multipartValue] of request.multipartUploads) {
        if (multipartValue.charAt(0) === '@') {
          requestDataCode += "    '" + quote(multipartKey) + "' => new CURLFile('" + quote(multipartValue.substring(1)) + "'),\n"
        } else {
          requestDataCode += "    '" + quote(multipartKey) + "' => '" + quote(multipartValue) + "',\n"
        }
      }
      requestDataCode += ']'
    } else if (request.isDataBinary && request.data.charAt(0) === '@') {
      requestDataCode = "file_get_contents('" + quote(request.data.substring(1)) + "')"
    } else {
      requestDataCode = "'" + quote(request.data) + "'"
    }
    phpCode += 'curl_setopt($ch, CURLOPT_POSTFIELDS, ' + requestDataCode + ');\n'
  }

  if (request.proxy) {
    phpCode += "curl_setopt($ch, CURLOPT_PROXY, '" + quote(request.proxy) + "');\n"
    if (request.proxyAuth) {
      phpCode += "curl_setopt($ch, CURLOPT_PROXYUSERPWD, '" + quote(request.proxyAuth) + "');\n"
    }
  }

  if (request.timeout) {
    phpCode += 'curl_setopt($ch, CURLOPT_TIMEOUT, ' + (parseInt(request.timeout) || 0) + ');\n'
  }

  if (request.followRedirects) {
    phpCode += 'curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);\n'
  }

  if (request.insecure) {
    phpCode += 'curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);\n'
    phpCode += 'curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);\n'
  }

  phpCode += '\n$response = curl_exec($ch);\n\n'

  phpCode += 'curl_close($ch);\n'
  return phpCode
}

export const toPhp = (curlCommand: string | string[]): string => {
  const request = util.parseCurlCommand(curlCommand)
  return _toPhp(request)
}
