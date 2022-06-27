import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import jsesc from "jsesc";

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
  "referer",
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "user",
]);

const INDENTATION = " ".repeat(4);
const indent = (line: string, level = 1): string =>
  INDENTATION.repeat(level) + line;
const quote = (str: string): string => jsesc(str, { quotes: "double" });

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
            `headers.insert(${name}, "${quote(headerValue)}".parse().unwrap());`
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
        return indent(`.file("${m.name}", "${quote(m.contentFile)}")?`, 2);
      }
      return indent(`.text("${m.name}", "${quote(m.content)}")`, 2);
    });
    parts[parts.length - 1] += ";";
    lines.push(...parts, "");
  }

  lines.push(indent("let client = reqwest::blocking::Client::new();"));

  const reqwestMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];
  if (reqwestMethods.includes(request.method)) {
    lines.push(
      indent(
        `let res = client.${request.method.toLowerCase()}("${quote(
          request.url
        )}")`
      )
    );
  } else {
    lines.push(
      indent(
        `let res = client.request("${quote(request.method)}", "${quote(
          request.url
        )}")`
      )
    );
  }

  if (request.auth) {
    const [user, password] = request.auth;
    lines.push(
      indent(`.basic_auth("${quote(user)}", Some("${quote(password)}"))`, 2)
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
      lines.push(indent(`.body("${quote(request.data)}")`, 2));
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
