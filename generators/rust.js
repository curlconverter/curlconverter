const util = require('../util')
const jsesc = require('jsesc')

const INDENTATION = ' '.repeat(4)
const indent = (line, level = 1) => INDENTATION.repeat(level) + line
const quote = str => jsesc(str, { quotes: 'double' })

function toRust (curlCommand) {
  const lines = ['extern crate reqwest;']
  const request = util.parseCurlCommand(curlCommand)

  const hasHeaders = request.headers || request.cookies
  {
    // Generate imports.
    const imports = [
      { want: 'header', condition: hasHeaders },
      { want: 'multipart', condition: !!request.multipartUploads }
    ].filter(i => i.condition).map(i => i.want)

    if (imports.length > 1) {
      lines.push(`use reqwest::{${imports.join(', ')}};`)
    } else if (imports.length) {
      lines.push(`use reqwest::${imports[0]};`)
    }
  }
  lines.push('', 'fn main() -> Result<(), Box<dyn std::error::Error>> {')

  if (request.headers || request.cookies) {
    lines.push(indent('let mut headers = header::HeaderMap::new();'))
    for (const headerName in request.headers) {
      const headerValue = quote(request.headers[headerName])
      lines.push(indent(`headers.insert("${headerName}", "${headerValue}".parse().unwrap());`))
    }

    if (request.cookies) {
      const cookies = Object.keys(request.cookies)
        .map(key => `${key}=${request.cookies[key]}`)
        .join('; ')
      lines.push(indent(`headers.insert(header::COOKIE, "${quote(cookies)}".parse().unwrap());`))
    }

    lines.push('')
  }

  if (request.multipartUploads) {
    lines.push(indent('let form = multipart::Form::new()'))
    const parts = Object.keys(request.multipartUploads).map(partType => {
      const partValue = request.multipartUploads[partType]
      switch (partType) {
        case 'image':
        case 'file': {
          const path = partValue.split('@')[1]
          return indent(`.file("${partType}", "${quote(path)}")?`, 2)
        }
        default:
          return indent(`.text("${partType}", "${quote(partValue)}")`, 2)
      }
    })
    parts[parts.length - 1] += ';'
    lines.push(...parts, '')
  }

  lines.push(indent('let res = reqwest::Client::new()'))
  lines.push(indent(`.${request.method}("${quote(request.url)}")`, 2))

  if (request.auth) {
    const [user, password] = request.auth.split(':', 2).map(quote)
    lines.push(indent(`.basic_auth("${user || ''}", Some("${password || ''}"))`, 2))
  }

  if (hasHeaders) {
    lines.push(indent('.headers(headers)', 2))
  }

  if (request.multipartUploads) {
    lines.push(indent('.multipart(form)', 2))
  }

  if (request.data) {
    if (typeof request.data === 'string' && request.data.indexOf('\n') !== -1) {
      // Use raw strings for multiline content
      lines.push(
        indent('.body(r#"', 2),
        request.data,
        '"#',
        indent(')', 2)
      )
    } else {
      lines.push(indent(`.body("${quote(request.data)}")`, 2))
    }
  }

  lines.push(
    indent('.send()?', 2),
    indent('.text()?;', 2),
    indent('println!("{}", res);'),
    '',
    indent('Ok(())'),
    '}'
  )

  return lines.join('\n') + '\n'
}

module.exports = toRust
