import { Word, eq, mergeWords, joinWords } from "./shell/Word.js";

import { CCError, has, isInt } from "./utils.js";
import { warnf, warnIfPartsIgnored } from "./Warnings.js";
import type { Warnings, Support } from "./Warnings.js";
import type {
  GlobalConfig,
  OperationConfig,
  SrcDataParam,
} from "./curl/opts.js";

import { Headers, parseCookies, parseCookiesStrict } from "./Headers.js";
import type { Cookies } from "./Headers.js";

import { pickAuth, type AuthType } from "./curl/auth.js";
export { AuthType } from "./curl/auth.js";

import { parseurl, type Curl_URL } from "./curl/url.js";

import { parseQueryString, percentEncodePlus } from "./Query.js";
import type { QueryList, QueryDict } from "./Query.js";

import { parseForm } from "./curl/form.js";
import type { FormParam } from "./curl/form.js";

export type FileParamType = "data" | "binary" | "urlencode" | "json";
export type DataType = FileParamType | "raw";

export type FileDataParam = {
  filetype: FileParamType;
  // The left side of "=" for --data-urlencode, can't be empty string
  name?: Word;
  filename: Word;
};
// "raw"-type SrcDataParams, and `FileParamType`s that read from stdin
// when we have its contents (because it comes from a pipe) are converted
// to plain strings
export type DataParam = Word | FileDataParam;

// struct getout
// https://github.com/curl/curl/blob/curl-7_86_0/src/tool_sdecls.h#L96
export interface RequestUrl {
  // What it looked like in the input, used for error messages
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
  globoff?: boolean;

  // Just the part that comes from `--get --data` or `--url-query` (not the query in the URL)
  // unless there's only one URL, then it will include both.
  queryArray?: DataParam[];

  authType: AuthType;
  awsSigV4?: Word;
  delegation?: Word;

  // A null header means the command explicitly disabled sending this header
  headers: Headers;

  // .cookies is a parsed version of the Cookie header, if it can be parsed.
  // Generators that use .cookies need to delete the header from .headers (usually).
  cookies?: Cookies;
  cookieFiles?: Word[];
  cookieJar?: Word;

  compressed?: boolean;

  multipartUploads?: FormParam[];

  dataArray?: DataParam[];
  data?: Word;
  dataReadsFile?: string;
  isDataBinary?: boolean;
  isDataRaw?: boolean;

  ipv4?: boolean;
  ipv6?: boolean;

  ciphers?: Word;
  insecure?: boolean;
  cert?: [Word, Word | null];
  certType?: Word;
  key?: Word;
  keyType?: Word;
  cacert?: Word;
  capath?: Word;
  crlfile?: Word;
  pinnedpubkey?: Word;
  randomFile?: Word;
  egdFile?: Word;
  hsts?: Word[]; // a filename

  proxy?: Word;
  proxyAuth?: Word;
  noproxy?: Word; // a list of hosts or "*"

  // seconds, can have decimal
  timeout?: Word;
  connectTimeout?: Word;
  limitRate?: Word;

  followRedirects?: boolean;
  followRedirectsTrusted?: boolean;
  maxRedirects?: Word;

  http2?: boolean;
  http3?: boolean;

  stdin?: Word;
  stdinFile?: Word;

  unixSocket?: Word;
  netrc?: "optional" | "required" | "ignored"; // undefined means implicitly "ignored"

  // Global options
  verbose?: boolean;
  silent?: boolean;
}

function buildURL(
  global: GlobalConfig,
  config: OperationConfig,
  url: Word,
  uploadFile?: Word,
  outputFile?: Word,
  stdin?: Word,
  stdinFile?: Word
): RequestUrl {
  const originalUrl = url;
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
  } else if (uploadFile && uploadFile.toBool()) {
    // --upload-file '' doesn't do anything.
    method = new Word("PUT");
  } else if (!config.get && (has(config, "data") || has(config, "form"))) {
    method = new Word("POST");
  }

  const requestUrl: RequestUrl = {
    originalUrl,
    urlWithoutQueryList,
    url,
    urlObj: u,
    urlWithOriginalQuery,
    urlWithoutQueryArray,
    method,
  };
  if (queryStrReadsFile) {
    requestUrl.queryReadsFile = queryStrReadsFile;
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
    if (eq(uploadFile, "-") || eq(uploadFile, ".")) {
      if (stdinFile) {
        requestUrl.uploadFile = stdinFile;
      } else if (stdin) {
        warnf(global, [
          "upload-file-with-stdin-content",
          "--upload-file with stdin content is not supported",
        ]);
        requestUrl.uploadFile = uploadFile;

        // TODO: this is complicated,
        // --upload-file only applies per-URL so .data needs to become per-URL...
        // if you pass --data and --upload-file or --get and --upload-file, curl will error
        // if (config.url && config.url.length === 1) {
        //   config.data = [["raw", stdin]];
        // } else {
        //   warnf(global, [
        //     "upload-file-with-stdin-content-and-multiple-urls",
        //     "--upload-file with stdin content and multiple URLs is not supported",
        //   ]);
        // }
      } else {
        requestUrl.uploadFile = uploadFile;
      }
    } else {
      requestUrl.uploadFile = uploadFile;
    }
  }
  if (outputFile) {
    // TODO: get stdout redirects of command
    requestUrl.output = outputFile;
  }

  // --user takes precedence over the URL
  const auth = config.user || u.auth;
  if (auth) {
    const [user, pass] = auth.split(":", 2);
    requestUrl.auth = [user, pass || new Word()];
  }

  return requestUrl;
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
      const dataParam: DataParam = {
        // If `filename` isn't null, then `type` can't be "raw"
        filetype: type as FileParamType,
        filename,
      };
      if (name) {
        dataParam.name = name;
      }
      data.push(dataParam);
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
      if (!(d instanceof Word)) {
        dataStrReadsFile ||= d.filename.toString(); // report first file
        if (d.name) {
          return mergeWords([d.name, "=@", d.filename]);
        }
        return d.filename.prepend("@");
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

  const headers = new Headers(config.header);

  let cookies;
  const cookieFiles: Word[] = [];
  const cookieHeader = headers.get("cookie");
  if (cookieHeader) {
    const parsedCookies = parseCookiesStrict(cookieHeader);
    if (parsedCookies) {
      cookies = parsedCookies;
    }
  } else if (cookieHeader === undefined && config.cookie) {
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
      headers.setIfMissing("Cookie", cookieString);
      const parsedCookies = parseCookies(cookieString);
      if (parsedCookies) {
        cookies = parsedCookies;
      }
    }
  }

  if (config["user-agent"]) {
    headers.setIfMissing("User-Agent", config["user-agent"]);
  }
  if (config.referer) {
    // referer can be ";auto" or followed by ";auto", we ignore that.
    const referer = config.referer.replace(/;auto$/, "");
    if (referer.length) {
      headers.setIfMissing("Referer", referer);
    }
  }
  if (config.range) {
    let range = config.range.prepend("bytes=");
    if (!range.includes("-")) {
      range = range.append("-");
    }
    headers.setIfMissing("Range", range);
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
    headers.setIfMissing(header, timecond);
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
  for (const [i, url] of config.url.entries()) {
    urls.push(
      buildURL(
        global,
        config,
        url,
        uploadFiles[i],
        outputFiles[i],
        stdin,
        stdinFile
      )
    );
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
    headers,
  };
  // TODO: warn about unused stdin?
  if (stdin) {
    request.stdin = stdin;
  }
  if (stdinFile) {
    request.stdinFile = stdinFile;
  }

  if (config.globoff !== undefined) {
    request.globoff = config.globoff;
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
    headers.setIfMissing("Content-Type", "application/json");
    headers.setIfMissing("Accept", "application/json");
  } else if (config.data) {
    headers.setIfMissing("Content-Type", "application/x-www-form-urlencoded");
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
    const bearer = config["oauth2-bearer"].prepend("Bearer ");
    headers.setIfMissing("Authorization", bearer);
  }
  if (config.delegation) {
    request.delegation = config.delegation;
  }

  // TODO: ideally we should generate code that explicitly unsets the header too
  // no HTTP libraries allow that.
  headers.clearNulls();

  if (config.data && config.data.length) {
    request.data = dataStr;
    if (dataStrReadsFile) {
      request.dataReadsFile = dataStrReadsFile;
    }
    request.dataArray = data;
    // TODO: remove these
    request.isDataRaw = false;
    request.isDataBinary = (data || []).some(
      (d) => !(d instanceof Word) && d.filetype === "binary"
    );
  }
  if (queryArray) {
    // If we have to generate code that reads from a file, we
    // need to do it once for all URLs.
    request.queryArray = queryArray;
  }

  if (config["ipv4"] !== undefined) {
    request["ipv4"] = config["ipv4"];
  }
  if (config["ipv6"] !== undefined) {
    request["ipv6"] = config["ipv6"];
  }

  if (config.ciphers) {
    request.ciphers = config.ciphers;
  }
  if (config.insecure) {
    request.insecure = true;
  }
  // TODO: if the URL doesn't start with https://, curl doesn't verify
  // certificates, etc.
  if (config.cert) {
    if (config.cert.startsWith("pkcs11:") || !config.cert.match(/[:\\]/)) {
      request.cert = [config.cert, null];
    } else {
      // TODO: curl does more complex processing
      // find un-backslash-escaped colon, backslash might also be escaped with a backslash
      let colon = -1;

      try {
        // Safari versions older than 16.4 don't support negative lookbehind
        colon = config.cert.search(/(?<!\\)(?:\\\\)*:/);
      } catch {
        colon = config.cert.search(/:/);
      }

      if (colon === -1) {
        request.cert = [config.cert, null];
      } else {
        const cert = config.cert.slice(0, colon);
        const password = config.cert.slice(colon + 1);
        if (password.toBool()) {
          request.cert = [cert, password];
        } else {
          request.cert = [cert, null];
        }
      }
    }
  }
  if (config["cert-type"]) {
    request.certType = config["cert-type"];
  }
  if (config.key) {
    request.key = config.key;
  }
  if (config["key-type"]) {
    request.keyType = config["key-type"];
  }
  if (config.cacert) {
    request.cacert = config.cacert;
  }
  if (config.capath) {
    request.capath = config.capath;
  }
  if (config.crlfile) {
    request.crlfile = config.crlfile;
  }
  if (config.pinnedpubkey) {
    request.pinnedpubkey = config.pinnedpubkey;
  }
  if (config["random-file"]) {
    request.randomFile = config["random-file"];
  }
  if (config["egd-file"]) {
    request.egdFile = config["egd-file"];
  }
  if (config.hsts) {
    request.hsts = config.hsts;
  }

  if (config.proxy) {
    // https://github.com/curl/curl/blob/e498a9b1fe5964a18eb2a3a99dc52160d2768261/lib/url.c#L2388-L2390
    request.proxy = config.proxy;
    if (config["proxy-user"]) {
      request.proxyAuth = config["proxy-user"];
    }
  }
  if (config.noproxy) {
    request.noproxy = config.noproxy;
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
  if (config["limit-rate"]) {
    request.limitRate = config["limit-rate"];
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
  if (config.http3 || config["http3-only"]) {
    request.http3 = true;
  }

  if (config["unix-socket"]) {
    request.unixSocket = config["unix-socket"];
  }

  if (config["netrc-optional"]) {
    request.netrc = "optional";
  } else if (config.netrc || config["netrc-file"]) {
    request.netrc = "required";
  } else if (config.netrc === false) {
    // TODO || config["netrc-optional"] === false ?
    request.netrc = "ignored";
  }

  if (global.verbose) {
    request.verbose = true;
  }
  if (global.silent) {
    request.silent = true;
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

export function getFirst(
  requests: Request[],
  warnings: Warnings,
  support?: Support
): Request {
  if (requests.length > 1) {
    warnings.push([
      "next",
      // TODO: better message, we might have two requests because of
      // --next or because of multiple curl commands or both
      "got " +
        requests.length +
        " curl requests, only converting the first one",
    ]);
  }
  const request = requests[0];
  warnIfPartsIgnored(request, warnings, support);
  return request;
}
