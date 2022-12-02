import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import { repr as jsrepr } from "./javascript/javascript.js";

const supportedArgs = new Set([
  "url",
  "request",
  "user-agent",
  "cookie",
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "range",
  "referer",
  "time-cond",
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
  "location",
  "location-trusted",
  "max-redirs",
]);

const INDENTATION = " ".repeat(4);
const indent = (line: string, level = 1): string =>
  INDENTATION.repeat(level) + line;
const repr = (str: string): string => jsrepr(str, '"');

export const _toRust = (request: Request, warnings: Warnings = []): string => {
  const lines = ["extern crate reqwest;"];
  {
    // Generate imports.
    const imports = [
      { want: "header", condition: !!request.headers },
      { want: "blocking::multipart", condition: !!request.multipartUploads },
    ]
      .filter((i) => i.condition)
      .map((i) => i.want);

    if (imports.length > 1) {
      lines.push(`use reqwest::{${imports.join(", ")}};`);
    } else if (imports.length) {
      lines.push(`use reqwest::${imports[0]};`);
    }
  }
  lines.push("", "fn main() -> Result<(), Box<dyn std::error::Error>> {");

  if (request.headers) {
    lines.push(indent("let mut headers = header::HeaderMap::new();"));
    const headerEnum: { [key: string]: string } = {
      cookie: "header::COOKIE",
    };
    for (const [headerName, headerValue] of request.headers || []) {
      const enumValue = headerEnum[headerName.toLowerCase()];
      const name = enumValue || `"${headerName}"`;
      if (headerValue !== null) {
        lines.push(
          indent(
            `headers.insert(${name}, ${repr(headerValue)}.parse().unwrap());`
          )
        );
      }
    }
    lines.push("");
  }

  if (request.multipartUploads) {
    lines.push(indent("let form = multipart::Form::new()"));
    const parts = request.multipartUploads.map((m) => {
      if ("contentFile" in m) {
        return indent(`.file(${repr(m.name)}, ${repr(m.contentFile)})?`, 2);
      }
      return indent(`.text(${repr(m.name)}, ${repr(m.content)})`, 2);
    });
    parts[parts.length - 1] += ";";
    lines.push(...parts, "");
  }

  if (!request.followRedirects) {
    lines.push(indent("let client = reqwest::blocking::Client::builder()"));
    lines.push(indent(".redirect(reqwest::redirect::Policy::none())", 2));
    lines.push(indent(".build()", 2));
    lines.push(indent(".unwrap();", 2));
  } else if (typeof request.maxRedirects === "undefined") {
    // Curl's default is following 50 redirects, reqwest's is 10
    lines.push(indent("let client = reqwest::blocking::Client::new();"));
  } else {
    lines.push(indent("let client = reqwest::blocking::Client::builder()"));
    if (request.maxRedirects === "-1") {
      lines.push(
        indent(
          ".redirect(reqwest::redirect::Policy::custom(|attempt| { attempt.follow() }))",
          2
        )
      );
    } else {
      // Insert the --max-redirs value as-is, hoping it's a valid integer
      lines.push(
        indent(
          ".redirect(reqwest::redirect::Policy::limited(" +
            request.maxRedirects.trim() +
            "))",
          2
        )
      );
    }
    lines.push(indent(".build()", 2));
    lines.push(indent(".unwrap();", 2));
  }

  const reqwestMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];
  if (reqwestMethods.includes(request.method)) {
    lines.push(
      indent(
        `let res = client.${request.method.toLowerCase()}(${repr(request.url)})`
      )
    );
  } else {
    lines.push(
      indent(
        `let res = client.request(${repr(request.method)}, ${repr(
          request.url
        )})`
      )
    );
  }

  if (request.auth) {
    const [user, password] = request.auth;
    lines.push(
      indent(`.basic_auth(${repr(user)}, Some(${repr(password)}))`, 2)
    );
  }

  if (request.headers) {
    lines.push(indent(".headers(headers)", 2));
  }

  if (request.multipartUploads) {
    lines.push(indent(".multipart(form)", 2));
  }

  if (request.data) {
    if (typeof request.data === "string" && request.data.indexOf("\n") !== -1) {
      // Use raw strings for multiline content
      lines.push(indent('.body(r#"', 2), request.data, '"#', indent(")", 2));
    } else {
      lines.push(indent(`.body(${repr(request.data)})`, 2));
    }
  }

  lines.push(
    indent(".send()?", 2),
    indent(".text()?;", 2),
    indent('println!("{}", res);'),
    "",
    indent("Ok(())"),
    "}"
  );

  return lines.join("\n") + "\n";
};
export const toRustWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const rust = _toRust(request, warnings);
  return [rust, warnings];
};
export const toRust = (curlCommand: string | string[]): string => {
  return toRustWarn(curlCommand)[0];
};
