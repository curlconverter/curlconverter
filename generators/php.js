import * as util from '../util.js'
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
      if (typeof request.headers === 'object') {
        let isAcceptEncodingSet = false
        for (const headerName in request.headers) {
          if (headerName.toLowerCase() === 'accept-encoding') {
            isAcceptEncodingSet = true
            break
          }
        }
        if (!isAcceptEncodingSet) { request.headers['Accept-Encoding'] = 'gzip' }
      } else {
        headersArrayCode += "\t'Accept-Encoding' => 'gzip',\n"
      }
    }

    for (const headerName in request.headers) {
      headersArrayCode += "\t'" + quote(headerName) + "' => '" + quote(request.headers[headerName]) + "',\n"
    }

    headersArrayCode += ']'
    phpCode += 'curl_setopt($ch, CURLOPT_HTTPHEADER, ' + headersArrayCode + ');\n'
  }

  if (request.cookies) {
    phpCode += "curl_setopt($ch, CURLOPT_COOKIE, '" + quote(util.serializeCookies(request.cookies)) + "');\n"
  }

  if (request.auth) {
    phpCode += 'curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);\n'
    phpCode += "curl_setopt($ch, CURLOPT_USERPWD, '" + quote(request.auth) + "');\n"
  }

  if (request.data) {
    phpCode += "curl_setopt($ch, CURLOPT_POSTFIELDS, '" + quote(request.data) + "');\n"
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
