import { Word, eq, firstShellToken, mergeWords, joinWords } from "./word.js";

import { CCError, has, isInt, underlineNode } from "./util.js";
import { warnf } from "./curl/opts.js";
import type {
  GlobalConfig,
  OperationConfig,
  SrcDataParam,
} from "./curl/opts.js";

import {
  parseCookies,
  parseCookiesStrict,
  _setHeaderIfMissing,
} from "./headers.js";
import type { Headers, Cookies } from "./headers.js";

import { pickAuth, type AuthType } from "./curl/auth.js";

import { parseurl, type Curl_URL } from "./curl/url.js";

import { parseQueryString, percentEncodePlus } from "./query.js";
import type {
  DataParam,
  FileParamType,
  QueryList,
  QueryDict,
} from "./query.js";

import { parseForm } from "./curl/form.js";
import type { FormParam } from "./curl/form.js";

// struct getout
// https://github.com/curl/curl/blob/curl-7_86_0/src/tool_sdecls.h#L96
export interface RequestUrl {
  // The url exactly as it was passed in, used for error messages
  originalUrl: Word;
  url: Word;
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
  urlWithoutQueryList: Word;
  queryList?: QueryList;
  // When all repeated keys in queryList happen one after the other
  // ?a=1&a=1&b=2 (okay)
  // ?a=1&b=2&a=1 (doesn't work, queryList is defined but queryDict isn't)
  queryDict?: QueryDict;

  urlWithoutQueryArray: Word;
  urlWithOriginalQuery: Word;
  // This includes the query in the URL and the query that comes from `--get --data` or `--url-query`
  queryArray?: DataParam[];
  // This is only the query in the URL
  urlQueryArray?: DataParam[];

  uploadFile?: Word;
  output?: Word;

  method: Word;
  auth?: [Word, Word];
  // TODO: should authType be per-url as well?
  // authType?: string;
}

export interface Request {
  // Will have at least one element (otherwise an error is raised)
  urls: RequestUrl[];

  // Just the part that comes from `--get --data` or `--url-query` (not the query in the URL)
  // unless there's only one URL, then it will include both.
  queryArray?: DataParam[];

  authType: AuthType;
  awsSigV4?: Word;
  delegation?: Word;

  // A null header means the command explicitly disabled sending this header
  headers?: Headers;
  lowercaseHeaders: boolean;

  // .cookies is a parsed version of the Cookie header, if it can be parsed.
  // Generators that use .cookies need to delete the header from .headers (usually).
  cookies?: Cookies;
  cookieFiles?: Word[];
  cookieJar?: Word;

  compressed?: boolean;
  insecure?: boolean;

  multipartUploads?: FormParam[];

  dataArray?: DataParam[];
  data?: Word;
  dataReadsFile?: string;
  isDataBinary?: boolean;
  isDataRaw?: boolean;

  cert?: Word | [Word, Word];
  cacert?: Word;
  capath?: Word;

  proxy?: Word;
  proxyAuth?: Word;

  timeout?: Word;
  connectTimeout?: Word;

  followRedirects?: boolean;
  followRedirectsTrusted?: boolean;
  maxRedirects?: Word;

  http2?: boolean;
  http3?: boolean;

  stdin?: Word;
  stdinFile?: Word;
}

export function buildURL(
  global: GlobalConfig,
  config: OperationConfig,
  url: Word,
  uploadFile?: Word,
  stdin?: Word,
  stdinFile?: Word
): [
  Curl_URL,
  Word,
  string | null,
  Word,
  QueryList | null,
  QueryDict | null,
  Word,
  Word,
  DataParam[] | null,
  DataParam[] | null
] {
  const u = parseurl(global, config, url);

  // https://github.com/curl/curl/blob/curl-7_85_0/src/tool_operate.c#L1124
  // https://github.com/curl/curl/blob/curl-7_85_0/src/tool_operhlp.c#L76
  if (uploadFile) {
    // TODO: it's more complicated
    if (u.path.isEmpty()) {
      u.path = uploadFile.prepend("/");
    } else if (u.path.endsWith("/")) {
      u.path = u.path.add(uploadFile);
    }

    if (config.get) {
      warnf(global, [
        "data-ignored",
        "curl doesn't let you pass --get and --upload-file together",
      ]);
    }
  }

  // TODO: remove .originalQuery
  const urlWithOriginalQuery = mergeWords([
    u.scheme,
    "://",
    u.host,
    u.path,
    u.query,
    u.fragment,
  ]);

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
  if (u.query.toBool() || (config["url-query"] && config["url-query"].length)) {
    let queryStr: Word | null = null;

    let queryParts: SrcDataParam[] = [];
    if (u.query.toBool()) {
      // remove the leading '?'
      queryParts.push(["raw", u.query.slice(1)]);
      [queryArray, queryStr, queryStrReadsFile] = buildData(
        queryParts,
        stdin,
        stdinFile
      );
      urlQueryArray = queryArray;
    }
    if (config["url-query"]) {
      queryParts = queryParts.concat(config["url-query"]);
      [queryArray, queryStr, queryStrReadsFile] = buildData(
        queryParts,
        stdin,
        stdinFile
      );
    }

    // TODO: check the curl source code
    // TODO: curl localhost:8888/?
    // will request /?
    // but
    // curl localhost:8888/? --url-query ''
    // (or --get --data '') will request /
    u.query = new Word();
    if (queryStr && queryStr.toBool()) {
      u.query = queryStr.prepend("?");
    }
  }
  const urlWithoutQueryArray = mergeWords([
    u.scheme,
    "://",
    u.host,
    u.path,
    u.fragment,
  ]);
  url = mergeWords([u.scheme, "://", u.host, u.path, u.query, u.fragment]);
  let urlWithoutQueryList = url;
  // TODO: parseQueryString() doesn't accept leading '?'
  let [queryList, queryDict] = parseQueryString(
    u.query.toBool() ? u.query.slice(1) : new Word()
  );
  if (queryList && queryList.length) {
    // TODO: remove the fragment too?
    urlWithoutQueryList = mergeWords([
      u.scheme,
      "://",
      u.host,
      u.path,
      u.fragment,
    ]);
  } else {
    queryList = null;
    queryDict = null;
  }

  // TODO: --path-as-is
  // TODO: --request-target
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
  stdin?: Word,
  stdinFile?: Word
): [DataParam[], Word, string | null] {
  const data: DataParam[] = [];
  let dataStrState = new Word();
  for (const [i, x] of configData.entries()) {
    const type = x[0];
    let value = x[1];
    let name: Word | null = null;

    if (i > 0 && type !== "json") {
      dataStrState = dataStrState.append("&");
    }

    if (type === "urlencode") {
      // curl checks for = before @
      const splitOn = value.includes("=") || !value.includes("@") ? "=" : "@";
      // If there's no = or @ then the entire content is treated as a value and encoded
      if (value.includes("@") || value.includes("=")) {
        [name, value] = value.split(splitOn, 2);
      }

      if (splitOn === "=") {
        if (name && name.toBool()) {
          dataStrState = dataStrState.add(name).append("=");
        }
        // curl's --data-urlencode percent-encodes spaces as "+"
        // https://github.com/curl/curl/blob/curl-7_86_0/src/tool_getparam.c#L630
        dataStrState = dataStrState.add(percentEncodePlus(value));
        continue;
      }

      name = name && name.toBool() ? name : null;
      value = value.prepend("@");
    }

    let filename: Word | null = null;

    if (type !== "raw" && value.startsWith("@")) {
      filename = value.slice(1);
      if (eq(filename, "-")) {
        if (stdin !== undefined) {
          switch (type) {
            case "binary":
            case "json":
              value = stdin;
              break;
            case "urlencode":
              value = mergeWords([
                name && name.length ? name.append("=") : new Word(),
                percentEncodePlus(stdin),
              ]);
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
      if (dataStrState.toBool()) {
        data.push(dataStrState);
        dataStrState = new Word();
      }
      // If `filename` isn't null, then `type` can't be "raw"
      data.push([type as FileParamType, name, filename]);
    } else {
      dataStrState = dataStrState.add(value);
    }
  }
  if (dataStrState.toBool()) {
    data.push(dataStrState);
  }

  let dataStrReadsFile: string | null = null;
  const dataStr = mergeWords(
    data.map((d) => {
      if (Array.isArray(d)) {
        const name = d[1];
        const filename = d[2];
        dataStrReadsFile ||= filename.toString(); // report first file
        if (name) {
          return mergeWords([name, "=@", filename]);
        }
        return filename.prepend("@");
      }
      return d;
    })
  );

  return [data, dataStr, dataStrReadsFile];
}

function buildRequest(
  global: GlobalConfig,
  config: OperationConfig,
  stdin?: Word,
  stdinFile?: Word
): Request {
  if (!config.url || !config.url.length) {
    // TODO: better error message (could be parsing fail)
    throw new CCError("no URL specified!");
  }

  let headers: Headers = [];
  if (config.header) {
    for (const header of config.header) {
      if (header.startsWith("@")) {
        warnf(global, [
          "header-file",
          "passing a file for --header/-H is not supported: " +
            JSON.stringify(header.toString()),
        ]);
        continue;
      }

      if (header.includes(":")) {
        const [name, value] = header.split(":", 2);
        const nameToken = firstShellToken(name);
        if (nameToken) {
          warnf(global, [
            "header-expression",
            "ignoring " +
              nameToken.type +
              " in header name\n" +
              underlineNode(nameToken.syntaxNode),
          ]);
        }
        const hasValue = value && value.trim().toBool();
        const headerValue = hasValue ? value.removeFirstChar(" ") : null;
        headers.push([name, headerValue]);
      } else if (header.includes(";")) {
        const [name] = header.split(";", 2);
        headers.push([name, new Word()]);
      } else {
        // TODO: warn that this header arg is ignored
      }
    }
  }
  const lowercase =
    headers.length > 0 && headers.every((h) => eq(h[0], h[0].toLowerCase()));

  // Handle repeated headers
  // For Cookie and Accept, merge the values using ';' and ',' respectively
  // For other headers, warn about the repeated header
  const uniqueHeaders: { [key: string]: [Word, Word | null][] } = {};
  for (const [name, value] of headers) {
    // TODO: something better, at least warn that variable is ignored
    const lowerName = name.toLowerCase().toString();
    if (!uniqueHeaders[lowerName]) {
      uniqueHeaders[lowerName] = [];
    }
    uniqueHeaders[lowerName].push([name, value]);
  }
  headers = [];
  for (const [lowerName, repeatedHeaders] of Object.entries(uniqueHeaders)) {
    if (repeatedHeaders.length === 1) {
      headers.push(repeatedHeaders[0]);
      continue;
    }
    // If they're all null, just use the first one
    if (repeatedHeaders.every((h) => h[1] === null)) {
      const lastRepeat = repeatedHeaders[repeatedHeaders.length - 1];
      // Warn users if some are capitalized differently
      if (new Set(repeatedHeaders.map((h) => h[0])).size > 1) {
        warnf(global, [
          "repeated-header",
          `"${lastRepeat[0]}" header unset ${repeatedHeaders.length} times`,
        ]);
      }
      headers.push(lastRepeat);
      continue;
    }
    // Otherwise there's at least one non-null value, so we can ignore the nulls
    // TODO: if the values of the repeated headers are the same, just use the first one
    //     'content-type': 'application/json; application/json',
    // doesn't really make sense
    const nonEmptyHeaders = repeatedHeaders.filter((h) => h[1] !== null);
    if (nonEmptyHeaders.length === 1) {
      headers.push(nonEmptyHeaders[0]);
      continue;
    }
    // https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Standard_request_fields
    // and then searched for "#" in the RFCs that define each header
    const commaSeparatedHeaders = new Set(
      [
        "A-IM",
        "Accept",
        "Accept-Charset",
        // "Accept-Datetime",
        "Accept-Encoding",
        "Accept-Language",
        // "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        // TODO: auth-scheme [ 1*SP ( token68 / #auth-param ) ]
        // "Authorization",
        "Cache-Control",
        "Connection",
        "Content-Encoding",
        // "Content-Length",
        // "Content-MD5",
        // "Content-Type", // semicolon
        // "Cookie", // semicolon
        // "Date",
        "Expect",
        "Forwarded",
        // "From",
        // "Host",
        // "HTTP2-Settings",
        "If-Match",
        // "If-Modified-Since",
        "If-None-Match",
        // "If-Range",
        // "If-Unmodified-Since",
        // "Max-Forwards",
        // "Origin",
        // "Pragma",
        // "Prefer", // semicolon
        // "Proxy-Authorization",
        "Range",
        // "Referer",
        "TE",
        "Trailer",
        "Transfer-Encoding",
        // "User-Agent",
        "Upgrade",
        "Via",
        "Warning",
      ].map((h) => h.toLowerCase())
    );
    const semicolonSeparatedHeaders = new Set(
      ["Content-Type", "Cookie", "Prefer"].map((h) => h.toLowerCase())
    );
    let mergeChar = "";
    if (commaSeparatedHeaders.has(lowerName)) {
      mergeChar = ", ";
    } else if (semicolonSeparatedHeaders.has(lowerName)) {
      mergeChar = "; ";
    }
    if (mergeChar) {
      const merged = joinWords(
        nonEmptyHeaders.map((h) => h[1]) as Word[],
        mergeChar
      );
      warnf(global, [
        "repeated-header",
        `merged ${nonEmptyHeaders.length} "${
          nonEmptyHeaders[nonEmptyHeaders.length - 1][0]
        }" headers together with "${mergeChar.trim()}"`,
      ]);
      headers.push([nonEmptyHeaders[0][0], merged]);
      continue;
    }

    warnf(global, [
      "repeated-header",
      `found ${nonEmptyHeaders.length} "${
        nonEmptyHeaders[nonEmptyHeaders.length - 1][0]
      }" headers, only the last one will be sent`,
    ]);
    headers = headers.concat(nonEmptyHeaders);
  }

  let cookies;
  const cookieFiles: Word[] = [];
  const cookieHeaders = headers.filter(
    (h) => h[0].toLowerCase().toString() === "cookie"
  );
  if (cookieHeaders.length === 1 && cookieHeaders[0][1] !== null) {
    const parsedCookies = parseCookiesStrict(cookieHeaders[0][1]);
    if (parsedCookies) {
      cookies = parsedCookies;
    }
  } else if (cookieHeaders.length === 0 && config.cookie) {
    // If there is a Cookie header, --cookies is ignored
    const cookieStrings: Word[] = [];
    for (const c of config.cookie) {
      // a --cookie without a = character reads from it as a filename
      if (c.includes("=")) {
        cookieStrings.push(c);
      } else {
        cookieFiles.push(c);
      }
    }
    if (cookieStrings.length) {
      const cookieString = joinWords(config.cookie, "; ");
      _setHeaderIfMissing(headers, "Cookie", cookieString, lowercase);
      const parsedCookies = parseCookies(cookieString);
      if (parsedCookies) {
        cookies = parsedCookies;
      }
    }
  }

  if (config["user-agent"]) {
    _setHeaderIfMissing(headers, "User-Agent", config["user-agent"], lowercase);
  }
  if (config.referer) {
    // referer can be ";auto" or followed by ";auto", we ignore that.
    const referer = config.referer.replace(/;auto$/, "");
    if (referer.length) {
      _setHeaderIfMissing(headers, "Referer", referer, lowercase);
    }
  }
  if (config.range) {
    let range = config.range.prepend("bytes=");
    if (!range.includes("-")) {
      range = range.append("-");
    }
    _setHeaderIfMissing(headers, "Range", range, lowercase);
  }
  if (config["time-cond"]) {
    let timecond = config["time-cond"];
    let header = "If-Modified-Since";
    switch (timecond.charAt(0)) {
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
    const uploadFile: Word | undefined = uploadFiles[i];
    const output: Word | undefined = outputFiles[i];

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
    ] = buildURL(global, config, originalUrl, uploadFile, stdin, stdinFile);

    // curl expects you to uppercase methods always. If you do -X PoSt, that's what it
    // will send, but most APIs will helpfully uppercase what you pass in as the method.
    //
    // There are many places where curl determines the method, this is the last one:
    // https://github.com/curl/curl/blob/curl-7_85_0/lib/http.c#L2032
    let method = new Word("GET");
    if (
      config.request &&
      // Safari adds `-X null` if it can't determine the request type
      // https://github.com/WebKit/WebKit/blob/f58ef38d48f42f5d7723691cb090823908ff5f9f/Source/WebInspectorUI/UserInterface/Models/Resource.js#L1250
      !eq(config.request, "null")
    ) {
      method = config.request;
    } else if (config.head) {
      method = new Word("HEAD");
    } else if (uploadFile) {
      // --upload-file '' doesn't do anything.
      method = new Word("PUT");
    } else if (!config.get && (has(config, "data") || has(config, "form"))) {
      method = new Word("POST");
    }

    const requestUrl: RequestUrl = {
      originalUrl: originalUrl,
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
      const [user, pass] = auth.split(":", 2);
      requestUrl.auth = [user, pass ? pass : new Word()];
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
        config["upload-file"]
          ?.map((f) => JSON.stringify(f.toString()))
          .join(", "),
    ]);
  }
  if ((config.output || []).length > config.url.length) {
    warnf(global, [
      "too-many-ouptut-files",
      "Got more --output/-o options than URLs: " +
        config.output?.map((f) => JSON.stringify(f.toString())).join(", "),
    ]);
  }

  const request: Request = {
    urls,
    authType: pickAuth(config.authtype),
    lowercaseHeaders: lowercase,
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
    _setHeaderIfMissing(
      headers,
      "Accept",
      new Word("application/json"),
      lowercase
    );
  } else if (config.data) {
    _setHeaderIfMissing(
      headers,
      "Content-Type",
      "application/x-www-form-urlencoded",
      lowercase
    );
  } else if (config.form) {
    // TODO: set content-type?
    request.multipartUploads = parseForm(config.form);
  }

  if (config["aws-sigv4"]) {
    // https://github.com/curl/curl/blob/curl-7_86_0/lib/setopt.c#L678-L679
    request.authType = "aws-sigv4";
    request.awsSigV4 = config["aws-sigv4"];
  }
  if (request.authType === "bearer" && config["oauth2-bearer"]) {
    _setHeaderIfMissing(
      headers,
      "Authorization",
      config["oauth2-bearer"].prepend("Bearer "),
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
    if (
      config["max-time"].isString() &&
      // TODO: parseFloat() like curl
      isNaN(parseFloat(config["max-time"].toString()))
    ) {
      warnf(global, [
        "max-time-not-number",
        "option --max-time: expected a proper numerical parameter: " +
          JSON.stringify(config["max-time"].toString()),
      ]);
    }
  }
  if (config["connect-timeout"]) {
    request.connectTimeout = config["connect-timeout"];
    if (
      config["connect-timeout"].isString() &&
      isNaN(parseFloat(config["connect-timeout"].toString()))
    ) {
      warnf(global, [
        "connect-timeout-not-number",
        "option --connect-timeout: expected a proper numerical parameter: " +
          JSON.stringify(config["connect-timeout"].toString()),
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
    if (
      config["max-redirs"].isString() &&
      !isInt(config["max-redirs"].toString())
    ) {
      warnf(global, [
        "max-redirs-not-int",
        "option --max-redirs: expected a proper numerical parameter: " +
          JSON.stringify(config["max-redirs"].toString()),
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

export function buildRequests(
  global: GlobalConfig,
  stdin?: Word,
  stdinFile?: Word
): Request[] {
  if (!global.configs.length) {
    // shouldn't happen
    warnf(global, ["no-configs", "got empty config object"]);
  }
  return global.configs.map((config) =>
    buildRequest(global, config, stdin, stdinFile)
  );
}
