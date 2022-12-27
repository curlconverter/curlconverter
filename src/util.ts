import parser from "./bash-parser.js";
import type { Parser } from "./bash-parser.js";

export class CCError extends Error {}

// Note: !has() will lead to type errors
function has<T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

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

function isInt(s: string): boolean {
  return /^\s*[+-]?\d+$/.test(s);
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

type QueryList = Array<[string, string]>;
interface QueryDict {
  [key: string]: string | Array<string>;
}

type Headers = Array<[string, string | null]>;

type Cookie = [string, string];
type Cookies = Array<Cookie>;

type FormType = "string" | "form";
type SrcFormParam = { value: string; type: FormType };
type FormParam = {
  name: string;
} & ({ content: string } | { contentFile: string; filename?: string });

type FileParamType = "string" | "binary" | "urlencode" | "json";
type DataType = FileParamType | "raw";

type SrcDataParam = [DataType, string];

type FileDataParam = [FileParamType, string | null, string];
// "raw"-type SrcDataParams, and `FileParamType`s that read from stdin
// when we have its contents (because it comes from a pipe) are converted
// to plain strings
type DataParam = string | FileDataParam;

// The keys should be named the same as the curl options that
// set them because they appear in error messages.
interface OperationConfig {
  request?: string; // the HTTP method

  // Not the same name as the curl options that set it
  authtype: number;
  authArgs?: [string, boolean][];

  json?: boolean;

  // canBeList
  url?: string[];
  "upload-file"?: string[];
  output?: string[];
  header?: string[];
  "proxy-header"?: string[];
  form?: SrcFormParam[];
  data?: SrcDataParam[];
  "url-query"?: SrcDataParam[];
  "mail-rcpt"?: string[];
  resolve?: string[];
  "connect-to"?: string[];
  cookie?: string[];
  quote?: string[];
  "telnet-option"?: string[];

  // TODO: list every argument
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
// These options can be specified more than once, they
// are always returned as a list.
// Normally, if you specify some option more than once,
// curl will just take the last one.
const canBeList = new Set([
  "url",
  "upload-file",
  "output",
  "header",
  "proxy-header",
  "form",
  "data",
  "url-query",
  "mail-rcpt",
  "resolve",
  "connect-to",
  "cookie",
  "quote",
  "telnet-option",

  "authArgs", // used for error messages
]);
interface GlobalConfig {
  verbose?: boolean;
  help?: boolean;
  version?: boolean;
  warnings?: Warnings;
  configs: OperationConfig[];

  // These are specific to the curlconverter cli
  language?: string;
  stdin?: boolean;
}

function warnf(global: GlobalConfig, warning: [string, string]) {
  if (!global.warnings) {
    global.warnings = [];
  }
  global.warnings.push(warning);
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
  if (mask === CURLAUTH_ANY) {
    return "basic";
  }

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

function pushArgValue(
  global: GlobalConfig,
  config: OperationConfig,
  argName: string,
  value: string
) {
  // Note: cli.ts assumes that the property names on OperationConfig
  // are the same as the passed in argument in an error message, so
  // if you do something like
  // echo curl example.com | curlconverter - --data-raw foo
  // The error message will say
  // "if you pass --stdin or -, you can't also pass --data"
  // instead of "--data-raw".
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
      config.json = true;
      return pushProp(config, "data", ["json", value]);
    case "url-query":
      if (value.startsWith("+")) {
        return pushProp(config, "url-query", ["raw", value.slice(1)]);
      }
      return pushProp(config, "url-query", ["urlencode", value]);

    case "form":
      return pushProp(config, "form", { value, type: "form" });
    case "form-string":
      return pushProp(config, "form", { value, type: "string" });

    case "aws-sigv4":
      pushProp(config, "authArgs", [argName, true]); // error reporting
      config.authtype |= CURLAUTH_AWS_SIGV4;
      break;
    case "oauth2-bearer":
      pushProp(config, "authArgs", [argName, true]); // error reporting
      config.authtype |= CURLAUTH_BEARER;
      break;

    case "language": // --language is a curlconverter specific option
      global[argName] = value;
      return;
  }

  return pushProp(config, argName, value);
}

function setArgValue(
  global: GlobalConfig,
  config: OperationConfig,
  argName: string,
  toggle: boolean
) {
  switch (argName) {
    case "digest":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_DIGEST;
      } else {
        config.authtype &= ~CURLAUTH_DIGEST;
      }
      break;
    case "negotiate":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_NEGOTIATE;
      } else {
        config.authtype &= ~CURLAUTH_NEGOTIATE;
      }
      break;
    case "ntlm":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_NTLM;
      } else {
        config.authtype &= ~CURLAUTH_NTLM;
      }
      break;
    case "ntlm-wb":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_NTLM_WB;
      } else {
        config.authtype &= ~CURLAUTH_NTLM_WB;
      }
      break;
    case "basic":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_BASIC;
      } else {
        config.authtype &= ~CURLAUTH_BASIC;
      }
      break;
    case "anyauth":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
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
    case "verbose":
    case "version":
    case "help":
    case "stdin": // --stdin or - is a curlconverter specific option
      global[argName] = toggle;
      break;
    case "next":
      // curl ignores --next if the last url node doesn't have a url
      if (
        toggle &&
        config.url &&
        config.url.length > 0 &&
        config.url.length >= (config["upload-file"] || []).length &&
        config.url.length >= (config.output || []).length
      ) {
        config = { authtype: CURLAUTH_BASIC };
        global.configs.push(config);
      }
      break;
    default:
      config[argName] = toggle;
  }
  return config;
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
  "url-query",
];

// Unsupported args that users wouldn't expect to be warned about
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

// https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L60
interface Curl_URL {
  scheme: string;

  auth?: string;
  user?: string;
  password?: string;

  // options: string /* IMAP only? */;
  host: string;
  // zoneid: string /* for numerical IPv6 addresses */;
  // port: string;
  path: string;
  query: string;
  originalQuery: string;
  fragment: string;
  // portnum: number /* the numerical version */;
}
// struct getout
// https://github.com/curl/curl/blob/curl-7_86_0/src/tool_sdecls.h#L96
// and
// struct urlpieces
// https://github.com/curl/curl/blob/curl-7_86_0/lib/urldata.h#L1336
interface RequestUrl {
  // The url exactly as it was passed in, used for error messages
  originalUrl: string;
  url: string;
  // the query string can contain instructions to
  // read the query string from a file, for example with
  // --url-query @filename
  // In that case we put "@filename" in the query string and "filename" here and
  // warn the user that they'll need to modify the code to read that file.
  queryReadsFile?: string;

  urlObj: Curl_URL;

  // If the ?query can't be losslessly parsed, then
  // .urlWithoutQueryList === .url
  // .queryList           === undefined
  urlWithoutQueryList: string;
  queryList?: QueryList;
  // When all repeated keys in queryList happen one after the other
  // ?a=1&a=1&b=2 (okay)
  // ?a=1&b=2&a=1 (doesn't work, queryList is defined but queryDict isn't)
  queryDict?: QueryDict;

  urlWithoutQueryArray: string;
  urlWithOriginalQuery: string;
  // This includes the query in the URL and the query that comes from `--get --data` or `--url-query`
  queryArray?: DataParam[];
  // This is only the query in the URL
  urlQueryArray?: DataParam[];
  uploadFile?: string;
  output?: string;

  method: string;
  auth?: [string, string];
  // TODO: should authType be per-url as well?
  // authType?: string;
}

interface Request {
  // Will have at least one element (otherwise an error is raised)
  urls: RequestUrl[];

  // Just the part that comes from `--get --data` or `--url-query` (not the query in the URL)
  // unless there's only one URL, then it will include both.
  queryArray?: DataParam[];

  authType: string;
  awsSigV4?: string;
  delegation?: string;

  headers?: Headers;
  cookies?: Cookies;
  cookieFiles?: string[];
  cookieJar?: string;
  compressed?: boolean;
  dataArray?: DataParam[];
  multipartUploads?: FormParam[];
  data?: string;
  dataReadsFile?: string;
  isDataBinary?: boolean;
  isDataRaw?: boolean;
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
  http2?: boolean;
  http3?: boolean;

  stdin?: string;
  stdinFile?: string;
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
  rate: { type: "string" },
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
  "url-query": { type: "string" },
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
  "remove-on-error": { type: "bool" },
  "no-remove-on-error": {
    type: "bool",
    name: "remove-on-error",
    expand: false,
  },
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
  "no-remote-name": { type: "bool", name: "remote-name", expand: false },
  "remote-name-all": { type: "bool" },
  "no-remote-name-all": {
    type: "bool",
    name: "remote-name-all",
    expand: false,
  },
  "output-dir": { type: "string" },
  clobber: { type: "bool" },
  "no-clobber": { type: "bool", name: "clobber", expand: false },
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
  "0": "http1.0",
  "1": "tlsv1",
  "2": "sslv2",
  "3": "sslv3",
  "4": "ipv4",
  "6": "ipv6",
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
      if (node.children.every((n: Parser.SyntaxNode) => n.type === "word")) {
        return node.text;
      }
      return node.children
        .map((n: Parser.SyntaxNode) => toVal(n, curlCommand))
        .join("");
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
    args: args.map((a: Parser.SyntaxNode) => toVal(a, curlCommand)),
    stdin,
    stdinFile,
  };
};

const checkLongOpt = (
  lookup: string,
  longArgName: string,
  supportedOpts: Set<string>,
  global: GlobalConfig
) => {
  if (!supportedOpts.has(longArgName) && !ignoredArgs.has(longArgName)) {
    // TODO: better message. include generator name?
    warnf(global, [longArgName, "--" + lookup + " is not a supported option"]);
  }
};

const checkShortOpt = (
  lookup: string,
  longArgName: string,
  supportedOpts: Set<string>,
  global: GlobalConfig
) => {
  if (!supportedOpts.has(longArgName) && !ignoredArgs.has(longArgName)) {
    // TODO: better message. include generator name?
    warnf(global, [longArgName, "-" + lookup + " is not a supported option"]);
  }
};

const parseArgs = (
  args: string[],
  longOpts: LongOpts,
  shortOpts: ShortOpts,
  supportedOpts?: Set<string>,
  warnings: Warnings = []
): GlobalConfig => {
  let config: OperationConfig = { authtype: CURLAUTH_BASIC };
  const global: GlobalConfig = { configs: [config], warnings };
  for (let i = 0, stillflags = true; i < args.length; i++) {
    let arg: string | string[] = args[i];
    let argRepr = arg;
    if (stillflags && arg.startsWith("-")) {
      if (arg === "--") {
        /* This indicates the end of the flags and thus enables the
           following (URL) argument to start with -. */
        stillflags = false;
      } else if (arg.startsWith("--")) {
        const lookup = arg.slice(2);
        const longArg = longOpts[lookup];
        if (longArg === null) {
          throw new CCError("option " + arg + ": is ambiguous");
        }
        if (typeof longArg === "undefined") {
          // TODO: extract a list of deleted arguments to check here
          throw new CCError("option " + arg + ": is unknown");
        }

        if (longArg.type === "string") {
          if (i + 1 < args.length) {
            i++;
            pushArgValue(global, config, longArg.name, args[i]);
          } else {
            throw new CCError("option " + arg + ": requires parameter");
          }
        } else {
          config = setArgValue(
            global,
            config,
            longArg.name,
            toBoolean(arg.slice(2))
          ); // TODO: all shortened args work correctly?
        }
        if (supportedOpts) {
          checkLongOpt(lookup, longArg.name, supportedOpts, global);
        }
      } else {
        // Short option. These can look like
        // -X POST    -> {request: 'POST'}
        // or
        // -XPOST     -> {request: 'POST'}
        // or multiple options
        // -ABCX POST -> {A: true, B: true, C: true, request: 'POST'}
        // or multiple options and a value for the last one
        // -ABCXPOST  -> {A: true, B: true, C: true, request: 'POST'}

        // "-" passed to curl as an argument raises an error,
        // curlconverter's command line uses it to read from stdin
        if (arg.length === 1) {
          if (has(shortOpts, "")) {
            arg = ["-", ""];
            argRepr = "-";
          } else {
            throw new CCError("option " + argRepr + ": is unknown");
          }
        }
        for (let j = 1; j < arg.length; j++) {
          if (!has(shortOpts, arg[j])) {
            if (has(changedShortOpts, arg[j])) {
              throw new CCError(
                "option " + argRepr + ": " + changedShortOpts[arg[j]]
              );
            }
            // TODO: there are a few deleted short options we could report
            throw new CCError("option " + argRepr + ": is unknown");
          }
          const lookup = arg[j];
          const shortFor = shortOpts[lookup];
          const longArg = longOpts[shortFor];
          if (longArg === null) {
            // This could happen if curlShortOpts points to a renamed option or has a typo
            throw new CCError("ambiguous short option -" + arg[j]);
          }
          if (longArg.type === "string") {
            let val;
            if (j + 1 < arg.length) {
              // treat -XPOST as -X POST
              val = arg.slice(j + 1);
              j = arg.length;
            } else if (i + 1 < args.length) {
              i++;
              val = args[i];
            } else {
              throw new CCError("option " + argRepr + ": requires parameter");
            }
            pushArgValue(global, config, longArg.name, val as string);
          } else {
            // Use shortFor because -N is short for --no-buffer
            // and we want to end up with {buffer: false}
            config = setArgValue(
              global,
              config,
              longArg.name,
              toBoolean(shortFor)
            );
          }
          if (supportedOpts && lookup) {
            checkShortOpt(lookup, longArg.name, supportedOpts, global);
          }
        }
      }
    } else {
      pushArgValue(global, config, "url", arg);
    }
  }

  for (const cfg of global.configs) {
    for (const [arg, values] of Object.entries(cfg)) {
      if (Array.isArray(values) && !canBeList.has(arg)) {
        cfg[arg] = values[values.length - 1];
      }
    }
  }
  return global;
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
): [QueryList | null, QueryDict | null] {
  // if url is 'example.com?' => s is ''
  // if url is 'example.com'  => s is null
  if (!s) {
    return [null, null];
  }

  const asList: QueryList = [];
  for (const param of s.split("&")) {
    // Most software libraries don't let you distinguish between a=&b= and a&b,
    // so if we get an `a&b`-type query string, don't bother.
    if (!param.includes("=")) {
      return [null, null];
    }

    const [key, val] = param.split(/=(.*)/s, 2);
    let decodedKey;
    let decodedVal;
    try {
      // https://url.spec.whatwg.org/#urlencoded-parsing recommends replacing + with space
      // before decoding.
      decodedKey = decodeURIComponent(key.replace(/\+/g, " "));
      decodedVal = decodeURIComponent(val.replace(/\+/g, " "));
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
    const roundTripVal = percentEncode(decodedVal);
    // If the original data used %20 instead of + (what requests will send), that's close enough
    if (
      (roundTripKey !== key && roundTripKey.replace(/%20/g, "+") !== key) ||
      (roundTripVal !== val && roundTripVal.replace(/%20/g, "+") !== val)
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
      (asDict[key] as Array<string>).push(val);
    } else if (!Object.prototype.hasOwnProperty.call(asDict, key)) {
      asDict[key] = [val];
    } else {
      // If there's a repeated key with a different key between
      // one of its repetitions, there is no way to represent
      // this query string as a dictionary.
      return [asList, null];
    }
    prevKey = key;
  }

  // Convert lists with 1 element to the element
  for (const [key, val] of Object.entries(asDict)) {
    // The type system doesn't know that val can only be an array here, but
    // creating a second object and copying everything would be less efficient.
    if (val.length === 1) {
      asDict[key] = val[0];
    }
  }

  return [asList, asDict];
}

export function parseurl(
  global: GlobalConfig,
  config: OperationConfig,
  url: string
): Curl_URL {
  // This is curl's parseurl()
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L1144
  // Except we want to accept all URLs.
  // curl further validates URLs in curl_url_get()
  // https://github.com/curl/curl/blob/curl-7_86_0/lib/urlapi.c#L1374
  const u: Curl_URL = {
    scheme: "",
    host: "",
    path: "", // with leading '/'
    query: "", // with leading '?'
    originalQuery: "", // with leading '?'
    fragment: "", // with leading '#'
  };

  // curl automatically prepends 'http' if the scheme is missing,
  // but many libraries fail if your URL doesn't have it,
  // we tack it on here to mimic curl
  //
  // RFC 3986 3.1 says
  //   scheme      = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  // but curl will accept a digit/plus/minus/dot in the first character
  // curl will also accept a url with one / like http:/localhost
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L960
  const schemeMatch = url.match(/^([a-zA-Z0-9+-.]*):\/\/*/);
  if (schemeMatch) {
    u.scheme = schemeMatch[1].toLowerCase();
    url = url.slice(schemeMatch[0].length);
  } else {
    // curl actually defaults to https://
    // but we don't because unlike curl, most libraries won't downgrade to http if you ask for https
    // TODO: handle file:// scheme
    u.scheme = config["proto-default"] ?? "http";
  }
  if (!["http", "https"].includes(u.scheme)) {
    warnf(global, ["bad-scheme", `Protocol "${u.scheme}" not supported`]);
  }

  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L992
  const hostMatch = url.match(/^(.*?)[/?#]/); // .*? means we match until the first / ? or #
  if (hostMatch) {
    u.host = hostMatch[1];
    u.path = url.slice(hostMatch[1].length); // keep leading '/'
    // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L1024
    const fragmentIndex = u.path.indexOf("#");
    const queryIndex = u.path.indexOf("?");
    if (fragmentIndex !== -1) {
      u.fragment = u.path.slice(fragmentIndex);
      if (queryIndex !== -1 && queryIndex < fragmentIndex) {
        u.query = u.path.slice(queryIndex, fragmentIndex);
        u.path = u.path.slice(0, queryIndex);
      } else {
        u.path = u.path.slice(0, fragmentIndex);
      }
    } else if (queryIndex !== -1) {
      u.query = u.path.slice(queryIndex);
      u.path = u.path.slice(0, queryIndex);
    }
  } else {
    u.host = url;
  }

  // parse username:password@hostname
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L1083
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L460
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/url.c#L2827
  const authMatch = u.host.match(/^(.*?)@/);
  if (authMatch) {
    const auth = authMatch[1];
    u.host = url.slice(authMatch[0].length); // throw away '@'
    // TODO: this makes this command line option sort of supported but not really
    if (!config["disallow-username-in-url"]) {
      // Curl will exit if this is the case, but we just remove it from the URL
      u.auth = auth;
      if (auth.includes(":")) {
        [u.user, u.password] = auth.split(/:(.*)/s, 2);
      } else {
        u.user = auth;
        u.password = ""; // if there's no ':', curl will append it
      }
    }
  }

  // TODO: need to extract port first
  // hostname_check()
  // https://github.com/curl/curl/blob/curl-7_86_0/lib/urlapi.c#L572
  // if (!u.host) {
  //   warnf(global, [
  //     "no-host",
  //     "Found empty host in URL: " + JSON.stringify(url),
  //   ]);
  // } else if (u.host.startsWith("[")) {
  //   if (!u.host.endsWith("]")) {
  //     warnf(global, [
  //       "bad-host",
  //       "Found invalid IPv6 address in URL: " + JSON.stringify(url),
  //     ]);
  //   } else {
  //     const firstWeirdCharacter = u.host.match(/[^0123456789abcdefABCDEF:.]/);
  //     // %zone_id
  //     if (firstWeirdCharacter && firstWeirdCharacter[0] !== "%") {
  //       warnf(global, [
  //         "bad-host",
  //         "Found invalid IPv6 address in URL: " + JSON.stringify(url),
  //       ]);
  //     }
  //   }
  // } else {
  //   const firstInvalidCharacter = u.host.match(
  //     /[\r\n\t/:#?!@{}[\]\\$'"^`*<>=;,]/
  //   );
  //   if (firstInvalidCharacter) {
  //     warnf(global, [
  //       "bad-host",
  //       "Found invalid character " +
  //         JSON.stringify(firstInvalidCharacter[0]) +
  //         " in URL: " +
  //         JSON.stringify(url),
  //     ]);
  //   }
  // }

  return u;
}

export function buildURL(
  global: GlobalConfig,
  config: OperationConfig,
  url: string,
  uploadFile?: string
): [
  Curl_URL,
  string,
  string | null,
  string,
  QueryList | null,
  QueryDict | null,
  string,
  string,
  DataParam[] | null,
  DataParam[] | null
] {
  const u = parseurl(global, config, url);

  // https://github.com/curl/curl/blob/curl-7_85_0/src/tool_operate.c#L1124
  // https://github.com/curl/curl/blob/curl-7_85_0/src/tool_operhlp.c#L76
  if (uploadFile) {
    // TODO: it's more complicated
    if (!u.path) {
      u.path = "/" + uploadFile;
    } else if (u.path.endsWith("/")) {
      u.path += uploadFile;
    }

    if (config.get) {
      warnf(global, [
        "data-ignored",
        "curl doesn't let you pass --get and --upload-file together",
      ]);
    }
  }

  // TODO: remove .originalQuery
  const urlWithOriginalQuery =
    u.scheme + "://" + u.host + u.path + u.query + u.fragment;

  // curl example.com example.com?foo=bar --url-query isshared=t
  // will make requests for
  // example.com/?isshared=t
  // example.com/?foo=bar&isshared=t
  //
  // so the query could come from
  //   1. `--url` (i.e. the requested URL)
  //   2. `--url-query` or `--get --data` (the latter takes precedence)
  //
  // If it comes from the latter, we might need to generate code to read
  // from one or more files.
  // When there's multiple urls, the latter applies to all of them
  // but the query from --url only applies to that URL.
  //
  // There's 3 cases for the query:
  // 1. it's well-formed and can be expressed as a list of tuples (or a dict)
  //   `?one=1&one=1&two=2`
  // 2. it can't, for example because one of the pieces doesn't have a '='
  //   `?one`
  // 3. we need to generate code that reads from a file
  //
  // If there's only one URL we merge the query from the URL with the shared part.
  //
  // If there's multiple URLs and a shared part that reads from a file (case 3),
  // we only write the file reading code once, pass it as the params= argument
  // and the part from the URL has to be passed as a string in the URL
  // and requests will combine the query in the URL with the query in params=.
  //
  // Otherwise, we print each query for each URL individually, either as a
  // list of tuples if we can or in the URL if we can't.
  //
  // When files are passed in through --data-urlencode or --url-query
  // we can usually treat them as case 1 as well (in Python), but that would
  // generate code slightly different from curl because curl reads the file once
  // upfront, whereas we would read the file multiple times and it might contain
  // different data each time (for example if it's /dev/urandom).
  let urlQueryArray: DataParam[] | null = null;
  let queryArray: DataParam[] | null = null;
  let queryStrReadsFile: string | null = null;
  if (u.query || (config["url-query"] && config["url-query"].length)) {
    let queryStr;

    let queryParts: SrcDataParam[] = [];
    if (u.query) {
      // remove the leading '?'
      queryParts.push(["raw", u.query.slice(1)]);
      [queryArray, queryStr, queryStrReadsFile] = buildData(queryParts);
      urlQueryArray = queryArray;
    }
    if (config["url-query"]) {
      queryParts = queryParts.concat(config["url-query"]);
      [queryArray, queryStr, queryStrReadsFile] = buildData(queryParts);
    }

    // TODO: check the curl source code
    // TODO: curl localhost:8888/?
    // will request /?
    // but
    // curl localhost:8888/? --url-query ''
    // (or --get --data '') will request /
    u.query = "";
    if (queryStr) {
      u.query = "?" + queryStr;
    }
  }
  const urlWithoutQueryArray = u.scheme + "://" + u.host + u.path + u.fragment;

  url = u.scheme + "://" + u.host + u.path + u.query + u.fragment;
  let urlWithoutQueryList = url;
  // TODO: parseQueryString() doesn't accept leading '?'
  let [queryList, queryDict] = parseQueryString(
    u.query ? u.query.slice(1) : ""
  );
  if (queryList && queryList.length) {
    // TODO: remove the fragment too?
    urlWithoutQueryList = u.scheme + "://" + u.host + u.path + u.fragment;
  } else {
    queryList = null;
    queryDict = null;
  }

  // TODO: --path-as-is
  return [
    u,
    url,
    queryStrReadsFile,

    urlWithoutQueryList,
    queryList,
    queryDict,

    urlWithoutQueryArray,
    urlWithOriginalQuery,
    queryArray,
    urlQueryArray,
  ];
}

function buildData(
  configData: SrcDataParam[],
  stdin?: string,
  stdinFile?: string
): [DataParam[], string, string | null] {
  const data: DataParam[] = [];
  let dataStrState = "";
  for (const [i, x] of configData.entries()) {
    const type = x[0];
    let value = x[1];
    let name: string | null = null;

    if (i > 0 && type !== "json") {
      dataStrState += "&";
    }

    if (type === "urlencode") {
      // curl checks for = before @
      const splitOn = value.includes("=") || !value.includes("@") ? "=" : "@";
      const splitOnRegex = splitOn === "=" ? /=(.*)/s : /@(.*)/s;
      // If there's no = or @ then the entire content is treated as a value and encoded
      if (value.includes("@") || value.includes("=")) {
        [name, value] = value.split(splitOnRegex, 2);
      }

      if (splitOn === "=") {
        if (name) {
          dataStrState += name + "=";
        }
        // curl's --data-urlencode percent-encodes spaces as "+"
        // https://github.com/curl/curl/blob/curl-7_86_0/src/tool_getparam.c#L630
        dataStrState += percentEncodePlus(value);
        continue;
      }

      name = name ? name : null;
      value = "@" + value;
    }

    let filename: string | null = null;

    if (type !== "raw" && value.startsWith("@")) {
      filename = value.slice(1);
      if (filename === "-") {
        if (stdin !== undefined) {
          switch (type) {
            case "binary":
            case "json":
              value = stdin;
              break;
            case "urlencode":
              value = (name ? name + "=" : "") + percentEncodePlus(stdin);
              break;
            default:
              value = stdin.replace(/[\n\r]/g, "");
          }
          filename = null;
        } else if (stdinFile !== undefined) {
          filename = stdinFile;
        } else {
          // TODO: if stdin is read twice, it will be empty the second time
          // TODO: `STDIN_SENTINEL` so that we can tell the difference between
          // a stdinFile called "-" and stdin for the error message
        }
      }
    }

    if (filename !== null) {
      if (dataStrState) {
        data.push(dataStrState);
        dataStrState = "";
      }
      // If `filename` isn't null, then `type` can't be "raw"
      data.push([type as FileParamType, name, filename]);
    } else {
      dataStrState += value;
    }
  }
  if (dataStrState) {
    data.push(dataStrState);
  }

  let dataStrReadsFile: string | null = null;
  const dataStr = data
    .map((d) => {
      if (Array.isArray(d)) {
        const name = d[1];
        const filename = d[2];
        dataStrReadsFile ||= filename; // report first file
        if (name) {
          return `${name}=@${filename}`;
        }
        return "@" + filename;
      }
      return d;
    })
    .join("");

  return [data, dataStr, dataStrReadsFile];
}

function buildRequest(
  global: GlobalConfig,
  config: OperationConfig,
  stdin?: string,
  stdinFile?: string
): Request {
  // TODO: handle multiple URLs
  if (!config.url || !config.url.length) {
    // TODO: better error message (could be parsing fail)
    throw new CCError("no URL specified!");
  }

  const headers: Headers = [];
  if (config.header) {
    for (const header of config.header) {
      if (header.startsWith("@")) {
        warnf(global, [
          "header-file",
          "passing a file for --header/-H is not supported: " +
            JSON.stringify(header),
        ]);
        continue;
      }

      if (header.includes(":")) {
        const [name, value] = header.split(/:(.*)/s, 2);
        if (!value.trim()) {
          headers.push([name, null]);
        } else {
          headers.push([name, value.replace(/^ /, "")]);
        }
      } else if (header.includes(";")) {
        const [name] = header.split(/;(.*)/s, 2);
        headers.push([name, ""]);
      }
    }
  }
  const lowercase =
    headers.length > 0 && headers.every((h) => h[0] === h[0].toLowerCase());

  let cookies;
  const cookieFiles: string[] = [];
  const cookieHeaders = headers.filter((h) => h[0].toLowerCase() === "cookie");
  if (cookieHeaders.length === 1 && cookieHeaders[0][1] !== null) {
    const parsedCookies = parseCookiesStrict(cookieHeaders[0][1]);
    if (parsedCookies) {
      cookies = parsedCookies;
    }
  } else if (cookieHeaders.length === 0 && config.cookie) {
    // If there is a Cookie header, --cookies is ignored
    const cookieStrings: string[] = [];
    for (const c of config.cookie) {
      // a --cookie without a = character reads from it as a filename
      if (c.includes("=")) {
        cookieStrings.push(c);
      } else {
        cookieFiles.push(c);
      }
    }
    if (cookieStrings.length) {
      const cookieString = config.cookie.join("; ");
      _setHeaderIfMissing(headers, "Cookie", cookieString, lowercase);
      cookies = parseCookies(cookieString);
    }
  }

  if (config["user-agent"]) {
    _setHeaderIfMissing(headers, "User-Agent", config["user-agent"], lowercase);
  }
  if (config.referer) {
    // referer can be ";auto" or followed by ";auto", we ignore that.
    const referer = config.referer.replace(/;auto$/, "");
    if (referer) {
      _setHeaderIfMissing(headers, "Referer", referer, lowercase);
    }
  }
  if (config.range) {
    let range = "bytes=" + config.range;
    if (!range.includes("-")) {
      range += "-";
    }
    _setHeaderIfMissing(headers, "Range", range, lowercase);
  }
  if (config["time-cond"]) {
    let timecond = config["time-cond"];
    let header = "If-Modified-Since";
    switch (timecond[0]) {
      case "+":
        timecond = timecond.slice(1);
        break;
      case "-":
        timecond = timecond.slice(1);
        header = "If-Unmodified-Since";
        break;
      case "=":
        timecond = timecond.slice(1);
        header = "Last-Modified";
        break;
    }
    // TODO: parse date
    _setHeaderIfMissing(headers, header, timecond, lowercase);
  }

  let data;
  let dataStr;
  let dataStrReadsFile;
  let queryArray;
  if (config.data && config.data.length) {
    if (config.get) {
      // https://github.com/curl/curl/blob/curl-7_85_0/src/tool_operate.c#L721
      // --get --data will overwrite --url-query, but if there's no --data, for example,
      // curl --url-query bar --get example.com
      // it won't
      // https://daniel.haxx.se/blog/2022/11/10/append-data-to-the-url-query/
      config["url-query"] = config.data;
      delete config.data;
    } else {
      [data, dataStr, dataStrReadsFile] = buildData(
        config.data,
        stdin,
        stdinFile
      );
    }
  }
  if (config["url-query"]) {
    [queryArray] = buildData(config["url-query"], stdin, stdinFile);
  }

  const urls: RequestUrl[] = [];
  const uploadFiles = config["upload-file"] || [];
  const outputFiles = config.output || [];
  // eslint-disable-next-line prefer-const
  for (let [i, originalUrl] of config.url.entries()) {
    const uploadFile: string | undefined = uploadFiles[i];
    const output: string | undefined = outputFiles[i];

    const [
      urlObj,
      url,
      queryReadsFile,

      urlWithoutQueryList,
      queryList,
      queryDict,

      urlWithoutQueryArray,
      urlWithOriginalQuery,
      queryArray,
      urlQueryArray,
    ] = buildURL(global, config, originalUrl, uploadFile);

    // curl expects you to uppercase methods always. If you do -X PoSt, that's what it
    // will send, but most APIs will helpfully uppercase what you pass in as the method.
    //
    // There are many places where curl determines the method, this is the last one:
    // https://github.com/curl/curl/blob/curl-7_85_0/lib/http.c#L2032
    let method = "GET";
    if (
      has(config, "request") &&
      // Safari adds `-X null` if it can't determine the request type
      // https://github.com/WebKit/WebKit/blob/f58ef38d48f42f5d7723691cb090823908ff5f9f/Source/WebInspectorUI/UserInterface/Models/Resource.js#L1250
      config.request !== "null"
    ) {
      method = config.request as string;
    } else if (config.head) {
      method = "HEAD";
    } else if (uploadFile) {
      // --upload-file '' doesn't do anything.
      method = "PUT";
    } else if ((has(config, "data") || has(config, "form")) && !config.get) {
      method = "POST";
    }

    const requestUrl: RequestUrl = {
      originalUrl,
      urlWithoutQueryList,
      url,
      urlObj,
      urlWithOriginalQuery,
      urlWithoutQueryArray,
      method,
    };
    if (queryReadsFile) {
      requestUrl.queryReadsFile = queryReadsFile;
    }
    if (queryList) {
      requestUrl.queryList = queryList;
      if (queryDict) {
        requestUrl.queryDict = queryDict;
      }
    }
    if (queryArray) {
      requestUrl.queryArray = queryArray;
    }
    if (urlQueryArray) {
      requestUrl.urlQueryArray = urlQueryArray;
    }
    if (uploadFile) {
      requestUrl.uploadFile = uploadFile;
    }
    if (output) {
      requestUrl.output = output;
    }

    // --user takes precedence over the URL
    const auth = config.user || urlObj.auth;
    if (auth) {
      const [user, pass] = auth.split(/:(.*)/s, 2);
      requestUrl.auth = [user, pass || ""];
    }

    urls.push(requestUrl);
  }
  // --get moves --data into the URL's query string
  if (config.get && config.data) {
    delete config.data;
  }

  if ((config["upload-file"] || []).length > config.url.length) {
    warnf(global, [
      "too-many-upload-files",
      "Got more --upload-file/-T options than URLs: " +
        config["upload-file"]?.map((f) => JSON.stringify(f)).join(", "),
    ]);
  }
  if ((config.output || []).length > config.url.length) {
    warnf(global, [
      "too-many-ouptut-files",
      "Got more --output/-o options than URLs: " +
        config.output?.map((f) => JSON.stringify(f)).join(", "),
    ]);
  }

  const request: Request = {
    urls,
    authType: pickAuth(config.authtype),
  };
  // TODO: warn about unused stdin?
  if (stdin) {
    request.stdin = stdin;
  }
  if (stdinFile) {
    request.stdinFile = stdinFile;
  }

  if (cookies) {
    // generators that use .cookies need to do
    // deleteHeader(request, 'cookie')
    request.cookies = cookies;
  }
  if (cookieFiles.length) {
    request.cookieFiles = cookieFiles;
  }
  if (config["cookie-jar"]) {
    request.cookieJar = config["cookie-jar"];
  }

  if (config.compressed !== undefined) {
    request.compressed = config.compressed;
  }

  if (config.json) {
    _setHeaderIfMissing(headers, "Content-Type", "application/json", lowercase);
    _setHeaderIfMissing(headers, "Accept", "application/json", lowercase);
  } else if (config.data) {
    _setHeaderIfMissing(
      headers,
      "Content-Type",
      "application/x-www-form-urlencoded",
      lowercase
    );
  } else if (config.form) {
    request.multipartUploads = [];
    for (const multipartArgument of config.form) {
      if (!multipartArgument.value.includes("=")) {
        throw new CCError(
          "invalid value for --form/-F: " +
            JSON.stringify(multipartArgument.value)
        );
      }

      // TODO: https://curl.se/docs/manpage.html#-F
      // -F is the most complicated option, we only handle
      // name=value and name=@file and name=<file
      const [name, value] = multipartArgument.value.split(/=(.*)/s, 2);
      const isString = multipartArgument.type === "string";

      if (!isString && value.charAt(0) === "@") {
        const contentFile = value.slice(1);
        const filename = contentFile;
        request.multipartUploads.push({ name, contentFile, filename });
      } else if (!isString && value.charAt(0) === "<") {
        const contentFile = value.slice(1);
        request.multipartUploads.push({ name, contentFile });
      } else {
        const content = value;
        request.multipartUploads.push({ name, content });
      }
    }
  }

  if (config["aws-sigv4"]) {
    // https://github.com/curl/curl/blob/curl-7_86_0/lib/setopt.c#L678-L679
    request.authType = "aws-sigv4";
    request.awsSigV4 = config["aws-sigv4"];
  }
  if (request.authType === "bearer") {
    _setHeaderIfMissing(
      headers,
      "Authorization",
      "Bearer " + config["oauth2-bearer"],
      lowercase
    );
  }
  if (config.delegation) {
    request.delegation = config.delegation;
  }

  if (headers.length > 0) {
    for (let i = headers.length - 1; i >= 0; i--) {
      if (headers[i][1] === null) {
        // TODO: ideally we should generate code that explicitly unsets the header too
        headers.splice(i, 1);
      }
    }
    request.headers = headers;
  }

  if (config.data && config.data.length) {
    request.data = dataStr;
    if (dataStrReadsFile) {
      request.dataReadsFile = dataStrReadsFile;
    }
    request.dataArray = data;
    // TODO: remove these
    request.isDataRaw = false;
    request.isDataBinary = (data || []).some(
      (d) => Array.isArray(d) && d[0] === "binary"
    );
  }
  if (queryArray) {
    // If we have to generate code that reads from a file, we
    // need to do it once for all URLs.
    request.queryArray = queryArray;
  }

  if (config.insecure) {
    request.insecure = true;
  }
  // TODO: if the URL doesn't start with https://, curl doesn't verify
  // certificates, etc.
  if (config.cert) {
    // --key has no effect if --cert isn't passed
    request.cert = config.key ? [config.cert, config.key] : config.cert;
  }
  if (config.cacert) {
    request.cacert = config.cacert;
  }
  if (config.capath) {
    request.capath = config.capath;
  }
  if (config.proxy) {
    // https://github.com/curl/curl/blob/e498a9b1fe5964a18eb2a3a99dc52160d2768261/lib/url.c#L2388-L2390
    request.proxy = config.proxy;
    if (config["proxy-user"]) {
      request.proxyAuth = config["proxy-user"];
    }
  }
  if (config["max-time"]) {
    request.timeout = config["max-time"];
    if (isNaN(parseFloat(config["max-time"]))) {
      warnf(global, [
        "max-time-not-number",
        "option --max-time: expected a proper numerical parameter: " +
          JSON.stringify(config["max-time"]),
      ]);
    }
  }
  if (config["connect-timeout"]) {
    request.connectTimeout = config["connect-timeout"];
    if (isNaN(parseFloat(config["connect-timeout"]))) {
      warnf(global, [
        "connect-timeout-not-number",
        "option --connect-timeout: expected a proper numerical parameter: " +
          JSON.stringify(config["connect-timeout"]),
      ]);
    }
  }
  if (Object.prototype.hasOwnProperty.call(config, "location")) {
    request.followRedirects = config.location;
  }
  if (config["location-trusted"]) {
    request.followRedirectsTrusted = config["location-trusted"];
  }
  if (config["max-redirs"]) {
    request.maxRedirects = config["max-redirs"].trim();
    if (!isInt(config["max-redirs"])) {
      warnf(global, [
        "max-redirs-not-int",
        "option --max-redirs: expected a proper numerical parameter: " +
          JSON.stringify(config["max-redirs"]),
      ]);
    }
  }

  const http2 = config.http2 || config["http2-prior-knowledge"];
  if (http2) {
    request.http2 = http2;
  }
  if (config.http3) {
    request.http3 = config.http3;
  }

  return request;
}

function buildRequests(
  global: GlobalConfig,
  stdin?: string,
  stdinFile?: string
): Request[] {
  if (!global.configs.length) {
    // shouldn't happen
    warnf(global, ["no-configs", "got empty config object"]);
  }
  return global.configs.map((config) =>
    buildRequest(global, config, stdin, stdinFile)
  );
}

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

  const global = parseArgs(
    args,
    curlLongOpts,
    curlShortOpts,
    supportedArgs,
    warnings
  );

  return buildRequests(global, stdin, stdinFile);
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
  QueryList,
  QueryDict,
  DataParam,
  Warnings,
};
