import * as util from "../util.js";
import type { Request, Query, QueryDict, Warnings } from "../util.js";

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const supportedByOthers = ["max-time", "location"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// https://peps.python.org/pep-3138/
// https://www.unicode.org/reports/tr44/#GC_Values_Table
// https://unicode.org/Public/UNIDATA/UnicodeData.txt
// https://en.wikipedia.org/wiki/Plane_(Unicode)#Overview
const regexSingleEscape = /'|\\|\p{C}|\p{Z}'/gu;
const regexDoubleEscape = /"|\\|\p{C}|\p{Z}'/gu;

export function repr(s: string): string {
  let quote = "'";
  if (s.includes("'") && !s.includes('"')) {
    quote = '"';
  }
  const regex = quote === "'" ? regexSingleEscape : regexDoubleEscape;

  return (
    quote +
    s.replace(regex, (c: string): string => {
      switch (c) {
        case " ":
          return " ";
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
        case "'":
        case '"':
          return "\\" + c;
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
    quote
  );
}

// TODO: use this if string contains unmatched surrogates?
// It just replaces them with the replacement character, but at least that code would run.
export function pybescComplex(s: string): string {
  let quote = "'";
  if (s.includes("'") && !s.includes('"')) {
    quote = '"';
  }
  const quoteCode = quote.charCodeAt(0);

  // TODO: using UTF-8 here is overly simplistic and how to encode here
  // is a pretty complicated decision.
  // For starters, it would be more correct to use the same encoding as
  // the terminal when running from the command line.
  const bytes = util.UTF8encoder.encode(s);

  return (
    "b" +
    quote +
    [...bytes]
      .map((c: number): string => {
        switch (c) {
          case 0x07:
            return "\\a";
          case 0x08:
            return "\\b";
          case 0x0c:
            return "\\f";
          case 0x0a:
            return "\\n";
          case 0x0d:
            return "\\r";
          case 0x09:
            return "\\t";
          case 0x0b:
            return "\\v";
          case 0x5c:
            return "\\\\";
          case quoteCode:
            return "\\" + String.fromCharCode(c);
        }
        if (c >= 0x20 && c < 0x7f) {
          return String.fromCharCode(c);
        }
        const hex = c.toString(16);
        return "\\x" + hex.padStart(2, "0");
      })
      .join("") +
    quote
  );
}

export function reprb(s: string): string {
  const sEsc = repr(s);
  // We check until 0x7F instead of 0xFF because curl (running in a UTF-8 terminal) when it gets
  // bytes sends them as is, but if we pass b'\x80' to Requests, it will encode that byte as
  // Latin-1 instead of UTF-8.
  if (/^[\x00-\x7f]*$/.test(s)) {
    return "b" + sEsc;
  }
  // TODO: unmatched surrogates will generate code that throws an error
  return sEsc + ".encode('utf-8')";
}

function reprWithVariable(value: string, hasEnvironmentVariable: boolean) {
  // TODO: escape {}
  return hasEnvironmentVariable ? "f" + repr(value) : repr(value);
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
      // TODO: there could be differences in number syntax between Python and JavaScript
      // TODO: if the number in the JSON file is too big for JavaScript, we will lose information
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

function decodePercentEncoding(s: string): string | null {
  let decoded;
  try {
    // https://url.spec.whatwg.org/#urlencoded-parsing recommends replacing + with space
    // before decoding.
    decoded = decodeURIComponent(s.replace(/\+/g, " "));
  } catch (e) {
    if (e instanceof URIError) {
      // String contains invalid percent encoded characters
      return null;
    }
    throw e;
  }
  let roundTripKey;
  try {
    // If the query string doesn't round-trip, we cannot properly convert it.
    // TODO: this is too strict. Ideally we want to check how each runtime/library
    // percent-encodes query strings. For example, a %27 character in the input query
    // string will be decoded to a ' but won't be re-encoded into a %27 by encodeURIComponent
    roundTripKey = util.percentEncode(decoded);
  } catch (e) {
    if (e instanceof URIError) {
      return null;
    }
    throw e;
  }
  // If the original data used %20 instead of + (what requests will send), that's close enough
  if (roundTripKey !== s && roundTripKey.replace(/%20/g, "+") !== s) {
    return null;
  }
  return decoded;
}

function _consumeEntriesState(
  canBeEntries: boolean,
  dataEntries: Array<[string, string]>,
  dataEntriesState: string
): boolean {
  if (!dataEntriesState) {
    return canBeEntries;
  }

  let newEntries = dataEntriesState.split("&");
  // --data-urlencod name=content --json blah&key=value
  // should generate
  // {'name': 'content'+'blah', 'key': 'value'}
  if (dataEntries.length) {
    const [first, ...rest] = newEntries;
    if (first) {
      const decodedFirst = decodePercentEncoding(first);
      if (decodedFirst === null) {
        return false;
      }
      dataEntries[dataEntries.length - 1][1] += " + " + repr(decodedFirst);
    }
    newEntries = rest;
  }
  for (const param of newEntries) {
    const [key, val] = param.split(/=(.*)/s, 2);
    if (val === undefined) {
      return false;
    }

    const decodedKey = decodePercentEncoding(key);
    if (decodedKey === null) {
      return false;
    }
    const decodedVal = decodePercentEncoding(val);
    if (decodedVal === null) {
      return false;
    }
    dataEntries.push([decodedKey, repr(decodedVal)]);
  }
  return canBeEntries;
}

function consumeEntriesState(
  canBeEntries: boolean,
  dataEntries: Array<[string, string]>,
  dataEntriesState: string
): [boolean, Array<[string, string]>, string] {
  if (!canBeEntries) {
    return [false, [], ""];
  }
  canBeEntries = _consumeEntriesState(
    canBeEntries,
    dataEntries,
    dataEntriesState
  );
  return [canBeEntries, dataEntries, ""];
}

function dataEntriesToDict(
  dataEntries: Array<[string, string]>
): { [key: string]: Array<string> } | null {
  // Group keys
  const asDict: { [key: string]: Array<string> } = {};
  let prevKey = null;
  for (const [key, val] of dataEntries) {
    if (prevKey === key) {
      asDict[key].push(val);
    } else {
      if (!Object.prototype.hasOwnProperty.call(asDict, key)) {
        asDict[key] = [val];
      } else {
        // A repeated key with a different key between one of its repetitions
        // means we can't represent these entries as a dictionary.
        return null;
      }
    }
    prevKey = key;
  }

  return asDict;
}

function dataEntriesToPython(dataEntries: Array<[string, string]>): string {
  if (dataEntries.length === 0) {
    return "''"; // This shouldn't happen
  }

  const entriesDict = dataEntriesToDict(dataEntries);
  if (entriesDict !== null) {
    if (Object.keys(entriesDict).length === 0) {
      return "''"; // This shouldn't happen
    }
    let s = "{\n";
    for (const [key, vals] of Object.entries(entriesDict)) {
      s += "    " + repr(key) + ": ";
      if (vals.length === 0) {
        s += "''"; // This shouldn't happen
      } else if (vals.length === 1) {
        s += vals[0];
      } else {
        s += "[\n";
        for (const val of vals) {
          s += "        " + val + ",\n";
        }
        s += "    ]";
      }
      s += ",\n";
    }
    s += "}";
    return s;
  }

  let s = "[\n";
  for (const entry of dataEntries) {
    const [key, val] = entry;
    s += "    (" + repr(key) + ", " + val + "),\n";
  }
  s += "]";
  return s;
}

function getDataString(
  request: Request
): [string | null, Set<string>, string | null, boolean | null] {
  const imports: Set<string> = new Set();
  if (!request.data || !request.dataArray) {
    return [null, imports, null, null];
  }

  // There's 3 things you can pass as the data= argument to Requests (in descending order of preference):
  //   a dictionary, or a list of tuples (if the dictionary would have duplicate keys)
  //   a string
  //   bytes
  // We generate the 3 representations in parallel and decide while we're generating
  // which ones we can't use.

  // data= can't be a dict or a list of tuples (i.e. entries) when
  // - there is a @file from --data, --data-binary or --json
  // - there is a --data-urlencode without a name= or name@
  // - if you split the input on & and there's a value that doesn't contain an = (e.g. --data "foo=bar&" or simply --data "&")
  // - there is a name or value that doesn't roundtrip through percent encoding
  let canBeEntries = true;
  let dataEntries: Array<[string, string]> = [];
  let dataEntriesState = "";

  const dataLines = [];
  // If we see a string with non-ASCII characters, or read from a file (which may contain
  // non - ASCII characters), we convert the entire string to bytes at the end.
  // curl sends bytes as-is, which is presumably in UTF-8, whereas Requests sends
  // 0x80-0xFF as Latin-1 (as-is) and throws an error if it sees codepoints
  // above 0xFF.
  // TODO: is this actually helpful?
  let encode = false;
  let encodeOnSeparateLine = false;

  // If one of the arguments has to be binary, then they all have to be binary
  // because we can't mix bytes and str.
  // An argument has to be binary when the input command has
  // --data-binary @filename
  // otherwise we will generate code that will try to read an image file as text and error.
  const dataLinesBinary = [];
  let isBinary = false;

  for (const [i, d] of request.dataArray.entries()) {
    const [type, value] = d;

    const op = i === 0 ? "=" : "+=";
    let line = `data ${op} `;
    let binLine = line;

    const joiner = i === 0 || type === "json" ? "" : "&";
    if (["data", "binary", "json"].includes(type) && value.startsWith("@")) {
      const filename = value.slice(1);

      let fileObj: string | null = null;
      let binFileObj: string | null = null;
      let fileContents: string | null = null;
      if (filename === "-") {
        if (request.stdin) {
          fileContents = ["binary", "json"].includes(type)
            ? request.stdin
            : request.stdin.replace(/[\n\r]/g, "");
        } else if (request.stdinFile) {
          line =
            "with open(" + repr(request.stdinFile) + ") as f:\n    " + line;
          binLine =
            "with open(" +
            repr(request.stdinFile) +
            ", 'rb') as f:\n    " +
            binLine;
          fileObj = binFileObj = "f";
        } else {
          fileObj = "sys.stdin";
          binFileObj = "sys.stdin.buffer";
          imports.add("sys");
        }
      } else {
        line = "with open(" + repr(filename) + ") as f:\n    " + line;
        binLine =
          "with open(" + repr(filename) + ", 'rb') as f:\n    " + binLine;
        fileObj = binFileObj = "f";
      }

      if (fileContents === null) {
        if (joiner) {
          line += repr(joiner) + " + ";
          encodeOnSeparateLine = true;

          binLine += reprb(joiner) + " + ";
        }
        line += fileObj;
        binLine += binFileObj;

        if (type === "binary") {
          line += ".read()"; // we don't care about `line` anymore because isBinary = true
          binLine += ".read()";
          isBinary = true;
        } else {
          line += ".read().replace('\\n', '').replace('\\r', '')";
          binLine += ".read().replace(b'\\n', b'').replace(b'\\r', b'')";
        }

        encode = true;
        canBeEntries = false;
      } else {
        line += repr(joiner + fileContents);
        binLine += reprb(joiner + fileContents);

        encode ||= [...fileContents].some((c) => c > "\xff");
        if (canBeEntries) {
          dataEntriesState += joiner + fileContents;
        }
        // TODO:
        // isBinary ||= [...fileContents].some((c) => c > "\xff");
      }
    } else if (type === "urlencode") {
      let name: string | null = null;
      let content = value;
      let binContent = value;
      let entriesContent = value;
      let contentIsCode = false;

      if (value.includes("=")) {
        // If = is the first character then it's removed
        [name, content] = value.split(/=(.*)/s, 2);
        entriesContent = binContent = content;
      } else if (value.includes("@")) {
        contentIsCode = true;
        [name, content] = value.split(/@(.*)/s, 2);
        binContent = content;
        if (content === "-") {
          if (request.stdin) {
            content = binContent = entriesContent = request.stdin;
            contentIsCode = false;
          } else if (request.stdinFile) {
            line =
              "with open(" + repr(request.stdinFile) + ") as f:\n    " + line;
            binLine =
              "with open(" +
              repr(request.stdinFile) +
              ", 'rb') as f:\n    " +
              binLine;
            // TODO: change safe= etc. to match curl
            content = binContent = "quote(f.read())";
            entriesContent = "open(" + repr(request.stdinFile) + ").read()";
            imports.add("urllib.parse.quote");
          } else {
            content = "quote(sys.stdin.read())";
            binContent = "quote(sys.stdin.buffer.read())";
            entriesContent = "sys.stdin.read()";
            imports.add("sys");
            imports.add("urllib.parse.quote");
          }
        } else {
          line = "with open(" + repr(content) + ") as f:\n    " + line;
          binLine =
            "with open(" + repr(binContent) + ", 'rb') as f:\n    " + binLine;

          // TODO: change safe= etc. to match curl
          content = binContent = "quote(f.read())";
          entriesContent = "open(" + repr(content) + ").read()";
          imports.add("urllib.parse.quote");
        }
      }

      if (name) {
        [canBeEntries, dataEntries, dataEntriesState] = consumeEntriesState(
          canBeEntries,
          dataEntries,
          dataEntriesState
        );
        if (contentIsCode) {
          line += repr(joiner + name + "=") + " + " + content;
          binLine += reprb(joiner + name + "=") + " + " + binContent;
          encode = true;
          encodeOnSeparateLine = true;
          if (canBeEntries) {
            dataEntries.push([name, entriesContent]);
          }
        } else {
          const rawValue = joiner + name + "=" + util.percentEncode(content);
          line += repr(rawValue);
          binLine += reprb(rawValue);
          if (canBeEntries) {
            dataEntries.push([name, repr(entriesContent)]);
          }
        }
      } else {
        canBeEntries = false;
        if (contentIsCode) {
          if (joiner) {
            line += repr(joiner) + " + ";
            encodeOnSeparateLine = true;
            binLine += reprb(joiner) + " + ";
          }
          line += content;
          binLine += binContent;
          encode = true;
        } else {
          const rawValue = joiner + util.percentEncode(content);
          line += repr(rawValue);
          binLine += reprb(rawValue);
        }
      }
    } else {
      line += repr(joiner + value);
      encode ||= [...value].some((c) => c > "\xff");

      binLine += reprb(joiner + value);

      if (canBeEntries) {
        dataEntriesState += joiner + value;
      }
    }

    dataLines.push(line);
    dataLinesBinary.push(binLine);
  }
  if (encode) {
    if (dataLines.length === 1 && !encodeOnSeparateLine) {
      dataLines[0] += ".encode('utf-8')";
    } else {
      dataLines.push("data = data.encode('utf-8')");
    }
  }
  const dataString = (isBinary ? dataLinesBinary : dataLines).join("\n") + "\n";
  [canBeEntries, dataEntries, dataEntriesState] = consumeEntriesState(
    canBeEntries,
    dataEntries,
    dataEntriesState
  );

  const contentTypeHeader = util.getHeader(request, "content-type");
  const isJson =
    !(request.dataFiles && request.dataFiles.length) &&
    contentTypeHeader &&
    contentTypeHeader.split(";")[0].trim() === "application/json";
  if (isJson) {
    try {
      // TODO: repeated dictionary keys are discarded
      const dataAsJson = JSON.parse(request.data);
      // Requests uses Python's builtin json library
      // https://github.com/psf/requests/blob/b0e025ade7ed30ed53ab61f542779af7e024932e/requests/models.py#L473
      // which serializes JSON with spaces between : and ,
      // but JSON.stringify() doesn't add spaces. So mostly this is
      // guarding against loss in precision in very long numbers.
      // TODO: reimplement JSON.stringify() to match Python's json.dumps()
      const roundtrips = JSON.stringify(dataAsJson) === request.data;
      const jsonDataString = "json_data = " + objToPython(dataAsJson) + "\n";
      return [dataString, imports, jsonDataString, roundtrips];
    } catch {}
  }

  if (canBeEntries && dataEntries.length) {
    // TODO: warn that spaces encoded as '%20' are encoded as '+' by Requests
    const dataPythonObj = "data = " + dataEntriesToPython(dataEntries) + "\n";
    if (
      util.getHeader(request, "content-type") ===
      "application/x-www-form-urlencoded"
    ) {
      util.deleteHeader(request, "content-type");
    }
    imports.delete("urllib.parse.quote");
    return [dataPythonObj, imports, null, null];
  }
  return [dataString, imports, null, null];
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

// TODO: get this from the input AST because strings can contain $
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
  let jsonDataString;
  let jsonDataStringRoundtrips;
  let filesString;
  if (request.uploadFile) {
    // If you mix --data and --upload-file, it gets weird. content-length will
    // be from --data but the data will be from --upload-file
    if (request.uploadFile === "-" || request.uploadFile === ".") {
      dataString = "data = sys.stdin.buffer.read()\n";
      imports.add("sys");
    } else {
      dataString = "with open(" + repr(request.uploadFile) + ", 'rb') as f:\n";
      dataString += "    data = f.read()\n";
    }
  } else if (request.data) {
    let dataImports: Set<string>;
    [dataString, dataImports, jsonDataString, jsonDataStringRoundtrips] =
      getDataString(request);
    dataImports.forEach(imports.add, imports);
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
    let usesStdin = false;
    [filesString, usesStdin] = getFilesString(request);
    if (usesStdin) {
      imports.add("sys");
    }
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
      if (imp === "urllib.parse.quote") {
        // TODO: use quote_plus instead, since that's what Requests uses?
        pythonCode += "from urllib.parse import quote\n";
      } else {
        pythonCode += "import " + imp + "\n";
      }
    }
    if (imports.size > 1) {
      pythonCode += "\n";
    }
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
    pythonCode += dataString
      ?.split("\n")
      // Don't add comment characters to empty lines, most importantly the last line
      .map((l) => (l.trim() ? "#" + l : l))
      .join("\n");
    // TODO: do this correctly?
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
