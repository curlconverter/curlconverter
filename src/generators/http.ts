import { Word, eq } from "../shell/Word.js";
import { parseCurlCommand, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";
import type { FormParam } from "../curl/form.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",

  "http0.9",
  // "http1.0",
  "http1.1",
  "http2",
  "http2-prior-knowledge",
  "http3",
  "http3-only",
  "no-http0.9",

  "compressed",
  "no-compressed",

  "upload-file",
]);

export function repr(w: Word): string {
  return w.tokens.map((t) => (typeof t === "string" ? t : t.text)).join("");
}

export function _toHTTP(requests: Request[], warnings: Warnings = []): string {
  const request = getFirst(requests, warnings);
  let s = request.urls[0].method.toString() + " ";

  const urlObj = request.urls[0].urlObj;
  // TODO: check that has both --url-query and query
  let url = urlObj.path.toString() + urlObj.query.toString();
  if (!url) {
    url = "/";
  }
  s += url + " ";

  if (request.http3) {
    s += "HTTP/3";
  } else if (request.http2) {
    s += "HTTP/2";
  } else {
    s += "HTTP/1.1";
  }
  s += "\n";

  // TODO: these should come first
  request.headers.setIfMissing("Host", urlObj.host.toString());
  // TODO: update version with extract_curl_args.py
  request.headers.setIfMissing("User-Agent", "curl/8.0.1");

  if (request.compressed) {
    request.headers.setIfMissing("Accept-Encoding", "deflate, gzip");
    // Modern curl versions send this, but users are less likely to have
    // decompressors for br and zstd.
    // request.headers.setIfMissing("Accept-Encoding", "deflate, gzip, br, zstd");
  }

  if (request.urls[0].auth) {
    const [user, pass] = request.urls[0].auth;
    if (request.authType === "basic") {
      request.headers.setIfMissing(
        "Authorization",
        // TODO
        "Basic " + btoa(user.toString() + ":" + pass.toString())
      );
    }
  }

  // Generate a random boundary, just like curl, in a cryptographically secure way
  // TODO: use a hash of the so that this doesn't change on every keystroke
  let boundary =
    "------------------------" +
    Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  if (request.multipartUploads) {
    const contentType = request.headers.get("Content-Type");
    if (contentType) {
      const m = contentType.toString().match(/boundary=(.*)/);
      if (m) {
        boundary = m[1];
      } else {
        warnings.push([
          "no-boundary",
          `Content-Type header "${contentType.toString()}" does not specify a boundary.`,
        ]);
      }
    } else {
      // TODO: could existing Content-Type have other stuff that needs to be preserved?
      request.headers.set(
        "Content-Type",
        "multipart/form-data; boundary=" + boundary
      );
    }
  }

  for (const [headerName, headerValue] of request.headers) {
    if (headerValue === null) {
      continue;
    }
    s += headerName.toString() + ": " + headerValue.toString() + "\n";
  }

  s += "\n";

  if (request.data) {
    s += request.data.toString();
  } else if (request.urls[0].uploadFile) {
    s += request.urls[0].uploadFile.toString();
    warnings.push([
      "upload-file",
      "need to read data from file: " +
        JSON.stringify(request.urls[0].uploadFile.toString()),
    ]);
  } else if (request.multipartUploads) {
    for (const f of request.multipartUploads) {
      s += "--" + boundary + "\n";
      s += "Content-Disposition: form-data";
      s += '; name="' + f.name.toString() + '"';
      if ("content" in f) {
        s += "\n\n";
        const content = f.content.toString();
        if (content) {
          s += content + "\n";
        }
      } else {
        if (f.filename) {
          s += '; filename="' + f.name.toString() + '"';
        }
        // TODO: set content type from file extension
        s += "\n\n" + f.contentFile.toString() + "\n";
      }
      s += "\n";
    }
    s += "--" + boundary + "--" + "\n";
  }

  return s;
}

export function toHTTPWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parseCurlCommand(curlCommand, supportedArgs, warnings);
  const http = _toHTTP(requests, warnings);
  return [http, warnings];
}
export function toHTTP(curlCommand: string | string[]): string {
  return toHTTPWarn(curlCommand)[0];
}
