import { Word, eq, mergeWords } from "../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,

  "unix-socket",
  "abstract-unix-socket",

  "compressed",
  "no-compressed",
  "verbose",
  "no-verbose",

  "proxy",
  "proxy-user",
  "proxytunnel",
  "noproxy",
  // TODO: all the rest of --proxy-* args
  // TODO: --socks
  // TODO: --ssl and --tls

  "netrc",
  "netrc-file",
  "netrc-optional",

  // "anyauth",
  // "no-anyauth",
  "digest",
  "no-digest",
  "negotiate",
  "no-negotiate",
  "ntlm",
  "no-ntlm",
  "ntlm-wb",
  "no-ntlm-wb",
  // "aws-sigv4",
  // "delegation",
  // "service-name",

  "ipv4",
  "ipv6",

  "ignore-content-length",
  "no-ignore-content-length",

  // TODO
  // "http1.1",
  // "http2",
  // "http2-prior-knowledge",
  "http3",
  // "http3-only",

  "cookie-jar",
  "junk-session-cookies",

  "crlf",
  "no-crlf",

  "pass",
  "cacert",
  "capath",
  "crlfile",
  "pinnedpubkey",
  "curves",
  "cert",
  "cert-type",
  "key",
  "key-type",

  "form",
  "form-string",
  "form-escape",
  "no-form-escape",

  "doh-url",
  "doh-cert-status",
  // "doh-insecure",  // has no effect

  "location",
  "no-location",
  "location-trusted",
  "no-location-trusted",
  "max-redirs",

  "max-time",
  "connect-timeout",

  "keepalive",
  "no-keepalive",
  "keepalive-time",

  "insecure",
  "no-insecure",
]);

const regexEscape = /"|\\|\p{C}|[^ \P{Z}]/gu;
export function reprStr(s: string): string {
  return (
    '"' +
    s.replace(regexEscape, (c: string): string => {
      switch (c) {
        case "\x07":
          return "\\a";
        case "\b":
          return "\\b";
        case "\f":
          return "\\f";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\t":
          return "\\t";
        case "\v":
          return "\\v";
        case "\\":
          return "\\\\";
        case '"':
          return '\\"';
      }
      const hex = (c.codePointAt(0) as number).toString(16);
      if (hex.length <= 2) {
        return "\\x" + hex.padStart(2, "0");
      }
      if (hex.length <= 4) {
        return "\\u" + hex.padStart(4, "0");
      }
      return "\\U" + hex.padStart(8, "0");
    }) +
    '"'
  );
}

export function repr(word: Word, imports: Set<string>): string {
  const reprs = [];
  for (const t of word.tokens) {
    if (typeof t === "string") {
      reprs.push(reprStr(t));
    } else if (t.type === "variable") {
      reprs.push("getenv(" + reprStr(t.value) + ")");
      imports.add("stdlib.h");
    } else if (t.type === "command") {
      // TODO: read the FILE contents
      reprs.push("popen(" + reprStr(t.value) + ', "r")');
      imports.add("stdio.h");
    }
  }

  // TODO: C can't concatenate strings
  return reprs.join(" + ");
}

export function atof1000(word: Word, imports: Set<string>): string {
  if (word.isString()) {
    // TODO: check it's actually a valid float
    const asFloat = parseFloat(word.toString());
    if (!Number.isNaN(asFloat)) {
      return Math.floor(asFloat * 1000) + "L";
    }
  }
  return "(long)(atof(" + repr(word, imports) + ") * 1000)";
}

export function atol(word: Word, imports: Set<string>): string {
  if (word.isString()) {
    // TODO: check it's actually a valid int
    return word.toString() + "L";
  }
  return "atol(" + repr(word, imports) + ")";
}

function requestToC(
  request: Request,
  warnings: Warnings = [],
  imports: Set<string>,
): string {
  let preamble = "";
  preamble += "int main(int argc, char *argv[])\n";
  preamble += "{\n";
  preamble += "  CURLcode ret;\n";
  preamble += "  CURL *hnd;\n";

  let vars = "";

  let code = "";
  code += "  hnd = curl_easy_init();\n";

  let cleanup = "";
  cleanup += "  curl_easy_cleanup(hnd);\n";
  cleanup += "  hnd = NULL;\n";

  // TODO: request.limitRate
  code += "  curl_easy_setopt(hnd, CURLOPT_BUFFERSIZE, 102400L);\n";

  // TODO: if it doesn't have a query string from --data, it's better to
  // do originalUrl because it doesn't need to have the http[s]://
  const url = request.urls[0].url;
  code += "  curl_easy_setopt(hnd, CURLOPT_URL, " + repr(url, imports) + ");\n";

  code += "  curl_easy_setopt(hnd, CURLOPT_NOPROGRESS, 1L);\n";

  if (request.proxy) {
    const proxy = repr(request.proxy, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_PROXY, " + proxy + ");\n";
  }
  if (request.proxyAuth) {
    const proxyUserpwd = repr(request.proxyAuth, imports);
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_PROXYUSERPWD, " + proxyUserpwd + ");\n";
  }
  if (request.proxytunnel) {
    code += "  curl_easy_setopt(hnd, CURLOPT_HTTPPROXYTUNNEL, 1L);\n";
  }
  if (request.noproxy) {
    const noproxy = repr(request.noproxy, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_NOPROXY, " + noproxy + ");\n";
  }
  if (request.netrc) {
    const netrc = {
      optional: "CURL_NETRC_OPTIONAL",
      required: "CURL_NETRC_REQUIRED",
      ignored: "CURL_NETRC_IGNORED",
    }[request.netrc || "ignored"];
    code += "  curl_easy_setopt(hnd, CURLOPT_NETRC, (long)" + netrc + ");\n";
  }
  if (request.netrcFile) {
    const netrcFile = repr(request.netrcFile, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_NETRC_FILE, " + netrcFile + ");\n";
  }

  if (request.urls[0].auth) {
    const [username, password] = request.urls[0].auth;
    const userpwd = repr(mergeWords(username, ":", password), imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_USERPWD, " + userpwd + ");\n";
  }

  if (request.urls[0].uploadFile) {
    // TODO
  } else if (request.multipartUploads) {
    preamble += "  curl_mime *mime1;\n";
    preamble += "  curl_mimepart *part1;\n";

    vars += "  mime1 = NULL;\n";

    code += "  mime1 = curl_mime_init(hnd);\n";

    for (const m of request.multipartUploads) {
      code += "  part1 = curl_mime_addpart(mime1);\n";
      if ("contentFile" in m && m.contentFile) {
        code +=
          "  curl_mime_filedata(part1, " +
          repr(m.contentFile, imports) +
          ");\n";
      } else if ("content" in m && m.content) {
        code +=
          "  curl_mime_data(part1, " +
          repr(m.content, imports) +
          ", CURL_ZERO_TERMINATED);\n";
      }
      if ("encoder" in m && m.encoder) {
        code +=
          "  curl_mime_encoder(part1, " + repr(m.encoder, imports) + ");\n";
      }
      if (
        "filename" in m &&
        m.filename &&
        !("contentFile" in m && m.contentFile && eq(m.filename, m.contentFile))
      ) {
        code +=
          "  curl_mime_filename(part1, " + repr(m.filename, imports) + ");\n";
      } else if (!m.filename && "contentFile" in m && m.contentFile) {
        code += "  curl_mime_filename(part1, NULL);\n";
      }
      code += "  curl_mime_name(part1, " + repr(m.name, imports) + ");\n";
      if ("contentType" in m && m.contentType) {
        code +=
          "  curl_mime_type(part1, " + repr(m.contentType, imports) + ");\n";
      }
      if ("headers" in m && m.headers) {
        warnings.push([
          "multipart-headers",
          "multipart headers are not supported: " +
            m.headers.map((h) => h.toString()).join(", "),
        ]);
      }
      if ("headerFiles" in m && m.headerFiles) {
        warnings.push([
          "multipart-headers",
          "multipart header files are not supported: " +
            m.headerFiles.map((h) => h.toString()).join(", "),
        ]);
      }
    }

    code += "  curl_easy_setopt(hnd, CURLOPT_MIMEPOST, mime1);\n";

    cleanup += "  curl_mime_free(mime1);\n";
    cleanup += "  mime1 = NULL;\n";
  } else if (request.data) {
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, " +
      repr(request.data, imports) +
      ");\n";
    // this isn't correct if .data reads files
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_POSTFIELDSIZE_LARGE, (curl_off_t)" +
      request.data.length.toString() +
      ");\n";
  }
  if (request.formEscape) {
    code += "  curl_easy_setopt(hnd, CURLOPT_MIME_OPTIONS, 1L);\n";
  }

  if (request.urls[0].auth) {
    const curlAuth = {
      basic: "CURLAUTH_BASIC",
      negotiate: "CURLAUTH_NEGOTIATE",
      digest: "CURLAUTH_DIGEST",
      ntlm: "CURLAUTH_NTLM",
      "ntlm-wb": "CURLAUTH_NTLM_WB",
      bearer: "CURLAUTH_BEARER",
      "aws-sigv4": "CURLAUTH_AWS_SIGV4",
      none: "CURLAUTH_NONE",
    }[request.authType];
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_HTTPAUTH, (long)" + curlAuth + ");\n";
  }

  const headerLines = [];
  for (const [headerName, headerValue] of request.headers) {
    const h = headerName.toLowerCase();
    if (eq(h, "user-agent") || eq(h, "referer")) {
      continue;
    }
    if (headerValue === null) {
      headerLines.push(
        "  slist1 = curl_slist_append(slist1, " +
          repr(mergeWords(headerName, ":"), imports) +
          ");\n",
      );
    } else if (eq(headerValue, "")) {
      headerLines.push(
        "  slist1 = curl_slist_append(slist1, " +
          repr(mergeWords(headerName, ";"), imports) +
          ");\n",
      );
    } else {
      headerLines.push(
        "  slist1 = curl_slist_append(slist1, " +
          repr(mergeWords(headerName, ": ", headerValue), imports) +
          ");\n",
      );
    }
  }
  if (headerLines.length) {
    preamble += "  struct curl_slist *slist1;\n";

    vars += "  slist1 = NULL;\n";
    vars += headerLines.join("");

    code += "  curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, slist1);\n";

    cleanup += "  curl_slist_free_all(slist1);\n";
    cleanup += "  slist1 = NULL;\n";
  }
  const referer = request.headers.get("referer");
  if (referer) {
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_REFERER, " +
      repr(referer, imports) +
      ");\n";
  }
  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_USERAGENT, " +
      repr(userAgent, imports) +
      ");\n";
  } else if (userAgent === undefined) {
    // TODO: needs to be kept up-to-date with VERSION in cli.ts
    code += '  curl_easy_setopt(hnd, CURLOPT_USERAGENT, "curl/8.2.1");\n';
  }

  if (request.followRedirects) {
    code += "  curl_easy_setopt(hnd, CURLOPT_FOLLOWLOCATION, 1L);\n";
    if (request.followRedirectsTrusted) {
      code += "  curl_easy_setopt(hnd, CURLOPT_UNRESTRICTED_AUTH, 1L);\n";
    }
  }

  if (request.timeout) {
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_TIMEOUT_MS, " +
      atof1000(request.timeout, imports) +
      ");\n";
  }

  const maxRedirs = request.maxRedirects || new Word("50");
  code +=
    "  curl_easy_setopt(hnd, CURLOPT_MAXREDIRS, " +
    atol(maxRedirs, imports) +
    ");\n";

  // TODO
  let httpVersion = "CURL_HTTP_VERSION_2TLS";
  if (request.http3) {
    httpVersion = "CURL_HTTP_VERSION_3";
  }
  code +=
    "  curl_easy_setopt(hnd, CURLOPT_HTTP_VERSION, (long)" +
    httpVersion +
    ");\n";

  if (request.compressed) {
    code += '  curl_easy_setopt(hnd, CURLOPT_ACCEPT_ENCODING, "");\n';
  }

  if (request.transferEncoding) {
    code += "  curl_easy_setopt(hnd, CURLOPT_TRANSFER_ENCODING, 1L);\n";
  }

  if (request.pass) {
    const pass = repr(request.pass, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_KEYPASSWD, " + pass + ");\n";
  }
  if (request.cacert) {
    const cacert = repr(request.cacert, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_CAINFO, " + cacert + ");\n";
  }
  if (request.capath) {
    const capath = repr(request.capath, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_CAPATH, " + capath + ");\n";
    code += "  curl_easy_setopt(hnd, CURLOPT_PROXY_CAPATH, " + capath + ");\n";
  }
  if (request.crlfile) {
    const crlfile = repr(request.crlfile, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_CRLFILE, " + crlfile + ");\n";
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_PROXY_CRLFILE, " + crlfile + ");\n";
  }
  if (request.pinnedpubkey) {
    const pinnedpubkey = repr(request.pinnedpubkey, imports);
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_PINNEDPUBLICKEY, " +
      pinnedpubkey +
      ");\n";
  }
  if (request.curves) {
    const curves = repr(request.curves, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_SSL_EC_CURVES, " + curves + ");\n";
  }
  if (request.cert) {
    let cert = request.cert[0];
    if (request.cert[1]) {
      cert = mergeWords(cert, ":", request.cert[1]);
    }
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_SSLCERT, " +
      repr(cert, imports) +
      ");\n";
  }
  if (request.certType) {
    const certType = repr(request.certType, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_SSLCERTTYPE, " + certType + ");\n";
  }
  if (request.key) {
    const key = repr(request.key, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_SSLKEY, " + key + ");\n";
  }
  if (request.keyType) {
    const keyType = repr(request.keyType, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_SSLKEYTYPE, " + keyType + ");\n";
  }

  if (request.insecure) {
    code += "  curl_easy_setopt(hnd, CURLOPT_SSL_VERIFYPEER, 0L);\n";
    code += "  curl_easy_setopt(hnd, CURLOPT_SSL_VERIFYHOST, 0L);\n";
  }

  if (request.dohCertStatus) {
    code += "  curl_easy_setopt(hnd, CURLOPT_DOH_SSL_VERIFYSTATUS, 1L);\n";
  }

  if (request.crlf) {
    code += "  curl_easy_setopt(hnd, CURLOPT_CRLF, 1L);\n";
  }

  if (request.cookieJar) {
    const cookieJar = repr(request.cookieJar, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_COOKIEJAR, " + cookieJar + ");\n";
  }
  if (request.junkSessionCookies) {
    code += "  curl_easy_setopt(hnd, CURLOPT_COOKIESESSION, 1L);\n";
  }

  // TODO: this is more complicated.
  // --head just sets CURLOPT_NOBODY and CURLOPT_FILETIME
  // --upload-file just sets CURLOPT_UPLOAD and CURLOPT_INFILESIZE_LARGE
  let expectedMethod = "GET";
  if (request.data || request.multipartUploads) {
    expectedMethod = "POST";
  }
  if (!eq(request.urls[0].method, expectedMethod)) {
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, " +
      repr(request.urls[0].method, imports) +
      ");\n";
  }

  if (request.interface) {
    const interface_ = repr(request.interface, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_INTERFACE, " + interface_ + ");\n";
  }

  if (request.connectTimeout) {
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_CONNECTTIMEOUT_MS, " +
      atof1000(request.connectTimeout, imports) +
      ");\n";
  }

  if (request.dohUrl) {
    const dohUrl = repr(request.dohUrl, imports);
    code += "  curl_easy_setopt(hnd, CURLOPT_DOH_URL, " + dohUrl + ");\n";
  }

  if (request.verbose) {
    code += "  curl_easy_setopt(hnd, CURLOPT_VERBOSE, 1L);\n";
  }

  // TODO: these should be mutually exclusive
  if (request.ipv6) {
    code += "  curl_easy_setopt(hnd, CURLOPT_IPRESOLVE, 2L);\n";
  } else if (request.ipv4) {
    code += "  curl_easy_setopt(hnd, CURLOPT_IPRESOLVE, 1L);\n";
  }

  if (request.ignoreContentLength) {
    code += "  curl_easy_setopt(hnd, CURLOPT_IGNORE_CONTENT_LENGTH, 1L);\n";
  }

  code += "  curl_easy_setopt(hnd, CURLOPT_FTP_SKIP_PASV_IP, 1L);\n";
  if (request.keepAlive !== false) {
    code += "  curl_easy_setopt(hnd, CURLOPT_TCP_KEEPALIVE, 1L);\n";
    if (request.keepAliveTime) {
      const keepAliveTime = atol(request.keepAliveTime, imports);
      code +=
        "  curl_easy_setopt(hnd, CURLOPT_TCP_KEEPIDLE, " +
        keepAliveTime +
        ");\n";
      code +=
        "  curl_easy_setopt(hnd, CURLOPT_TCP_KEEPINTVL, " +
        keepAliveTime +
        ");\n";
    }
  }

  if (request.unixSocket) {
    const socket = repr(request.unixSocket, imports);
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_UNIX_SOCKET_PATH, " + socket + ");\n";
  }
  if (request.abstractUnixSocket) {
    const socket = repr(request.abstractUnixSocket, imports);
    code +=
      "  curl_easy_setopt(hnd, CURLOPT_ABSTRACT_UNIX_SOCKET, " +
      socket +
      ");\n";
  }

  code += "\n";
  code += "  ret = curl_easy_perform(hnd);\n";

  let end = "";
  end += "  return (int)ret;\n";
  end += "}\n";

  return (
    preamble +
    (vars ? "\n" + vars : "") +
    "\n" +
    code +
    "\n" +
    cleanup +
    "\n" +
    end
  );
}

export function printImports(imps: Set<string>): string {
  let s = "";
  for (const imp of Array.from(imps).sort()) {
    s += "#include <" + imp + ">\n";
  }
  return s;
}

export function _toC(requests: Request[], warnings: Warnings = []): string {
  const imports = new Set<string>(["curl/curl.h"]);

  const request = getFirst(requests, warnings);
  const code = requestToC(request, warnings, imports);

  return printImports(imports) + "\n" + code;
}

export function toCWarn(
  curlCommand: string | string[],
  warnings: Warnings = [],
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const c = _toC(requests, warnings);
  return [c, warnings];
}

export function toC(curlCommand: string | string[]): string {
  return toCWarn(curlCommand)[0];
}
