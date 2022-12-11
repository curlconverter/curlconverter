// This is
// https://github.com/curl/curl/blob/curl-7_82_0/src/tool_cfgable.h
// translated to TypeScript.

enum curl_error {
  ERR_NONE,
  ERR_BINARY_TERMINAL = 1, /* binary to terminal detected */
  ERR_LAST
};

// struct State {
//   struct getout *urlnode;
//   struct URLGlob *inglob;
//   struct URLGlob *urls;
//   char *outfiles;
//   char *httpgetfields;
//   char *uploadfile;
//   unsigned long infilenum; /* number of files to upload */
//   unsigned long up;  /* upload file counter within a single upload glob */
//   unsigned long urlnum; /* how many iterations this single URL has with ranges
//                            etc */
//   unsigned long li;
// };
export type State = any;

export type curl_slist = [string];
export type curl_off_t = any;
export type getout = {
  // next?: getout;      /* next one */
  // TODO: url: string;
  url?: string;       /* the URL we deal with */
  outfile?: string | null;   /* where to store the output */
  infile?: string;    /* file to upload, if GETOUT_UPLOAD is set */
  flags: number;     /* options - composed of GETOUT_* bits */
  num?: number;       /* which URL number in an invocation */
};

export type curl_TimeCond = any;
export type tool_mime = any;
export type curl_mime = any;
export type HttpReq = any;


export type PostField = {
  mode: 'binary' | 'text' | 'url-encoded';
  name?: string;
  content?: string;
  filename?: string;
}

export type Mime = {
  name: string;
  type?: 'file' | 'text';
  content?: string;
  filename?: string;
}


export type OperationConfig = {
  remote_time?: boolean;
  random_file?: string;
  egd_file?: string;
  useragent?: string;
  cookies?: curl_slist;  /* cookies to serialize into a single line */
  cookiejar?: string;          /* write to this file */
  cookiefiles?: curl_slist;  /* file(s) to load cookies from */
  altsvc?: string;             /* alt-svc cache file name */
  hsts?: string;               /* HSTS cache file name */
  cookiesession?: boolean;       /* new session? */
  encoding?: boolean;            /* Accept-Encoding please */
  tr_encoding?: boolean;         /* Transfer-Encoding please */
  authtype: number;   /* auth bitmask */
  use_resume?: boolean;
  resume_from_current?: boolean;
  disable_epsv?: boolean;
  disable_eprt?: boolean;
  ftp_pret?: boolean;
  proto?: number;
  proto_present?: boolean;
  proto_redir?: number;
  proto_redir_present?: boolean;
  proto_default?: string;
  resume_from?: curl_off_t;
  postfields?: PostField[];
  postfieldsize?: curl_off_t;
  referer?: string;
  timeout?: number;
  connecttimeout?: number;
  maxredirs?: number;
  max_filesize?: curl_off_t;
  output_dir?: string;
  headerfile?: string;
  ftpport?: string;
  iface?: string;
  localport?: number;
  localportrange?: number;
  porttouse?: number;
  range?: string;
  low_speed_limit?: number;
  low_speed_time?: number;
  dns_servers?: string;   /* dot notation: 1.1.1.1;2.2.2.2 */
  dns_interface?: string; /* interface name */
  dns_ipv4_addr?: string; /* dot notation */
  dns_ipv6_addr?: string; /* dot notation */
  userpwd?: string;
  login_options?: string;
  tls_username?: string;
  tls_password?: string;
  tls_authtype?: string;
  proxy_tls_username?: string;
  proxy_tls_password?: string;
  proxy_tls_authtype?: string;
  proxyuserpwd?: string;
  proxy?: string;
  proxyver?: number;             /* set to CURLPROXY_HTTP* define */
  noproxy?: string;
  mail_from?: string;
  mail_rcpt?: curl_slist;
  mail_auth?: string;
  mail_rcpt_allowfails?: boolean; /* --mail-rcpt-allowfails */
  sasl_authzid?: string;       /* Authorisation identity (identity to use) */
  sasl_ir?: boolean;             /* Enable/disable SASL initial response */
  proxytunnel?: boolean;
  ftp_append?: boolean;          /* APPE on ftp */
  use_ascii?: boolean;           /* select ascii or text transfer */
  autoreferer?: boolean;         /* automatically set referer */
  failonerror?: boolean;         /* fail on (HTTP) errors */
  failwithbody?: boolean;        /* fail on (HTTP) errors but still store body */
  show_headers?: boolean;        /* show headers to data output */
  no_body?: boolean;             /* don't get the body */
  dirlistonly?: boolean;         /* only get the FTP dir list */
  followlocation?: boolean;      /* follow http redirects */
  unrestricted_auth?: boolean;   /* Continue to send authentication (user+password)
                               when following ocations, even when hostname
                               changed */
  netrc_opt?: boolean;
  netrc?: boolean;
  netrc_file?: string;

  // TODO: url needs to be parsed. e.g. example.com/[1..10] returns a list
//   url_list?: getout;  /* point to the first node */
//   url_last?: getout;  /* point to the last/current node */
//   url_get?: getout;   /* point to the node to fill in URL */
//   url_out?: getout;   /* point to the node to fill in outfile */
//   url_ul?: getout;    /* point to the node to fill in upload */
  url_list: getout[];

  doh_url?: string;
  cipher_list?: string;
  proxy_cipher_list?: string;
  cipher13_list?: string;
  proxy_cipher13_list?: string;
  cert?: string | null;
  proxy_cert?: string | null;
  cert_type?: string;
  proxy_cert_type?: string;
  cacert?: string;
  proxy_cacert?: string;
  capath?: string;
  proxy_capath?: string;
  crlfile?: string;
  proxy_crlfile?: string;
  pinnedpubkey?: string;
  proxy_pinnedpubkey?: string;
  key?: string;
  proxy_key?: string;
  key_type?: string;
  proxy_key_type?: string;
  key_passwd?: string;
  proxy_key_passwd?: string;
  pubkey?: string;
  hostpubmd5?: string;
  hostpubsha256?: string;
  engine?: string;
  etag_save_file?: string;
  etag_compare_file?: string;
  crlf?: boolean;
  customrequest?: string;
  ssl_ec_curves?: string;
  krblevel?: string;
  request_target?: string;
  httpversion?: number;
  http09_allowed?: boolean;
  nobuffer?: boolean;
  readbusy?: boolean;            /* set when reading input returns EAGAIN */
  globoff?: boolean;
  use_httpget?: boolean;
  insecure_ok?: boolean;         /* set TRUE to allow insecure SSL connects */
  doh_insecure_ok?: boolean;     /* set TRUE to allow insecure SSL connects
                               for DoH */
  proxy_insecure_ok?: boolean;   /* set TRUE to allow insecure SSL connects
                               for proxy */
  terminal_binary_ok?: boolean;
  verifystatus?: boolean;
  doh_verifystatus?: boolean;
  create_dirs?: boolean;
  ftp_create_dirs?: boolean;
  ftp_skip_ip?: boolean;
  proxynegotiate?: boolean;
  proxyntlm?: boolean;
  proxydigest?: boolean;
  proxybasic?: boolean;
  proxyanyauth?: boolean;
  jsoned?: boolean; /* added json content-type */
  writeout?: string;           /* %-styled format string to output */
  quote?: curl_slist;
  postquote?: curl_slist;
  prequote?: curl_slist;
  ssl_version?: number;
  ssl_version_max?: number;
  proxy_ssl_version?: number;
  ip_version?: number;
  create_file_mode?: number; /* CURLOPT_NEW_FILE_PERMS */
  timecond?: curl_TimeCond;
  condtime?: curl_off_t;
  headers?: curl_slist;
  proxyheaders?: curl_slist;
  mimeroot?: tool_mime;
  mimecurrent?: tool_mime;
  mimepost?: curl_mime;
  mime?: Mime[];
  telnet_options?: curl_slist;
  resolve?: curl_slist;
  connect_to?: curl_slist;
  httpreq?: HttpReq;

  /* for bandwidth limiting features: */
  sendpersecond?: curl_off_t; /* send to peer */
  recvpersecond?: curl_off_t; /* receive from peer */

  ftp_ssl?: boolean;
  ftp_ssl_reqd?: boolean;
  ftp_ssl_control?: boolean;
  ftp_ssl_ccc?: boolean;
  ftp_ssl_ccc_mode?: number;
  preproxy?: string;
  socks5_gssapi_nec?: boolean;    /* The NEC reference server does not protect the
                               encryption type exchange */
  socks5_auth: number;/* auth bitmask for socks5 proxies */
  proxy_service_name?: string; /* set authentication service name for HTTP and
                               SOCKS5 proxies */
  service_name?: string;       /* set authentication service name for DIGEST-MD5,
                               Kerberos 5 and SPNEGO */

  tcp_nodelay?: boolean;
  tcp_fastopen?: boolean;
  req_retry?: number;           /* number of retries */
  retry_all_errors?: boolean;    /* retry on any error */
  retry_connrefused?: boolean;   /* set connection refused as a transient error */
  retry_delay?: number;         /* delay between retries (in seconds) */
  retry_maxtime?: number;       /* maximum time to keep retrying */

  ftp_account?: string;        /* for ACCT */
  ftp_alternative_to_user?: string;  /* send command if USER/PASS fails */
  ftp_filemethod?: number;
  mime_options?: number;        /* Mime option flags. */
  tftp_blksize?: number;        /* TFTP BLKSIZE option */
  tftp_no_options?: boolean;     /* do not send TFTP options requests */
  ignorecl?: boolean;            /* --ignore-content-length */
  disable_sessionid?: boolean;

  raw?: boolean;
  post301?: boolean;
  post302?: boolean;
  post303?: boolean;
  nokeepalive?: boolean;         /* for keepalive needs */
  alivetime?: number;
  content_disposition?: boolean; /* use Content-disposition filename */

  default_node_flags?: number;   /* default flags to search for each 'node', which
                               is basically each given URL to transfer */

  xattr?: boolean;               /* store metadata in extended attributes */
  gssapi_delegation?: number;
  ssl_allow_beast?: boolean;     /* allow this SSL vulnerability */
  proxy_ssl_allow_beast?: boolean; /* allow this SSL vulnerability for proxy*/

  ssl_no_revoke?: boolean;       /* disable SSL certificate revocation checks */
  /*bool proxy_ssl_no_revoke; */

  ssl_revoke_best_effort?: boolean; /* ignore SSL revocation offline/missing
                                  revocation list errors */

  native_ca_store?: boolean;        /* use the native os ca store */
  ssl_auto_client_cert?: boolean;   /* automatically locate and use a client
                                  certificate for authentication (Schannel) */
  proxy_ssl_auto_client_cert?: boolean; /* proxy version of ssl_auto_client_cert */
  oauth_bearer?: string;             /* OAuth 2.0 bearer token */
  nonpn?: boolean;                     /* enable/disable TLS NPN extension */
  noalpn?: boolean;                    /* enable/disable TLS ALPN extension */
  unix_socket_path?: string;         /* path to Unix domain socket */
  abstract_unix_socket?: boolean;      /* path to an abstract Unix domain socket */
  falsestart?: boolean;
  path_as_is?: boolean;
  expect100timeout?: number;
  suppress_connect_headers?: boolean;  /* suppress proxy CONNECT response headers
                                     from user callbacks */
  synthetic_error?: curl_error;     /* if non-zero, it overrides any libcurl
                                     error */
  ssh_compression?: boolean;           /* enable/disable SSH compression */
  happy_eyeballs_timeout_ms?: number; /* happy eyeballs timeout in milliseconds.
                                     0 is valid. default: CURL_HET_DEFAULT. */
  haproxy_protocol?: boolean;          /* whether to send HAProxy protocol v1 */
  disallow_username_in_url?: boolean;  /* disallow usernames in URLs */
  aws_sigv4?: string;
  global?: GlobalConfig;
  prev?: OperationConfig;
  next?: OperationConfig;   /* Always last in the struct */
  state?: State;             /* for create_transfer() */

  // TODO
  // used for --language for the curlconverter cli
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type FILE = any
export type trace = any

export type GlobalConfig = {
  showerror: number;                   /* -1 == unset, default => show errors
                                           0 => -s is used to NOT show errors
                                           1 => -S has been used to show errors */
  mute?: boolean;                      /* don't show messages, --silent given */
  noprogress?: boolean;                /* don't show progress bar --silent given */
  isatty?: boolean;                    /* Updated internally if output is a tty */
  errors?: FILE;                       /* Error stream, defaults to stderr */
  errors_fopened?: boolean;            /* Whether error stream isn't stderr */
  trace_dump?: string;                 /* file to dump the network trace to */
  trace_stream?: FILE;
  trace_fopened?: boolean;
  tracetype?: trace;
  tracetime?: boolean;                 /* include timestamp? */
  progressmode?: number;               /* CURL_PROGRESS_BAR / CURL_PROGRESS_STATS */
  libcurl?: string;                    /* Output libcurl code to this file name */
  fail_early?: boolean;                /* exit on first transfer error */
  styled_output?: boolean;             /* enable fancy output style detection */
  test_event_based?: boolean;
  parallel?: boolean;
  parallel_max?: number;
  parallel_connect?: boolean;
  help_category?: string;            /* The help category, if set */
//   first: OperationConfig;
//   current: OperationConfig;
//   last: OperationConfig;   /* Always last in the struct */
  configs: OperationConfig[];
  warnings: string[];

  help?: boolean;
  version?: boolean;
  manual?: boolean;

  // TODO
  // used for --language for the curlconverter cli
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};