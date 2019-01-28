var util = require('../util')
var jsesc = require('jsesc')

var toRust = function (curlCommand) {
    var request = util.parseCurlCommand(curlCommand)
    console.log(request);

    var rustCode = 'extern crate reqwest;\n'

    if (request.headers || request.cookies) {
        rustCode += "use reqwest::headers::*;\n"
    }
    if (request.multipartUploads) {
        rustCode += "use reqwest::multipart;\n"
    }


    rustCode += '\nfn main() -> Result<(), reqwest::Error> {\n'

    if (request.headers || request.cookies) {

        rustCode += '\tlet mut headers = HeaderMap::new();\n'

        for (var header in request.headers) {
            rustCode += '\theaders.insert(' + header.replace(/\-/g, '_').toUpperCase() + ', "' + request.headers[header] + '".parse().unwrap());\n'
        }

        for (var cookie in request.cookies) {
            rustCode += '\theaders.insert(COOKIE, "' + cookie + '".parse().unwrap());\n'
        }
    }

    if (request.multipartUploads) {

        rustCode += '\tlet form = multipart::From::new()'

        for (var part in request.multipartUploads) {
            if (part == "image" || part == "file") {
                rustCode += '\n\t\t.file("' + part + '", "' + request.multipartUploads[part].split('@')[1] + '")?'
            } else {
                rustCode += '\n\t\t.text("' + part + '", "' + request.multipartUploads[part] + '")'
            }
        }
        rustCode += ";\n"
    }



    rustCode += '\n\tlet res = reqwest::Client::new()\n'

    switch (request.method) {
        case 'get':
            rustCode += '\t\t.get("' + request.url + '")'
            break;
        case 'post':
            rustCode += '\t\t.post("' + request.url + '")'
            break;
        case 'put':
            rustCode += '\t\t.put("' + request.url + '")'
            break;
        case 'patch':
            rustCode += '\t\t.patch("' + request.url + '")'
            break;
        case 'delete':
            rustCode += '\t\t.delete("' + request.url + '")'
            break;
        default:
            break;
    }
    rustCode += '\n'

    if (request.auth) {
        var splitAuth = request.auth.split(':')
        var user = splitAuth[0] || ''
        var password = splitAuth[1] || ''
        rustCode += '\t\t.basic_auth("' + user + '", Some("' + password + '"))\n'
    }

    if (request.headers) {
        rustCode += '\t\t.headers(headers)\n'
    }

    if (request.multipartUploads) {
        rustCode += '\t\t.multipart(form)\n'
    }

    if (request.data) {
        if (typeof request.data == "string") {
            rustCode += '\t\t.body("' + request.data.replace(/\s/g, '') + '")\n'
        } else {
            rustCode += '\t\t.body("' + request.data + '")\n'
        }

    }


    // Complete query builder and send
    // text()? gets the body or response
    rustCode += '\t\t.send()?\n\t\t.text()?;\n'
    // Print the result to stdout
    rustCode += '\tprintln!("{}", res);\n\n\tOk(())\n}'

    return rustCode += '\n'
}

module.exports = toRust
