var util = require('../util')

var toRust = function (curlCommand) {
  var request = util.parseCurlCommand(curlCommand)
  var rustCode = 'extern crate reqwest;\n'

  if (request.headers || request.cookies) {
    rustCode += 'use reqwest::headers::*;\n'
  }
  if (request.multipartUploads) {
    rustCode += 'use reqwest::multipart;\n'
  }

  rustCode += '\nfn main() -> Result<(), reqwest::Error> {\n'

  if (request.headers || request.cookies) {
    rustCode += '    let mut headers = HeaderMap::new();\n'

    for (var header in request.headers) {
      rustCode += '    headers.insert(' + header.replace(/-/g, '_').toUpperCase() + ', "' + request.headers[header] + '".parse().unwrap());\n'
    }

    for (var cookie in request.cookies) {
      rustCode += '    headers.insert(COOKIE, "' + cookie + '".parse().unwrap());\n'
    }
  }

  if (request.multipartUploads) {
    rustCode += '    let form = multipart::Form::new()'

    for (var part in request.multipartUploads) {
      if (part === 'image' || part === 'file') {
        rustCode += '\n        .file("' + part + '", "' + request.multipartUploads[part].split('@')[1] + '")?'
      } else {
        rustCode += '\n        .text("' + part + '", "' + request.multipartUploads[part] + '")'
      }
    }
    rustCode += ';\n'
  }

  rustCode += '\n    let res = reqwest::Client::new()\n'

  switch (request.method) {
    case 'get':
      rustCode += '        .get("' + request.url + '")'
      break
    case 'post':
      rustCode += '        .post("' + request.url + '")'
      break
    case 'put':
      rustCode += '        .put("' + request.url + '")'
      break
    case 'head':
      rustCode += '        .head("' + request.url + '")'
      break
    case 'patch':
      rustCode += '        .patch("' + request.url + '")'
      break
    case 'delete':
      rustCode += '        .delete("' + request.url + '")'
      break
    default:
      break
  }
  rustCode += '\n'

  if (request.auth) {
    var splitAuth = request.auth.split(':')
    var user = splitAuth[0] || ''
    var password = splitAuth[1] || ''
    rustCode += '        .basic_auth("' + user + '", Some("' + password + '"))\n'
  }

  if (request.headers) {
    rustCode += '        .headers(headers)\n'
  }

  if (request.multipartUploads) {
    rustCode += '        .multipart(form)\n'
  }

  if (request.data) {
    if (typeof request.data === 'string') {
      rustCode += '        .body("' + request.data.replace(/\s/g, '') + '")\n'
    } else {
      rustCode += '        .body("' + request.data + '")\n'
    }
  }

  // Complete query builder and send
  // text()? gets the body or response
  rustCode += '        .send()?\n        .text()?;\n'
  // Print the result to stdout
  rustCode += '    println!("{}", res);\n\n    Ok(())\n}'
  rustCode += '\n'
  return rustCode
}

module.exports = toRust
