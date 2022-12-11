import URL from "url";

import parser from "./bash-parser.js";
import type { Parser } from "./bash-parser.js";
import {
  parseArgs,
  strdup,
  HTTPREQ_SIMPLEPOST,
  HTTPREQ_HEAD,
  HTTPREQ_GET,
  curlLongOpts as newCurlLongOpts,
  curlShortOpts as newCurlShortOpts,
} from "./curl/getparam.js";
import type { GlobalConfig, OperationConfig } from "./curl/cfgable.js";

// TODO: this type doesn't work.
function has<T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isInt(s: string): boolean {
  return /^\s*[+-]?\d+$/.test(s);
}

export class CCError extends Error {}

function pushProp<Type>(
  obj: { [key: string]: Type[] },
  prop: string,
  value: Type
) {
  if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
    obj[prop] = [];
  }
  obj[prop].push(value);
  return obj;
}

interface _LongShort {
  name?: string; // added dynamically
  type: "string" | "number" | "bool";
  expand?: boolean;
  removed?: string;
}

interface LongShort {
  name: string;
  type: "string" | "number" | "bool";
  expand?: boolean;
  removed?: string;
}

interface _LongOpts {
  [key: string]: _LongShort;
}
interface LongOpts {
  [key: string]: LongShort | null;
}
interface ShortOpts {
  [key: string]: string;
}

type Query = Array<[string, string | null]>;
interface QueryDict {
  [key: string]: string | null | Array<string | null>;
}

type Headers = Array<[string, string | null]>;

type Cookie = [string, string];
type Cookies = Array<Cookie>;

type FormParam = { value: string; type: "string" | "form" };
type FullDataParam = ["data" | "raw" | "binary" | "urlencode" | "json", string];

type DataParam = [
  "data" | "binary" | "urlencode" | "json",
  string | null,
  string
];
interface ParsedArguments {
  request?: string; // the HTTP method
  data?: FullDataParam[];
  jsoned?: boolean;
  authtype: number;
  form?: FormParam[];
  // TODO
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const CURLAUTH_BASIC = 1 << 0;
const CURLAUTH_DIGEST = 1 << 1;
const CURLAUTH_NEGOTIATE = 1 << 2;
const CURLAUTH_NTLM = 1 << 3;
const CURLAUTH_DIGEST_IE = 1 << 4;
const CURLAUTH_NTLM_WB = 1 << 5;
const CURLAUTH_BEARER = 1 << 6;
const CURLAUTH_AWS_SIGV4 = 1 << 7;
const CURLAUTH_ANY = ~CURLAUTH_DIGEST_IE;

// This is this function
// https://github.com/curl/curl/blob/curl-7_86_0/lib/http.c#L455
// which is not the correct function, since it works on the response.
//
// Curl also filters out auth schemes it doesn't support,
// https://github.com/curl/curl/blob/curl-7_86_0/lib/setopt.c#L970
// but we support all of them, so we don't need to do that.
function pickAuth(mask: number): string {
  const auths: [number, string][] = [
    [CURLAUTH_NEGOTIATE, "negotiate"],
    [CURLAUTH_BEARER, "bearer"],
    [CURLAUTH_DIGEST, "digest"],
    [CURLAUTH_NTLM, "ntlm"],
    [CURLAUTH_NTLM_WB, "ntlm-wb"],
    [CURLAUTH_BASIC, "basic"],
    // This check happens outside this function because we obviously
    // don't need to to specify --no-basic to use aws-sigv4
    // https://github.com/curl/curl/blob/curl-7_86_0/lib/setopt.c#L678-L679
    [CURLAUTH_AWS_SIGV4, "aws-sigv4"],
  ];
  for (const [auth, authName] of auths) {
    if (mask & auth) {
      return authName;
    }
  }
  return "none";
}

type Warnings = [string, string][];

function pushArgValue(config: ParsedArguments, argName: string, value: string) {
  switch (argName) {
    case "data":
    case "data-ascii":
      return pushProp(config, "data", ["data", value]);
    case "data-binary":
      return pushProp(config, "data", [
        // Unless it's a file, --data-binary works the same as --data
        value.startsWith("@") ? "binary" : "data",
        value,
      ]);
    case "data-raw":
      return pushProp(config, "data", [
        // Unless it's a file, --data-raw works the same as --data
        value.startsWith("@") ? "raw" : "data",
        value,
      ]);
    case "data-urlencode":
      return pushProp(config, "data", ["urlencode", value]);
    case "json":
      config.jsoned = true;
      return pushProp(config, "data", ["json", value]);
    // TODO: case "url-query":

    case "form":
      return pushProp(config, "form", { value, type: "form" });
    case "form-string":
      return pushProp(config, "form", { value, type: "string" });

    case "user":
      return pushProp(config, "userpwd", value);
    case "aws-sigv4":
      config.authtype |= CURLAUTH_AWS_SIGV4;
      return pushProp(config, "aws_sigv4", value);
    case "oauth2-bearer":
      config.authtype |= CURLAUTH_BEARER;
      return pushProp(config, "oauth_bearer", value);
  }

  return pushProp(config, argName, value);
}

function setArgValue(
  config: ParsedArguments,
  argName: string,
  toggle: boolean
) {
  switch (argName) {
    case "digest":
      if (toggle) {
        config.authtype |= CURLAUTH_DIGEST;
      } else {
        config.authtype &= ~CURLAUTH_DIGEST;
      }
      break;
    case "negotiate":
      if (toggle) {
        config.authtype |= CURLAUTH_NEGOTIATE;
      } else {
        config.authtype &= ~CURLAUTH_NEGOTIATE;
      }
      break;
    case "ntlm":
      if (toggle) {
        config.authtype |= CURLAUTH_NTLM;
      } else {
        config.authtype &= ~CURLAUTH_NTLM;
      }
      break;
    case "ntlm-wb":
      if (toggle) {
        config.authtype |= CURLAUTH_NTLM_WB;
      } else {
        config.authtype &= ~CURLAUTH_NTLM_WB;
      }
      break;
    case "basic":
      if (toggle) {
        config.authtype |= CURLAUTH_BASIC;
      } else {
        config.authtype &= ~CURLAUTH_BASIC;
      }
      break;
    case "anyauth":
      if (toggle) {
        config.authtype = CURLAUTH_ANY;
      }
      break;
    case "location":
      config["location"] = toggle;
      break;
    case "location-trusted":
      config["location"] = toggle;
      config["location-trusted"] = toggle;
      break;
    default:
      config[argName] = toggle;
  }
}

// Arguments which are supported by all generators, because they're
// already handled in util.ts or because they're easy to implement
const COMMON_SUPPORTED_ARGS: string[] = [
  "url",
  "proto-default",
  // Method
  "request",
  "get",
  "head",
  "no-head",
  // Headers
  "header", // TODO: can be a file
  "user-agent",
  "referer",
  "range",
  "time-cond",
  "cookie", // TODO: can be a file
  "oauth2-bearer",
  // Basic Auth
  "user",
  "basic",
  "no-basic",
  // Data
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
];

interface Request {
  // If the ?query can't be losslessly parsed, then
  // Request.query === undefined and
  // Request.urlWithouQuery === Request.url
  url: string;
  urlWithoutQuery: string;
  query?: Query;
  queryDict?: QueryDict;
  method: string;
  headers?: Headers;
  stdin?: string;
  stdinFile?: string;
  multipartUploads?: ({
    name: string;
  } & ({ content: string } | { contentFile: string; filename?: string }))[];
  authType: string;
  auth?: [string, string];
  awsSigV4?: string;
  delegation?: string;
  cookies?: Cookies;
  cookieFiles?: string[];
  cookieJar?: string;
  compressed?: boolean;
  dataArray?: (string | DataParam)[];
  data?: string;
  dataFiles?: Array<[string, string]>;
  isDataBinary?: boolean;
  isDataRaw?: boolean;
  uploadFile?: string;
  insecure?: boolean;
  cert?: string | [string, string];
  cacert?: string;
  capath?: string;
  proxy?: string;
  proxyAuth?: string;
  timeout?: string;
  connectTimeout?: string;
  followRedirects?: boolean;
  followRedirectsTrusted?: boolean;
  maxRedirects?: string;
  output?: string;
  http2?: boolean;
  http3?: boolean;
}

// BEGIN GENERATED CURL OPTIONS
const _curlLongOpts: _LongOpts = {
  url: { type: "string" },
  "dns-ipv4-addr": { type: "string" },
  "dns-ipv6-addr": { type: "string" },
  "random-file": { type: "string" },
  "egd-file": { type: "string" },
  "oauth2-bearer": { type: "string" },
  "connect-timeout": { type: "string" },
  "doh-url": { type: "string" },
  ciphers: { type: "string" },
  "dns-interface": { type: "string" },
  "disable-epsv": { type: "bool", name: "epsv" },
  "no-disable-epsv": { type: "bool", name: "epsv", expand: false },
  "disallow-username-in-url": { type: "bool" },
  "no-disallow-username-in-url": {
    type: "bool",
    name: "disallow-username-in-url",
    expand: false,
  },
  epsv: { type: "bool" },
  "no-epsv": { type: "bool", name: "epsv", expand: false },
  "dns-servers": { type: "string" },
  trace: { type: "string" },
  npn: { type: "bool" },
  "no-npn": { type: "bool", name: "npn", expand: false },
  "trace-ascii": { type: "string" },
  alpn: { type: "bool" },
  "no-alpn": { type: "bool", name: "alpn", expand: false },
  "limit-rate": { type: "string" },
  compressed: { type: "bool" },
  "no-compressed": { type: "bool", name: "compressed", expand: false },
  "tr-encoding": { type: "bool" },
  "no-tr-encoding": { type: "bool", name: "tr-encoding", expand: false },
  digest: { type: "bool" },
  "no-digest": { type: "bool", name: "digest", expand: false },
  negotiate: { type: "bool" },
  "no-negotiate": { type: "bool", name: "negotiate", expand: false },
  ntlm: { type: "bool" },
  "no-ntlm": { type: "bool", name: "ntlm", expand: false },
  "ntlm-wb": { type: "bool" },
  "no-ntlm-wb": { type: "bool", name: "ntlm-wb", expand: false },
  basic: { type: "bool" },
  "no-basic": { type: "bool", name: "basic", expand: false },
  anyauth: { type: "bool" },
  "no-anyauth": { type: "bool", name: "anyauth", expand: false },
  wdebug: { type: "bool" },
  "no-wdebug": { type: "bool", name: "wdebug", expand: false },
  "ftp-create-dirs": { type: "bool" },
  "no-ftp-create-dirs": {
    type: "bool",
    name: "ftp-create-dirs",
    expand: false,
  },
  "create-dirs": { type: "bool" },
  "no-create-dirs": { type: "bool", name: "create-dirs", expand: false },
  "create-file-mode": { type: "string" },
  "max-redirs": { type: "string" },
  "proxy-ntlm": { type: "bool" },
  "no-proxy-ntlm": { type: "bool", name: "proxy-ntlm", expand: false },
  crlf: { type: "bool" },
  "no-crlf": { type: "bool", name: "crlf", expand: false },
  stderr: { type: "string" },
  "aws-sigv4": { type: "string" },
  interface: { type: "string" },
  krb: { type: "string" },
  krb4: { type: "string", name: "krb" },
  "haproxy-protocol": { type: "bool" },
  "no-haproxy-protocol": {
    type: "bool",
    name: "haproxy-protocol",
    expand: false,
  },
  "max-filesize": { type: "string" },
  "disable-eprt": { type: "bool", name: "eprt" },
  "no-disable-eprt": { type: "bool", name: "eprt", expand: false },
  eprt: { type: "bool" },
  "no-eprt": { type: "bool", name: "eprt", expand: false },
  xattr: { type: "bool" },
  "no-xattr": { type: "bool", name: "xattr", expand: false },
  "ftp-ssl": { type: "bool", name: "ssl" },
  "no-ftp-ssl": { type: "bool", name: "ssl", expand: false },
  ssl: { type: "bool" },
  "no-ssl": { type: "bool", name: "ssl", expand: false },
  "ftp-pasv": { type: "bool" },
  "no-ftp-pasv": { type: "bool", name: "ftp-pasv", expand: false },
  socks5: { type: "string" },
  "tcp-nodelay": { type: "bool" },
  "no-tcp-nodelay": { type: "bool", name: "tcp-nodelay", expand: false },
  "proxy-digest": { type: "bool" },
  "no-proxy-digest": { type: "bool", name: "proxy-digest", expand: false },
  "proxy-basic": { type: "bool" },
  "no-proxy-basic": { type: "bool", name: "proxy-basic", expand: false },
  retry: { type: "string" },
  "retry-connrefused": { type: "bool" },
  "no-retry-connrefused": {
    type: "bool",
    name: "retry-connrefused",
    expand: false,
  },
  "retry-delay": { type: "string" },
  "retry-max-time": { type: "string" },
  "proxy-negotiate": { type: "bool" },
  "no-proxy-negotiate": {
    type: "bool",
    name: "proxy-negotiate",
    expand: false,
  },
  "form-escape": { type: "bool" },
  "no-form-escape": { type: "bool", name: "form-escape", expand: false },
  "ftp-account": { type: "string" },
  "proxy-anyauth": { type: "bool" },
  "no-proxy-anyauth": { type: "bool", name: "proxy-anyauth", expand: false },
  "trace-time": { type: "bool" },
  "no-trace-time": { type: "bool", name: "trace-time", expand: false },
  "ignore-content-length": { type: "bool" },
  "no-ignore-content-length": {
    type: "bool",
    name: "ignore-content-length",
    expand: false,
  },
  "ftp-skip-pasv-ip": { type: "bool" },
  "no-ftp-skip-pasv-ip": {
    type: "bool",
    name: "ftp-skip-pasv-ip",
    expand: false,
  },
  "ftp-method": { type: "string" },
  "local-port": { type: "string" },
  socks4: { type: "string" },
  socks4a: { type: "string" },
  "ftp-alternative-to-user": { type: "string" },
  "ftp-ssl-reqd": { type: "bool", name: "ssl-reqd" },
  "no-ftp-ssl-reqd": { type: "bool", name: "ssl-reqd", expand: false },
  "ssl-reqd": { type: "bool" },
  "no-ssl-reqd": { type: "bool", name: "ssl-reqd", expand: false },
  sessionid: { type: "bool" },
  "no-sessionid": { type: "bool", name: "sessionid", expand: false },
  "ftp-ssl-control": { type: "bool" },
  "no-ftp-ssl-control": {
    type: "bool",
    name: "ftp-ssl-control",
    expand: false,
  },
  "ftp-ssl-ccc": { type: "bool" },
  "no-ftp-ssl-ccc": { type: "bool", name: "ftp-ssl-ccc", expand: false },
  "ftp-ssl-ccc-mode": { type: "string" },
  libcurl: { type: "string" },
  raw: { type: "bool" },
  "no-raw": { type: "bool", name: "raw", expand: false },
  post301: { type: "bool" },
  "no-post301": { type: "bool", name: "post301", expand: false },
  keepalive: { type: "bool" },
  "no-keepalive": { type: "bool", name: "keepalive", expand: false },
  "socks5-hostname": { type: "string" },
  "keepalive-time": { type: "string" },
  post302: { type: "bool" },
  "no-post302": { type: "bool", name: "post302", expand: false },
  noproxy: { type: "string" },
  "socks5-gssapi-nec": { type: "bool" },
  "no-socks5-gssapi-nec": {
    type: "bool",
    name: "socks5-gssapi-nec",
    expand: false,
  },
  "proxy1.0": { type: "string" },
  "tftp-blksize": { type: "string" },
  "mail-from": { type: "string" },
  "mail-rcpt": { type: "string" },
  "ftp-pret": { type: "bool" },
  "no-ftp-pret": { type: "bool", name: "ftp-pret", expand: false },
  proto: { type: "string" },
  "proto-redir": { type: "string" },
  resolve: { type: "string" },
  delegation: { type: "string" },
  "mail-auth": { type: "string" },
  post303: { type: "bool" },
  "no-post303": { type: "bool", name: "post303", expand: false },
  metalink: { type: "bool" },
  "no-metalink": { type: "bool", name: "metalink", expand: false },
  "sasl-authzid": { type: "string" },
  "sasl-ir": { type: "bool" },
  "no-sasl-ir": { type: "bool", name: "sasl-ir", expand: false },
  "test-event": { type: "bool" },
  "no-test-event": { type: "bool", name: "test-event", expand: false },
  "unix-socket": { type: "string" },
  "path-as-is": { type: "bool" },
  "no-path-as-is": { type: "bool", name: "path-as-is", expand: false },
  "socks5-gssapi-service": { type: "string", name: "proxy-service-name" },
  "proxy-service-name": { type: "string" },
  "service-name": { type: "string" },
  "proto-default": { type: "string" },
  "expect100-timeout": { type: "string" },
  "tftp-no-options": { type: "bool" },
  "no-tftp-no-options": {
    type: "bool",
    name: "tftp-no-options",
    expand: false,
  },
  "connect-to": { type: "string" },
  "abstract-unix-socket": { type: "string" },
  "tls-max": { type: "string" },
  "suppress-connect-headers": { type: "bool" },
  "no-suppress-connect-headers": {
    type: "bool",
    name: "suppress-connect-headers",
    expand: false,
  },
  "compressed-ssh": { type: "bool" },
  "no-compressed-ssh": { type: "bool", name: "compressed-ssh", expand: false },
  "happy-eyeballs-timeout-ms": { type: "string" },
  "retry-all-errors": { type: "bool" },
  "no-retry-all-errors": {
    type: "bool",
    name: "retry-all-errors",
    expand: false,
  },
  "http1.0": { type: "bool" },
  "http1.1": { type: "bool" },
  http2: { type: "bool" },
  "http2-prior-knowledge": { type: "bool" },
  http3: { type: "bool" },
  "http0.9": { type: "bool" },
  "no-http0.9": { type: "bool", name: "http0.9", expand: false },
  tlsv1: { type: "bool" },
  "tlsv1.0": { type: "bool" },
  "tlsv1.1": { type: "bool" },
  "tlsv1.2": { type: "bool" },
  "tlsv1.3": { type: "bool" },
  "tls13-ciphers": { type: "string" },
  "proxy-tls13-ciphers": { type: "string" },
  sslv2: { type: "bool" },
  sslv3: { type: "bool" },
  ipv4: { type: "bool" },
  ipv6: { type: "bool" },
  append: { type: "bool" },
  "no-append": { type: "bool", name: "append", expand: false },
  "user-agent": { type: "string" },
  cookie: { type: "string" },
  "alt-svc": { type: "string" },
  hsts: { type: "string" },
  "use-ascii": { type: "bool" },
  "no-use-ascii": { type: "bool", name: "use-ascii", expand: false },
  "cookie-jar": { type: "string" },
  "continue-at": { type: "string" },
  data: { type: "string" },
  "data-raw": { type: "string" },
  "data-ascii": { type: "string" },
  "data-binary": { type: "string" },
  "data-urlencode": { type: "string" },
  json: { type: "string" },
  "dump-header": { type: "string" },
  referer: { type: "string" },
  cert: { type: "string" },
  cacert: { type: "string" },
  "cert-type": { type: "string" },
  key: { type: "string" },
  "key-type": { type: "string" },
  pass: { type: "string" },
  engine: { type: "string" },
  capath: { type: "string" },
  pubkey: { type: "string" },
  hostpubmd5: { type: "string" },
  hostpubsha256: { type: "string" },
  crlfile: { type: "string" },
  tlsuser: { type: "string" },
  tlspassword: { type: "string" },
  tlsauthtype: { type: "string" },
  "ssl-allow-beast": { type: "bool" },
  "no-ssl-allow-beast": {
    type: "bool",
    name: "ssl-allow-beast",
    expand: false,
  },
  "ssl-auto-client-cert": { type: "bool" },
  "no-ssl-auto-client-cert": {
    type: "bool",
    name: "ssl-auto-client-cert",
    expand: false,
  },
  "proxy-ssl-auto-client-cert": { type: "bool" },
  "no-proxy-ssl-auto-client-cert": {
    type: "bool",
    name: "proxy-ssl-auto-client-cert",
    expand: false,
  },
  pinnedpubkey: { type: "string" },
  "proxy-pinnedpubkey": { type: "string" },
  "cert-status": { type: "bool" },
  "no-cert-status": { type: "bool", name: "cert-status", expand: false },
  "doh-cert-status": { type: "bool" },
  "no-doh-cert-status": {
    type: "bool",
    name: "doh-cert-status",
    expand: false,
  },
  "false-start": { type: "bool" },
  "no-false-start": { type: "bool", name: "false-start", expand: false },
  "ssl-no-revoke": { type: "bool" },
  "no-ssl-no-revoke": { type: "bool", name: "ssl-no-revoke", expand: false },
  "ssl-revoke-best-effort": { type: "bool" },
  "no-ssl-revoke-best-effort": {
    type: "bool",
    name: "ssl-revoke-best-effort",
    expand: false,
  },
  "tcp-fastopen": { type: "bool" },
  "no-tcp-fastopen": { type: "bool", name: "tcp-fastopen", expand: false },
  "proxy-tlsuser": { type: "string" },
  "proxy-tlspassword": { type: "string" },
  "proxy-tlsauthtype": { type: "string" },
  "proxy-cert": { type: "string" },
  "proxy-cert-type": { type: "string" },
  "proxy-key": { type: "string" },
  "proxy-key-type": { type: "string" },
  "proxy-pass": { type: "string" },
  "proxy-ciphers": { type: "string" },
  "proxy-crlfile": { type: "string" },
  "proxy-ssl-allow-beast": { type: "bool" },
  "no-proxy-ssl-allow-beast": {
    type: "bool",
    name: "proxy-ssl-allow-beast",
    expand: false,
  },
  "login-options": { type: "string" },
  "proxy-cacert": { type: "string" },
  "proxy-capath": { type: "string" },
  "proxy-insecure": { type: "bool" },
  "no-proxy-insecure": { type: "bool", name: "proxy-insecure", expand: false },
  "proxy-tlsv1": { type: "bool" },
  "socks5-basic": { type: "bool" },
  "no-socks5-basic": { type: "bool", name: "socks5-basic", expand: false },
  "socks5-gssapi": { type: "bool" },
  "no-socks5-gssapi": { type: "bool", name: "socks5-gssapi", expand: false },
  "etag-save": { type: "string" },
  "etag-compare": { type: "string" },
  curves: { type: "string" },
  fail: { type: "bool" },
  "no-fail": { type: "bool", name: "fail", expand: false },
  "fail-early": { type: "bool" },
  "no-fail-early": { type: "bool", name: "fail-early", expand: false },
  "styled-output": { type: "bool" },
  "no-styled-output": { type: "bool", name: "styled-output", expand: false },
  "mail-rcpt-allowfails": { type: "bool" },
  "no-mail-rcpt-allowfails": {
    type: "bool",
    name: "mail-rcpt-allowfails",
    expand: false,
  },
  "fail-with-body": { type: "bool" },
  "no-fail-with-body": { type: "bool", name: "fail-with-body", expand: false },
  form: { type: "string" },
  "form-string": { type: "string" },
  globoff: { type: "bool" },
  "no-globoff": { type: "bool", name: "globoff", expand: false },
  get: { type: "bool" },
  "request-target": { type: "string" },
  help: { type: "bool" },
  "no-help": { type: "bool", name: "help", expand: false },
  header: { type: "string" },
  "proxy-header": { type: "string" },
  include: { type: "bool" },
  "no-include": { type: "bool", name: "include", expand: false },
  head: { type: "bool" },
  "no-head": { type: "bool", name: "head", expand: false },
  "junk-session-cookies": { type: "bool" },
  "no-junk-session-cookies": {
    type: "bool",
    name: "junk-session-cookies",
    expand: false,
  },
  "remote-header-name": { type: "bool" },
  "no-remote-header-name": {
    type: "bool",
    name: "remote-header-name",
    expand: false,
  },
  insecure: { type: "bool" },
  "no-insecure": { type: "bool", name: "insecure", expand: false },
  "doh-insecure": { type: "bool" },
  "no-doh-insecure": { type: "bool", name: "doh-insecure", expand: false },
  config: { type: "string" },
  "list-only": { type: "bool" },
  "no-list-only": { type: "bool", name: "list-only", expand: false },
  location: { type: "bool" },
  "no-location": { type: "bool", name: "location", expand: false },
  "location-trusted": { type: "bool" },
  "no-location-trusted": {
    type: "bool",
    name: "location-trusted",
    expand: false,
  },
  "max-time": { type: "string" },
  manual: { type: "bool" },
  "no-manual": { type: "bool", name: "manual", expand: false },
  netrc: { type: "bool" },
  "no-netrc": { type: "bool", name: "netrc", expand: false },
  "netrc-optional": { type: "bool" },
  "no-netrc-optional": { type: "bool", name: "netrc-optional", expand: false },
  "netrc-file": { type: "string" },
  buffer: { type: "bool" },
  "no-buffer": { type: "bool", name: "buffer", expand: false },
  output: { type: "string" },
  "remote-name": { type: "bool" },
  "remote-name-all": { type: "bool" },
  "no-remote-name-all": {
    type: "bool",
    name: "remote-name-all",
    expand: false,
  },
  "output-dir": { type: "string" },
  proxytunnel: { type: "bool" },
  "no-proxytunnel": { type: "bool", name: "proxytunnel", expand: false },
  "ftp-port": { type: "string" },
  disable: { type: "bool" },
  "no-disable": { type: "bool", name: "disable", expand: false },
  quote: { type: "string" },
  range: { type: "string" },
  "remote-time": { type: "bool" },
  "no-remote-time": { type: "bool", name: "remote-time", expand: false },
  silent: { type: "bool" },
  "no-silent": { type: "bool", name: "silent", expand: false },
  "show-error": { type: "bool" },
  "no-show-error": { type: "bool", name: "show-error", expand: false },
  "telnet-option": { type: "string" },
  "upload-file": { type: "string" },
  user: { type: "string" },
  "proxy-user": { type: "string" },
  verbose: { type: "bool" },
  "no-verbose": { type: "bool", name: "verbose", expand: false },
  version: { type: "bool" },
  "no-version": { type: "bool", name: "version", expand: false },
  "write-out": { type: "string" },
  proxy: { type: "string" },
  preproxy: { type: "string" },
  request: { type: "string" },
  "speed-limit": { type: "string" },
  "speed-time": { type: "string" },
  "time-cond": { type: "string" },
  parallel: { type: "bool" },
  "no-parallel": { type: "bool", name: "parallel", expand: false },
  "parallel-max": { type: "string" },
  "parallel-immediate": { type: "bool" },
  "no-parallel-immediate": {
    type: "bool",
    name: "parallel-immediate",
    expand: false,
  },
  "progress-bar": { type: "bool" },
  "no-progress-bar": { type: "bool", name: "progress-bar", expand: false },
  "progress-meter": { type: "bool" },
  "no-progress-meter": { type: "bool", name: "progress-meter", expand: false },
  next: { type: "bool" },
};

const curlShortOpts: ShortOpts = {
  0: "http1.0",
  1: "tlsv1",
  2: "sslv2",
  3: "sslv3",
  4: "ipv4",
  6: "ipv6",
  a: "append",
  A: "user-agent",
  b: "cookie",
  B: "use-ascii",
  c: "cookie-jar",
  C: "continue-at",
  d: "data",
  D: "dump-header",
  e: "referer",
  E: "cert",
  f: "fail",
  F: "form",
  g: "globoff",
  G: "get",
  h: "help",
  H: "header",
  i: "include",
  I: "head",
  j: "junk-session-cookies",
  J: "remote-header-name",
  k: "insecure",
  K: "config",
  l: "list-only",
  L: "location",
  m: "max-time",
  M: "manual",
  n: "netrc",
  N: "no-buffer",
  o: "output",
  O: "remote-name",
  p: "proxytunnel",
  P: "ftp-port",
  q: "disable",
  Q: "quote",
  r: "range",
  R: "remote-time",
  s: "silent",
  S: "show-error",
  t: "telnet-option",
  T: "upload-file",
  u: "user",
  U: "proxy-user",
  v: "verbose",
  V: "version",
  w: "write-out",
  x: "proxy",
  X: "request",
  Y: "speed-limit",
  y: "speed-time",
  z: "time-cond",
  Z: "parallel",
  "#": "progress-bar",
  ":": "next",
};
// END GENERATED CURL OPTIONS

// These are options that curl used to have.
// Those that don't conflict with the current options are supported by curlconverter.
// TODO: curl's --long-options can be shortened.
// For example if curl used to only have a single option, "--blah" then
// "--bla" "--bl" and "--b" all used to be valid options as well. If later
// "--blaz" was added, suddenly those 3 shortened options are removed (because
// they are now ambiguous).
// https://github.com/curlconverter/curlconverter/pull/280#issuecomment-931241328
const _removedLongOpts: { [key: string]: _LongShort } = {
  "ftp-ascii": { type: "bool", name: "use-ascii", removed: "7.10.7" },
  port: { type: "string", removed: "7.3" },
  upload: { type: "bool", removed: "7.7" },
  continue: { type: "bool", removed: "7.9" },
  "3p-url": { type: "string", removed: "7.16.0" },
  "3p-user": { type: "string", removed: "7.16.0" },
  "3p-quote": { type: "string", removed: "7.16.0" },
  "http2.0": { type: "bool", name: "http2", removed: "7.36.0" },
  "no-http2.0": { type: "bool", name: "http2", removed: "7.36.0" },
  "telnet-options": {
    type: "string",
    name: "telnet-option",
    removed: "7.49.0",
  },
  "http-request": { type: "string", name: "request", removed: "7.49.0" },
  socks: { type: "string", name: "socks5", removed: "7.49.0" },
  "capath ": { type: "string", name: "capath", removed: "7.49.0" }, // trailing space
  ftpport: { type: "string", name: "ftp-port", removed: "7.49.0" },
  environment: { type: "bool", removed: "7.54.1" },
  // These --no-<option> flags were automatically generated and never had any effect
  "no-tlsv1": { type: "bool", name: "tlsv1", removed: "7.54.1" },
  "no-tlsv1.2": { type: "bool", name: "tlsv1.2", removed: "7.54.1" },
  "no-http2-prior-knowledge": {
    type: "bool",
    name: "http2-prior-knowledge",
    removed: "7.54.1",
  },
  "no-ipv6": { type: "bool", name: "ipv6", removed: "7.54.1" },
  "no-ipv4": { type: "bool", name: "ipv4", removed: "7.54.1" },
  "no-sslv2": { type: "bool", name: "sslv2", removed: "7.54.1" },
  "no-tlsv1.0": { type: "bool", name: "tlsv1.0", removed: "7.54.1" },
  "no-tlsv1.1": { type: "bool", name: "tlsv1.1", removed: "7.54.1" },
  "no-remote-name": { type: "bool", name: "remote-name", removed: "7.54.1" },
  "no-sslv3": { type: "bool", name: "sslv3", removed: "7.54.1" },
  "no-get": { type: "bool", name: "get", removed: "7.54.1" },
  "no-http1.0": { type: "bool", name: "http1.0", removed: "7.54.1" },
  "no-next": { type: "bool", name: "next", removed: "7.54.1" },
  "no-tlsv1.3": { type: "bool", name: "tlsv1.3", removed: "7.54.1" },
  "no-environment": { type: "bool", name: "environment", removed: "7.54.1" },
  "no-http1.1": { type: "bool", name: "http1.1", removed: "7.54.1" },
  "no-proxy-tlsv1": { type: "bool", name: "proxy-tlsv1", removed: "7.54.1" },
  "no-http2": { type: "bool", name: "http2", removed: "7.54.1" },
};
for (const [opt, val] of Object.entries(_removedLongOpts)) {
  if (!has(val, "name")) {
    val.name = opt;
  }
}
const removedLongOpts = _removedLongOpts as LongOpts; // could be stricter, there's no null values
// TODO: use this to warn users when they specify a short option that
// used to be for something else?
const changedShortOpts: { [key: string]: string } = {
  p: "used to be short for --port <port> (a since-deleted flag) until curl 7.3",
  // TODO: some of these might be renamed options
  t: "used to be short for --upload (a since-deleted boolean flag) until curl 7.7",
  c: "used to be short for --continue (a since-deleted boolean flag) until curl 7.9",
  // TODO: did -@ actually work?
  "@": "used to be short for --create-dirs until curl 7.10.7",
  Z: "used to be short for --max-redirs <num> until curl 7.10.7",
  9: "used to be short for --crlf until curl 7.10.8",
  8: "used to be short for --stderr <file> until curl 7.10.8",
  7: "used to be short for --interface <name> until curl 7.10.8",
  6: "used to be short for --krb <level> (which itself used to be --krb4 <level>) until curl 7.10.8",
  // TODO: did these short options ever actually work?
  5: "used to be another way to specify the url until curl 7.10.8",
  "*": "used to be another way to specify the url until curl 7.49.0",
  "~": "used to be short for --xattr until curl 7.49.0",
};

// These are args that users wouldn't expect to be warned about
const ignoredArgs = new Set([
  "help",
  "no-help",
  "silent",
  "no-silent",
  "verbose",
  "no-verbose",
  "version",
  "no-version",
  "progress-bar",
  "no-progress-bar",
  "progress-meter",
  "no-progress-meter",
  "show-error",
  "no-show-error",
]);

// These options can be specified more than once, they
// are always returned as a list.
// Normally, if you specify some option more than once,
// curl will just take the last one.
// TODO: extract this from curl's source code?
const canBeList = new Set([
  // TODO: unlike curl, we don't support multiple
  // URLs and just take the last one.
  "url",
  "header",
  "proxy-header",
  "form",
  "data",
  "mail-rcpt",
  "resolve",
  "connect-to",
  "cookie",
  "quote",
  "telnet-option",
]);

const shortened: { [key: string]: LongShort[] } = {};
for (const [opt, val] of Object.entries(_curlLongOpts)) {
  if (!has(val, "name")) {
    val.name = opt;
  }
}
const curlLongOpts = _curlLongOpts as LongOpts;
for (const [opt, val] of Object.entries(_curlLongOpts)) {
  // curl lets you not type the full argument as long as it's unambiguous.
  // So --sil instead of --silent is okay, --s is not.
  // This doesn't apply to options starting with --no-
  // Default 'expand' to true if not specified
  const shouldExpand = !has(val, "expand") || val.expand;
  delete val.expand;
  if (shouldExpand) {
    for (let i = 1; i < opt.length; i++) {
      const shortenedOpt = opt.slice(0, i);
      pushProp(shortened, shortenedOpt, val);
    }
  }
}
for (const [shortenedOpt, vals] of Object.entries(shortened)) {
  if (!Object.prototype.hasOwnProperty.call(curlLongOpts, shortenedOpt)) {
    if (vals.length === 1) {
      curlLongOpts[shortenedOpt] = vals[0];
    } else if (vals.length > 1) {
      // More than one option shortens to this, it's ambiguous
      curlLongOpts[shortenedOpt] = null;
    }
  }
}
for (const [removedOpt, val] of Object.entries(removedLongOpts)) {
  if (!Object.prototype.hasOwnProperty.call(curlLongOpts, removedOpt)) {
    curlLongOpts[removedOpt] = val;
  } else if (curlLongOpts[removedOpt] === null) {
    // This happens with --socks because it became --socks5 and there are multiple options
    // that start with "--socks"
    // console.error("couldn't add removed option --" + removedOpt + " to curlLongOpts because it's already ambiguous")
    // TODO: do we want to do this?
    // curlLongOpts[removedOpt] = val
  } else {
    // Almost certainly a shortened form of a still-existing option
    // This happens with --continue (now short for --continue-at)
    // and --upload (now short for --upload-file)
    // console.error("couldn't add removed option --" + removedOpt + ' to curlLongOpts because it already exists')
  }
}

function toBoolean(opt: string): boolean {
  if (opt.startsWith("no-disable-")) {
    return true;
  }
  if (opt.startsWith("disable-") || opt.startsWith("no-")) {
    return false;
  }
  return true;
}

const parseWord = (str: string): string => {
  const BACKSLASHES = /\\./gs;
  const unescapeChar = (m: string) => (m.charAt(1) === "\n" ? "" : m.charAt(1));
  return str.replace(BACKSLASHES, unescapeChar);
};
// Expansions look ${like_this}
// https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html
const parseExpansion = (str: string): string => {
  // TODO: warn if child node isn't simply "variable_name".
  return str.slice(2, -1);
};
const parseSingleQuoteString = (str: string): string => {
  const BACKSLASHES = /\\(\n|')/gs;
  const unescapeChar = (m: string) => (m.charAt(1) === "\n" ? "" : m.charAt(1));
  return str.slice(1, -1).replace(BACKSLASHES, unescapeChar);
};
const parseDoubleQuoteString = (str: string): string => {
  const BACKSLASHES = /\\(\n|\\|")/gs;
  const unescapeChar = (m: string) => (m.charAt(1) === "\n" ? "" : m.charAt(1));
  return str.slice(1, -1).replace(BACKSLASHES, unescapeChar);
};
const parseTranslatedString = (str: string): string => {
  return parseDoubleQuoteString(str.slice(1));
};
// ANSI-C quoted strings look $'like this'.
// Not all shells have them but Bash does
// https://www.gnu.org/software/bash/manual/html_node/ANSI_002dC-Quoting.html
//
// https://git.savannah.gnu.org/cgit/bash.git/tree/lib/sh/strtrans.c
const parseAnsiCString = (str: string): string => {
  const ANSI_BACKSLASHES =
    /\\(\\|a|b|e|E|f|n|r|t|v|'|"|\?|[0-7]{1,3}|x[0-9A-Fa-f]{1,2}|u[0-9A-Fa-f]{1,4}|U[0-9A-Fa-f]{1,8}|c.)/gs;
  const unescapeChar = (m: string) => {
    switch (m.charAt(1)) {
      case "\\":
        return "\\";
      case "a":
        return "\x07";
      case "b":
        return "\b";
      case "e":
      case "E":
        return "\x1B";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "v":
        return "\v";
      case "'":
        return "'";
      case '"':
        return '"';
      case "?":
        return "?";
      case "c":
        // Bash handles all characters by considering the first byte
        // of its UTF-8 input and can produce invalid UTF-8, whereas
        // JavaScript stores strings in UTF-16
        if (m.codePointAt(2)! > 127) {
          throw new CCError(
            'non-ASCII control character in ANSI-C quoted string: "\\u{' +
              m.codePointAt(2)!.toString(16) +
              '}"'
          );
        }
        // If this produces a 0x00 (null) character, it will cause bash to
        // terminate the string at that character, but we return the null
        // character in the result.
        return m[2] === "?"
          ? "\x7F"
          : String.fromCodePoint(
              m[2].toUpperCase().codePointAt(0)! & 0b00011111
            );
      case "x":
      case "u":
      case "U":
        // Hexadecimal character literal
        // Unlike bash, this will error if the the code point is greater than 10FFFF
        return String.fromCodePoint(parseInt(m.slice(2), 16));
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
        // Octal character literal
        return String.fromCodePoint(parseInt(m.slice(1), 8) % 256);
      default:
        // There must be a mis-match between ANSI_BACKSLASHES and the switch statement
        throw new CCError(
          "unhandled character in ANSI-C escape code: " + JSON.stringify(m)
        );
    }
  };

  return str.slice(2, -1).replace(ANSI_BACKSLASHES, unescapeChar);
};

const underlineBadNode = (
  curlCommand: string,
  node: Parser.SyntaxNode
): string => {
  // TODO: is this exactly how tree-sitter splits lines?
  const line = curlCommand.split("\n")[node.startPosition.row];
  const onOneLine = node.endPosition.row === node.startPosition.row;
  const end = onOneLine ? node.endPosition.column : line.length;
  return (
    `${line}\n` +
    " ".repeat(node.startPosition.column) +
    "^".repeat(end - node.startPosition.column) +
    (onOneLine ? "" : "^") // TODO: something else?
  );
};

const underlineBadNodeEnd = (
  curlCommand: string,
  node: Parser.SyntaxNode
): string => {
  // TODO: is this exactly how tree-sitter splits lines?
  const line = curlCommand.split("\n")[node.endPosition.row];
  const onOneLine = node.endPosition.row === node.startPosition.row;
  const start = onOneLine ? node.startPosition.column : 0;
  // TODO: cut off line if it's too long
  return `${line}\n` + " ".repeat(start) + "^".repeat(node.endPosition.column);
};

function toVal(node: Parser.SyntaxNode, curlCommand: string): string {
  switch (node.type) {
    case "word":
    case "simple_expansion": // TODO: handle variables properly downstream
      return parseWord(node.text);
    case "string": // TODO: handle variables
      return parseDoubleQuoteString(node.text);
    case "raw_string":
      return parseSingleQuoteString(node.text);
    case "ansii_c_string":
      return parseAnsiCString(node.text);
    case "expansion":
      return parseExpansion(node.text);
    case "string_expansion":
      return parseTranslatedString(node.text);
    case "concatenation":
      // item[]=1 turns into item=1 if we don't do this
      // https://github.com/tree-sitter/tree-sitter-bash/issues/104
      if (node.children.every((n) => n.type === "word")) {
        return node.text;
      }
      return node.children.map((c) => toVal(c, curlCommand)).join("");
    default:
      throw new CCError(
        "unexpected argument type " +
          JSON.stringify(node.type) +
          '. Must be one of "word", "string", "raw_string", "ansii_c_string", "expansion", "simple_expansion", "string_expansion" or "concatenation"\n' +
          underlineBadNode(curlCommand, node)
      );
  }
}

interface TokenizeResult {
  cmdName: string;
  args: string[];
  stdin?: string;
  stdinFile?: string;
}
const tokenize = (
  curlCommand: string,
  warnings: Warnings = []
): TokenizeResult => {
  const ast = parser.parse(curlCommand);
  // https://github.com/tree-sitter/tree-sitter-bash/blob/master/grammar.js
  // The AST must be in a nice format, i.e.
  // (program
  //   (command
  //     name: (command_name (word))
  //     argument+: (
  //       word |
  //       'string' |
  //       "raw_string" |
  //       $'ansii_c_string' |
  //       $"string_expansion" |
  //       $simple_expansion |
  //       concaten[ation)))
  //
  // TODO: support strings with variable expansions inside
  // TODO: support prefixed variables, e.g. "MY_VAR=hello curl example.com"
  // TODO: get only named children?
  if (ast.rootNode.type !== "program") {
    // TODO: better error message.
    throw new CCError(
      'expected a "program" top-level AST node, got ' +
        ast.rootNode.type +
        " instead"
    );
  }

  if (ast.rootNode.childCount < 1 || !ast.rootNode.children) {
    // TODO: better error message.
    throw new CCError('empty "program" node');
  }

  // Get the curl call AST node. Skip comments
  let command, lastNode, stdin, stdinFile;
  for (const n of ast.rootNode.children) {
    if (n.type === "comment") {
      continue;
    } else if (n.type === "command") {
      command = n;
      lastNode = n;
      break;
    } else if (n.type === "redirected_statement") {
      if (!n.childCount) {
        throw new CCError('got empty "redirected_statement" AST node');
      }
      let redirects;
      [command, ...redirects] = n.namedChildren;
      lastNode = n;
      if (command.type !== "command") {
        throw new CCError(
          'got "redirected_statement" AST node whose first child is not a "command", got ' +
            command.type +
            " instead\n" +
            underlineBadNode(curlCommand, command)
        );
      }
      if (n.childCount < 2) {
        throw new CCError(
          'got "redirected_statement" AST node with only one child - no redirect'
        );
      }
      if (redirects.length > 1) {
        warnings.push([
          "multiple-redirects",
          // TODO: only the Python generator uses the redirect so this is misleading.
          "found " +
            redirects.length +
            " redirect nodes. Only the first one will be used:\n" +
            underlineBadNode(curlCommand, redirects[1]),
        ]);
      }
      const redirect = redirects[0];
      if (redirect.type === "file_redirect") {
        stdinFile = toVal(redirect.namedChildren[0], curlCommand);
      } else if (redirect.type === "heredoc_redirect") {
        // heredoc bodies are children of the parent program node
        // https://github.com/tree-sitter/tree-sitter-bash/issues/118
        if (redirect.namedChildCount < 1) {
          throw new CCError(
            'got "redirected_statement" AST node with heredoc but no heredoc start'
          );
        }
        const heredocStart = redirect.namedChildren[0].text;
        const heredocBody = n.nextNamedSibling;
        lastNode = heredocBody;
        if (!heredocBody) {
          throw new CCError(
            'got "redirected_statement" AST node with no heredoc body'
          );
        }
        // TODO: herestrings and heredocs are different
        if (heredocBody.type !== "heredoc_body") {
          throw new CCError(
            'got "redirected_statement" AST node with heredoc but no heredoc body, got ' +
              heredocBody.type +
              " instead"
          );
        }
        // TODO: heredocs do variable expansion and stuff
        if (heredocStart.length) {
          stdin = heredocBody.text.slice(0, -heredocStart.length);
        } else {
          // this shouldn't happen
          stdin = heredocBody.text;
        }
      } else if (redirect.type === "herestring_redirect") {
        if (redirect.namedChildCount < 1 || !redirect.firstNamedChild) {
          throw new CCError(
            'got "redirected_statement" AST node with empty herestring'
          );
        }
        // TODO: this just converts bash code to text
        stdin = redirect.firstNamedChild.text;
      } else {
        throw new CCError(
          'got "redirected_statement" AST node whose second child is not one of "file_redirect", "heredoc_redirect" or "herestring_redirect", got ' +
            command.type +
            " instead"
        );
      }

      break;
    } else if (n.type === "ERROR") {
      throw new CCError(
        `Bash parsing error on line ${n.startPosition.row + 1}:\n` +
          underlineBadNode(curlCommand, n)
      );
    } else {
      // TODO: better error message.
      throw new CCError(
        'expected a "command" or "redirected_statement" AST node, instead got ' +
          ast.rootNode.children[0].type +
          "\n" +
          underlineBadNode(curlCommand, ast.rootNode.children[0])
      );
    }
  }
  // TODO: better logic, skip comments.
  if (lastNode && lastNode.nextNamedSibling) {
    // TODO: better wording
    warnings.push([
      "extra-commands",
      `curl command ends on line ${
        lastNode.endPosition.row + 1
      }, everything after this is ignored:\n` +
        underlineBadNodeEnd(curlCommand, lastNode),
    ]);

    const curlCommandLines = curlCommand.split("\n");
    const lastNodeLine = curlCommandLines[lastNode.endPosition.row];
    const impromperBackslash = lastNodeLine.match(/\\\s+$/);
    if (
      impromperBackslash &&
      curlCommandLines.length > lastNode.endPosition.row + 1 &&
      impromperBackslash.index !== undefined
    ) {
      warnings.push([
        "unescaped-newline",
        "The trailling '\\' on line " +
          (lastNode.endPosition.row + 1) +
          " is followed by whitespace, so it won't escape the newline after it:\n" +
          // TODO: cut off line if it's very long?
          lastNodeLine +
          "\n" +
          " ".repeat(impromperBackslash.index) +
          "^".repeat(impromperBackslash[0].length),
      ]);
    }
  }
  if (!command) {
    // NOTE: if you add more node types in the `for` loop above, this error needs to be updated.
    // We would probably need to keep track of the node types we've seen.
    throw new CCError(
      'expected a "command" or "redirected_statement" AST node, only found "comment" nodes'
    );
  }
  for (const n of ast.rootNode.children) {
    if (n.type === "ERROR") {
      warnings.push([
        "bash",
        `Bash parsing error on line ${n.startPosition.row + 1}:\n` +
          underlineBadNode(curlCommand, n),
      ]);
    }
  }

  if (command.childCount < 1) {
    // TODO: better error message.
    throw new CCError('empty "command" node');
  }
  // Use namedChildren so that variable_assignment/file_redirect is skipped
  // TODO: warn when command variable_assignment is skipped
  // TODO: add childrenForFieldName to tree-sitter node/web bindings
  const [cmdName, ...args] = command.namedChildren;
  if (cmdName.type !== "command_name") {
    throw new CCError(
      'expected a "command_name" AST node, found ' +
        cmdName.type +
        " instead\n" +
        underlineBadNode(curlCommand, cmdName)
    );
  }
  if (cmdName.childCount < 1) {
    throw new CCError(
      'found empty "command_name" AST node\n' +
        underlineBadNode(curlCommand, cmdName)
    );
  }

  return {
    cmdName: toVal(cmdName.firstChild!, curlCommand),
    args: args.map((a) => toVal(a, curlCommand)),
    stdin,
    stdinFile,
  };
};

const checkLongOpt = (
  lookup: string,
  longArgName: string,
  supportedOpts: Set<string>,
  warnings: Warnings
) => {
  if (!supportedOpts.has(longArgName) && !ignoredArgs.has(longArgName)) {
    // TODO: better message. include generator name?
    warnings.push([longArgName, "--" + lookup + " is not a supported option"]);
  }
};

const checkShortOpt = (
  lookup: string,
  longArgName: string,
  supportedOpts: Set<string>,
  warnings: Warnings
) => {
  if (!supportedOpts.has(longArgName) && !ignoredArgs.has(longArgName)) {
    // TODO: better message. include generator name?
    warnings.push([longArgName, "-" + lookup + " is not a supported option"]);
  }
};

// Match Python's urllib.parse.quote() behavior
// https://github.com/python/cpython/blob/3.11/Lib/urllib/parse.py#L826
// You're not supposed to percent encode non-ASCII characters, but
// both curl and Python let you do it by encoding each UTF-8 byte.
// TODO: ignore hex case?
const UTF8encoder = new TextEncoder();
export const percentEncode = (s: string): string => {
  return [...UTF8encoder.encode(s)]
    .map((b) => {
      if (
        // A-Z
        (b >= 0x41 && b <= 0x5a) ||
        // a-z
        (b >= 0x61 && b <= 0x7a) ||
        // 0-9
        (b >= 0x30 && b <= 0x39) ||
        // -._~
        b === 0x2d ||
        b === 0x2e ||
        b === 0x5f ||
        b === 0x7e
      ) {
        return String.fromCharCode(b);
      }
      return "%" + b.toString(16).toUpperCase().padStart(2, "0");
    })
    .join("");
};
export const percentEncodePlus = (s: string): string =>
  percentEncode(s).replace(/%20/g, "+");

export function parseQueryString(
  s: string | null
): [Query | null, QueryDict | null] {
  // if url is 'example.com?' => s is ''
  // if url is 'example.com'  => s is null
  if (!s) {
    return [null, null];
  }

  const asList: Query = [];
  for (const param of s.split("&")) {
    const [key, _val] = param.split(/=(.*)/s, 2);
    const val = _val === undefined ? null : _val;
    let decodedKey;
    let decodedVal;
    try {
      // https://url.spec.whatwg.org/#urlencoded-parsing recommends replacing + with space
      // before decoding.
      decodedKey = decodeURIComponent(key.replace(/\+/g, " "));
      decodedVal =
        val === null ? null : decodeURIComponent(val.replace(/\+/g, " "));
    } catch (e) {
      if (e instanceof URIError) {
        // Query string contains invalid percent encoded characters,
        // we cannot properly convert it.
        return [null, null];
      }
      throw e;
    }
    // If the query string doesn't round-trip, we cannot properly convert it.
    // TODO: this is a bit Python-specific, ideally we would check how each runtime/library
    // percent-encodes query strings. For example, a %27 character in the input query
    // string will be decoded to a ' but won't be re-encoded into a %27 by encodeURIComponent
    const roundTripKey = percentEncode(decodedKey);
    const roundTripVal = decodedVal === null ? null : percentEncode(decodedVal);
    // If the original data used %20 instead of + (what requests will send), that's close enough
    if (
      (roundTripKey !== key && roundTripKey.replace(/%20/g, "+") !== key) ||
      (roundTripVal !== null &&
        roundTripVal !== val &&
        roundTripVal.replace(/%20/g, "+") !== val)
    ) {
      return [null, null];
    }
    asList.push([decodedKey, decodedVal]);
  }

  // Group keys
  const asDict: QueryDict = {};
  let prevKey = null;
  for (const [key, val] of asList) {
    if (prevKey === key) {
      (asDict[key] as Array<string | null>).push(val);
    } else {
      if (!Object.prototype.hasOwnProperty.call(asDict, key)) {
        asDict[key] = [val];
      } else {
        // If there's a repeated key with a different key between
        // one of its repetitions, there is no way to represent
        // this query string as a dictionary.
        return [asList, null];
      }
    }
    prevKey = key;
  }

  // Convert lists with 1 element to the element
  for (const [key, val] of Object.entries(asDict)) {
    if ((val as Array<string | null>).length === 1) {
      asDict[key] = (val as Array<string | null>)[0];
    }
  }

  return [asList, asDict];
}

const buildRequest = (
  config: OperationConfig,
  _global: GlobalConfig,
  warnings: Warnings = [],
  stdin?: string,
  stdinFile?: string
): Request => {
  // TODO: handle multiple URLs
  // https://github.com/curl/curl/blob/curl-7_79_1/src/tool_operate.c#L2368-L2372
  if (!config.url_list || !config.url_list.length) {
    // TODO: better error message (could be parsing fail)
    throw "no URL specified!";
  }
  // TODO:
  let url = config.url_list[config.url_list.length - 1].url ?? "";

  // https://github.com/curl/curl/blob/curl-7_79_1/src/tool_operate.c#L680-L705
  let httpgetfields;
  if (config.postfields) {
    if (config.use_httpget) {
      /* Use the postfields data for a http get */
      httpgetfields = config.postfields;
      config.httpreq = config.no_body ? HTTPREQ_HEAD : HTTPREQ_GET;
    } else {
      config.httpreq = HTTPREQ_SIMPLEPOST;
    }
  }

  // TODO: don't make this a dictionary.
  const headers: { [key: string]: string } = {};
  let cookieString;
  // TODO: config.cookies and config.cookiefiles
  if (config.cookies && config.cookies.length) {
    cookieString = config.cookies.join(";");
  }
  if (config.headers) {
    config.headers.forEach((header) => {
      if (header.trim().toLowerCase().startsWith("cookie:")) {
        cookieString = header;
      } else {
        const components = header.split(/:(.*)/s);
        if (components[1]) {
          headers[components[0]] = components[1].trim();
        } else {
          // TODO: report error?
        }
      }
    });
  }
  // https://github.com/curl/curl/blob/dd77ccd87c5bd8713eb1184e9e004b8d76b693cd/lib/http.c#L2065
  if (config.useragent && !has(headers, "User-Agent")) {
    headers["User-Agent"] = config.useragent;
  }
  // https://github.com/curl/curl/blob/dd77ccd87c5bd8713eb1184e9e004b8d76b693cd/lib/http.c#L3092
  if (config.referer && !has(headers, "Referer")) {
    headers.Referer = config.referer;
  }
  if (config.range && !has(headers, "Range")) {
    headers.Range = config.range;
  }

  let multipartUploads: { [key: string]: string } | null = null;
  if (config.mime) {
    // TODO: this shouldn't be an object because you can have empty names
    multipartUploads = {};
    config.mime.forEach((multipartArgument) => {
      // an object
      // {
      //   name: the thing before the "="
      //   type: "file" | "text"
      //
      // then one of
      //   content: the thing after the "="
      //   filename: the filename to read to get content
      //     it might be "-" in which case the generated code needs to read from stdin
      // }
      //
      // TODO: handle files
      // satisfy typechecker
      if (multipartUploads && multipartArgument.type === "text") {
        multipartUploads[multipartArgument.name] =
          multipartArgument.content || "";
      }
    });
  }
  // TODO:
  // let cookies;
  // if (cookieString) {
  //   const cookieParseOptions = { decode: (s) => s };
  //   // separate out cookie headers into separate data structure
  //   // note: cookie is case insensitive
  //   cookies = cookie.parse(
  //     cookieString.replace(/^Cookie: /gi, ""),
  //     cookieParseOptions
  //   );
  // }

  // TODO: don't lower case method,
  // curl expects you to uppercase always, if you do -X PoSt, that's
  // what it will put as the method and we should do the same.
  //
  // https://github.com/curl/curl/blob/curl-7_79_1/lib/http.c#L2025
  let method;
  if (config.head) {
    method = "head";
  } else if (config.customrequest && config.customrequest !== "null") {
    // Safari adds `-Xnull` if it can't determine the request type
    method = config.customrequest.toLowerCase();
    // } else if (config.upload_file) { // --upload-file '' doesn't do anything.
    //   method = 'put'
  } else if (
    (has(config, "postfields") || has(config, "mime")) &&
    !config.use_httpget
  ) {
    method = "post";
  } else {
    method = "get";
  }

  // URL.parse is deprecated but it doesn't error out if the URL
  // doesn't start with "http://", unlike `new URL(url)`
  const urlObject = URL.parse(url); // eslint-disable-line

  // if GET request with postfields, convert postfields to query string
  // NB: the -G flag does not change the http verb. It just moves the data into the url.
  if (config.use_httpget) {
    urlObject.search = urlObject.search ? urlObject.search : "";
    if (config.postfields) {
      let urlQueryString = "";

      if (url.includes("?")) {
        urlQueryString += "&";
      } else {
        url += "?";
      }

      // console.log(config.postfields)
      // TODO: handle files and data type here lol
      urlQueryString += config.postfields.map((d) => d.content).join("&");
      urlObject.search += urlQueryString;
      url += urlQueryString;
      delete config.postfields;
    }
  }
  if (urlObject.search && urlObject.search.endsWith("&")) {
    urlObject.search = urlObject.search.slice(0, -1);
  }
  // TODO: if the query string doesn't round-trip back to
  // the original query string, we need to keep the URL as-is.
  // const origQueryNoQuestion = urlObject.search.startsWith('?') ? urlObject.search.substring(1) : urlObject.search
  // if (query.toString() === origQueryNoQuestion) {
  const query = new URLSearchParams(urlObject.search ?? "");
  urlObject.search = null; // Clean out the search/query portion.
  const request: any = {
    // TODO: proper type
    url: url,
    urlWithoutQuery: URL.format(urlObject),
  };
  if ([...query].length > 0) {
    request.query = query;
  }

  if (config.encoding) {
    // --compressed
    request.compressed = true;
  }

  if (Object.keys(headers).length) {
    request.headers = headers;
  }
  request.method = method;

  // TODO:
  // if (cookies) {
  //   request.cookies = cookies;
  //   request.cookieString = cookieString.replace("Cookie: ", "");
  // }
  if (multipartUploads) {
    request.multipartUploads = multipartUploads;
  }
  // TODO: set Content-Type downstream for some of these
  if (config.postfields) {
    // {
    //   mode: "binary" | "text" | "url-encoded"
    //   name: the thing before the "="
    //
    // then one of
    //   content: the thing after the "="
    //   filename: the filename to read to get content
    //     it might be "-" in which case the generated code needs to read from stdin
    // }
    const postfields = config.postfields.filter((f) => !has(f, "filename"));
    // console.log(config.postfields)
    // console.log(postfields)
    if (postfields.length) {
      request.data = postfields.map(
        (f) => f.name + "=" + (f.content ? f.content : "")
      );
    }
  }

  if (config.userpwd) {
    request.auth = config.userpwd;
  }
  if (has(request, "data")) {
    if (request.data.length > 1) {
      request.dataArray = request.data;
      request.data = request.data.join("&");
    } else {
      request.data = request.data[0];
    }
  }

  if (config.insecure_ok) {
    request.insecure = true;
  }

  return request;
};

const buildRequests = (
  _global: GlobalConfig,
  warnings: Warnings = [],
  stdin?: string,
  stdinFile?: string
) => {
  return _global.configs.map((c) => buildRequest(c, _global));
};

function parseCurlCommand(
  curlCommand: string | string[],
  supportedArgs?: Set<string>,
  warnings: Warnings = []
): Request[] {
  let cmdName: string,
    args: string[],
    stdin: undefined | string,
    stdinFile: undefined | string;
  if (Array.isArray(curlCommand)) {
    [cmdName, ...args] = curlCommand;
    if (typeof cmdName === "undefined") {
      throw new CCError("no arguments provided");
    }
  } else {
    ({ cmdName, args, stdin, stdinFile } = tokenize(curlCommand, warnings));
    if (typeof cmdName === "undefined") {
      throw new CCError("failed to parse input");
    }
  }
  if (cmdName.trim() !== "curl") {
    const shortenedCmdName =
      cmdName.length > 30 ? cmdName.slice(0, 27) + "..." : cmdName;
    if (cmdName.startsWith("curl ")) {
      throw new CCError(
        'command should begin with a single token "curl" but instead begins with ' +
          JSON.stringify(shortenedCmdName)
      );
    } else {
      throw new CCError(
        'command should begin with "curl" but instead begins with ' +
          JSON.stringify(shortenedCmdName)
      );
    }
  }

  const parsedArguments = parseArgs(
    args,
    [newCurlLongOpts, newCurlShortOpts],
    supportedArgs,
    warnings
  );

  return buildRequests(parsedArguments, warnings, stdin, stdinFile);
}

// Gets the first header, matching case-insensitively
const getHeader = (
  request: Request,
  header: string
): string | null | undefined => {
  if (!request.headers) {
    return undefined;
  }
  const lookup = header.toLowerCase();
  for (const [h, v] of request.headers) {
    if (h.toLowerCase() === lookup) {
      return v;
    }
  }
  return undefined;
};

const getContentType = (request: Request): string | null | undefined => {
  if (!request.headers) {
    return undefined;
  }
  const contentTypeHeader = getHeader(request, "content-type");
  if (!contentTypeHeader) {
    return contentTypeHeader;
  }
  return contentTypeHeader.split(";")[0].trim();
};

const _hasHeader = (headers: Headers, header: string): boolean => {
  const lookup = header.toLowerCase();
  for (const h of headers) {
    if (h[0].toLowerCase() === lookup) {
      return true;
    }
  }
  return false;
};

const hasHeader = (request: Request, header: string): boolean | undefined => {
  if (!request.headers) {
    return false;
  }
  return _hasHeader(request.headers, header);
};

const _setHeaderIfMissing = (
  headers: Headers,
  header: string,
  value: string,
  lowercase: boolean | number = false
): boolean => {
  if (_hasHeader(headers, header)) {
    return false;
  }
  headers.push([lowercase ? header.toLowerCase() : header, value]);
  return true;
};
const setHeaderIfMissing = (
  request: Request,
  header: string,
  value: string,
  lowercase: boolean | number = false
) => {
  if (!request.headers) {
    return;
  }
  return _setHeaderIfMissing(request.headers, header, value, lowercase);
};

const _deleteHeader = (headers: Headers, header: string) => {
  const lookup = header.toLowerCase();
  for (let i = headers.length - 1; i >= 0; i--) {
    if (headers[i][0].toLowerCase() === lookup) {
      headers.splice(i, 1);
    }
  }
};

const deleteHeader = (request: Request, header: string) => {
  if (!request.headers) {
    return;
  }
  return _deleteHeader(request.headers, header);
};

const countHeader = (request: Request, header: string) => {
  let count = 0;
  const lookup = header.toLowerCase();
  for (const h of request.headers || []) {
    if (h[0].toLowerCase() === lookup) {
      count += 1;
    }
  }
  return count;
};

const parseCookiesStrict = (cookieString: string): Cookies | null => {
  const cookies: Cookies = [];
  for (let cookie of cookieString.split(";")) {
    cookie = cookie.replace(/^ /, "");
    const [name, value] = cookie.split(/=(.*)/s, 2);
    if (value === undefined) {
      return null;
    }
    cookies.push([name, value]);
  }
  return cookies;
};

const parseCookies = (cookieString: string): Cookies => {
  const cookies: Cookies = [];
  for (let cookie of cookieString.split(";")) {
    cookie = cookie.trim();
    if (!cookie) {
      continue;
    }
    const [name, value] = cookie.split(/=(.*)/s, 2);
    cookies.push([name, value || ""]);
  }
  return cookies;
};

export {
  curlLongOpts,
  curlShortOpts,
  COMMON_SUPPORTED_ARGS,
  parseCurlCommand,
  parseArgs,
  buildRequests,
  getHeader,
  getContentType,
  hasHeader,
  countHeader,
  setHeaderIfMissing,
  deleteHeader,
  has,
  isInt,
  UTF8encoder,
};

export type {
  LongOpts,
  ShortOpts,
  Request,
  Cookie,
  Cookies,
  Query,
  QueryDict,
  DataParam,
  Warnings,
};
