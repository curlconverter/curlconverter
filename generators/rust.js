import * as util from '../util.js'

import jsesc from 'jsesc'

const INDENTATION = ' '.repeat(4)
const indent = (line, level = 1) => INDENTATION.repeat(level) + line
const quote = str => jsesc(str, { quotes: 'double' })

export const _toRust = request => {
  const lines = ['extern crate reqwest;']
  {
    // Generate imports.
    const imports = [
      { want: 'header', condition: !!request.headers },
      { want: 'multipart', condition: !!request.multipartUploads }
    ].filter(i => i.condition).map(i => i.want)

    if (imports.length > 1) {
      lines.push(`use reqwest::{${imports.join(', ')}};`)
    } else if (imports.length) {
      lines.push(`use reqwest::${imports[0]};`)
    }
  }
  lines.push('', 'fn main() -> Result<(), Box<dyn std::error::Error>> {')

  if (request.headers) {
    lines.push(indent('let mut headers = header::HeaderMap::new();'))
    const headerEnum = {
      cookie: 'header::COOKIE'
    }
    for (const [headerName, headerValue] of (request.headers || [])) {
      const enumValue = headerEnum[headerName.toLowerCase()]
      const name = enumValue || `"${headerName}"`
      lines.push(indent(`headers.insert(${name}, "${quote(headerValue)}".parse().unwrap());`))
    }
    lines.push('')
  }

  if (request.multipartUploads) {
    lines.push(indent('let form = multipart::Form::new()'))
    const parts = request.multipartUploads.map(m => {
      const [partType, partValue] = m
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
    const [user, password] = request.auth
    lines.push(indent(`.basic_auth("${quote(user)}", Some("${quote(password)}"))`, 2))
  }

  if (request.headers) {
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
export const toRust = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toRust(request)
}
