import * as util from "../util.js";
import type { Warnings } from "../util.js";

import jsesc from "jsesc";
import type { Request, Query, QueryDict } from "../util.js";

// TODO: partiallySupportedArgs
const supportedArgs = new Set([
  "url",
  "request",
  "compressed",
  "no-compressed",
  "digest",
  "no-digest",
  "http1.0",
  "http1.1",
  "http2",
  "http2-prior-knowledge",
  "http3",
  "http0.9",
  "no-http0.9",
  "user-agent",
  "cookie",
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "referer",
  "cert",
  "cacert",
  "key",
  "capath",
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "insecure",
  "no-insecure",
  "output",
  "user",
  "upload-file",
  "proxy-user",
  "proxy",
]);
// supported by other generators
const supportedByOthers = ["max-time", "location"];
const unsupportedArgs = [
  "dns-ipv4-addr",
  "dns-ipv6-addr",
  "random-file",
  "egd-file",
  "oauth2-bearer",
  "connect-timeout",
  "doh-url",
  "ciphers",
  "dns-interface",
  "disable-epsv",
  "no-disable-epsv",
  "disallow-username-in-url",
  "no-disallow-username-in-url",
  "epsv",
  "no-epsv",
  "dns-servers",
  "trace",
  "npn",
  "no-npn",
  "trace-ascii",
  "alpn",
  "no-alpn",
  "limit-rate",
  "tr-encoding",
  "no-tr-encoding",
  "negotiate",
  "no-negotiate",
  "ntlm",
  "no-ntlm",
  "ntlm-wb",
  "no-ntlm-wb",
  "basic",
  "no-basic",
  "anyauth",
  "no-anyauth",
  "wdebug",
  "no-wdebug",
  "ftp-create-dirs",
  "no-ftp-create-dirs",
  "create-dirs",
  "no-create-dirs",
  "create-file-mode",
  "max-redirs",
  "proxy-ntlm",
  "no-proxy-ntlm",
  "crlf",
  "no-crlf",
  "stderr",
  "aws-sigv4",
  "interface",
  "krb",
  "krb4",
  "haproxy-protocol",
  "no-haproxy-protocol",
  "max-filesize",
  "disable-eprt",
  "no-disable-eprt",
  "eprt",
  "no-eprt",
  "xattr",
  "no-xattr",
  "ftp-ssl",
  "no-ftp-ssl",
  "ssl",
  "no-ssl",
  "ftp-pasv",
  "no-ftp-pasv",
  "socks5",
  "tcp-nodelay",
  "no-tcp-nodelay",
  "proxy-digest",
  "no-proxy-digest",
  "proxy-basic",
  "no-proxy-basic",
  "retry",
  "retry-connrefused",
  "no-retry-connrefused",
  "retry-delay",
  "retry-max-time",
  "proxy-negotiate",
  "no-proxy-negotiate",
  "form-escape",
  "no-form-escape",
  "ftp-account",
  "proxy-anyauth",
  "no-proxy-anyauth",
  "trace-time",
  "no-trace-time",
  "ignore-content-length",
  "no-ignore-content-length",
  "ftp-skip-pasv-ip",
  "no-ftp-skip-pasv-ip",
  "ftp-method",
  "local-port",
  "socks4",
  "socks4a",
  "ftp-alternative-to-user",
  "ftp-ssl-reqd",
  "no-ftp-ssl-reqd",
  "ssl-reqd",
  "no-ssl-reqd",
  "sessionid",
  "no-sessionid",
  "ftp-ssl-control",
  "no-ftp-ssl-control",
  "ftp-ssl-ccc",
  "no-ftp-ssl-ccc",
  "ftp-ssl-ccc-mode",
  "libcurl",
  "raw",
  "no-raw",
  "post301",
  "no-post301",
  "keepalive",
  "no-keepalive",
  "socks5-hostname",
  "keepalive-time",
  "post302",
  "no-post302",
  "noproxy",
  "socks5-gssapi-nec",
  "no-socks5-gssapi-nec",
  "proxy1.0",
  "tftp-blksize",
  "mail-from",
  "mail-rcpt",
  "ftp-pret",
  "no-ftp-pret",
  "proto",
  "proto-redir",
  "resolve",
  "delegation",
  "mail-auth",
  "post303",
  "no-post303",
  "metalink",
  "no-metalink",
  "sasl-authzid",
  "sasl-ir",
  "no-sasl-ir",
  "test-event",
  "no-test-event",
  "unix-socket",
  "path-as-is",
  "no-path-as-is",
  "socks5-gssapi-service",
  "proxy-service-name",
  "service-name",
  "proto-default",
  "expect100-timeout",
  "tftp-no-options",
  "no-tftp-no-options",
  "connect-to",
  "abstract-unix-socket",
  "tls-max",
  "suppress-connect-headers",
  "no-suppress-connect-headers",
  "compressed-ssh",
  "no-compressed-ssh",
  "happy-eyeballs-timeout-ms",
  "retry-all-errors",
  "no-retry-all-errors",
  "tlsv1",
  "tlsv1.0",
  "tlsv1.1",
  "tlsv1.2",
  "tlsv1.3",
  "tls13-ciphers",
  "proxy-tls13-ciphers",
  "sslv2",
  "sslv3",
  "ipv4",
  "ipv6",
  "append",
  "no-append",
  "alt-svc",
  "hsts",
  "use-ascii",
  "no-use-ascii",
  "cookie-jar",
  "continue-at",
  "dump-header",
  "cert-type",
  "key-type",
  "pass",
  "engine",
  "pubkey",
  "hostpubmd5",
  "hostpubsha256",
  "crlfile",
  "tlsuser",
  "tlspassword",
  "tlsauthtype",
  "ssl-allow-beast",
  "no-ssl-allow-beast",
  "ssl-auto-client-cert",
  "no-ssl-auto-client-cert",
  "proxy-ssl-auto-client-cert",
  "no-proxy-ssl-auto-client-cert",
  "pinnedpubkey",
  "proxy-pinnedpubkey",
  "cert-status",
  "no-cert-status",
  "doh-cert-status",
  "no-doh-cert-status",
  "false-start",
  "no-false-start",
  "ssl-no-revoke",
  "no-ssl-no-revoke",
  "ssl-revoke-best-effort",
  "no-ssl-revoke-best-effort",
  "tcp-fastopen",
  "no-tcp-fastopen",
  "proxy-tlsuser",
  "proxy-tlspassword",
  "proxy-tlsauthtype",
  "proxy-cert",
  "proxy-cert-type",
  "proxy-key",
  "proxy-key-type",
  "proxy-pass",
  "proxy-ciphers",
  "proxy-crlfile",
  "proxy-ssl-allow-beast",
  "no-proxy-ssl-allow-beast",
  "login-options",
  "proxy-cacert",
  "proxy-capath",
  "proxy-insecure",
  "no-proxy-insecure",
  "proxy-tlsv1",
  "socks5-basic",
  "no-socks5-basic",
  "socks5-gssapi",
  "no-socks5-gssapi",
  "etag-save",
  "etag-compare",
  "curves",
  "fail",
  "no-fail",
  "fail-early",
  "no-fail-early",
  "styled-output",
  "no-styled-output",
  "mail-rcpt-allowfails",
  "no-mail-rcpt-allowfails",
  "fail-with-body",
  "no-fail-with-body",
  "globoff",
  "no-globoff",
  "request-target",
  "proxy-header",
  "include",
  "no-include",
  "junk-session-cookies",
  "no-junk-session-cookies",
  "remote-header-name",
  "no-remote-header-name",
  "doh-insecure",
  "no-doh-insecure",
  "config",
  "list-only",
  "no-list-only",
  "location",
  "no-location",
  "location-trusted",
  "no-location-trusted",
  "max-time",
  "manual",
  "no-manual",
  "netrc",
  "no-netrc",
  "netrc-optional",
  "no-netrc-optional",
  "netrc-file",
  "buffer",
  "no-buffer",
  "remote-name",
  "remote-name-all",
  "no-remote-name-all",
  "output-dir",
  "proxytunnel",
  "no-proxytunnel",
  "ftp-port",
  "disable",
  "no-disable",
  "quote",
  "range",
  "remote-time",
  "no-remote-time",
  "telnet-option",
  "write-out",
  "preproxy",
  "speed-limit",
  "speed-time",
  "time-cond",
  "parallel",
  "no-parallel",
  "parallel-max",
  "parallel-immediate",
  "no-parallel-immediate",
  "next", // TODO: this is a big one
];

function reprWithVariable(value: string, hasEnvironmentVariable: boolean) {
  if (!value) {
    return "''";
  }

  if (!hasEnvironmentVariable) {
    return "'" + jsesc(value, { quotes: "single", minimal: true }) + "'";
  }

  // TODO: escape {} in the string
  return 'f"' + jsesc(value, { quotes: "double", minimal: true }) + '"';
}

function repr(value: string): string {
  // In context of url parameters, don't accept nulls and such.
  return reprWithVariable(value, false);
}

function objToPython(
  obj: string | number | boolean | object | null,
  indent = 0
): string {
  let s = "";
  switch (typeof obj) {
    case "string":
      s += repr(obj);
      break;
    case "number":
      s += obj;
      break;
    case "boolean":
      s += obj ? "True" : "False";
      break;
    case "object":
      if (obj === null) {
        s += "None";
      } else if (Array.isArray(obj)) {
        if (obj.length === 0) {
          s += "[]";
        } else {
          s += "[\n";
          for (const item of obj) {
            s += " ".repeat(indent + 4) + objToPython(item, indent + 4) + ",\n";
          }
          s += " ".repeat(indent) + "]";
        }
      } else {
        const len = Object.keys(obj).length;
        if (len === 0) {
          s += "{}";
        } else {
          s += "{\n";
          for (const [k, v] of Object.entries(obj)) {
            // repr() because JSON keys must be strings.
            s +=
              " ".repeat(indent + 4) +
              repr(k) +
              ": " +
              objToPython(v, indent + 4) +
              ",\n";
          }
          s += " ".repeat(indent) + "}";
        }
      }
      break;
    default:
      throw new util.CCError(
        "unexpected object type that shouldn't appear in JSON: " + typeof obj
      );
  }
  return s;
}

function objToDictOrListOfTuples(obj: Query | QueryDict): string {
  if (!Array.isArray(obj)) {
    return objToPython(obj);
  }
  if (obj.length === 0) {
    return "[]";
  }
  let s = "[\n";
  for (const vals of obj) {
    s += "    (" + vals.map(objToPython).join(", ") + "),\n";
  }
  s += "]";
  return s;
}

function getDataString(
  request: Request
): [string | null, boolean, string | null, boolean | null] {
  if (!request.data) {
    return [null, false, null, null];
  }
  if (!request.isDataRaw && request.data.startsWith("@")) {
    let filePath = request.data.slice(1);
    if (filePath === "-") {
      if (request.stdinFile) {
        filePath = request.stdinFile;
      } else if (request.stdin) {
        request.data = request.stdin;
      } else {
        if (request.isDataBinary) {
          return [
            "data = sys.stdin.buffer.read().replace(b'\\n', b'')\n",
            true,
            null,
            null,
          ];
        } else {
          return [
            "data = sys.stdin.read().replace('\\n', '')\n",
            true,
            null,
            null,
          ];
        }
      }
    }
    if (!request.stdin) {
      if (request.isDataBinary) {
        // TODO: I bet the way python treats file paths is not identical to curl's
        return [
          "with open(" +
            repr(filePath) +
            ", 'rb') as f:\n    data = f.read().replace(b'\\n', b'')\n",
          false,
          null,
          null,
        ];
      } else {
        return [
          "with open(" +
            repr(filePath) +
            ") as f:\n    data = f.read().replace('\\n', '')\n",
          false,
          null,
          null,
        ];
      }
    }
  }

  const dataString = "data = " + repr(request.data) + "\n";

  const contentTypeHeader = util.getHeader(request, "content-type");
  const isJson =
    contentTypeHeader &&
    contentTypeHeader.split(";")[0].trim() === "application/json";
  if (isJson) {
    try {
      const dataAsJson = JSON.parse(request.data);
      // TODO: we actually want to know how it's serialized by
      // simplejson or Python's builtin json library,
      // which is what Requests uses
      // https://github.com/psf/requests/blob/b0e025ade7ed30ed53ab61f542779af7e024932e/requests/models.py#L473
      // but this is hopefully good enough.
      const roundtrips = JSON.stringify(dataAsJson) === request.data;
      const jsonDataString = "json_data = " + objToPython(dataAsJson) + "\n";
      return [dataString, false, jsonDataString, roundtrips];
    } catch {}
  }

  const [parsedQuery, parsedQueryAsDict] = util.parseQueryString(request.data);
  if (
    !request.isDataBinary &&
    parsedQuery &&
    parsedQuery.length &&
    !parsedQuery.some((p) => p[1] === null)
  ) {
    const dataPythonObj =
      "data = " +
      objToDictOrListOfTuples(parsedQueryAsDict || parsedQuery) +
      "\n";
    if (
      util.getHeader(request, "content-type") ===
      "application/x-www-form-urlencoded"
    ) {
      util.deleteHeader(request, "content-type");
    }
    return [dataPythonObj, false, null, null];
  }
  return [dataString, false, null, null];
}

function getFilesString(request: Request): [string, boolean] {
  let usesStdin = false;
  if (!request.multipartUploads) {
    return ["", usesStdin];
  }

  const multipartUploads = request.multipartUploads.map((m) => {
    // https://github.com/psf/requests/blob/2d5517682b3b38547634d153cea43d48fbc8cdb5/requests/models.py#L117
    //
    // Requests's multipart syntax looks like this:
    // (name/filename, content)
    // (name, open(filename/contentFile))
    // (name, (filename, open(contentFile))
    // (name, (filename, open(contentFile), contentType, headers)) // this isn't parsed from --form yet
    const name = m.name ? repr(m.name) : "None";
    const sentFilename =
      "filename" in m && m.filename ? repr(m.filename) : "None";
    if ("contentFile" in m) {
      if (m.contentFile === "-") {
        // TODO: use piped stdin if we have it
        usesStdin = true;
        return [name, "(" + sentFilename + ", sys.stdin.buffer.read())"];
      } else if (m.contentFile === m.filename) {
        return [name, "open(" + repr(m.contentFile) + ", 'rb')"];
      }
      return [
        name,
        "(" + sentFilename + ", open(" + repr(m.contentFile) + ", 'rb'))",
      ];
    }
    return [name, "(" + sentFilename + ", " + repr(m.content) + ")"];
  });

  const multipartUploadsAsDict = Object.fromEntries(multipartUploads);

  let filesString = "files = ";
  if (Object.keys(multipartUploadsAsDict).length === multipartUploads.length) {
    filesString += "{\n";
    for (const [multipartKey, multipartValue] of multipartUploads) {
      filesString += "    " + multipartKey + ": " + multipartValue + ",\n";
    }
    filesString += "}\n";
  } else {
    filesString += "[\n";
    for (const [multipartKey, multipartValue] of multipartUploads) {
      filesString += "    (" + multipartKey + ", " + multipartValue + "),\n";
    }
    filesString += "]\n";
  }

  return [filesString, usesStdin];
}

// convertVarToStringFormat will convert if inputString to f"..." format
// if inputString has possible variable as its substring
function detectEnvVar(inputString: string): [Set<string>, string] {
  // Using state machine to detect environment variable
  // Each character is an edge, state machine:
  // IN_ENV_VAR: means that currently we are iterating inside a possible environment variable
  // IN_STRING: means that currently we are iterating inside a normal string
  // For example:
  // "Hi my name is $USER_NAME !"
  // '$' --> will move state from IN_STRING to IN_ENV_VAR
  // ' ' --> will move state to IN_STRING, regardless the previous state

  const IN_ENV_VAR = 0;
  const IN_STRING = 1;

  // We only care for the unique element
  const detectedVariables: Set<string> = new Set();
  let currState = IN_STRING;
  let envVarStartIndex = -1;

  const whiteSpaceSet = new Set(" \n\t");

  const modifiedString = [];
  for (let idx = 0; idx < inputString.length; idx++) {
    const currIdx = idx;
    const currChar = inputString[currIdx];
    if (currState === IN_ENV_VAR && whiteSpaceSet.has(currChar)) {
      const newVariable = inputString.substring(envVarStartIndex, currIdx);

      if (newVariable !== "") {
        detectedVariables.add(newVariable);

        // Change $ -> {
        // Add } after the last variable name
        modifiedString.push("{" + newVariable + "}" + currChar);
      } else {
        modifiedString.push("$" + currChar);
      }
      currState = IN_STRING;
      envVarStartIndex = -1;
      continue;
    }

    if (currState === IN_ENV_VAR) {
      // Skip until we actually have the new variable
      continue;
    }

    // currState === IN_STRING
    if (currChar === "$") {
      currState = IN_ENV_VAR;
      envVarStartIndex = currIdx + 1;
    } else {
      modifiedString.push(currChar);
    }
  }

  if (currState === IN_ENV_VAR) {
    const newVariable = inputString.substring(
      envVarStartIndex,
      inputString.length
    );

    if (newVariable !== "") {
      detectedVariables.add(newVariable);
      modifiedString.push("{" + newVariable + "}");
    } else {
      modifiedString.push("$");
    }
  }

  return [detectedVariables, modifiedString.join("")];
}

export const _toPython = (
  request: Request,
  warnings: Warnings = []
): string => {
  const imports: Set<string> = new Set();
  // Currently, only assuming that the env-var only used in
  // the value part of cookies, params, or body
  const osVariables = new Set();
  const commentedOutHeaders: { [key: string]: string } = {
    // TODO: add a warning why this should be commented out?
    "accept-encoding": "",
    "content-length": "",
  };
  // https://github.com/icing/blog/blob/main/curl_on_a_weekend.md
  if (util.getHeader(request, "te") === "trailers") {
    commentedOutHeaders.te = "Requests doesn't support trailers";
  }

  let cookieStr;
  if (request.cookies) {
    // TODO: could have repeat cookies
    cookieStr = "cookies = {\n";
    for (const [cookieName, cookieValue] of request.cookies) {
      const [detectedVars, modifiedString] = detectEnvVar(cookieValue);

      const hasEnvironmentVariable = detectedVars.size > 0;

      for (const newVar of detectedVars) {
        osVariables.add(newVar);
      }

      cookieStr +=
        "    " +
        repr(cookieName) +
        ": " +
        reprWithVariable(modifiedString, hasEnvironmentVariable) +
        ",\n";
    }
    cookieStr += "}\n";
    // TODO: cookieStr should too, to avoid surprises.
    // This will stop being the case in Python 3.11
    // https://github.com/python/cpython/issues/86232
    commentedOutHeaders.cookie =
      request.cookies.length > 1
        ? "Requests sorts cookies= alphabetically"
        : "";
    if (request.cookieFiles) {
      warnings.push([
        "cookie-files",
        "passing both cookies and cookie files is not supported",
      ]);
    }
  } else if (request.cookieFiles && request.cookieFiles.length) {
    // TODO: what if user passes multiple cookie files?
    // TODO: what if user passes cookies and cookie files?
    const cookieFile = request.cookieFiles[request.cookieFiles.length - 1];
    imports.add("http");
    // TODO: do we need to .load()?
    cookieStr =
      "cookies = http.cookiejar.MozillaCookieJar(" + repr(cookieFile) + ")\n";
  }

  let proxyDict;
  if (request.proxy) {
    const proxy = request.proxy.includes("://")
      ? request.proxy
      : "http://" + request.proxy;
    const protocol = proxy.split("://")[0].toLowerCase();

    proxyDict = "proxies = {\n";
    switch (protocol) {
      case "http":
      case "https":
        // TODO: hopefully including both is right
        proxyDict += "    'http': " + repr(proxy) + ",\n";
        proxyDict += "    'https': " + repr(proxy) + ",\n";
        break;
      case "socks":
        proxyDict += "    'socks4': " + repr(proxy) + ",\n";
        break;
      case "socks4":
      case "socks5":
      case "socks5h":
      case "socks4a":
      default:
        proxyDict += "    '" + protocol + "': " + repr(proxy) + ",\n";
        break;
      // default:
      //   throw new CCError('Unsupported proxy scheme for ' + repr(request.proxy))
    }
    proxyDict += "}\n";
  }

  let certStr;
  if (request.cert) {
    certStr = "cert = ";
    if (Array.isArray(request.cert)) {
      certStr += "(" + request.cert.map(repr).join(", ") + ")";
    } else {
      certStr += repr(request.cert);
    }
    certStr += "\n";
  }

  let queryStr;
  if (request.query) {
    queryStr =
      "params = " +
      objToDictOrListOfTuples(request.queryDict || request.query) +
      "\n";
  }

  const contentType = util.getHeader(request, "content-type");
  let dataString;
  let usesStdin = false;
  let jsonDataString;
  let jsonDataStringRoundtrips;
  let filesString;
  if (request.uploadFile) {
    // If you mix --data and --upload-file, it gets weird. content-length will
    // be from --data but the data will be from --upload-file
    if (request.uploadFile === "-" || request.uploadFile === ".") {
      dataString = "data = sys.stdin.buffer.read()\n";
      usesStdin = true;
    } else {
      dataString = "with open(" + repr(request.uploadFile) + ", 'rb') as f:\n";
      dataString += "    data = f.read()\n";
    }
  } else if (request.data) {
    [dataString, usesStdin, jsonDataString, jsonDataStringRoundtrips] =
      getDataString(request);
    // Remove "Content-Type" from the headers dict
    // because Requests adds it automatically when you use json=
    if (
      jsonDataString &&
      contentType &&
      contentType.trim() === "application/json"
    ) {
      commentedOutHeaders["content-type"] = "Already added when you pass json=";
      if (!jsonDataStringRoundtrips) {
        commentedOutHeaders["content-type"] += " but not when you pass data=";
      }
    }
  } else if (request.multipartUploads) {
    [filesString, usesStdin] = getFilesString(request);
    // If you pass files= then Requests adds this header and a `boundary`
    // If you manually pass a Content-Type header it won't set a `boundary`
    // wheras curl does, so the request will fail.
    // https://github.com/curlconverter/curlconverter/issues/248
    if (
      filesString &&
      contentType &&
      contentType.trim() === "multipart/form-data" &&
      !contentType.includes("boundary=")
    ) {
      // TODO: better wording
      commentedOutHeaders["content-type"] =
        "requests won't add a boundary if this header is set when you pass files=";
    }
  }
  if (usesStdin) {
    imports.add("sys");
  }

  let headerDict;
  if (request.headers && request.headers.length) {
    // TODO: what if there are repeat headers
    headerDict = "headers = {\n";
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue;
      }
      const [detectedVars, modifiedString] = detectEnvVar(headerValue);

      const hasVariable = detectedVars.size > 0;

      for (const newVar of detectedVars) {
        osVariables.add(newVar);
      }

      let lineStart;
      if (util.has(commentedOutHeaders, headerName.toLowerCase())) {
        if (commentedOutHeaders[headerName.toLowerCase()]) {
          headerDict +=
            "    # " + commentedOutHeaders[headerName.toLowerCase()] + "\n";
        }
        lineStart = "    # ";
      } else {
        lineStart = "    ";
      }
      headerDict +=
        lineStart +
        repr(headerName) +
        ": " +
        reprWithVariable(modifiedString, hasVariable) +
        ",\n";
    }
    headerDict += "}\n";
    if (
      request.headers.length > 1 &&
      request.headers.every((h) => h[0] === h[0].toLowerCase()) &&
      !(request.http2 || request.http3)
    ) {
      warnings.push([
        "--header",
        "all the --header/-H names are lowercase, which means this may have been an HTTP/2 or HTTP/3 request. Requests only sends HTTP/1.1",
      ]);
    }
  }

  let requestLine;
  if (
    ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"].includes(
      request.method
    )
  ) {
    requestLine =
      "response = requests." +
      request.method.toLowerCase() +
      "(" +
      repr(request.urlWithoutQuery);
  } else {
    // If the method wasn't uppercase, Requests will uppercase it anyway, but we write it out in its original case
    requestLine =
      "response = requests.request(" +
      repr(request.method) +
      ", " +
      repr(request.urlWithoutQuery);
  }

  let requestLineBody = "";
  if (request.query) {
    requestLineBody += ", params=params";
  }
  if (cookieStr) {
    requestLineBody += ", cookies=cookies";
  }
  if (request.headers && request.headers.length) {
    requestLineBody += ", headers=headers";
  }
  if (request.data || request.uploadFile) {
    if (jsonDataString) {
      requestLineBody += ", json=json_data";
    } else {
      requestLineBody += ", data=data";
    }
  } else if (request.multipartUploads) {
    requestLineBody += ", files=files";
  }
  if (request.proxy) {
    requestLineBody += ", proxies=proxies";
  }
  if (request.cert) {
    requestLineBody += ", cert=cert";
  }
  if (request.insecure) {
    requestLineBody += ", verify=False";
  } else if (request.cacert || request.capath) {
    requestLineBody +=
      ", verify=" + repr((request.cacert || request.capath) as string);
  }

  if (request.auth) {
    const [user, password] = request.auth;
    const authClass = request.digest ? "HTTPDigestAuth" : "";
    requestLineBody +=
      ", auth=" + authClass + "(" + repr(user) + ", " + repr(password) + ")";
  }
  requestLineBody += ")";

  requestLine += requestLineBody;

  let pythonCode = "";

  if (osVariables.size > 0) {
    imports.add("os");
  }
  if (imports.size) {
    for (const imp of Array.from(imports).sort()) {
      pythonCode += "import " + imp + "\n";
    }
    pythonCode += "\n";
  }

  pythonCode += "import requests\n";
  if (request.auth && request.digest) {
    pythonCode += "from requests.auth import HTTPDigestAuth\n";
  }
  pythonCode += "\n";

  if (osVariables.size > 0) {
    for (const osVar of osVariables) {
      const line = `${osVar} = os.getenv('${osVar}')\n`;
      pythonCode += line;
    }

    pythonCode += "\n";
  }

  if (proxyDict) {
    pythonCode += proxyDict + "\n";
  }

  if (cookieStr) {
    pythonCode += cookieStr + "\n";
  }
  if (headerDict) {
    pythonCode += headerDict + "\n";
  }
  if (queryStr) {
    pythonCode += queryStr + "\n";
  }
  if (certStr) {
    pythonCode += certStr + "\n";
  }
  if (jsonDataString) {
    pythonCode += jsonDataString + "\n";
  } else if (dataString) {
    pythonCode += dataString + "\n";
  } else if (filesString) {
    pythonCode += filesString + "\n";
  }

  pythonCode += requestLine;

  if (jsonDataString && !jsonDataStringRoundtrips) {
    pythonCode +=
      "\n\n" +
      "# Note: json_data will not be serialized by requests\n" +
      "# exactly as it was in the original request.\n";
    pythonCode += "#" + dataString;
    pythonCode += "#" + requestLine.replace(", json=json_data", ", data=data");
  }

  if (request.output && request.output !== "/dev/null") {
    if (request.output === "-") {
      pythonCode += "\nprint(response.text)";
    } else {
      pythonCode +=
        "\n\nwith open(" +
        repr(request.output) +
        ", 'wb') as f:\n    f.write(response.content)";
    }
  }

  if (request.http2) {
    warnings.push([
      "http2",
      "this was an HTTP/2 request but requests only supports HTTP/1.1",
    ]);
  }
  if (request.http3) {
    warnings.push([
      "http3",
      "this was an HTTP/3 request but requests only supports HTTP/1.1",
    ]);
  }

  return pythonCode + "\n";
};

export const toPythonWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const python = _toPython(request, warnings);
  return [python, warnings];
};

export const toPython = (curlCommand: string | string[]): string => {
  return toPythonWarn(curlCommand)[0];
};
