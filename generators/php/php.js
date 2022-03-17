import * as util from '../../util.js'
import jsesc from 'jsesc'

const quote = str => jsesc(str, { quotes: 'single' })

export const _toPhp = request => {
  let phpCode = '<?php\n'
  phpCode += '$ch = curl_init();\n'
  phpCode += "curl_setopt($ch, CURLOPT_URL, '" + quote(request.url) + "');\n"
  phpCode += 'curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n'
  phpCode += "curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '" + request.method.toUpperCase() + "');\n"

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
      headersArrayCode += "    '" + quote(headerName) + "' => '" + quote(headerValue) + "',\n"
    }

    headersArrayCode += ']'
    phpCode += 'curl_setopt($ch, CURLOPT_HTTPHEADER, ' + headersArrayCode + ');\n'
  }

  if (request.cookies) {
    phpCode += "curl_setopt($ch, CURLOPT_COOKIE, '" + quote(util.serializeCookies(request.cookies)) + "');\n"
  }

  if (request.auth) {
    phpCode += 'curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);\n'
    phpCode += "curl_setopt($ch, CURLOPT_USERPWD, '" + quote(request.auth.join(':')) + "');\n"
  }

  if (request.data || request.multipartUploads) {
    let requestDataCode = ''
    if (request.multipartUploads) {
      requestDataCode = '[\n'
      for (const multipartKey in request.multipartUploads) {
        const multipartValue = request.multipartUploads[multipartKey]
        if (multipartValue.charAt(0) === '@') {
          requestDataCode += "    '" + quote(multipartKey) + "' => new CURLFile('" + quote(multipartValue.substring(1)) + "'),\n"
        } else {
          requestDataCode += "    '" + quote(multipartKey) + "' => '" + quote(multipartValue) + "',\n"
        }
      }
      requestDataCode += ']'
    } else if (request.isDataBinary) {
      requestDataCode += "file_get_contents('" + quote(request.data.substring(1)) + "')"
    } else {
      requestDataCode = "'" + quote(request.data) + "'"
    }
    phpCode += 'curl_setopt($ch, CURLOPT_POSTFIELDS, ' + requestDataCode + ');\n'
  }

  if (request.insecure) {
    phpCode += 'curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);\n'
    phpCode += 'curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);\n'
  }

  phpCode += '\n$response = curl_exec($ch);\n\n'

  phpCode += 'curl_close($ch);\n'
  return phpCode
}

export const toPhp = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toPhp(request)
}
