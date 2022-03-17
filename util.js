import URL from 'url'

import cookie from 'cookie'
import nunjucks from 'nunjucks'

import parser from './parser.js'

const env = nunjucks.configure(['templates/'], { // set folders with templates
  autoescape: false
})
env.addFilter('isArr', something => Array.isArray(something))
env.addFilter('isString', something => typeof something === 'string')

const has = (obj, prop) => {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

export class CCError extends Error {}

const pushProp = (obj, prop, value) => {
  if (!has(obj, prop)) {
    obj[prop] = []
  }
  obj[prop].push(value)
  return obj
}

// BEGIN GENERATED CURL OPTIONS
const curlLongOpts = {
  url: { type: 'string' },
  'dns-ipv4-addr': { type: 'string' },
  'dns-ipv6-addr': { type: 'string' },
  'random-file': { type: 'string' },
  'egd-file': { type: 'string' },
  'oauth2-bearer': { type: 'string' },
  'connect-timeout': { type: 'string' },
  'doh-url': { type: 'string' },
  ciphers: { type: 'string' },
  'dns-interface': { type: 'string' },
  'disable-epsv': { type: 'bool', name: 'epsv' },
  'no-disable-epsv': { type: 'bool', name: 'epsv', expand: false },
  'disallow-username-in-url': { type: 'bool' },
  'no-disallow-username-in-url': { type: 'bool', name: 'disallow-username-in-url', expand: false },
  epsv: { type: 'bool' },
  'no-epsv': { type: 'bool', name: 'epsv', expand: false },
  'dns-servers': { type: 'string' },
  trace: { type: 'string' },
  npn: { type: 'bool' },
  'no-npn': { type: 'bool', name: 'npn', expand: false },
  'trace-ascii': { type: 'string' },
  alpn: { type: 'bool' },
  'no-alpn': { type: 'bool', name: 'alpn', expand: false },
  'limit-rate': { type: 'string' },
  compressed: { type: 'bool' },
  'no-compressed': { type: 'bool', name: 'compressed', expand: false },
  'tr-encoding': { type: 'bool' },
  'no-tr-encoding': { type: 'bool', name: 'tr-encoding', expand: false },
  digest: { type: 'bool' },
  'no-digest': { type: 'bool', name: 'digest', expand: false },
  negotiate: { type: 'bool' },
  'no-negotiate': { type: 'bool', name: 'negotiate', expand: false },
  ntlm: { type: 'bool' },
  'no-ntlm': { type: 'bool', name: 'ntlm', expand: false },
  'ntlm-wb': { type: 'bool' },
  'no-ntlm-wb': { type: 'bool', name: 'ntlm-wb', expand: false },
  basic: { type: 'bool' },
  'no-basic': { type: 'bool', name: 'basic', expand: false },
  anyauth: { type: 'bool' },
  'no-anyauth': { type: 'bool', name: 'anyauth', expand: false },
  wdebug: { type: 'bool' },
  'no-wdebug': { type: 'bool', name: 'wdebug', expand: false },
  'ftp-create-dirs': { type: 'bool' },
  'no-ftp-create-dirs': { type: 'bool', name: 'ftp-create-dirs', expand: false },
  'create-dirs': { type: 'bool' },
  'no-create-dirs': { type: 'bool', name: 'create-dirs', expand: false },
  'create-file-mode': { type: 'string' },
  'max-redirs': { type: 'string' },
  'proxy-ntlm': { type: 'bool' },
  'no-proxy-ntlm': { type: 'bool', name: 'proxy-ntlm', expand: false },
  crlf: { type: 'bool' },
  'no-crlf': { type: 'bool', name: 'crlf', expand: false },
  stderr: { type: 'string' },
  'aws-sigv4': { type: 'string' },
  interface: { type: 'string' },
  krb: { type: 'string' },
  krb4: { type: 'string', name: 'krb' },
  'haproxy-protocol': { type: 'bool' },
  'no-haproxy-protocol': { type: 'bool', name: 'haproxy-protocol', expand: false },
  'max-filesize': { type: 'string' },
  'disable-eprt': { type: 'bool', name: 'eprt' },
  'no-disable-eprt': { type: 'bool', name: 'eprt', expand: false },
  eprt: { type: 'bool' },
  'no-eprt': { type: 'bool', name: 'eprt', expand: false },
  xattr: { type: 'bool' },
  'no-xattr': { type: 'bool', name: 'xattr', expand: false },
  'ftp-ssl': { type: 'bool', name: 'ssl' },
  'no-ftp-ssl': { type: 'bool', name: 'ssl', expand: false },
  ssl: { type: 'bool' },
  'no-ssl': { type: 'bool', name: 'ssl', expand: false },
  'ftp-pasv': { type: 'bool' },
  'no-ftp-pasv': { type: 'bool', name: 'ftp-pasv', expand: false },
  socks5: { type: 'string' },
  'tcp-nodelay': { type: 'bool' },
  'no-tcp-nodelay': { type: 'bool', name: 'tcp-nodelay', expand: false },
  'proxy-digest': { type: 'bool' },
  'no-proxy-digest': { type: 'bool', name: 'proxy-digest', expand: false },
  'proxy-basic': { type: 'bool' },
  'no-proxy-basic': { type: 'bool', name: 'proxy-basic', expand: false },
  retry: { type: 'string' },
  'retry-connrefused': { type: 'bool' },
  'no-retry-connrefused': { type: 'bool', name: 'retry-connrefused', expand: false },
  'retry-delay': { type: 'string' },
  'retry-max-time': { type: 'string' },
  'proxy-negotiate': { type: 'bool' },
  'no-proxy-negotiate': { type: 'bool', name: 'proxy-negotiate', expand: false },
  'ftp-account': { type: 'string' },
  'proxy-anyauth': { type: 'bool' },
  'no-proxy-anyauth': { type: 'bool', name: 'proxy-anyauth', expand: false },
  'trace-time': { type: 'bool' },
  'no-trace-time': { type: 'bool', name: 'trace-time', expand: false },
  'ignore-content-length': { type: 'bool' },
  'no-ignore-content-length': { type: 'bool', name: 'ignore-content-length', expand: false },
  'ftp-skip-pasv-ip': { type: 'bool' },
  'no-ftp-skip-pasv-ip': { type: 'bool', name: 'ftp-skip-pasv-ip', expand: false },
  'ftp-method': { type: 'string' },
  'local-port': { type: 'string' },
  socks4: { type: 'string' },
  socks4a: { type: 'string' },
  'ftp-alternative-to-user': { type: 'string' },
  'ftp-ssl-reqd': { type: 'bool', name: 'ssl-reqd' },
  'no-ftp-ssl-reqd': { type: 'bool', name: 'ssl-reqd', expand: false },
  'ssl-reqd': { type: 'bool' },
  'no-ssl-reqd': { type: 'bool', name: 'ssl-reqd', expand: false },
  sessionid: { type: 'bool' },
  'no-sessionid': { type: 'bool', name: 'sessionid', expand: false },
  'ftp-ssl-control': { type: 'bool' },
  'no-ftp-ssl-control': { type: 'bool', name: 'ftp-ssl-control', expand: false },
  'ftp-ssl-ccc': { type: 'bool' },
  'no-ftp-ssl-ccc': { type: 'bool', name: 'ftp-ssl-ccc', expand: false },
  'ftp-ssl-ccc-mode': { type: 'string' },
  libcurl: { type: 'string' },
  raw: { type: 'bool' },
  'no-raw': { type: 'bool', name: 'raw', expand: false },
  post301: { type: 'bool' },
  'no-post301': { type: 'bool', name: 'post301', expand: false },
  keepalive: { type: 'bool' },
  'no-keepalive': { type: 'bool', name: 'keepalive', expand: false },
  'socks5-hostname': { type: 'string' },
  'keepalive-time': { type: 'string' },
  post302: { type: 'bool' },
  'no-post302': { type: 'bool', name: 'post302', expand: false },
  noproxy: { type: 'string' },
  'socks5-gssapi-nec': { type: 'bool' },
  'no-socks5-gssapi-nec': { type: 'bool', name: 'socks5-gssapi-nec', expand: false },
  'proxy1.0': { type: 'string' },
  'tftp-blksize': { type: 'string' },
  'mail-from': { type: 'string' },
  'mail-rcpt': { type: 'string' },
  'ftp-pret': { type: 'bool' },
  'no-ftp-pret': { type: 'bool', name: 'ftp-pret', expand: false },
  proto: { type: 'string' },
  'proto-redir': { type: 'string' },
  resolve: { type: 'string' },
  delegation: { type: 'string' },
  'mail-auth': { type: 'string' },
  post303: { type: 'bool' },
  'no-post303': { type: 'bool', name: 'post303', expand: false },
  metalink: { type: 'bool' },
  'no-metalink': { type: 'bool', name: 'metalink', expand: false },
  'sasl-authzid': { type: 'string' },
  'sasl-ir': { type: 'bool' },
  'no-sasl-ir': { type: 'bool', name: 'sasl-ir', expand: false },
  'test-event': { type: 'bool' },
  'no-test-event': { type: 'bool', name: 'test-event', expand: false },
  'unix-socket': { type: 'string' },
  'path-as-is': { type: 'bool' },
  'no-path-as-is': { type: 'bool', name: 'path-as-is', expand: false },
  'socks5-gssapi-service': { type: 'string', name: 'proxy-service-name' },
  'proxy-service-name': { type: 'string' },
  'service-name': { type: 'string' },
  'proto-default': { type: 'string' },
  'expect100-timeout': { type: 'string' },
  'tftp-no-options': { type: 'bool' },
  'no-tftp-no-options': { type: 'bool', name: 'tftp-no-options', expand: false },
  'connect-to': { type: 'string' },
  'abstract-unix-socket': { type: 'string' },
  'tls-max': { type: 'string' },
  'suppress-connect-headers': { type: 'bool' },
  'no-suppress-connect-headers': { type: 'bool', name: 'suppress-connect-headers', expand: false },
  'compressed-ssh': { type: 'bool' },
  'no-compressed-ssh': { type: 'bool', name: 'compressed-ssh', expand: false },
  'happy-eyeballs-timeout-ms': { type: 'string' },
  'retry-all-errors': { type: 'bool' },
  'no-retry-all-errors': { type: 'bool', name: 'retry-all-errors', expand: false },
  'http1.0': { type: 'bool' },
  'http1.1': { type: 'bool' },
  http2: { type: 'bool' },
  'http2-prior-knowledge': { type: 'bool' },
  http3: { type: 'bool' },
  'http0.9': { type: 'bool' },
  'no-http0.9': { type: 'bool', name: 'http0.9', expand: false },
  tlsv1: { type: 'bool' },
  'tlsv1.0': { type: 'bool' },
  'tlsv1.1': { type: 'bool' },
  'tlsv1.2': { type: 'bool' },
  'tlsv1.3': { type: 'bool' },
  'tls13-ciphers': { type: 'string' },
  'proxy-tls13-ciphers': { type: 'string' },
  sslv2: { type: 'bool' },
  sslv3: { type: 'bool' },
  ipv4: { type: 'bool' },
  ipv6: { type: 'bool' },
  append: { type: 'bool' },
  'no-append': { type: 'bool', name: 'append', expand: false },
  'user-agent': { type: 'string' },
  cookie: { type: 'string' },
  'alt-svc': { type: 'string' },
  hsts: { type: 'string' },
  'use-ascii': { type: 'bool' },
  'no-use-ascii': { type: 'bool', name: 'use-ascii', expand: false },
  'cookie-jar': { type: 'string' },
  'continue-at': { type: 'string' },
  data: { type: 'string' },
  'data-raw': { type: 'string' },
  'data-ascii': { type: 'string' },
  'data-binary': { type: 'string' },
  'data-urlencode': { type: 'string' },
  'dump-header': { type: 'string' },
  referer: { type: 'string' },
  cert: { type: 'string' },
  cacert: { type: 'string' },
  'cert-type': { type: 'string' },
  key: { type: 'string' },
  'key-type': { type: 'string' },
  pass: { type: 'string' },
  engine: { type: 'string' },
  capath: { type: 'string' },
  pubkey: { type: 'string' },
  hostpubmd5: { type: 'string' },
  crlfile: { type: 'string' },
  tlsuser: { type: 'string' },
  tlspassword: { type: 'string' },
  tlsauthtype: { type: 'string' },
  'ssl-allow-beast': { type: 'bool' },
  'no-ssl-allow-beast': { type: 'bool', name: 'ssl-allow-beast', expand: false },
  'ssl-auto-client-cert': { type: 'bool' },
  'no-ssl-auto-client-cert': { type: 'bool', name: 'ssl-auto-client-cert', expand: false },
  'proxy-ssl-auto-client-cert': { type: 'bool' },
  'no-proxy-ssl-auto-client-cert': { type: 'bool', name: 'proxy-ssl-auto-client-cert', expand: false },
  pinnedpubkey: { type: 'string' },
  'proxy-pinnedpubkey': { type: 'string' },
  'cert-status': { type: 'bool' },
  'no-cert-status': { type: 'bool', name: 'cert-status', expand: false },
  'doh-cert-status': { type: 'bool' },
  'no-doh-cert-status': { type: 'bool', name: 'doh-cert-status', expand: false },
  'false-start': { type: 'bool' },
  'no-false-start': { type: 'bool', name: 'false-start', expand: false },
  'ssl-no-revoke': { type: 'bool' },
  'no-ssl-no-revoke': { type: 'bool', name: 'ssl-no-revoke', expand: false },
  'ssl-revoke-best-effort': { type: 'bool' },
  'no-ssl-revoke-best-effort': { type: 'bool', name: 'ssl-revoke-best-effort', expand: false },
  'tcp-fastopen': { type: 'bool' },
  'no-tcp-fastopen': { type: 'bool', name: 'tcp-fastopen', expand: false },
  'proxy-tlsuser': { type: 'string' },
  'proxy-tlspassword': { type: 'string' },
  'proxy-tlsauthtype': { type: 'string' },
  'proxy-cert': { type: 'string' },
  'proxy-cert-type': { type: 'string' },
  'proxy-key': { type: 'string' },
  'proxy-key-type': { type: 'string' },
  'proxy-pass': { type: 'string' },
  'proxy-ciphers': { type: 'string' },
  'proxy-crlfile': { type: 'string' },
  'proxy-ssl-allow-beast': { type: 'bool' },
  'no-proxy-ssl-allow-beast': { type: 'bool', name: 'proxy-ssl-allow-beast', expand: false },
  'login-options': { type: 'string' },
  'proxy-cacert': { type: 'string' },
  'proxy-capath': { type: 'string' },
  'proxy-insecure': { type: 'bool' },
  'no-proxy-insecure': { type: 'bool', name: 'proxy-insecure', expand: false },
  'proxy-tlsv1': { type: 'bool' },
  'socks5-basic': { type: 'bool' },
  'no-socks5-basic': { type: 'bool', name: 'socks5-basic', expand: false },
  'socks5-gssapi': { type: 'bool' },
  'no-socks5-gssapi': { type: 'bool', name: 'socks5-gssapi', expand: false },
  'etag-save': { type: 'string' },
  'etag-compare': { type: 'string' },
  curves: { type: 'string' },
  fail: { type: 'bool' },
  'no-fail': { type: 'bool', name: 'fail', expand: false },
  'fail-early': { type: 'bool' },
  'no-fail-early': { type: 'bool', name: 'fail-early', expand: false },
  'styled-output': { type: 'bool' },
  'no-styled-output': { type: 'bool', name: 'styled-output', expand: false },
  'mail-rcpt-allowfails': { type: 'bool' },
  'no-mail-rcpt-allowfails': { type: 'bool', name: 'mail-rcpt-allowfails', expand: false },
  'fail-with-body': { type: 'bool' },
  'no-fail-with-body': { type: 'bool', name: 'fail-with-body', expand: false },
  form: { type: 'string' },
  'form-string': { type: 'string' },
  globoff: { type: 'bool' },
  'no-globoff': { type: 'bool', name: 'globoff', expand: false },
  get: { type: 'bool' },
  'request-target': { type: 'string' },
  help: { type: 'bool' },
  'no-help': { type: 'bool', name: 'help', expand: false },
  header: { type: 'string' },
  'proxy-header': { type: 'string' },
  include: { type: 'bool' },
  'no-include': { type: 'bool', name: 'include', expand: false },
  head: { type: 'bool' },
  'no-head': { type: 'bool', name: 'head', expand: false },
  'junk-session-cookies': { type: 'bool' },
  'no-junk-session-cookies': { type: 'bool', name: 'junk-session-cookies', expand: false },
  'remote-header-name': { type: 'bool' },
  'no-remote-header-name': { type: 'bool', name: 'remote-header-name', expand: false },
  insecure: { type: 'bool' },
  'no-insecure': { type: 'bool', name: 'insecure', expand: false },
  'doh-insecure': { type: 'bool' },
  'no-doh-insecure': { type: 'bool', name: 'doh-insecure', expand: false },
  config: { type: 'string' },
  'list-only': { type: 'bool' },
  'no-list-only': { type: 'bool', name: 'list-only', expand: false },
  location: { type: 'bool' },
  'no-location': { type: 'bool', name: 'location', expand: false },
  'location-trusted': { type: 'bool' },
  'no-location-trusted': { type: 'bool', name: 'location-trusted', expand: false },
  'max-time': { type: 'string' },
  manual: { type: 'bool' },
  'no-manual': { type: 'bool', name: 'manual', expand: false },
  netrc: { type: 'bool' },
  'no-netrc': { type: 'bool', name: 'netrc', expand: false },
  'netrc-optional': { type: 'bool' },
  'no-netrc-optional': { type: 'bool', name: 'netrc-optional', expand: false },
  'netrc-file': { type: 'string' },
  buffer: { type: 'bool' },
  'no-buffer': { type: 'bool', name: 'buffer', expand: false },
  output: { type: 'string' },
  'remote-name': { type: 'bool' },
  'remote-name-all': { type: 'bool' },
  'no-remote-name-all': { type: 'bool', name: 'remote-name-all', expand: false },
  'output-dir': { type: 'string' },
  proxytunnel: { type: 'bool' },
  'no-proxytunnel': { type: 'bool', name: 'proxytunnel', expand: false },
  'ftp-port': { type: 'string' },
  disable: { type: 'bool' },
  'no-disable': { type: 'bool', name: 'disable', expand: false },
  quote: { type: 'string' },
  range: { type: 'string' },
  'remote-time': { type: 'bool' },
  'no-remote-time': { type: 'bool', name: 'remote-time', expand: false },
  silent: { type: 'bool' },
  'no-silent': { type: 'bool', name: 'silent', expand: false },
  'show-error': { type: 'bool' },
  'no-show-error': { type: 'bool', name: 'show-error', expand: false },
  'telnet-option': { type: 'string' },
  'upload-file': { type: 'string' },
  user: { type: 'string' },
  'proxy-user': { type: 'string' },
  verbose: { type: 'bool' },
  'no-verbose': { type: 'bool', name: 'verbose', expand: false },
  version: { type: 'bool' },
  'no-version': { type: 'bool', name: 'version', expand: false },
  'write-out': { type: 'string' },
  proxy: { type: 'string' },
  preproxy: { type: 'string' },
  request: { type: 'string' },
  'speed-limit': { type: 'string' },
  'speed-time': { type: 'string' },
  'time-cond': { type: 'string' },
  parallel: { type: 'bool' },
  'no-parallel': { type: 'bool', name: 'parallel', expand: false },
  'parallel-max': { type: 'string' },
  'parallel-immediate': { type: 'bool' },
  'no-parallel-immediate': { type: 'bool', name: 'parallel-immediate', expand: false },
  'progress-bar': { type: 'bool' },
  'no-progress-bar': { type: 'bool', name: 'progress-bar', expand: false },
  'progress-meter': { type: 'bool' },
  'no-progress-meter': { type: 'bool', name: 'progress-meter', expand: false },
  next: { type: 'bool' }
}

const curlShortOpts = {
  0: 'http1.0',
  1: 'tlsv1',
  2: 'sslv2',
  3: 'sslv3',
  4: 'ipv4',
  6: 'ipv6',
  a: 'append',
  A: 'user-agent',
  b: 'cookie',
  B: 'use-ascii',
  c: 'cookie-jar',
  C: 'continue-at',
  d: 'data',
  D: 'dump-header',
  e: 'referer',
  E: 'cert',
  f: 'fail',
  F: 'form',
  g: 'globoff',
  G: 'get',
  h: 'help',
  H: 'header',
  i: 'include',
  I: 'head',
  j: 'junk-session-cookies',
  J: 'remote-header-name',
  k: 'insecure',
  K: 'config',
  l: 'list-only',
  L: 'location',
  m: 'max-time',
  M: 'manual',
  n: 'netrc',
  N: 'no-buffer',
  o: 'output',
  O: 'remote-name',
  p: 'proxytunnel',
  P: 'ftp-port',
  q: 'disable',
  Q: 'quote',
  r: 'range',
  R: 'remote-time',
  s: 'silent',
  S: 'show-error',
  t: 'telnet-option',
  T: 'upload-file',
  u: 'user',
  U: 'proxy-user',
  v: 'verbose',
  V: 'version',
  w: 'write-out',
  x: 'proxy',
  X: 'request',
  Y: 'speed-limit',
  y: 'speed-time',
  z: 'time-cond',
  Z: 'parallel',
  '#': 'progress-bar',
  ':': 'next'
}
// END GENERATED CURL OPTIONS

// These are options that curl used to have.
// Those that don't conflict with the current options are supported by curlconverter.
// TODO: curl's --long-options can be shortened.
// For example if curl used to only have a single option, "--blah" then
// "--bla" "--bl" and "--b" all used to be valid options as well. If later
// "--blaz" was added, suddenly those 3 shortened options are removed (because
// they are now ambiguous).
// https://github.com/curlconverter/curlconverter/pull/280#issuecomment-931241328
const removedLongOpts = {
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
  'capath ': { type: 'string', name: 'capath', removed: '7.49.0' }, // trailing space
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
for (const [opt, val] of Object.entries(removedLongOpts)) {
  if (!has(val, 'name')) {
    val.name = opt
  }
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

// These options can be specified more than once, they
// are always returned as a list.
// Normally, if you specify some option more than once,
// curl will just take the last one.
// TODO: extract this from curl's source code?
const canBeList = new Set([
  // TODO: unlike curl, we don't support multiple
  // URLs and just take the last one.
  'url',
  'header', 'proxy-header',
  'form',
  'data', 'data-binary', 'data-ascii', 'data-raw', 'data-urlencode',
  'mail-rcpt',
  'resolve',
  'connect-to',
  // TODO: support multiple cookies
  // https://github.com/curlconverter/curlconverter/issues/161
  // 'cookie',
  'quote',
  'telnet-option'
])

const shortened = {}
for (const [opt, val] of Object.entries(curlLongOpts)) {
  if (!has(val, 'name')) {
    val.name = opt
  }
  // curl lets you not type the full argument as long as it's unambiguous.
  // So --sil instead of --silent is okay, --s is not.
  // This doesn't apply to options starting with --no-
  // Default 'expand' to true if not specified
  const shouldExpand = !has(val, 'expand') || val.expand
  delete val.expand
  if (shouldExpand) {
    for (let i = 1; i < opt.length; i++) {
      const shortenedOpt = opt.slice(0, i)
      pushProp(shortened, shortenedOpt, val)
    }
  }
}
for (const [shortenedOpt, vals] of Object.entries(shortened)) {
  if (!has(curlLongOpts, shortenedOpt)) {
    if (vals.length === 1) {
      curlLongOpts[shortenedOpt] = vals[0]
    } else if (vals.length > 1) {
      // More than one option shortens to this, it's ambiguous
      curlLongOpts[shortenedOpt] = null
    }
  }
}
for (const [removedOpt, val] of Object.entries(removedLongOpts)) {
  if (!has(curlLongOpts, removedOpt)) {
    curlLongOpts[removedOpt] = val
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

const toBoolean = opt => {
  if (opt.startsWith('no-disable-')) {
    return true
  }
  if (opt.startsWith('disable-') || opt.startsWith('no-')) {
    return false
  }
  return true
}

// NOTE: this bash string parsing is probably not entirely correct.
// We get the text as it appears in the bash source code,
// which might have escaped newlines (if the string spans
// multiple lines) and escaped quotes and maybe other
// things I don't know about.
const parseSingleQuoteString = (str) => {
  const BACKSLASHES = /\\(\n|')/gs
  const unescapeChar = (m) => m.charAt(1) === '\n' ? '' : m.charAt(1)
  return str.slice(1, -1).replace(BACKSLASHES, unescapeChar)
}
const parseDoubleQuoteString = (str) => {
  const BACKSLASHES = /\\(\n|\\|")/gs
  const unescapeChar = (m) => m.charAt(1) === '\n' ? '' : m.charAt(1)
  return str.slice(1, -1).replace(BACKSLASHES, unescapeChar)
}
// ANSI-C quoted strings look $'like this'.
// Not all shells have them but bash does
// https://www.gnu.org/software/bash/manual/html_node/ANSI_002dC-Quoting.html
//
// https://git.savannah.gnu.org/cgit/bash.git/tree/lib/sh/strtrans.c
const parseAnsiCString = (str) => {
  const ANSI_BACKSLASHES = /\\(\\|a|b|e|E|f|n|r|t|v|'|"|\?|[0-7]{1,3}|x[0-9A-Fa-f]{1,2}|u[0-9A-Fa-f]{1,4}|U[0-9A-Fa-f]{1,8}|c.)/gs
  const unescapeChar = (m) => {
    switch (m.charAt(1)) {
      case '\\':
        return '\\'
      case 'a':
        return '\a' // eslint-disable-line
      case 'b':
        return '\b'
      case 'e':
      case 'E':
        return '\x1B'
      case 'f':
        return '\f'
      case 'n':
        return '\n'
      case 'r':
        return '\r'
      case 't':
        return '\t'
      case 'v':
        return '\v'
      case "'":
        return "'"
      case '"':
        return '"'
      case '?':
        return '?'
      case 'c':
        // bash handles all characters by considering the first byte
        // of its UTF-8 input and can produce invalid UTF-8, whereas
        // JavaScript stores strings in UTF-16
        if (m.codePointAt(2) > 127) {
          throw new CCError("non-ASCII control character in ANSI-C quoted string: '\\u{" + m.codePointAt(2).toString(16) + "}'")
        }
        // If this produces a 0x00 (null) character, it will cause bash to
        // terminate the string at that character, but we return the null
        // character in the result.
        return m[2] === '?' ? '\x7F' : String.fromCodePoint(m[2].toUpperCase().codePointAt(0) & 0b00011111)
      case 'x':
      case 'u':
      case 'U':
        // Hexadecimal character literal
        // Unlike bash, this will error if the the code point is greater than 10FFFF
        return String.fromCodePoint(parseInt(m.slice(2), 16))
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
        // Octal character literal
        return String.fromCodePoint(parseInt(m.slice(1), 8) % 256)
      default:
        // There must be a mis-match between ANSI_BACKSLASHES and the switch statement
        throw new CCError('unhandled character in ANSI-C escape code: ' + JSON.stringify(m))
    }
  }

  return str.slice(2, -1).replace(ANSI_BACKSLASHES, unescapeChar)
}

const tokenizeBashStr = (curlCommand) => {
  const curlArgs = parser.parse(curlCommand)
  // The AST must be in a nice format, i.e.
  // (program
  //   (command
  //     name: (command_name (word))
  //     argument+: (
  //       word |
  //       string ('') |
  //       raw_string ("") |
  //       ansii_c_string ($'') |
  //       simple_expansion (variable_name))))
  //
  // TODO: support strings with variable expansions inside
  // TODO: support prefixed variables, e.g. "MY_VAR=hello curl example.com"
  // TODO: get only named children?
  if (curlArgs.rootNode.type !== 'program') {
    // TODO: better error message.
    throw new CCError("expected a 'program' AST node, got " + curlArgs.rootNode.type + ' instead')
  }

  if (curlArgs.rootNode.childCount < 1) {
    // TODO: better error message.
    throw new CCError('empty "program" node')
  }

  // Get the curl call AST node. Skip comments
  let command
  for (const programChildNode of curlArgs.rootNode.children) {
    if (programChildNode.type === 'comment') {
      continue
    } else if (programChildNode.type === 'command') {
      command = programChildNode
      // TODO: if there are more `command` nodes,
      // warn that everything after the first one is ignored
      break
    } else {
      // TODO: better error message.
      throw new CCError("expected a 'command' AST node, got " + curlArgs.rootNode.firstChild.type + ' instead')
    }
  }
  if (!command) {
    // NOTE: if you add more node types in the `for` loop above, this error needs to be updated.
    // We would probably need to keep track of the node types we've seen.
    throw new CCError("expected a 'command' AST node, only found 'comment' nodes")
  }

  if (command.childCount < 1) {
    // TODO: better error message.
    throw new CCError('empty "command" node')
  }
  // TODO: add childrenForFieldName to tree-sitter node/web bindings and then
  // use that here instead
  // TODO: you can have variable_assignment before the actual command
  // MY_VAR=foo curl example.com
  const [cmdName, ...args] = command.children
  if (cmdName.type !== 'command_name') {
    // TODO: better error message.
    throw new CCError("expected a 'command_name' AST node, got " + cmdName.type + ' instead')
  }

  const toVal = (node) => {
    switch (node.type) {
      case 'word':
        return node.text
      case 'string':
        return parseDoubleQuoteString(node.text)
      case 'raw_string':
        return parseSingleQuoteString(node.text)
      case 'ansii_c_string':
        return parseAnsiCString(node.text)
      case 'simple_expansion':
        return node.text // TODO: handle variables properly downstream
      case 'concatenation':
        // item[]=1 turns into item=1 if we don't do this
        // https://github.com/tree-sitter/tree-sitter-bash/issues/104
        if (node.children.every(n => n.type === 'word')) {
          return node.text
        }
        return node.children.map(toVal).join('')
      default:
        // console.error(curlCommand)
        // console.error(curlArgs.rootNode.toString())
        throw new CCError('unexpected argument type ' + JSON.stringify(node.type) + '. Must be one of "word", "string", "raw_string", "ascii_c_string", "simple_expansion" or "concatenation"')
    }
  }
  return [cmdName.text.trim(), ...args.map(toVal)]
}

const parseArgs = (args, opts) => {
  const [longOpts, shortOpts] = opts || [curlLongOpts, curlShortOpts]

  const parsedArguments = {}
  for (let i = 0, stillflags = true; i < args.length; i++) {
    let arg = args[i]
    if (stillflags && arg.startsWith('-')) {
      if (arg === '--') {
        /* This indicates the end of the flags and thus enables the
           following (URL) argument to start with -. */
        stillflags = false
      } else if (arg.startsWith('--')) {
        const longArg = longOpts[arg.slice(2)]
        if (longArg === null) {
          throw new CCError('option ' + arg + ': is ambiguous')
        }
        if (typeof longArg === 'undefined') {
          // TODO: extract a list of deleted arguments to check here
          throw new CCError('option ' + arg + ': is unknown')
        }

        if (longArg.type === 'string') {
          if (i + 1 < args.length) {
            i++
            pushProp(parsedArguments, longArg.name, args[i])
          } else {
            throw new CCError('option ' + arg + ': requires parameter')
          }
        } else {
          parsedArguments[longArg.name] = toBoolean(arg.slice(2)) // TODO: all shortened args work correctly?
        }
      } else {
        // Short option. These can look like
        // -X POST -> {request: 'POST'}
        // or
        // -XPOST  -> {request: 'POST'}
        // or multiple options
        // -ABCX POST
        // -> {A: true, B: true, C: true, request: 'POST'}
        // or multiple options and a value for the last one
        // -ABCXPOST
        // -> {A: true, B: true, C: true, request: 'POST'}

        // "-" passed to curl on its own raises an error,
        // curlconverter's command line uses it to read from stdin
        if (arg.length === 1) {
          if (has(shortOpts, '')) {
            arg = ['-', '']
          } else {
            throw new CCError('option ' + arg + ': is unknown')
          }
        }
        for (let j = 1; j < arg.length; j++) {
          if (!has(shortOpts, arg[j])) {
            if (has(changedShortOpts, arg[j])) {
              throw new CCError('option ' + arg + ': ' + changedShortOpts[arg[j]])
            }
            // TODO: there are a few deleted short options we could report
            throw new CCError('option ' + arg + ': is unknown')
          }
          const shortFor = shortOpts[arg[j]]
          const longArg = longOpts[shortFor]
          if (longArg.type === 'string') {
            let val
            if (j + 1 < arg.length) {
              // treat -XPOST as -X POST
              val = arg.slice(j + 1)
              j = arg.length
            } else if (i + 1 < args.length) {
              i++
              val = args[i]
            } else {
              throw new CCError('option ' + arg + ': requires parameter')
            }
            pushProp(parsedArguments, longArg.name, val)
          } else {
            // Use shortFor because -N is short for --no-buffer
            // and we want to end up with {buffer: false}
            parsedArguments[longArg.name] = toBoolean(shortFor)
          }
        }
      }
    } else {
      pushProp(parsedArguments, 'url', arg)
    }
  }

  for (const [arg, values] of Object.entries(parsedArguments)) {
    if (Array.isArray(values) && !canBeList.has(arg)) {
      parsedArguments[arg] = values[values.length - 1]
    }
  }
  return parsedArguments
}

export const parseQueryString = (s) => {
  // if url is 'example.com?' => s is ''
  // if url is 'example.com'  => s is null
  if (!s) {
    return [null, null]
  }

  const asList = []
  for (const param of s.split('&')) {
    const [key, val] = param.split(/=(.*)/s, 2)
    let decodedKey
    let decodedVal
    try {
      decodedKey = decodeURIComponent(key)
      decodedVal = val === undefined ? null : decodeURIComponent(val)
    } catch (e) {
      if (e instanceof URIError) {
        // Query string contains invalid percent encoded characters,
        // we cannot properly convert it.
        return [null, null]
      }
      throw e
    }
    try {
      // If the query string doesn't round-trip, we cannot properly convert it.
      // TODO: this is too strict. Ideally we want to check how each runtime/library
      // percent encodes query strings. For example, a %27 character in the input query
      // string will be decoded to a ' but won't be re-encoded into a %27 by encodeURIComponent
      const roundTripKey = encodeURIComponent(decodedKey)
      const roundTripVal = encodeURIComponent(decodedVal)
      if ((roundTripKey !== key && roundTripKey.replace('%20', '+') !== key) ||
          (decodedVal && (roundTripVal !== val && roundTripVal.replace('%20', '+') !== val))) {
        return [null, null]
      }
    } catch (e) {
      if (e instanceof URIError) {
        return [null, null]
      }
      throw e
    }
    asList.push([decodedKey, decodedVal])
  }

  // Group keys
  const asDict = {}
  let prevKey = null
  for (const [key, val] of asList) {
    if (prevKey === key) {
      asDict[key].push(val)
    } else {
      if (!has(asDict, key)) {
        asDict[key] = [val]
      } else {
        // If there's a repeated key with a different key between
        // one of its repetitions, there is no way to represent
        // this query string as a dictionary.
        return [asList, null]
      }
    }
    prevKey = key
  }

  // Convert lists with 1 element to the element
  for (const [key, val] of Object.entries(asDict)) {
    if (val.length === 1) {
      asDict[key] = val[0]
    }
  }

  return [asList, asDict]
}

const buildRequest = parsedArguments => {
  // TODO: handle multiple URLs
  if (!parsedArguments.url || !parsedArguments.url.length) {
    // TODO: better error message (could be parsing fail)
    throw new CCError('no URL specified!')
  }
  let url = parsedArguments.url[parsedArguments.url.length - 1]

  let headers
  let cookieString
  if (parsedArguments.header) {
    if (!headers) {
      headers = {}
    }
    parsedArguments.header.forEach(header => {
      if (header.indexOf('Cookie') !== -1) {
        cookieString = header
      } else {
        const components = header.split(/:(.*)/s)
        if (components[1]) {
          headers[components[0]] = components[1].trim()
        }
      }
    })
  }

  if (parsedArguments['user-agent']) {
    if (!headers) {
      headers = {}
    }
    headers['User-Agent'] = parsedArguments['user-agent']
  }

  if (parsedArguments.cookie) {
    cookieString = parsedArguments.cookie
  }
  let multipartUploads
  if (parsedArguments.form) {
    multipartUploads = {}
    parsedArguments.form.forEach(multipartArgument => {
      // input looks like key=value. value could be json or a file path prepended with an @
      // TODO: what if multipartArgument is empty string?
      // TODO: if string has more than one '=', this throws away data
      const [key, value] = multipartArgument.split('=', 2)
      multipartUploads[key] = value
    })
  }
  let cookies
  if (cookieString) {
    const cookieParseOptions = { decode: (s) => s }
    // separate out cookie headers into separate data structure
    // note: cookie is case insensitive
    cookies = cookie.parse(cookieString.replace(/^Cookie: /gi, ''), cookieParseOptions)
  }

  // TODO: don't lower case method,
  // curl expects you to uppercase always, if you do -X PoSt, that's
  // what it will put as the method and we should do the same.
  // TODO: read curl's source to figure out precedence rules.
  let method
  if (parsedArguments.head) {
    method = 'head'
  } else if (has(parsedArguments, 'request') &&
    parsedArguments.request !== 'null') { // Safari adds `-Xnull` if it can't determine the request type
    method = parsedArguments.request.toLowerCase()
  } else if (parsedArguments['upload-file']) { // --upload-file '' doesn't do anything.
    method = 'put'
  } else if ((has(parsedArguments, 'data') ||
    has(parsedArguments, 'data-ascii') ||
    has(parsedArguments, 'data-binary') ||
    has(parsedArguments, 'data-raw') ||
    has(parsedArguments, 'form')) && !(parsedArguments.get)) {
    method = 'post'
  } else {
    method = 'get'
  }

  const urlObject = URL.parse(url) // eslint-disable-line
  // if GET request with data, convert data to query string
  // NB: the -G flag does not change the http verb. It just moves the data into the url.
  // TODO: this probably has a lot of mismatches with curl
  if (parsedArguments.get) {
    urlObject.query = urlObject.query ? urlObject.query : ''
    if (has(parsedArguments, 'data')) {
      let urlQueryString = ''

      if (url.indexOf('?') < 0) {
        url += '?'
      } else {
        urlQueryString += '&'
      }

      urlQueryString += parsedArguments.data.join('&')
      urlObject.query += urlQueryString
      // TODO: url and urlObject will be different if url has an #id
      url += urlQueryString
      delete parsedArguments.data
    }
  }
  if (urlObject.query && urlObject.query.endsWith('&')) {
    urlObject.query = urlObject.query.slice(0, -1)
  }
  const [queryAsList, queryAsDict] = parseQueryString(urlObject.query)
  // Most software libraries don't let you distinguish between a=&b= and a&b,
  // so if we get an `a&b`-type query string, don't bother.
  const request = { url }
  if (!queryAsList || queryAsList.some((p) => p[1] === null)) {
    request.urlWithoutQuery = url // TODO: rename?
  } else {
    urlObject.search = null // Clean out the search/query portion.
    request.urlWithoutQuery = URL.format(urlObject)

    if (queryAsList.length > 0) {
      request.query = queryAsList
      if (queryAsDict) {
        request.queryDict = queryAsDict
      }
    }
  }

  if (parsedArguments.compressed) {
    request.compressed = true
  }

  if (headers) {
    request.headers = headers
  }
  request.method = method

  if (cookies) {
    request.cookies = cookies
    request.cookieString = cookieString.replace('Cookie: ', '')
  }
  if (multipartUploads) {
    request.multipartUploads = multipartUploads
  }
  // TODO: all of these could be specified in the same command.
  // They also need to maintain order.
  // TODO: do all of these allow @file?
  // TODO: set Content-Type downstream for some of these
  if (parsedArguments.data) {
    request.data = parsedArguments.data
  } else if (parsedArguments['data-binary']) {
    request.data = parsedArguments['data-binary']
    request.isDataBinary = true
  } else if (parsedArguments['data-ascii']) {
    request.data = parsedArguments['data-ascii']
  } else if (parsedArguments['data-raw']) {
    request.data = parsedArguments['data-raw']
    request.isDataRaw = true
  } else if (parsedArguments['data-urlencode']) {
    // TODO: this doesn't exactly match curl
    // all '&' and all but the first '=' need to be escaped
    request.data = parsedArguments['data-urlencode']
  }

  if (parsedArguments.user) {
    request.auth = parsedArguments.user
  }
  if (has(request, 'data')) {
    if (request.data.length > 1) {
      request.dataArray = request.data
      request.data = request.data.join('&')
    } else {
      request.data = request.data[0]
    }
  }

  if (parsedArguments.insecure) {
    request.insecure = true
  }
  // TODO: if the URL doesn't start with https://, curl doesn't verify
  // certificates, etc.
  if (parsedArguments.cert) {
    // --key has no effect if --cert isn't passed
    request.cert = parsedArguments.key ? [parsedArguments.cert, parsedArguments.key] : parsedArguments.cert
  }
  if (parsedArguments.cacert) {
    request.cacert = parsedArguments.cacert
  }
  if (parsedArguments.capath) {
    request.capath = parsedArguments.capath
  }

  return request
}

const parseCurlCommand = (curlCommand) => {
  const [cmdName, ...args] = Array.isArray(curlCommand) ? curlCommand : tokenizeBashStr(curlCommand)
  if (typeof cmdName === 'undefined') {
    const errorMsg = Array.isArray(curlCommand) ? 'no arguments provided' : 'failed to parse input'
    throw new CCError(errorMsg)
  }
  if (cmdName.trim() !== 'curl') {
    const shortenedCmdName = cmdName.length > 30 ? cmdName.slice(0, 27) + '...' : cmdName
    if (cmdName.startsWith('curl ')) {
      throw new CCError('command should begin with a single token "curl" but instead begins with ' + JSON.stringify(shortenedCmdName))
    } else {
      throw new CCError('command should begin with "curl" but instead begins with ' + JSON.stringify(shortenedCmdName))
    }
  }

  const parsedArguments = parseArgs(args)
  return buildRequest(parsedArguments)
}

const serializeCookies = cookieDict => {
  let cookieString = ''
  let i = 0
  const cookieCount = Object.keys(cookieDict).length
  for (const cookieName in cookieDict) {
    const cookieValue = cookieDict[cookieName]
    cookieString += cookieName + '=' + cookieValue
    if (i < cookieCount - 1) {
      cookieString += '; '
    }
    i++
  }
  return cookieString
}

export {
  curlLongOpts,
  curlShortOpts,
  parseArgs,
  buildRequest,
  parseCurlCommand,
  serializeCookies
}
