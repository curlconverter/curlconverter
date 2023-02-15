import { Word, eq } from "../shell/Word.js";
import { warnf } from "../Warnings.js";
import type { GlobalConfig, OperationConfig } from "./opts.js";

// https://github.com/curl/curl/blob/curl-7_87_0/lib/urlapi.c#L60
// https://github.com/curl/curl/blob/curl-7_87_0/lib/urldata.h#L1295
export interface Curl_URL {
  scheme: Word;

  auth?: Word;
  user?: Word;
  password?: Word;

  // options: string /* IMAP only? */;
  host: Word;
  // zoneid: string /* for numerical IPv6 addresses */;
  // port: string;
  path: Word;
  query: Word;
  originalQuery: Word;
  fragment: Word;
  // portnum: number /* the numerical version */;
}

export function parseurl(
  global: GlobalConfig,
  config: OperationConfig,
  url: Word
): Curl_URL {
  // This is curl's parseurl()
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L1144
  // Except we want to accept all URLs.
  // curl further validates URLs in curl_url_get()
  // https://github.com/curl/curl/blob/curl-7_86_0/lib/urlapi.c#L1374
  const u: Curl_URL = {
    scheme: new Word(),
    host: new Word(),
    path: new Word(), // with leading '/'
    query: new Word(), // with leading '?'
    originalQuery: new Word(), // with leading '?'
    fragment: new Word(), // with leading '#'
  };

  // Remove url glob escapes
  // https://github.com/curl/curl/blob/curl-7_87_0/src/tool_urlglob.c#L395-L398
  if (!config.globoff) {
    url = url.replace(/\\([[\]{}])/g, "$1");
  }

  // Prepend "http"/"https" if the scheme is missing.
  // RFC 3986 3.1 says
  //   scheme      = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  // but curl will accept a digit/plus/minus/dot in the first character
  // curl will also accept a url with one / like http:/localhost
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L960
  let schemeMatch = null;
  if (url.tokens.length && typeof url.tokens[0] === "string") {
    schemeMatch = url.tokens[0].match(/^([a-zA-Z0-9+-.]*):\/\/*/);
  }
  if (schemeMatch) {
    const [schemeAndSlashes, scheme] = schemeMatch;
    u.scheme = new Word(scheme.toLowerCase());
    url = url.slice(schemeAndSlashes.length);
  } else {
    // curl defaults to https://
    // we don't because most libraries won't downgrade to http
    // if you ask for https, unlike curl.
    // TODO: handle file:// scheme
    u.scheme = config["proto-default"] ?? new Word("http");
  }
  if (!eq(u.scheme, "http") && !eq(u.scheme, "https")) {
    warnf(global, ["bad-scheme", `Protocol "${u.scheme}" not supported`]);
  }

  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L992
  const hostMatch = url.indexOfFirstChar("/?#");
  if (hostMatch !== -1) {
    u.host = url.slice(0, hostMatch);
    // TODO: u.path might end up empty if indexOfFirstChar found ?#
    u.path = url.slice(hostMatch); // keep leading '/' in .path
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
  const authMatch = u.host.indexOf("@");
  if (authMatch !== -1) {
    const auth = u.host.slice(0, authMatch);
    u.host = u.host.slice(authMatch + 1); // throw away '@'
    // TODO: this makes this command line option sort of supported but not really
    if (!config["disallow-username-in-url"]) {
      // Curl will exit if this is the case, but we just remove it from the URL
      u.auth = auth;
      if (auth.includes(":")) {
        [u.user, u.password] = auth.split(":", 2);
      } else {
        u.user = auth;
        u.password = new Word(); // if there's no ':', curl will append it
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
