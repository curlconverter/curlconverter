import { Warnings } from '../util';
import { getout, GlobalConfig, OperationConfig, PostField, Mime } from './cfgable';
/* eslint-disable */

// This is
//
// https://github.com/curl/curl/blob/curl-7_79_1/src/tool_getparam.c
//
// translated to JavaScript.

class File {
  name: string;

  constructor (name: string) {
    this.name = name
  }
}
const STDIN = new File('-')

// class EnvironmentVariable {
//   constructor (name) {
//     if (name.startsWith('$')) {
//       name = name.slice(1)
//     }
//     this.name = name
//   }

//   toString () {
//     return '$' + this.name
//   }
// }

class CCError extends Error {
  constructor (message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

class ShellParsingError extends CCError { }

class InvalidCommandError extends CCError { }
class ArgumentError extends InvalidCommandError { }
// TODO: this?
// TODO: include arg removal date
// class AmbiguousArgumentError extends ArgumentError { }
// class UnknownArgumentError extends ArgumentError { }

// TODO: this type doesn't work.
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

type _LongShort = {
  letter: string;
  type: string;
  name?: string;
  negatable?: boolean;
  removed?: string;
}
type LongShort = {
  letter: string;
  type: string;
  name: string;
}
const _curlLongOpts: { [key: string]: _LongShort | null} = {
  url: { letter: '*@', type: 'string' },
  'dns-ipv4-addr': { letter: '*4', type: 'string' },
  'dns-ipv6-addr': { letter: '*6', type: 'string' },
  'random-file': { letter: '*a', type: 'string' },
  'egd-file': { letter: '*b', type: 'string' },
  'oauth2-bearer': { letter: '*B', type: 'string' },
  'connect-timeout': { letter: '*c', type: 'string' },
  'doh-url': { letter: '*C', type: 'string' },
  ciphers: { letter: '*d', type: 'string' },
  'dns-interface': { letter: '*D', type: 'string' },
  'disable-epsv': { letter: '*e', type: 'bool', name: 'epsv', negatable: true },
  'disallow-username-in-url': { letter: '*f', type: 'bool', negatable: true },
  epsv: { letter: '*E', type: 'bool', negatable: true },
  'dns-servers': { letter: '*F', type: 'string' },
  trace: { letter: '*g', type: 'string' },
  npn: { letter: '*G', type: 'bool', negatable: true },
  'trace-ascii': { letter: '*h', type: 'string' },
  alpn: { letter: '*H', type: 'bool', negatable: true },
  'limit-rate': { letter: '*i', type: 'string' },
  compressed: { letter: '*j', type: 'bool', negatable: true },
  'tr-encoding': { letter: '*J', type: 'bool', negatable: true },
  digest: { letter: '*k', type: 'bool', negatable: true },
  negotiate: { letter: '*l', type: 'bool', negatable: true },
  ntlm: { letter: '*m', type: 'bool', negatable: true },
  'ntlm-wb': { letter: '*M', type: 'bool', negatable: true },
  basic: { letter: '*n', type: 'bool', negatable: true },
  anyauth: { letter: '*o', type: 'bool', negatable: true },
  wdebug: { letter: '*p', type: 'bool', negatable: true },
  'ftp-create-dirs': { letter: '*q', type: 'bool', negatable: true },
  'create-dirs': { letter: '*r', type: 'bool', negatable: true },
  'create-file-mode': { letter: '*R', type: 'string' },
  'max-redirs': { letter: '*s', type: 'string' },
  'proxy-ntlm': { letter: '*t', type: 'bool', negatable: true },
  crlf: { letter: '*u', type: 'bool', negatable: true },
  stderr: { letter: '*v', type: 'string' },
  'aws-sigv4': { letter: '*V', type: 'string' },
  interface: { letter: '*w', type: 'string' },
  krb: { letter: '*x', type: 'string' },
  krb4: { letter: '*x', type: 'string', name: 'krb' },
  'haproxy-protocol': { letter: '*X', type: 'bool', negatable: true },
  'max-filesize': { letter: '*y', type: 'string' },
  'disable-eprt': { letter: '*z', type: 'bool', name: 'eprt', negatable: true },
  eprt: { letter: '*Z', type: 'bool', negatable: true },
  xattr: { letter: '*~', type: 'bool', negatable: true },
  'ftp-ssl': { letter: '$a', type: 'bool', name: 'ssl', negatable: true },
  ssl: { letter: '$a', type: 'bool', negatable: true },
  'ftp-pasv': { letter: '$b', type: 'bool', negatable: true },
  socks5: { letter: '$c', type: 'string' },
  'tcp-nodelay': { letter: '$d', type: 'bool', negatable: true },
  'proxy-digest': { letter: '$e', type: 'bool', negatable: true },
  'proxy-basic': { letter: '$f', type: 'bool', negatable: true },
  retry: { letter: '$g', type: 'string' },
  'retry-connrefused': { letter: '$V', type: 'bool', negatable: true },
  'retry-delay': { letter: '$h', type: 'string' },
  'retry-max-time': { letter: '$i', type: 'string' },
  'proxy-negotiate': { letter: '$k', type: 'bool', negatable: true },
  'ftp-account': { letter: '$m', type: 'string' },
  'proxy-anyauth': { letter: '$n', type: 'bool', negatable: true },
  'trace-time': { letter: '$o', type: 'bool', negatable: true },
  'ignore-content-length': { letter: '$p', type: 'bool', negatable: true },
  'ftp-skip-pasv-ip': { letter: '$q', type: 'bool', negatable: true },
  'ftp-method': { letter: '$r', type: 'string' },
  'local-port': { letter: '$s', type: 'string' },
  socks4: { letter: '$t', type: 'string' },
  socks4a: { letter: '$T', type: 'string' },
  'ftp-alternative-to-user': { letter: '$u', type: 'string' },
  'ftp-ssl-reqd': { letter: '$v', type: 'bool', name: 'ssl-reqd', negatable: true },
  'ssl-reqd': { letter: '$v', type: 'bool', negatable: true },
  sessionid: { letter: '$w', type: 'bool', negatable: true },
  'ftp-ssl-control': { letter: '$x', type: 'bool', negatable: true },
  'ftp-ssl-ccc': { letter: '$y', type: 'bool', negatable: true },
  'ftp-ssl-ccc-mode': { letter: '$j', type: 'string' },
  libcurl: { letter: '$z', type: 'string' },
  raw: { letter: '$#', type: 'bool', negatable: true },
  post301: { letter: '$0', type: 'bool', negatable: true },
  keepalive: { letter: '$1', type: 'bool', negatable: true },
  'socks5-hostname': { letter: '$2', type: 'string' },
  'keepalive-time': { letter: '$3', type: 'string' },
  post302: { letter: '$4', type: 'bool', negatable: true },
  noproxy: { letter: '$5', type: 'string' },
  'socks5-gssapi-nec': { letter: '$7', type: 'bool', negatable: true },
  'proxy1.0': { letter: '$8', type: 'string' },
  'tftp-blksize': { letter: '$9', type: 'string' },
  'mail-from': { letter: '$A', type: 'string' },
  'mail-rcpt': { letter: '$B', type: 'string' },
  'ftp-pret': { letter: '$C', type: 'bool', negatable: true },
  proto: { letter: '$D', type: 'string' },
  'proto-redir': { letter: '$E', type: 'string' },
  resolve: { letter: '$F', type: 'string' },
  delegation: { letter: '$G', type: 'string' },
  'mail-auth': { letter: '$H', type: 'string' },
  post303: { letter: '$I', type: 'bool', negatable: true },
  metalink: { letter: '$J', type: 'bool', negatable: true },
  'sasl-authzid': { letter: '$6', type: 'string' },
  'sasl-ir': { letter: '$K', type: 'bool', negatable: true },
  'test-event': { letter: '$L', type: 'bool', negatable: true },
  'unix-socket': { letter: '$M', type: 'string' },
  'path-as-is': { letter: '$N', type: 'bool', negatable: true },
  'socks5-gssapi-service': { letter: '$O', type: 'string', name: 'proxy-service-name' },
  'proxy-service-name': { letter: '$O', type: 'string' },
  'service-name': { letter: '$P', type: 'string' },
  'proto-default': { letter: '$Q', type: 'string' },
  'expect100-timeout': { letter: '$R', type: 'string' },
  'tftp-no-options': { letter: '$S', type: 'bool', negatable: true },
  'connect-to': { letter: '$U', type: 'string' },
  'abstract-unix-socket': { letter: '$W', type: 'string' },
  'tls-max': { letter: '$X', type: 'string' },
  'suppress-connect-headers': { letter: '$Y', type: 'bool', negatable: true },
  'compressed-ssh': { letter: '$Z', type: 'bool', negatable: true },
  'happy-eyeballs-timeout-ms': { letter: '$~', type: 'string' },
  'retry-all-errors': { letter: '$!', type: 'bool', negatable: true },
  'http1.0': { letter: '0', type: 'bool' },
  'http1.1': { letter: '01', type: 'bool' },
  http2: { letter: '02', type: 'bool' },
  'http2-prior-knowledge': { letter: '03', type: 'bool' },
  http3: { letter: '04', type: 'bool' },
  'http0.9': { letter: '09', type: 'bool', negatable: true },
  tlsv1: { letter: '1', type: 'bool' },
  'tlsv1.0': { letter: '10', type: 'bool' },
  'tlsv1.1': { letter: '11', type: 'bool' },
  'tlsv1.2': { letter: '12', type: 'bool' },
  'tlsv1.3': { letter: '13', type: 'bool' },
  'tls13-ciphers': { letter: '1A', type: 'string' },
  'proxy-tls13-ciphers': { letter: '1B', type: 'string' },
  sslv2: { letter: '2', type: 'bool' },
  sslv3: { letter: '3', type: 'bool' },
  ipv4: { letter: '4', type: 'bool' },
  ipv6: { letter: '6', type: 'bool' },
  append: { letter: 'a', type: 'bool', negatable: true },
  'user-agent': { letter: 'A', type: 'string' },
  cookie: { letter: 'b', type: 'string' },
  'alt-svc': { letter: 'ba', type: 'string' },
  hsts: { letter: 'bb', type: 'string' },
  'use-ascii': { letter: 'B', type: 'bool', negatable: true },
  'cookie-jar': { letter: 'c', type: 'string' },
  'continue-at': { letter: 'C', type: 'string' },
  data: { letter: 'd', type: 'string' },
  'data-raw': { letter: 'dr', type: 'string' },
  'data-ascii': { letter: 'da', type: 'string' },
  'data-binary': { letter: 'db', type: 'string' },
  'data-urlencode': { letter: 'de', type: 'string' },
  'dump-header': { letter: 'D', type: 'string' },
  referer: { letter: 'e', type: 'string' },
  cert: { letter: 'E', type: 'string' },
  cacert: { letter: 'Ea', type: 'string' },
  'cert-type': { letter: 'Eb', type: 'string' },
  key: { letter: 'Ec', type: 'string' },
  'key-type': { letter: 'Ed', type: 'string' },
  pass: { letter: 'Ee', type: 'string' },
  engine: { letter: 'Ef', type: 'string' },
  capath: { letter: 'Eg', type: 'string' },
  pubkey: { letter: 'Eh', type: 'string' },
  hostpubmd5: { letter: 'Ei', type: 'string' },
  crlfile: { letter: 'Ej', type: 'string' },
  tlsuser: { letter: 'Ek', type: 'string' },
  tlspassword: { letter: 'El', type: 'string' },
  tlsauthtype: { letter: 'Em', type: 'string' },
  'ssl-allow-beast': { letter: 'En', type: 'bool', negatable: true },
  'ssl-auto-client-cert': { letter: 'Eo', type: 'bool', negatable: true },
  'proxy-ssl-auto-client-cert': { letter: 'EO', type: 'bool', negatable: true },
  pinnedpubkey: { letter: 'Ep', type: 'string' },
  'proxy-pinnedpubkey': { letter: 'EP', type: 'string' },
  'cert-status': { letter: 'Eq', type: 'bool', negatable: true },
  'doh-cert-status': { letter: 'EQ', type: 'bool', negatable: true },
  'false-start': { letter: 'Er', type: 'bool', negatable: true },
  'ssl-no-revoke': { letter: 'Es', type: 'bool', negatable: true },
  'ssl-revoke-best-effort': { letter: 'ES', type: 'bool', negatable: true },
  'tcp-fastopen': { letter: 'Et', type: 'bool', negatable: true },
  'proxy-tlsuser': { letter: 'Eu', type: 'string' },
  'proxy-tlspassword': { letter: 'Ev', type: 'string' },
  'proxy-tlsauthtype': { letter: 'Ew', type: 'string' },
  'proxy-cert': { letter: 'Ex', type: 'string' },
  'proxy-cert-type': { letter: 'Ey', type: 'string' },
  'proxy-key': { letter: 'Ez', type: 'string' },
  'proxy-key-type': { letter: 'E0', type: 'string' },
  'proxy-pass': { letter: 'E1', type: 'string' },
  'proxy-ciphers': { letter: 'E2', type: 'string' },
  'proxy-crlfile': { letter: 'E3', type: 'string' },
  'proxy-ssl-allow-beast': { letter: 'E4', type: 'bool', negatable: true },
  'login-options': { letter: 'E5', type: 'string' },
  'proxy-cacert': { letter: 'E6', type: 'string' },
  'proxy-capath': { letter: 'E7', type: 'string' },
  'proxy-insecure': { letter: 'E8', type: 'bool', negatable: true },
  'proxy-tlsv1': { letter: 'E9', type: 'bool' },
  'socks5-basic': { letter: 'EA', type: 'bool', negatable: true },
  'socks5-gssapi': { letter: 'EB', type: 'bool', negatable: true },
  'etag-save': { letter: 'EC', type: 'string' },
  'etag-compare': { letter: 'ED', type: 'string' },
  curves: { letter: 'EE', type: 'string' },
  fail: { letter: 'f', type: 'bool', negatable: true },
  'fail-early': { letter: 'fa', type: 'bool', negatable: true },
  'styled-output': { letter: 'fb', type: 'bool', negatable: true },
  'mail-rcpt-allowfails': { letter: 'fc', type: 'bool', negatable: true },
  'fail-with-body': { letter: 'fd', type: 'bool', negatable: true },
  form: { letter: 'F', type: 'string' },
  'form-string': { letter: 'Fs', type: 'string' },
  globoff: { letter: 'g', type: 'bool', negatable: true },
  get: { letter: 'G', type: 'bool' },
  'request-target': { letter: 'Ga', type: 'string' },
  help: { letter: 'h', type: 'bool', negatable: true },
  header: { letter: 'H', type: 'string' },
  'proxy-header': { letter: 'Hp', type: 'string' },
  include: { letter: 'i', type: 'bool', negatable: true },
  head: { letter: 'I', type: 'bool', negatable: true },
  'junk-session-cookies': { letter: 'j', type: 'bool', negatable: true },
  'remote-header-name': { letter: 'J', type: 'bool', negatable: true },
  insecure: { letter: 'k', type: 'bool', negatable: true },
  'doh-insecure': { letter: 'kd', type: 'bool', negatable: true },
  config: { letter: 'K', type: 'string' },
  'list-only': { letter: 'l', type: 'bool', negatable: true },
  location: { letter: 'L', type: 'bool', negatable: true },
  'location-trusted': { letter: 'Lt', type: 'bool', negatable: true },
  'max-time': { letter: 'm', type: 'string' },
  manual: { letter: 'M', type: 'bool', negatable: true },
  netrc: { letter: 'n', type: 'bool', negatable: true },
  'netrc-optional': { letter: 'no', type: 'bool', negatable: true },
  'netrc-file': { letter: 'ne', type: 'string' },
  buffer: { letter: 'N', type: 'bool', negatable: true },
  output: { letter: 'o', type: 'string' },
  'remote-name': { letter: 'O', type: 'bool' },
  'remote-name-all': { letter: 'Oa', type: 'bool', negatable: true },
  'output-dir': { letter: 'Ob', type: 'string' },
  proxytunnel: { letter: 'p', type: 'bool', negatable: true },
  'ftp-port': { letter: 'P', type: 'string' },
  disable: { letter: 'q', type: 'bool', negatable: true },
  quote: { letter: 'Q', type: 'string' },
  range: { letter: 'r', type: 'string' },
  'remote-time': { letter: 'R', type: 'bool', negatable: true },
  silent: { letter: 's', type: 'bool', negatable: true },
  'show-error': { letter: 'S', type: 'bool', negatable: true },
  'telnet-option': { letter: 't', type: 'string' },
  'upload-file': { letter: 'T', type: 'string' },
  user: { letter: 'u', type: 'string' },
  'proxy-user': { letter: 'U', type: 'string' },
  verbose: { letter: 'v', type: 'bool', negatable: true },
  version: { letter: 'V', type: 'bool', negatable: true },
  'write-out': { letter: 'w', type: 'string' },
  proxy: { letter: 'x', type: 'string' },
  preproxy: { letter: 'xa', type: 'string' },
  request: { letter: 'X', type: 'string' },
  'speed-limit': { letter: 'Y', type: 'string' },
  'speed-time': { letter: 'y', type: 'string' },
  'time-cond': { letter: 'z', type: 'string' },
  parallel: { letter: 'Z', type: 'bool', negatable: true },
  'parallel-max': { letter: 'Zb', type: 'string' },
  'parallel-immediate': { letter: 'Zc', type: 'bool', negatable: true },
  'progress-bar': { letter: '#', type: 'bool', negatable: true },
  'progress-meter': { letter: '#m', type: 'bool', negatable: true },
  next: { letter: ':', type: 'bool' }
}


const curlShortOpts: { [key: string]: string} = {}
for (const [opt, val] of Object.entries(_curlLongOpts)) {
  if (val === null) {
    continue
  }
  if (val.letter.length === 1) {
    // Some options could have the same .letter
    // but it doesn't matter which one ends up here
    curlShortOpts[val.letter] = opt
  }
}

// Options that curl used to have.
// We support those that don't conflict with currently existing options.
//
// TODO: curl's --long-options can be shortened.
// For example if curl used to only have a single option, "--blah" then
// "--bla" "--bl" and "--b" all used to be valid options as well. If later
// "--blaz" was added, suddenly those 3 shortened options are removed (because
// they are now ambiguous).
// https://github.com/curlconverter/curlconverter/pull/280#issuecomment-931241328
type _RemovedLongShort = {
  letter?: string;
  type: string;
  name?: string;
  negatable?: boolean;
  removed?: string;
}
type RemovedLongShort = {
  letter?: string;
  type: string;
  name: string;
}
const removedLongOpts: { [key: string]: _RemovedLongShort} = {
  'ftp-ascii': { type: 'bool', name: 'use-ascii', removed: '7.10.7' },
  port: { type: 'string', removed: '7.3' },
  upload: { type: 'bool', removed: '7.7' },
  continue: { type: 'bool', removed: '7.9' },
  '3p-url': { type: 'string', removed: '7.16.0' },
  '3p-user': { type: 'string', removed: '7.16.0' },
  '3p-quote': { type: 'string', removed: '7.16.0' },
  'http2.0': { type: 'bool', name: 'http2', removed: '7.36.0' },
  'no-http2.0': { type: 'bool', name: 'http2', removed: '7.36.0' },
  'telnet-options': { type: 'string', name: 'telnet-option', removed: '7.49.0' },
  'http-request': { type: 'string', name: 'request', removed: '7.49.0' },
  socks: { type: 'string', name: 'socks5', removed: '7.49.0' },
  // Trailing space
  'capath ': { type: 'string', name: 'capath', removed: '7.49.0' },
  ftpport: { type: 'string', name: 'ftp-port', removed: '7.49.0' },
  environment: { type: 'bool', removed: '7.54.1' },
  // These --no-<option> flags were automatically generated and never had any effect
  'no-tlsv1': { type: 'bool', name: 'tlsv1', removed: '7.54.1' },
  'no-tlsv1.2': { type: 'bool', name: 'tlsv1.2', removed: '7.54.1' },
  'no-http2-prior-knowledge': { type: 'bool', name: 'http2-prior-knowledge', removed: '7.54.1' },
  'no-ipv6': { type: 'bool', name: 'ipv6', removed: '7.54.1' },
  'no-ipv4': { type: 'bool', name: 'ipv4', removed: '7.54.1' },
  'no-sslv2': { type: 'bool', name: 'sslv2', removed: '7.54.1' },
  'no-tlsv1.0': { type: 'bool', name: 'tlsv1.0', removed: '7.54.1' },
  'no-tlsv1.1': { type: 'bool', name: 'tlsv1.1', removed: '7.54.1' },
  'no-remote-name': { type: 'bool', name: 'remote-name', removed: '7.54.1' },
  'no-sslv3': { type: 'bool', name: 'sslv3', removed: '7.54.1' },
  'no-get': { type: 'bool', name: 'get', removed: '7.54.1' },
  'no-http1.0': { type: 'bool', name: 'http1.0', removed: '7.54.1' },
  'no-next': { type: 'bool', name: 'next', removed: '7.54.1' },
  'no-tlsv1.3': { type: 'bool', name: 'tlsv1.3', removed: '7.54.1' },
  'no-environment': { type: 'bool', name: 'environment', removed: '7.54.1' },
  'no-http1.1': { type: 'bool', name: 'http1.1', removed: '7.54.1' },
  'no-proxy-tlsv1': { type: 'bool', name: 'proxy-tlsv1', removed: '7.54.1' },
  'no-http2': { type: 'bool', name: 'http2', removed: '7.54.1' }
}

// TODO: use this to warn users when they specify a short option that
// used to be for something else?
const changedShortOpts = {
  p: 'used to be short for --port <port> (a since-deleted flag) until curl 7.3',
  // TODO: some of these might be renamed options
  t: 'used to be short for --upload (a since-deleted boolean flag) until curl 7.7',
  c: 'used to be short for --continue (a since-deleted boolean flag) until curl 7.9',
  // TODO: did -@ actually work?
  '@': 'used to be short for --create-dirs until curl 7.10.7',
  Z: 'used to be short for --max-redirs <num> until curl 7.10.7',
  9: 'used to be short for --crlf until curl 7.10.8',
  8: 'used to be short for --stderr <file> until curl 7.10.8',
  7: 'used to be short for --interface <name> until curl 7.10.8',
  6: 'used to be short for --krb <level> (which itself used to be --krb4 <level>) until curl 7.10.8',
  // TODO: did these short options ever actually work?
  5: 'used to be another way to specify the url until curl 7.10.8',
  '*': 'used to be another way to specify the url until curl 7.49.0',
  '~': 'used to be short for --xattr until curl 7.49.0'
}

// curl lets you not type the full argument as long as it's unambiguous.
// So --sil instead of --silent is okay, --s is not.
// This doesn't apply to negated options (those starting with --no-)
//
// The way Curl does this is by iterating over all the long option names,
// and seeing how many of them start with the same text as the option it
// is trying to look up. If 0 start with the option passed in by the user,
// this is an unknow option (error), if only 1 option starts with the same
// text as the passed in option, this is that option (or an un-ambiguous
// shortened form of that option) and if more than 1 option starts with
// the text of the passed in option, this is an ambiguous shortened form
// (error).
//
// In JavaScript we have access to hash map technology, which is
// probably faster than iterating over all 250 options for each option
// TODO: check that that's actually true
// and this makes it easy to add options that were removed from Curl a
// long time ago.
const curlLongOpts: { [key: string]: LongShort | null} = {}
const shortenedOpts: { [key: string]: LongShort | null} = {}
for (const [opt, val] of Object.entries(_curlLongOpts)) {
  if (val === null) {
    continue; // make typechecker happy
  }

  if (!Object.prototype.hasOwnProperty.call(val, 'name')) {
    val.name = opt
  }

  const negatable = val.negatable
  delete val.negatable
  const vl = val as LongShort

  curlLongOpts[opt] = vl
  if (negatable) {
    curlLongOpts['no-' + opt] = vl
  }

  for (let i = 1; i < opt.length; i++) {
    const shortened = opt.slice(0, i)
    // If there's something already here, it's an ambiguous shortening
    // so set it to null. Later on, when we lookup this shortened form
    // and find a null, we can report that it's ambiguous.
    shortenedOpts[shortened] = has(shortenedOpts, shortened) ? null : vl
  }
}
for (const [shortened, val] of Object.entries(shortenedOpts)) {
  if (!Object.prototype.hasOwnProperty.call(curlLongOpts, shortened)) {
    curlLongOpts[shortened] = val
  }
}

// Add removed --long-options.
// We do not allow shortening these, and some might not have a .letter
for (const [removedOpt, val] of Object.entries(removedLongOpts)) {
  if (!Object.prototype.hasOwnProperty.call(val, 'name')) {
    val.name = removedOpt
  }
  val.letter = '**'

  if (!Object.prototype.hasOwnProperty.call(curlLongOpts, removedOpt)) {
    curlLongOpts[removedOpt] = val as LongShort // TODO: check
  } else if (curlLongOpts[removedOpt] === null) {
    // This happens with --socks because it became --socks5 and now there's
    // multiple options that start with "--socks"
    //
    // console.error("couldn't add removed option --" + removedOpt + " to curlLongOpts because it's already ambiguous")

    // TODO: do we want to do this?
    // curlLongOpts[removedOpt] = val
  } else {
    // Almost certainly a shortened form of a still-existing option
    // This happens with --continue (now short for --continue-at)
    // and --upload (now short for --upload-file)
    //
    // console.error("couldn't add removed option --" + removedOpt + ' to curlLongOpts because it already exists')
  }
}


/* Split the argument of -E to 'certname' and 'passphrase' separated by colon.
 * We allow ':' and '\' to be escaped by '\' so that we can use certificate
 * nicknames containing ':'.  See <https://sourceforge.net/p/curl/bugs/1196/>
 * for details. */
const parse_cert_parameter = (cert_parameter: string) => {
  const param_length = cert_parameter.length;
  let span;
  let param_place = null;
  let certname_place = null;
  let certname: string[] = [];
  let passphrase = null;

  /* most trivial assumption: cert_parameter is empty */
  if(param_length === 0)
    return [null, null];

  /* next less trivial: cert_parameter starts 'pkcs11:' and thus
   * looks like a RFC7512 PKCS#11 URI which can be used as-is.
   * Also if cert_parameter contains no colon nor backslash, this
   * means no passphrase was given and no characters escaped */
  if(cert_parameter.startsWith("pkcs11:") ||
     !(cert_parameter.includes(':') || cert_parameter.includes('\\'))) {
    return [cert_parameter, null]
  }
  // TODO: check for off-by-ones
  for (let param_place = 0; param_place < cert_parameter.length; param_place++) {
    if (cert_parameter[param_place] === '\\') {
      param_place++;
      if (param_place >= cert_parameter.length || cert_parameter[param_place] === '\\') {
        certname.push('\\')
      } else if (cert_parameter[param_place] === '\\') {
        certname.push(':')
      } else {
        certname.push('\\')
        certname.push(cert_parameter[param_place])
      }
      param_place++;
      break;
    } else if (cert_parameter[param_place] === ':') {
      /* Since we live in a world of weirdness and confusion, the win32
         dudes can use : when using drive letters and thus c:\file:password
         needs to work. In order not to break compatibility, we still use : as
         separator, but we try to detect when it is used for a file name! On
         windows. */
// # TODO?
// ifdef WIN32
//       if(param_place &&
//           (param_place == &cert_parameter[1]) &&
//           (cert_parameter[2] == '\\' || cert_parameter[2] == '/') &&
//           (ISALPHA(cert_parameter[0])) ) {
//         /* colon in the second column, followed by a backslash, and the
//            first character is an alphabetic letter:

//            this is a drive letter colon */
//         *certname_place++ = ':';
//         param_place++;
//         break;
//       }
// #endif
      /* escaped colons and Windows drive letter colons were handled
       * above; if we're still here, this is a separating colon */
      param_place++;
      if (param_place < cert_parameter.length) {
        passphrase = cert_parameter.slice(param_place)
      }
      break
    } else {
      certname.push(cert_parameter[param_place])
    }
  }
  return [certname.join(''), passphrase]
}

// Functions from curl's source code
// and some C builtins
const add2list = (config: OperationConfig, prop: keyof OperationConfig, nextarg: any) => {
  if (!Object.prototype.hasOwnProperty.call(config, prop)) {
    config[prop] = [];
  }
  config[prop].push(nextarg);
}
const warnf = (global: GlobalConfig, warning: string) => { global.warnings.push(warning); }
const errorf = warnf

// TODO: or parseInt?
const str2udouble = (s: string, max: number) => {return parseFloat(s)}
const str2num = (s: string) => { return parseInt(s) }
const str2unum = (s: string) => { return parseInt(s) }
const str2unummax = (s: string, max: number) => { return parseInt(s) }
const oct2nummax = (s: string, max: number) => { return parseInt(s, 8) }

// TODO
const str2tls_max = (s: string): number => {
  const tls_max_array: {[key: string]: number} = {
    "default": CURL_SSLVERSION_MAX_DEFAULT,
    "1.0":     CURL_SSLVERSION_MAX_TLSv1_0,
    "1.1":     CURL_SSLVERSION_MAX_TLSv1_1,
    "1.2":     CURL_SSLVERSION_MAX_TLSv1_2,
    "1.3":     CURL_SSLVERSION_MAX_TLSv1_3,
  };
  if (has(tls_max_array, s)) {
    return tls_max_array[s]
  }
  throw new CCError('option --tls-max: is badly used here')
}
// TODO
const str2offset = (s: string) => {
  const asInt = parseInt(s)
  if (asInt < 0) {
    // TODO: warn
  }
  return asInt
}

const strdup = (s: string) => s
const strlen = (s: string) => s.length

// "wipe the next argument out so that the username:password isn't 
// displayed in the system process list"
const cleanarg = (s?: string) => {}

const ISDIGIT = (c: string) => { return c >= '0' && c <= '9' }

/* Replace (in-place) '%20' by '+' according to RFC1866 */
const replace_url_encoded_space_by_plus = (s: string) => s.replace(/%20/g, '+')

const GetFileAndPassword = (
  nextarg: string, 
  config: OperationConfig, 
  file: 'cert' | 'proxy_cert', 
  password: 'key_passwd' | 'proxy_key_passwd'
) => {
  const [certname, passphrase] = parse_cert_parameter(nextarg);
  config[file] = certname;
  if(passphrase) {
    config[password] = passphrase;
  }
}

// TODO
const GetSizeParameter = (global: GlobalConfig, nextarg: string | undefined, key: string) => {}


// C constants
const TRUE = true
const FALSE = false
const NULL = null

// Curl constants
//
// TODO: move these constants into their own file.
//
// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/include/curl/curl.h#L777-L810
// config.authtype
const CURLAUTH_NONE         = 0
const CURLAUTH_BASIC        = 1<<0
const CURLAUTH_DIGEST       = 1<<1
const CURLAUTH_NEGOTIATE    = 1<<2
/* Deprecated since the advent of CURLAUTH_NEGOTIATE */
const CURLAUTH_GSSNEGOTIATE = CURLAUTH_NEGOTIATE
/* Used for CURLOPT_SOCKS5_AUTH to stay terminologically correct */
const CURLAUTH_GSSAPI = CURLAUTH_NEGOTIATE
const CURLAUTH_NTLM         = 1<<3
const CURLAUTH_DIGEST_IE    = 1<<4
const CURLAUTH_NTLM_WB      = 1<<5
const CURLAUTH_BEARER       = 1<<6
const CURLAUTH_AWS_SIGV4    = 1<<7
const CURLAUTH_ONLY         = 1<<31
const CURLAUTH_ANY          = ~CURLAUTH_DIGEST_IE
const CURLAUTH_ANYSAFE      = ~(CURLAUTH_BASIC|CURLAUTH_DIGEST_IE)


// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/include/curl/curl.h#L2266-L2274
const CURL_TIMECOND_NONE = 0
const CURL_TIMECOND_IFMODSINCE = 1
const CURL_TIMECOND_IFUNMODSINCE = 2
const CURL_TIMECOND_LASTMOD = 3
const CURL_TIMECOND_LAS = 4


// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/include/curl/curl.h#L762-L775
const CURLPROXY_HTTP = 0    /* added in 7.10, new in 7.19.4 default is to use
                                CONNECT HTTP/1.1 */
const CURLPROXY_HTTP_1_0 = 1    /* added in 7.19.4, force to use CONNECT
                                    HTTP/1.0  */
const CURLPROXY_HTTPS = 2  /* added in 7.52.0 */
const CURLPROXY_SOCKS4 = 4  /* support added in 7.15.2, enum existed already
                                in 7.10 */
const CURLPROXY_SOCKS5 = 5  /* added in 7.10 */
const CURLPROXY_SOCKS4A = 6  /* added in 7.18.0 */
const CURLPROXY_SOCKS5_HOSTNAME = 7 /* Use the SOCKS5 protocol but pass along the
                                        host name rather than the IP address. added
                                        in 7.18.0 */

// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/install-here/include/curl/curl.h#L2150-L2164
const CURL_HTTP_VERSION_NONE = 0 /* setting this means we don't care, and that we'd
                                    like the library to choose the best possible
                                    for us! */
const CURL_HTTP_VERSION_1_0 = 1  /* please use HTTP 1.0 in the request */
const CURL_HTTP_VERSION_1_1 = 2  /* please use HTTP 1.1 in the request */
const CURL_HTTP_VERSION_2_0 = 3  /* please use HTTP 2 in the request */
const CURL_HTTP_VERSION_2TLS = 4 /* use version 2 for HTTPS, version 1.1 for HTTP */
const CURL_HTTP_VERSION_2_PRIOR_KNOWLEDGE = 5  /* please use HTTP 2 without HTTP/1.1
                                                  Upgrade */
const CURL_HTTP_VERSION_3 = 30  /* Makes use of explicit HTTP/3 without fallback.
                                    Use CURLOPT_ALTSVC to enable HTTP/3 upgrade */
const CURL_HTTP_VERSION_LAST = 6 /* *ILLEGAL* http version */


// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/include/curl/curl.h#L2223-L2234
const CURL_SSLVERSION_DEFAULT = 0
const CURL_SSLVERSION_TLSv1 = 1 /* TLS 1.x */
const CURL_SSLVERSION_SSLv2 = 2
const CURL_SSLVERSION_SSLv3 = 3
const CURL_SSLVERSION_TLSv1_0 = 4
const CURL_SSLVERSION_TLSv1_1 = 5
const CURL_SSLVERSION_TLSv1_2 = 6
const CURL_SSLVERSION_TLSv1_3 = 7

const CURL_SSLVERSION_LAST = 8 /* never use, keep last */

// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/include/curl/curl.h#L2236
const CURL_SSLVERSION_MAX_NONE =     0;
const CURL_SSLVERSION_MAX_DEFAULT =  (CURL_SSLVERSION_TLSv1   << 16);
const CURL_SSLVERSION_MAX_TLSv1_0 =  (CURL_SSLVERSION_TLSv1_0 << 16);
const CURL_SSLVERSION_MAX_TLSv1_1 =  (CURL_SSLVERSION_TLSv1_1 << 16);
const CURL_SSLVERSION_MAX_TLSv1_2 =  (CURL_SSLVERSION_TLSv1_2 << 16);
const CURL_SSLVERSION_MAX_TLSv1_3 =  (CURL_SSLVERSION_TLSv1_3 << 16);



// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/src/tool_sdecls.h#L125-L131
const HTTPREQ_UNSPEC = 0
const HTTPREQ_GET = 1
const HTTPREQ_HEAD = 2
const HTTPREQ_MIMEPOST = 3
const HTTPREQ_SIMPLEPOST = 4

// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/include/curl/curl.h#L2165-L2166
const CURL_IPRESOLVE_V4 = 1 /* uses only IPv4 addresses/connections */
const CURL_IPRESOLVE_V6 = 2 /* uses only IPv6 addresses/connections */

const new_getout = (config: OperationConfig): getout => {
  // struct getout *next;      /* next one */
  // char          *url;       /* the URL we deal with */
  // char          *outfile;   /* where to store the output */
  // char          *infile;    /* file to upload, if GETOUT_UPLOAD is set */
  // int            flags;     /* options - composed of GETOUT_* bits */
  // int            num;       /* which URL number in an invocation */
  const getout = {
    url: '',
    flags: config.default_node_flags ? config.default_node_flags : 0
  }

  config.url_list.push(getout)
  return getout
};

const GETOUT_OUTFILE   = (1<<0)  /* set when outfile is deemed done */
const GETOUT_URL       = (1<<1)  /* set when URL is deemed done */
const GETOUT_USEREMOTE = (1<<2)  /* use remote file name locally */
const GETOUT_UPLOAD    = (1<<3)  /* if set, -T has been used */
const GETOUT_NOUPLOAD  = (1<<4)  /* if set, -T "" has been used */


// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/src/tool_sdecls.h#L113-L118
// global.tracetype
const TRACE_NONE = 0  /* no trace/verbose output at all */
const TRACE_BIN = 1   /* tcpdump inspired look */
const TRACE_ASCII = 2 /* like *BIN but without the hex output */
const TRACE_PLAIN = 3 /* -v/--verbose type */

const LONG_MAX = Number.MAX_SAFE_INTEGER

// https://github.com/curl/curl/blob/e12dc2dd977c1e5f8d05e681d8d31f4fc124f6f9/src/tool_main.h#L31-L32
const MAX_PARALLEL = 300
const PARALLEL_DEFAULT = 50


const PARAM_OK = 0
const PARAM_OPTION_AMBIGUOUS = 1
const PARAM_OPTION_UNKNOWN = 2
const PARAM_REQUIRES_PARAMETER = 3
const PARAM_BAD_USE = 4
const PARAM_HELP_REQUESTED = 5
const PARAM_MANUAL_REQUESTED = 6
const PARAM_VERSION_INFO_REQUESTED = 7
const PARAM_ENGINES_REQUESTED = 8
const PARAM_GOT_EXTRA_PARAMETER = 9
const PARAM_BAD_NUMERIC = 10
const PARAM_NEGATIVE_NUMERIC = 11
const PARAM_LIBCURL_DOESNT_SUPPORT = 12
const PARAM_LIBCURL_UNSUPPORTED_PROTOCOL = 13
const PARAM_NO_MEM = 14
const PARAM_NEXT_OPERATION = 15
const PARAM_NO_PREFIX = 16
const PARAM_NUMBER_TOO_LARGE = 17
const PARAM_NO_NOT_BOOLEAN = 18
const PARAM_CONTDISP_SHOW_HEADER = 19 /* --include and --remote-header-name */
const PARAM_CONTDISP_RESUME_FROM = 20 /* --continue-at and --remote-header-name */
const PARAM_LAST = 21

// TODO:
// "global" is already a variable on NodeJS, similar to "window" in the browser
// but this is probably fine?
const getparameter = (flag: string, // -f or --long-flag
                      nextarg: string | undefined,
                      usedarg: {ref?: boolean}, // usedarg.ref (it's an object to simulate a pointer lol)
                      global: GlobalConfig,
                      config: OperationConfig,
                      longOpts: LongOpts,
                      shortOpts: ShortOpts): number => {


  usedarg.ref = FALSE

  let parse

  let longopt = FALSE
  let singleopt = FALSE; /* when true means '-o foo' used '-ofoo' */

  let toggle = TRUE

  let param

  if(('-' !== flag[0]) || ('-' === flag[1])) {
    /* this should be a long name */
    const word = ('-' === flag[0]) ? flag.slice(2) : flag;
    longopt = TRUE

    if(word.startsWith("no-")) {
      toggle = FALSE;
    }

    param = longOpts[word]
    if (param === null) {
      return PARAM_OPTION_AMBIGUOUS
    }
    if (typeof param === 'undefined') {
      if (word.startsWith("no-")) {
        const paramWithoutNo = longOpts[word.slice(3)]
        if (paramWithoutNo) {
          return paramWithoutNo.type === 'bool' ? PARAM_NO_PREFIX : PARAM_NO_NOT_BOOLEAN
        }
      }
      return PARAM_OPTION_UNKNOWN
    }

    // Deleted/renamed option
    if (!param.letter) {
      let val
      if (param.type === 'string') {
        if (nextarg === undefined) {
          return PARAM_REQUIRES_PARAMETER;
        }
        usedarg.ref = TRUE
        val = nextarg
      } else {
        val = toggle
      }
      // If the option doesn't have a .name, we set it
      // on global. This is used for the curlconverter cli for --language
      // so that we don't have to look through all the configs for .language
      if (param.name) {
        config[param.name.replace('-', '_')] = val
      } else {
        global[word.replace('-', '_')] = val
      }
      return PARAM_OK
    }

    parse = param.letter
  } else {
    parse = flag.slice(1) /* prefixed with one dash, pass it */
  }

  do {
    /* we can loop here if we have multiple single-letters */

    const letter = parse[0]
    const subletter = (longopt && parse[1]) ? parse[1] : '\0'

    if (!longopt) {
      if (!shortOpts[letter]) {
        return PARAM_OPTION_UNKNOWN
      }
      param = longOpts[shortOpts[letter]]
    }

    // TODO
    if (param === null) {
      throw new CCError('weird param')
    }
    if (param === undefined) {
      throw new CCError('weird param')
    }

    if (param.type === 'string') {
      if (!longopt && parse.length > 1) {
        nextarg = parse.slice(1) /* this is the actual extra parameter */
        singleopt = TRUE         /* don't loop anymore after this */
      } else if (nextarg === null) {
        return PARAM_REQUIRES_PARAMETER;
      } else {
        usedarg.ref = TRUE
      }
    }

    nextarg = nextarg || ''; // TODO: for the typechecker

    // https://github.com/curl/curl/blob/curl-7_79_1/src/tool_getparam.c#L651
    switch(letter) {
    case '*': /* options without a short option */
      switch(subletter) {
      case '4': /* --dns-ipv4-addr */
        /* addr in dot notation */
        config.dns_ipv4_addr = nextarg;
        break;
      case '6': /* --dns-ipv6-addr */
        /* addr in dot notation */
        config.dns_ipv6_addr = nextarg;
        break;
      case 'a': /* random-file */
        config.random_file = nextarg;
        break;
      case 'b': /* egd-file */
        config.egd_file = nextarg;
        break;
      case 'B': /* OAuth 2.0 bearer token */
        config.oauth_bearer = nextarg;
        config.authtype |= CURLAUTH_BEARER;
        break;
      case 'c': /* connect-timeout */
        config.connecttimeout = str2udouble(nextarg, LONG_MAX/1000);
        break;
      case 'C': /* doh-url */
        config.doh_url = nextarg;
        break;
      case 'd': /* ciphers */
        config.cipher_list = nextarg;
        break;
      case 'D': /* --dns-interface */
        /* interface name */
        config.dns_interface = nextarg;
        break;
      case 'e': /* --disable-epsv */
        config.disable_epsv = toggle;
        break;
      case 'f': /* --disallow-username-in-url */
        config.disallow_username_in_url = toggle;
        break;
      case 'E': /* --epsv */
        config.disable_epsv = (!toggle)?TRUE:FALSE;
        break;
      case 'F': /* --dns-servers */
        /* IP addrs of DNS servers */
        config.dns_servers = nextarg;
        break;
      case 'g': /* --trace */
        global.trace_dump = nextarg;
        if(global.tracetype && (global.tracetype !== TRACE_BIN))
          warnf(global, "--trace overrides an earlier trace/verbose option\n");
        global.tracetype = TRACE_BIN;
        break;
      case 'G': /* --npn */
        config.nonpn = (!toggle)?TRUE:FALSE;
        break;
      case 'h': /* --trace-ascii */
        global.trace_dump = nextarg;
        if(global.tracetype && (global.tracetype !== TRACE_ASCII))
          warnf(global,
                "--trace-ascii overrides an earlier trace/verbose option\n");
        global.tracetype = TRACE_ASCII;
        break;
      case 'H': /* --alpn */
        config.noalpn = (!toggle)?TRUE:FALSE;
        break;
      case 'i': /* --limit-rate */
      {
        // TODO
        const value = GetSizeParameter(global, nextarg, "rate");
        config.recvpersecond = value;
        config.sendpersecond = value;
      }
      break;

      case 'j': /* --compressed */
        config.encoding = toggle;
        break;

      case 'J': /* --tr-encoding */
        config.tr_encoding = toggle;
        break;

      case 'k': /* --digest */
        if(toggle)
          config.authtype |= CURLAUTH_DIGEST;
        else
          config.authtype &= ~CURLAUTH_DIGEST;
        break;

      case 'l': /* --negotiate */
        if(toggle) {
          config.authtype |= CURLAUTH_NEGOTIATE;
        }
        else
          config.authtype &= ~CURLAUTH_NEGOTIATE;
        break;

      case 'm': /* --ntlm */
        if(toggle) {
          config.authtype |= CURLAUTH_NTLM;
        }
        else
          config.authtype &= ~CURLAUTH_NTLM;
        break;

      case 'M': /* --ntlm-wb */
        if(toggle) {
          config.authtype |= CURLAUTH_NTLM_WB;
        }
        else
          config.authtype &= ~CURLAUTH_NTLM_WB;
        break;

      case 'n': /* --basic for completeness */
        if(toggle)
          config.authtype |= CURLAUTH_BASIC;
        else
          config.authtype &= ~CURLAUTH_BASIC;
        break;

      case 'o': /* --anyauth, let libcurl pick it */
        if(toggle)
          config.authtype = CURLAUTH_ANY;
        /* --no-anyauth simply doesn't touch it */
        break;

      case 'p': /* --wdebug */
        // dbug_init();
        break;
      case 'q': /* --ftp-create-dirs */
        config.ftp_create_dirs = toggle;
        break;

      case 'r': /* --create-dirs */
        config.create_dirs = toggle;
        break;

      case 'R': /* --create-file-mode */
        config.create_file_mode = oct2nummax(nextarg, 511);
        // if(err)
        //   return err;
        break;

      case 's': /* --max-redirs */
        /* specified max no of redirects (http(s)), this accepts -1 as a
            special condition */
        config.maxredirs = str2num(nextarg);
        // if(config.maxredirs < -1)
        //   return PARAM_BAD_NUMERIC;
        break;

      case 't': /* --proxy-ntlm */
        config.proxyntlm = toggle;
        break;

      case 'u': /* --crlf */
        /* LF -> CRLF conversion? */
        config.crlf = toggle;
        break;

      case 'V': /* --aws-sigv4 */
        config.authtype |= CURLAUTH_AWS_SIGV4;
        config.aws_sigv4 = nextarg;
        break;

      case 'v': /* --stderr */
        // if(strcmp(nextarg, "-")) {
        //   FILE *newfile = fopen(nextarg, FOPEN_WRITETEXT);
        //   if(!newfile)
        //     warnf(global, "Failed to open %s!\n", nextarg);
        //   else {
        //     if(global.errors_fopened)
        //       fclose(global.errors);
        //     global.errors = newfile;
        //     global.errors_fopened = TRUE;
        //   }
        // }
        // else
        //   global.errors = stdout;
        break;
      case 'w': /* --interface */
        /* interface */
        config.iface = nextarg;
        break;
      case 'x': /* --krb */
        /* kerberos level string */
        config.krblevel = nextarg;
        break;
      case 'X': /* --haproxy-protocol */
        config.haproxy_protocol = toggle;
        break;
      case 'y': /* --max-filesize */
        {
          const value = GetSizeParameter(global, nextarg, "max-filesize");
          config.max_filesize = value;
        }
        break;
      case 'z': /* --disable-eprt */
        config.disable_eprt = toggle;
        break;
      case 'Z': /* --eprt */
        config.disable_eprt = (!toggle)?TRUE:FALSE;
        break;
      case '~': /* --xattr */
        config.xattr = toggle;
        break;
      case '@': /* the URL! */
      {
        let url
        if (config.url_list.length) {
          for (const urlObj of config.url_list) {
            const flags = urlObj.flags ? urlObj.flags : 0
            if (!(flags & GETOUT_URL)) {
              url = urlObj
              break
            }
          }
        }
        if (!url) {
          url = new_getout(config)
        }
        /* fill in the URL */
        url.url = nextarg
        url.flags |= GETOUT_URL;
      }
      }
      break;
    case '$': /* more options without a short option */
      switch(subletter) {
      case 'a': /* --ssl */
        config.ftp_ssl = toggle;
        break;
      case 'b': /* --ftp-pasv */
        delete config.ftpport;
        break;
      case 'c': /* --socks5 specifies a socks5 proxy to use, and resolves
                    the name locally and passes on the resolved address */
        config.proxy = nextarg;
        config.proxyver = CURLPROXY_SOCKS5;
        break;
      case 't': /* --socks4 specifies a socks4 proxy to use */
        config.proxy = nextarg;
        config.proxyver = CURLPROXY_SOCKS4;
        break;
      case 'T': /* --socks4a specifies a socks4a proxy to use */
        config.proxy = nextarg;
        config.proxyver = CURLPROXY_SOCKS4A;
        break;
      case '2': /* --socks5-hostname specifies a socks5 proxy and enables name
                    resolving with the proxy */
        config.proxy = nextarg;
        config.proxyver = CURLPROXY_SOCKS5_HOSTNAME;
        break;
      case 'd': /* --tcp-nodelay option */
        config.tcp_nodelay = toggle;
        break;
      case 'e': /* --proxy-digest */
        config.proxydigest = toggle;
        break;
      case 'f': /* --proxy-basic */
        config.proxybasic = toggle;
        break;
      case 'g': /* --retry */
        config.req_retry = str2unum(nextarg);
        break;
      case 'V': /* --retry-connrefused */
        config.retry_connrefused = toggle;
        break;
      case 'h': /* --retry-delay */
        config.retry_delay = str2unummax(nextarg, LONG_MAX/1000);
        break;
      case 'i': /* --retry-max-time */
        config.retry_maxtime = str2unummax(nextarg, LONG_MAX/1000);
        break;
      case '!': /* --retry-all-errors */
        config.retry_all_errors = toggle;
        break;

      case 'k': /* --proxy-negotiate */
        config.proxynegotiate = toggle;
        break;

      case 'm': /* --ftp-account */
        config.ftp_account = nextarg;
        break;
      case 'n': /* --proxy-anyauth */
        config.proxyanyauth = toggle;
        break;
      case 'o': /* --trace-time */
        global.tracetime = toggle;
        break;
      case 'p': /* --ignore-content-length */
        config.ignorecl = toggle;
        break;
      case 'q': /* --ftp-skip-pasv-ip */
        config.ftp_skip_ip = toggle;
        break;
      case 'r': /* --ftp-method (undocumented at this point) */
        // TODO
        // config.ftp_filemethod = ftpfilemethod(config, nextarg);
        break;
      case 's': { /* --local-port */
        config.localport = parseInt(nextarg)
        if (isNaN(config.localport)) {
          warnf(global, "couldn't parse --local-port value " + nextarg + "\n")
          delete config.localport
          break
        }
        const p = nextarg.indexOf('-')
        if (p > 0) {
          config.localportrange = parseInt(nextarg.slice(p).trim()) - (config.localport-1);
          if (isNaN(config.localportrange)) {
            warnf(global, "couldn't parse --local-port value " + nextarg + "\n")
            delete config.localportrange
            break
          }
        }
        // We could check that localport is <= 65535
        break;
      }
      case 'u': /* --ftp-alternative-to-user */
        config.ftp_alternative_to_user = nextarg;
        break;
      case 'v': /* --ssl-reqd */
        config.ftp_ssl_reqd = toggle;
        break;
      case 'w': /* --no-sessionid */
        config.disable_sessionid = (!toggle)?TRUE:FALSE;
        break;
      case 'x': /* --ftp-ssl-control */
        config.ftp_ssl_control = toggle;
        break;
      case 'y': /* --ftp-ssl-ccc */
        config.ftp_ssl_ccc = toggle;
        // TODO
        // if(!config.ftp_ssl_ccc_mode)
        //   config.ftp_ssl_ccc_mode = CURLFTPSSL_CCC_PASSIVE;
        break;
      case 'j': /* --ftp-ssl-ccc-mode */
        config.ftp_ssl_ccc = TRUE;
        // TODO
        // config.ftp_ssl_ccc_mode = ftpcccmethod(config, nextarg);
        break;
      case 'z': /* --libcurl */
        global.libcurl = nextarg;
        break;
      case '#': /* --raw */
        config.raw = toggle;
        break;
      case '0': /* --post301 */
        config.post301 = toggle;
        break;
      case '1': /* --no-keepalive */
        config.nokeepalive = (!toggle)?TRUE:FALSE;
        break;
      case '3': /* --keepalive-time */
        config.alivetime = str2unum(nextarg);
        break;
      case '4': /* --post302 */
        config.post302 = toggle;
        break;
      case 'I': /* --post303 */
        config.post303 = toggle;
        break;
      case '5': /* --noproxy */
        /* This specifies the noproxy list */
        config.noproxy = nextarg;
        break;
      case '7': /* --socks5-gssapi-nec*/
        config.socks5_gssapi_nec = toggle;
        break;
      case '8': /* --proxy1.0 */
        /* http 1.0 proxy */
        config.proxy = nextarg;
        config.proxyver = CURLPROXY_HTTP_1_0;
        break;
      case '9': /* --tftp-blksize */
        config.tftp_blksize = str2unum(nextarg);
        break;
      case 'A': /* --mail-from */
        config.mail_from = nextarg;
        break;
      case 'B': /* --mail-rcpt */
        /* append receiver to a list */
        add2list(config, 'mail_rcpt', nextarg);
        break;
      case 'C': /* --ftp-pret */
        config.ftp_pret = toggle;
        break;
      case 'D': /* --proto */
        config.proto_present = TRUE;
        // TODO
        // if(proto2num(config, &config.proto, nextarg))
        //   return PARAM_BAD_USE;
        break;
      case 'E': /* --proto-redir */
        // TODO
        config.proto_redir_present = TRUE;
        // if(proto2num(config, &config.proto_redir, nextarg))
        //   return PARAM_BAD_USE;
        break;
      case 'F': /* --resolve */
        add2list(config, 'resolve', nextarg);
        // if(err)
        //   return err;
        break;
      case 'G': /* --delegation LEVEL */
        // TODO
        // config.gssapi_delegation = delegation(config, nextarg);
        break;
      case 'H': /* --mail-auth */
        config.mail_auth = nextarg;
        break;
      case 'J': /* --metalink */
        // errorf(global, "--metalink is disabled\n");
        // return PARAM_BAD_USE;
        break;
      case '6': /* --sasl-authzid */
        config.sasl_authzid = nextarg;
        break;
      case 'K': /* --sasl-ir */
        config.sasl_ir = toggle;
        break;
      case 'L': /* --test-event */
        global.test_event_based = toggle;
        break;
      case 'M': /* --unix-socket */
        config.abstract_unix_socket = FALSE;
        config.unix_socket_path = nextarg;
        break;
      case 'N': /* --path-as-is */
        config.path_as_is = toggle;
        break;
      case 'O': /* --proxy-service-name */
        config.proxy_service_name = nextarg;
        break;
      case 'P': /* --service-name */
        config.service_name = nextarg;
        break;
      case 'Q': /* --proto-default */
        config.proto_default = nextarg;
        // TODO
        // err = check_protocol(config.proto_default);
        break;
      case 'R': /* --expect100-timeout */
        config.expect100timeout = str2udouble(nextarg, LONG_MAX/1000);
        break;
      case 'S': /* --tftp-no-options */
        config.tftp_no_options = toggle;
        break;
      case 'U': /* --connect-to */
        add2list(config, 'connect_to', nextarg);
        break;
      case 'W': /* --abstract-unix-socket */
        config.abstract_unix_socket = TRUE;
        config.unix_socket_path = nextarg;
        break;
      case 'X': /* --tls-max */
        config.ssl_version_max = str2tls_max(nextarg);
        // if(err)
        //   return err;
        break;
      case 'Y': /* --suppress-connect-headers */
        config.suppress_connect_headers = toggle;
        break;
      case 'Z': /* --compressed-ssh */
        config.ssh_compression = toggle;
        break;
      case '~': /* --happy-eyeballs-timeout-ms */
        config.happy_eyeballs_timeout_ms = str2unum(nextarg);
        /* 0 is a valid value for this timeout */
        break;
      }
      break;
    case '#':
      switch(subletter) {
      case 'm': /* --progress-meter */
        global.noprogress = !toggle;
        break;
      default:  /* --progress-bar */
        // TODO
        // global.progressmode =
        //   toggle ? CURL_PROGRESS_BAR : CURL_PROGRESS_STATS;
        break;
      }
      break;
    case ':': /* --next */
      return PARAM_NEXT_OPERATION;
    case '0': /* --http* options */
      switch(subletter) {
      case '\0':
        /* HTTP version 1.0 */
        config.httpversion = CURL_HTTP_VERSION_1_0;
        break;
      case '1':
        /* HTTP version 1.1 */
        config.httpversion = CURL_HTTP_VERSION_1_1;
        break;
      case '2':
        /* HTTP version 2.0 */
        config.httpversion = CURL_HTTP_VERSION_2_0;
        break;
      case '3': /* --http2-prior-knowledge */
        /* HTTP version 2.0 over clean TCP*/
        config.httpversion = CURL_HTTP_VERSION_2_PRIOR_KNOWLEDGE;
        break;
      case '4': /* --http3 */
        /* HTTP version 3 go over QUIC - at once */
        config.httpversion = CURL_HTTP_VERSION_3;
        break;
      case '9':
        /* Allow HTTP/0.9 responses! */
        config.http09_allowed = toggle;
        break;
      }
      break;
    case '1': /* --tlsv1* options */
      switch(subletter) {
      case '\0':
        /* TLS version 1.x */
        config.ssl_version = CURL_SSLVERSION_TLSv1;
        break;
      case '0':
        /* TLS version 1.0 */
        config.ssl_version = CURL_SSLVERSION_TLSv1_0;
        break;
      case '1':
        /* TLS version 1.1 */
        config.ssl_version = CURL_SSLVERSION_TLSv1_1;
        break;
      case '2':
        /* TLS version 1.2 */
        config.ssl_version = CURL_SSLVERSION_TLSv1_2;
        break;
      case '3':
        /* TLS version 1.3 */
        config.ssl_version = CURL_SSLVERSION_TLSv1_3;
        break;
      case 'A': /* --tls13-ciphers */
        config.cipher13_list = nextarg;
        break;
      case 'B': /* --proxy-tls13-ciphers */
        config.proxy_cipher13_list = nextarg;
        break;
      }
      break;
    case '2':
      /* SSL version 2 */
      warnf(global, "Ignores instruction to use SSLv2\n");
      break;
    case '3':
      /* SSL version 3 */
      warnf(global, "Ignores instruction to use SSLv3\n");
      break;
    case '4':
      /* IPv4 */
      config.ip_version = CURL_IPRESOLVE_V4;
      break;
    case '6':
      /* IPv6 */
      config.ip_version = CURL_IPRESOLVE_V6;
      break;
    case 'a':
      /* This makes the FTP sessions use APPE instead of STOR */
      config.ftp_append = toggle;
      break;
    case 'A':
      /* This specifies the User-Agent name */
      config.useragent = nextarg;
      break;
    case 'b':
      switch(subletter) {
      case 'a': /* --alt-svc */
        config.altsvc = nextarg;
        break;
      case 'b': /* --hsts */
        config.hsts = nextarg;
        break;
      default:  /* --cookie string coming up: */
        if(nextarg[0] === '@') {
          nextarg = nextarg.slice(1)
        } else if(nextarg.includes('=')) {
          /* A cookie string must have a =-letter */
          add2list(config, 'cookies', nextarg);
          break;
        }
        /* We have a cookie file to read from! */
        add2list(config, 'cookiefiles', nextarg);
      }
      break;
    case 'B':
      /* use ASCII/text when transferring */
      config.use_ascii = toggle;
      break;
    case 'c':
      /* get the file name to dump all cookies in */
      config.cookiejar = nextarg;
      break;
    case 'C':
      /* This makes us continue an ftp transfer at given position */
      if(nextarg !== "-") {
        config.resume_from = str2offset(nextarg);
        config.resume_from_current = FALSE;
      }
      else {
        config.resume_from_current = TRUE;
        config.resume_from = 0;
      }
      config.use_resume = TRUE;
      break;
    case 'd':
      /* postfield data */
    {
      // application/x-www-form-urlencoded data
      //
      // Basically, you have some preamble headers then the data.
      // In the data you can have a name, then a '=', then the data
      // If you have more than one, they're separated by a '&'
      //
      // Curl lets you pass this data like this:
      //
      // content -> <content>
      // =content -> <content>
      // name=content -> <name>=<content>
      // @filename -> <contents read from filename>
      // name@filename -> <name>=<contents read from filename>
      //
      // Then it depends on which flag you use:
      //
      // --data / --data-ascii
      //
      // --data-binary
      //
      // --data-raw
      //
      // --data-urlencode
      //
      // we return an object
      // {
      //   mode: "binary" | "text" | "url-encoded"
      //   name: the thing before the "="
      //
      // then one of
      //   content: the thing after the "="
      //   filename: the filename to read to get content
      //     it might be "-" in which case the generated code needs to read from stdin
      // }

      let postdata = NULL;
      let file;
      let size = 0;
      let raw_mode = (subletter === 'r');

      let result: PostField = {
        mode: subletter === 'b' ? 'binary' : 'text'
      }

      if(subletter === 'e') { /* --data-urlencode*/
        result.mode = 'url-encoded'
        /* [name]=[content], we encode the content part only
          * [name]@[file name]
          *
          * Case 2: we first load the file using that name and then encode
          * the content.
          */
        let p = nextarg.indexOf('=');
        if(p === -1) {
          /* there was no '=' letter, check for a '@' instead */
          p = nextarg.indexOf('@');
        }
        // =content and content aren't differentiated.
        result.name = p === -1 ? '' : nextarg.slice(0, p)
        // -1 works here too
        const content = nextarg.slice(p + 1)
        /* an '@' letter, it means that a file name or - (stdin) follows */
        if (nextarg[p] === '@') {
          // "-" vs real filename to be handled downstream
          result.filename = content
        } else {
          result.content = content
        }
      }
      else if('@' === nextarg[0] && !raw_mode) {
        /* the data begins with a '@' letter, it means that a file name
            or - (stdin) follows */
        result.name = ''
        result.filename = nextarg.slice(1); /* skip the @ */
      }
      else {
        // TODO: reduce code duplication with urlencoded above?
        let p = nextarg.indexOf('=');
        result.name = p === -1 ? '' : nextarg.slice(0, p)
        // -1 works here too
        result.content = nextarg.slice(p + 1)
      }

  // #ifdef CURL_DOES_CONVERSIONS
  //     if(subletter !== 'b') {
  //       /* NOT forced binary, convert to ASCII */
  //       if(convert_to_network(postdata, strlen(postdata))) {
  //         delete postdata;
  //         return PARAM_NO_MEM;
  //       }
  //     }
  // #endif

      add2list(config, 'postfields', result);
    }
    /*
      We can't set the request type here, as this data might be used in
      a simple GET if -G is used. Already or soon.
      if(SetHTTPrequest(HTTPREQ_SIMPLEPOST, &config.httpreq)) {
        delete postdata;
        return PARAM_BAD_USE;
      }
    */
    break;
    case 'D':
      /* dump-header to given file name */
      config.headerfile = nextarg;
      break;
    case 'e':
    {
      const ptr = nextarg.indexOf(";auto")
      let referer
      if (ptr > -1) {
        config.autoreferer = TRUE;
        /* Automatic referer requested, this may be combined with a
            set initial one */
        referer = nextarg.slice(0, ptr)
      } else {
        config.autoreferer = FALSE;
        referer = nextarg
      }

      if (referer) {
        config.referer = referer;
      } else {
        delete config.referer
      }
    }
    break;
    case 'E':
      switch(subletter) {
      case '\0': /* certificate file */
        GetFileAndPassword(nextarg, config, 'cert', 'key_passwd');
        break;
      case 'a': /* CA info PEM file */
        config.cacert = nextarg;
        break;
      case 'b': /* cert file type */
        config.cert_type = nextarg;
        break;
      case 'c': /* private key file */
        config.key = nextarg;
        break;
      case 'd': /* private key file type */
        config.key_type = nextarg;
        break;
      case 'e': /* private key passphrase */
        config.key_passwd = nextarg;
        cleanarg(nextarg);
        break;
      case 'f': /* crypto engine */
        config.engine = nextarg;
        if(config.engine && (config.engine === "list"))
          return PARAM_ENGINES_REQUESTED;
        break;
      case 'g': /* CA cert directory */
        config.capath = nextarg;
        break;
      case 'h': /* --pubkey public key file */
        config.pubkey = nextarg;
        break;
      case 'i': /* --hostpubmd5 md5 of the host public key */
        config.hostpubmd5 = nextarg;
        if(!config.hostpubmd5 || strlen(config.hostpubmd5) !== 32)
          return PARAM_BAD_USE;
        break;
      case 'j': /* CRL file */
        config.crlfile = nextarg;
        break;
      case 'k': /* TLS username */
        config.tls_username = nextarg;
        break;
      case 'l': /* TLS password */
        config.tls_password = nextarg;
        break;
      case 'm': /* TLS authentication type */
        config.tls_authtype = nextarg;
        // if(!(config.tls_authtype === "SRP"))
        //   return PARAM_LIBCURL_DOESNT_SUPPORT; /* only support TLS-SRP */
        break;
      case 'n': /* no empty SSL fragments, --ssl-allow-beast */
        config.ssl_allow_beast = toggle;
        break;

      case 'o': /* --ssl-auto-client-cert */
        config.ssl_auto_client_cert = toggle;
        break;

      case 'O': /* --proxy-ssl-auto-client-cert */
        config.proxy_ssl_auto_client_cert = toggle;
        break;

      case 'p': /* Pinned public key DER file */
        config.pinnedpubkey = nextarg;
        break;

      case 'P': /* proxy pinned public key */
        config.proxy_pinnedpubkey = nextarg;
        break;

      case 'q': /* --cert-status */
        config.verifystatus = TRUE;
        break;

      case 'Q': /* --doh-cert-status */
        config.doh_verifystatus = TRUE;
        break;

      case 'r': /* --false-start */
        config.falsestart = TRUE;
        break;

      case 's': /* --ssl-no-revoke */
        config.ssl_no_revoke = TRUE;
        break;

      case 'S': /* --ssl-revoke-best-effort */
        config.ssl_revoke_best_effort = TRUE;
        break;

      case 't': /* --tcp-fastopen */
        config.tcp_fastopen = TRUE;
        break;

      case 'u': /* TLS username for proxy */
        config.proxy_tls_username = nextarg;
        break;

      case 'v': /* TLS password for proxy */
        config.proxy_tls_password = nextarg;
        break;

      case 'w': /* TLS authentication type for proxy */
        config.proxy_tls_authtype = nextarg;
        break;

      case 'x': /* certificate file for proxy */
        GetFileAndPassword(nextarg, config, 'proxy_cert', 'proxy_key_passwd');
        break;

      case 'y': /* cert file type for proxy */
        config.proxy_cert_type = nextarg;
        break;

      case 'z': /* private key file for proxy */
        config.proxy_key = nextarg;
        break;

      case '0': /* private key file type for proxy */
        config.proxy_key_type = nextarg;
        break;

      case '1': /* private key passphrase for proxy */
        config.proxy_key_passwd = nextarg;
        cleanarg(nextarg);
        break;

      case '2': /* ciphers for proxy */
        config.proxy_cipher_list = nextarg;
        break;

      case '3': /* CRL file for proxy */
        config.proxy_crlfile = nextarg;
        break;

      case '4': /* no empty SSL fragments for proxy */
        config.proxy_ssl_allow_beast = toggle;
        break;

      case '5': /* --login-options */
        config.login_options = nextarg;
        break;

      case '6': /* CA info PEM file for proxy */
        config.proxy_cacert = nextarg;
        break;

      case '7': /* CA cert directory for proxy */
        config.proxy_capath = nextarg;
        break;

      case '8': /* allow insecure SSL connects for proxy */
        config.proxy_insecure_ok = toggle;
        break;

      case '9': /* --proxy-tlsv1 */
        /* TLS version 1 for proxy */
        config.proxy_ssl_version = CURL_SSLVERSION_TLSv1;
        break;

      case 'A':
        /* --socks5-basic */
        if(toggle)
          config.socks5_auth |= CURLAUTH_BASIC;
        else
          config.socks5_auth &= ~CURLAUTH_BASIC;
        break;

      case 'B':
        /* --socks5-gssapi */
        if(toggle)
          config.socks5_auth |= CURLAUTH_GSSAPI;
        else
          config.socks5_auth &= ~CURLAUTH_GSSAPI;
        break;

      case 'C':
        config.etag_save_file = nextarg;
        break;

      case 'D':
        config.etag_compare_file = nextarg;
        break;

      case 'E':
        config.ssl_ec_curves = nextarg;
        break;

      default: /* unknown flag */
        return PARAM_OPTION_UNKNOWN;
      }
      break;
    case 'f':
      switch(subletter) {
      case 'a': /* --fail-early */
        global.fail_early = toggle;
        break;
      case 'b': /* --styled-output */
        global.styled_output = toggle;
        break;
      case 'c': /* --mail-rcpt-allowfails */
        config.mail_rcpt_allowfails = toggle;
        break;
      case 'd': /* --fail-with-body */
        config.failwithbody = toggle;
        break;
      default: /* --fail (hard on errors)  */
        config.failonerror = toggle;
        break;
      }
      if(config.failonerror && config.failwithbody) {
        errorf(global, "You must select either --fail or --fail-with-body, not both.\n");
        // return PARAM_BAD_USE;
      }
      break;
    case 'F':
      // TODO
      // Posting data in multipart/form-data format
      // basically, you have a "boundary" between each element
      // and in each element you may have a "name" and a "filename"
      //
      // https://stackoverflow.com/a/28380690
      //
      // To curl you pass this data like this:
      //
      // name=content -> name, <no filename>, content
      // name=@filename -> name, filename, <contents read from filename>
      // name=<filename -> name, <no filename>, <contents read from filename>
      // =content -> <no name>, <no filename>, content
      //
      //
      // we return an object
      // {
      //   name: the thing before the "="
      //   type: "file" | "text"
      // then one of
      //   content: the thing after the "="
      //   filename: the filename to read to get content
      //     it might be "-" in which case the generated code needs to read from stdin
      // }

      // TODO
      //
      // But it gets more complicated because you can specify other data
      // like the filename
      //
      // name=@filename;filename=actualfilenamesent
      //
      // or the content type
      //
      // name=@filename;type=text/html
      // name=content;type=text/foo
      //
      // Then there's quoting rules
      //
      // name=@"local,file";filename="name;in;post"
      //
      // and also "if a filename/path is quoted by double-quotes,
      // any double-quote or backslash within the filename must
      // be escaped by backslash"
      //
      // Then it goes off the rails, you can have () which make multiple -F
      // options act like one or whatever.
      //
      // curl -F '=(;type=multipart/alternative' \
      //      -F '=plain text message' \
      //      -F '= <body>HTML message</body>;type=text/html' \
      //      -F '=)' -F '=@textfile.txt' ... smtp://example.com
      //
      // formparse(config,
      //           nextarg,
      //           (subletter === 's')?TRUE:FALSE) /* 's' is literal string */
      const literal_value = (subletter === 's')?TRUE:FALSE

      const p = nextarg.indexOf('=')
      if (p === -1) {
        warnf(global, "Illegally formatted input field!\n");
        break;
      }

      const name = nextarg.slice(0, p)
      const content = nextarg.slice(p + 1)

      const result: Mime = {
        name: name
      }
      if ((content[0] !== '@' && content[0] !== '<') || literal_value) {
        result.type = 'text'
        result.content = content
      } else {
        result.type = 'file'

        const filename = content.slice(1)
        result.filename = filename
        if (content[0] === '@') {
          // TODO: or just a different type?
          result.filename = content.slice(1)
        }
      }

      add2list(config, 'mime', result);

      config.httpreq = HTTPREQ_MIMEPOST
      break;

    case 'g': /* g disables URLglobbing */
      config.globoff = toggle;
      break;

    case 'G': /* HTTP GET */
      if(subletter === 'a') { /* --request-target */
        config.request_target = nextarg;
      }
      else
        config.use_httpget = TRUE;
      break;

    case 'h': /* h for help */
      // TODO: on newer curl versions, --help may or may not consume the next argument
      // just error if we see --help? at least warn.
      // if(toggle) {
      //   if(nextarg) {
      //     global.help_category = strdup(nextarg);
      //     if(!global.help_category)
      //       return PARAM_NO_MEM;
      //   }
      //   return PARAM_HELP_REQUESTED;
      // }
      /* we now actually support --no-help too! */
      global.help = toggle
      break;
    case 'H':
      /* A custom header to append to a list */
      let h
      if(nextarg[0] === '@') {
        const filename = nextarg.slice(1)
        h = filename === '-' ? STDIN : new File(filename)
      } else {
        h = nextarg
      }
      if(subletter === 'p') /* --proxy-header */
        add2list(config, 'proxyheaders', nextarg);
      else
        add2list(config, 'headers', nextarg);
      break;
    case 'i':
      config.show_headers = toggle; /* show the headers as well in the
                                      general output stream */
      break;
    case 'j':
      config.cookiesession = toggle;
      break;
    case 'I': /* --head */
      config.no_body = toggle;
      config.show_headers = toggle;
      config.httpreq = (config.no_body)?HTTPREQ_HEAD:HTTPREQ_GET
      break;
    case 'J': /* --remote-header-name */
      config.content_disposition = toggle;
      break;
    case 'k': /* allow insecure SSL connects */
      if(subletter === 'd') /* --doh-insecure */
        config.doh_insecure_ok = toggle;
      else
        config.insecure_ok = toggle;
      break;
    case 'K': /* parse config file */
      // TODO: warn that it's not supported
      // if(parseconfig(nextarg, global))
      //   warnf(global, "error trying read config from the '%s' file\n",
      //         nextarg);
      break;
    case 'l':
      config.dirlistonly = toggle; /* only list the names of the FTP dir */
      break;
    case 'L':
      config.followlocation = toggle; /* Follow Location: HTTP headers */
      switch(subletter) {
      case 't':
        /* Continue to send authentication (user+password) when following
          * locations, even when hostname changed */
        config.unrestricted_auth = toggle;
        break;
      }
      break;
    case 'm':
      /* specified max time */
      config.timeout = str2udouble(nextarg, LONG_MAX/1000);
      // if(err)
      //   return err;
      break;
    case 'M': /* M for manual, huge help */
      if(toggle) { /* --no-manual shows no manual... */
        global.manual = toggle
      }
      break;
    case 'n':
      switch(subletter) {
      case 'o': /* use .netrc or URL */
        config.netrc_opt = toggle;
        break;
      case 'e': /* netrc-file */
        config.netrc_file = nextarg;
        break;
      default:
        /* pick info from .netrc, if this is used for http, curl will
            automatically enforce user+password with the request */
        config.netrc = toggle;
        break;
      }
      break;
    case 'N':
      /* disable the output I/O buffering. note that the option is called
          --buffer but is mostly used in the negative form: --no-buffer */
      // TODO: longopt is not passed to this function.
      if(longopt)
        config.nobuffer = (!toggle)?TRUE:FALSE;
      else
        config.nobuffer = toggle;
      break;
    case 'O': /* --remote-name */
      if(subletter === 'a') { /* --remote-name-all */
        config.default_node_flags = toggle?GETOUT_USEREMOTE:0;
        break;
      }
      else if(subletter === 'b') { /* --output-dir */
        config.output_dir = nextarg;
        break;
      }
      /* FALLTHROUGH */
    case 'o': /* --output */
      /* output file */
    {
      let url
      if (config.url_list && config.url_list.length) {
        for (const urlObj of config.url_list) {
          const flags = urlObj.flags ? urlObj.flags : 0
          if (!(flags & GETOUT_OUTFILE)) {
            url = urlObj
            break
          }
        }
      }
      if (!url) {
        url = new_getout(config)
      }
      /* fill in the outfile */
      if('o' === letter) {
        url.outfile = nextarg;
        url.flags &= ~GETOUT_USEREMOTE; /* switch off */
      }
      else {
        url.outfile = NULL; /* leave it */
        if(toggle)
          url.flags |= GETOUT_USEREMOTE;  /* switch on */
        else
          url.flags &= ~GETOUT_USEREMOTE; /* switch off */
      }
      url.flags |= GETOUT_OUTFILE;
    }
    break;
    case 'P':
      /* This makes the FTP sessions use PORT instead of PASV */
      /* use <eth0> or <192.168.10.10> style addresses. Anything except
          this will make us try to get the "default" address.
          NOTE: this is a changed behavior since the released 4.1!
      */
      config.ftpport = nextarg;
      break;
    case 'p':
      /* proxy tunnel for non-http protocols */
      config.proxytunnel = toggle;
      break;

    case 'q': /* if used first, already taken care of, we do it like
                  this so we don't cause an error! */
      break;
    case 'Q':
      /* QUOTE command to send to FTP server */
      switch(nextarg[0]) {
      case '-':
        /* prefixed with a dash makes it a POST TRANSFER one */
        nextarg = nextarg.slice(1);
        add2list(config, 'postquote', nextarg);
        break;
      case '+':
        /* prefixed with a plus makes it a just-before-transfer one */
        nextarg = nextarg.slice(1);
        add2list(config, 'prequote', nextarg);
        break;
      default:
        add2list(config, 'quote', nextarg);
        break;
      }
      // if(err)
      //   return err;
      break;
    case 'r': /* --range */
      /* Specifying a range WITHOUT A DASH will create an illegal HTTP range
          (and won't actually be range by definition). The man page previously
          claimed that to be a good way, why this code is added to work-around
          it. */
      if(ISDIGIT(nextarg[0]) && !nextarg.includes('-')) {
        warnf(global,
              "A specified range MUST include at least one dash (-). Appending one for you!\n");
        config.range = nextarg + '-'
      } else {
        // TODO: check that range is correctly formatted?
        config.range = nextarg;
      }
      break;
    case 'R':
      /* use remote file's time */
      config.remote_time = toggle;
      break;
    case 's':
      /* don't show progress meter, don't show errors : */
      if(toggle)
        global.mute = global.noprogress = TRUE;
      else
        global.mute = global.noprogress = FALSE;
      if(global.showerror < 0)
        /* if still on the default value, set showerror to the reverse of
            toggle. This is to allow -S and -s to be used in an independent
            order but still have the same effect. */
        global.showerror = (!toggle)?1:0; /* toggle off */
      break;
    case 'S':
      /* show errors */
      global.showerror = toggle?1:0; /* toggle on if used with -s */
      break;
    case 't':
      /* Telnet options */
      add2list(config, 'telnet_options', nextarg);
      break;
    case 'T': /* --upload-file */
    {
      // TODO: each upload-file is associated with one URL
      let url
      if (config.url_list.length) {
        for (const urlObj of config.url_list) {
          const flags = urlObj.flags ? urlObj.flags : 0
          if (!(flags & GETOUT_UPLOAD)) {
            url = urlObj
            break
          }
        }
      }
      if (!url) {
        url = new_getout(config)
      }

      url.flags |= GETOUT_UPLOAD; /* mark -T used */
      if(!nextarg)
        url.flags |= GETOUT_NOUPLOAD;
      else {
        /* "-" equals stdin, but keep the string around for now */
        url.infile = nextarg;
      }
    }
    break;
    case 'u':
      /* user:password  */
      config.userpwd = nextarg;
      cleanarg(nextarg);
      break;
    case 'U':
      /* Proxy user:password  */
      config.proxyuserpwd = nextarg;
      cleanarg(nextarg);
      break;
    case 'v':
      if(toggle) {
        /* the '%' thing here will cause the trace get sent to stderr */
        global.trace_dump = "%";
        if(global.tracetype && (global.tracetype !== TRACE_PLAIN))
          warnf(global,
                "-v, --verbose overrides an earlier trace/verbose option\n");
        global.tracetype = TRACE_PLAIN;
      }
      else
        /* verbose is disabled here */
        global.tracetype = TRACE_NONE;
      break;
    case 'V':
      global.version = toggle
      break;

    case 'w':
      // TODO
      /* get the output string */
      // if('@' === nextarg[0]) {
      //   /* the data begins with a '@' letter, it means that a file name
      //       or - (stdin) follows */
      //   FILE *file;
      //   const char *fname;
      //   nextarg++; /* pass the @ */
      //   if(!strcmp("-", nextarg)) {
      //     fname = "<stdin>";
      //     file = stdin;
      //   }
      //   else {
      //     fname = nextarg;
      //     file = fopen(nextarg, FOPEN_READTEXT);
      //   }
      //   delete config.writeout;
      //   config.writeout = file2string(file);
      //   if(file && (file !== stdin))
      //     fclose(file);
      //   if(err)
      //     return err;
      //   if(!config.writeout)
      //     warnf(global, "Failed to read %s", fname);
      // }
      // else
      //   config.writeout = nextarg;
      break;
    case 'x':
      switch(subletter) {
      case 'a': /* --preproxy */
        config.preproxy = nextarg;
        break;
      default:
        /* --proxy */
        config.proxy = nextarg;
        config.proxyver = CURLPROXY_HTTP;
        break;
      }
      break;
    case 'X':
      /* set custom request */
      config.customrequest = nextarg;
      break;
    case 'y':
      /* low speed time */
      config.low_speed_time = str2unum(nextarg);
      if(!config.low_speed_limit)
        config.low_speed_limit = 1;
      break;
    case 'Y':
      /* low speed limit */
      config.low_speed_limit = str2unum(nextarg);
      if(!config.low_speed_time)
        config.low_speed_time = 30;
      break;
    case 'Z':
      switch(subletter) {
      case '\0':  /* --parallel */
        global.parallel = toggle;
        break;
      case 'b':   /* --parallel-max */
        global.parallel_max = str2unum(nextarg);
        if((global.parallel_max > MAX_PARALLEL) ||
            (global.parallel_max < 1))
          global.parallel_max = PARALLEL_DEFAULT;
        break;
      case 'c':   /* --parallel-connect */
        global.parallel_connect = toggle;
        break;
      }
      break;
    case 'z': /* time condition coming up */
      switch(nextarg[0]) {
      case '+':
        nextarg = nextarg.slice(1);
        /* FALLTHROUGH */
      default:
        /* If-Modified-Since: (section 14.28 in RFC2068) */
        config.timecond = CURL_TIMECOND_IFMODSINCE;
        break;
      case '-':
        /* If-Unmodified-Since:  (section 14.24 in RFC2068) */
        config.timecond = CURL_TIMECOND_IFUNMODSINCE;
        nextarg = nextarg.slice(1);
        break;
      case '=':
        /* Last-Modified:  (section 14.29 in RFC2068) */
        config.timecond = CURL_TIMECOND_LASTMOD;
        nextarg = nextarg.slice(1);
        break;
      }
      // TODO: curl_getdate() and tell generator it needs to get the
      // modification time of a file.
      //
      // now = time(NULL);
      // config.condtime = (curl_off_t)curl_getdate(nextarg, &now);
      // if(-1 === config.condtime) {
      //   /* now let's see if it is a file name to get the time from instead! */
      //   curl_off_t filetime = getfiletime(nextarg, global);
      //   if(filetime >= 0) {
      //     /* pull the time out from the file */
      //     config.condtime = filetime;
      //   }
      //   else {
      //     /* failed, remove time condition */
      //     config.timecond = CURL_TIMECOND_NONE;
      //     warnf(global,
      //           "Illegal date format for -z, --time-cond (and not "
      //           "a file name). Disabling time condition. "
      //           "See curl_getdate(3) for valid date syntax.\n");
      //   }
      // }
      break;
    default: /* unknown flag */
      return PARAM_OPTION_UNKNOWN;
    }
  } while(!longopt && !singleopt && (parse = parse.slice(1)) && !usedarg.ref);

  return PARAM_OK
}

type LongOpts = {[key: string]: LongShort | null};
type ShortOpts = {[key: string]: string};
const parseArgs = (
  args: string[],
  opts?: [LongOpts, ShortOpts],
  supportedOpts?: Set<string>,
  warnings: Warnings = []
) => {
  const [longOpts, shortOpts] = opts || [curlLongOpts, curlShortOpts]

  let config: OperationConfig = {
    authtype: CURLAUTH_BASIC,
    socks5_auth: CURLAUTH_BASIC, // TODO: correct?
    url_list: [],
  }
  const global: GlobalConfig = { configs: [config], warnings: [], showerror: -1 }

  let orig_opt: string | null = null

  let result = PARAM_OK

  for (let i = 1, stillflags = true; i < args.length && !result; i++) {
    orig_opt = args[i]
    if (stillflags && orig_opt.startsWith('-')) {
      if (orig_opt === '--') {
        /* This indicates the end of the flags and thus enables the
           following (URL) argument to start with -. */
        stillflags = false
      } else {
        const nextarg = i < (args.length - 1) ? args[i + 1] : undefined
        const passarg = {ref: false} // Pass a bool by reference lol.
        result = getparameter(orig_opt, nextarg, passarg, global, config, longOpts, shortOpts)

        if (result === PARAM_NEXT_OPERATION) {
          /* Reset result as PARAM_NEXT_OPERATION is only used here and not
             returned from this function */
          result = PARAM_OK;

          config = {
            authtype: CURLAUTH_BASIC,
            socks5_auth: CURLAUTH_BASIC, // TODO: correct?
            url_list: [],
          }
          global.configs.push(config)
        } else if (!result && passarg.ref) {
          i++ /* we're supposed to skip this */
        }
      }
    } else {
      result = getparameter('--url', orig_opt, {}, global, config, longOpts, shortOpts)
    }

  }

  if(!result && config.content_disposition) {
    if(config.show_headers)
      result = PARAM_CONTDISP_SHOW_HEADER;
    else if(config.resume_from_current)
      result = PARAM_CONTDISP_RESUME_FROM;
  }

  if(result && result !== PARAM_HELP_REQUESTED &&
     result !== PARAM_MANUAL_REQUESTED &&
     result !== PARAM_VERSION_INFO_REQUESTED &&
     result !== PARAM_ENGINES_REQUESTED) {
    // const char *reason = param2text(result);

    // if(orig_opt && strcmp(":", orig_opt))
    //   helpf(global.errors, "option %s: %s\n", orig_opt, reason);
    // else
    //   helpf(global.errors, "%s\n", reason);
  }

  return global;
}


export {
  has,
  strdup,

  curlLongOpts,
  curlShortOpts,
  parseArgs,

  // enums
  HTTPREQ_SIMPLEPOST,

  HTTPREQ_GET,
  HTTPREQ_HEAD,
  // TODO: export error objects (after writing them)
  // TODO: export deleted options/short options objects?
}

export type {
  LongOpts,
  ShortOpts,
}
