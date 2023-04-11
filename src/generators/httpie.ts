import { warnIfPartsIgnored } from "../Warnings.js";
import { Word, eq, mergeWords } from "../shell/Word.js";
import { parse, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, RequestUrl, Warnings } from "../parse.js";
import { parseQueryString } from "../Query.js";

import { repr } from "./wget.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "form",
  "form-string",

  "location",
  "no-location",
  "location-trusted",
  "no-location-trusted",
  "max-redirs",

  "ciphers",
  "insecure",
  "cert",
  // "cert-type",
  "key",
  // "key-type",
  "cacert",
  "capath",

  "proxy",
  // "proxy-user", // not supported
  "noproxy", // not supported, just better error

  "timeout",
  "connect-timeout",

  // Wget picks the auth and some it doesn't support but there's a more
  // specific error message for those.
  "anyauth",
  "no-anyauth",
  "digest",
  "no-digest",
  // "aws-sigv4", // not supported
  "negotiate",
  "no-negotiate",
  "delegation", // GSS/kerberos
  // "service-name", // GSS/kerberos, not supported
  "ntlm",
  "no-ntlm",
  "ntlm-wb",
  "no-ntlm-wb",

  // HTTPie looks for a netrc file by default
  // TODO: this doesn't work
  "no-netrc", // only explicitly disabling netrc has an effect,

  // "output",
  "upload-file",

  "next",
]);

function requestToHttpie(
  request: Request,
  url: RequestUrl,
  warnings: Warnings
): string {
  const flags: string[] = [];
  let method: string | null = null;
  let urlArg = url.url;
  const items: string[] = [];

  if (url.uploadFile || request.data || request.multipartUploads) {
    if (!eq(url.method, "POST")) {
      method = repr(url.method);
    }
  } else if (!eq(url.method, "GET")) {
    method = repr(url.method);
  }

  // TODO: don't merge headers
  if (request.headers.length) {
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        items.push(repr(mergeWords([headerName, ":"])));
      } else if (!headerValue.toBool()) {
        items.push(repr(mergeWords([headerName, ";"])));
      } else {
        if (headerValue.startsWith("@")) {
          // TODO: check this
          items.push(repr(mergeWords([headerName, ":\\", headerValue])));
        } else {
          items.push(repr(mergeWords([headerName, ":", headerValue])));
        }
      }
    }
  }

  if (url.auth) {
    const [user, password] = url.auth;

    if (request.authType === "digest") {
      flags.push("-A digest");
    } else if (request.authType === "ntlm" || request.authType === "ntlm-wb") {
      flags.push("--auth-type=ntlm");
      warnings.push([
        "httpie-ntlm",
        "NTLM auth requires the httpie-ntlm plugin",
      ]);
    } else if (request.authType === "negotiate") {
      flags.push("--auth-type=negotiate");
      warnings.push([
        "httpie-negotiate",
        "SPNEGO (GSS Negotiate) auth requires the httpie-negotiate plugin",
      ]);
      // TODO: is this the same thing?
      // } else if (request.authType === "aws-sigv4") {
      //   warnings.push([
      //     "httpie-ntlm",
      //     "aws-sigv4 auth is not supported and requires the httpie-aws-auth plugin",
      //   ]);
    } else if (request.authType !== "basic") {
      warnings.push([
        "httpie-unsupported-auth",
        "HTTPie doesn't support " + request.authType + " authentication",
      ]);
    }
    // TODO: -A bearer -a token

    flags.push("-a " + repr(mergeWords([user, ":", password])));
  }

  // TODO: don't need to add "http://" to URL
  // TODO: use "https" command and not add "https://" to URL
  // TODO: use localhost shorthands
  if (url.queryList) {
    urlArg = url.urlWithoutQueryList;
    for (const [name, value] of url.queryList) {
      items.push(repr(mergeWords([name, "==", value])));
    }
  }

  if (url.uploadFile) {
    if (eq(url.uploadFile, "-") || eq(url.uploadFile, ".")) {
      warnings.push([
        "httpie-stdin",
        "pass in the file contents to HTTPie through stdin",
      ]);
    } else {
      items.push("@" + repr(url.uploadFile));
    }
  } else if (
    request.dataArray &&
    request.dataArray.length === 1 &&
    !(request.dataArray[0] instanceof Word) &&
    !request.dataArray[0].name
  ) {
    items.push("@" + repr(request.dataArray[0].filename));
  } else if (request.data) {
    const contentType = request.headers.getContentType();
    if (request.data.isString()) {
      if (contentType === "application/json") {
        // TODO
        // try {
        //   const json = JSON.parse(request.data.toString());
        // } catch {
        //   flags.push("--raw " + repr(request.data));
        // }
        flags.push("--raw " + repr(request.data));
      } else if (contentType === "application/x-www-form-urlencoded") {
        const [queryList] = parseQueryString(request.data);
        if (queryList) {
          flags.push("--form");
          for (const [name, value] of queryList) {
            if (name.endsWith("=")) {
              // TODO: escape
            }
            if (name.includes(":")) {
              // TODO: escape
            }
            if (value.startsWith("=")) {
              // TODO: escape
              // TODO: if it can be escaped, back slashes have to be escaped too?
            }
            if (value.startsWith("@")) {
              // TODO: escape or has to be --raw
            }
            items.push(repr(mergeWords([name, "=", value])));
          }
        } else {
          flags.push("--raw " + repr(request.data));
        }
      } else {
        flags.push("--raw " + repr(request.data));
      }
    } else {
      flags.push("--raw " + repr(request.data));
    }
  } else if (request.multipartUploads) {
    flags.push("--multipart");
    for (const m of request.multipartUploads) {
      // TODO
    }
  }

  if (request.followRedirects || request.followRedirectsTrusted) {
    flags.push("--follow");
  }
  if (request.maxRedirects && request.maxRedirects.toString() !== "30") {
    // TODO: escape/parse?
    flags.push("--max-redirects=" + repr(request.maxRedirects));
  }

  if (request.netrc === "ignored") {
    flags.push("--ignore-netrc");
  }

  if (request.proxy) {
    flags.push("--proxy=http:" + repr(request.proxy));
    flags.push("--proxy=https:" + repr(request.proxy));
  }
  if (request.proxyAuth) {
    // TODO: add to proxy URL
  }
  if (request.noproxy) {
    warnings.push([
      "httpie-noproxy",
      "HTTPie requires passing noproxy through environment variables: " +
        JSON.stringify(request.noproxy.toString()),
    ]);
  }

  if (request.insecure) {
    flags.push("--verify=no");
  }
  if (request.cacert) {
    flags.push("--verify=" + repr(request.cacert));
  }
  if (request.capath) {
    flags.push("--verify=" + repr(request.capath));
  }

  if (request.cert) {
    const [cert, password] = request.cert;
    flags.push("--cert=" + repr(cert));
    if (password) {
      flags.push("--cert-key-pass=" + repr(password));
    }
  }
  // if (request.certType) {
  //   flags.push("--certificate-type=" + repr(request.certType));
  // }
  if (request.key) {
    flags.push("--cert-key=" + repr(request.key));
  }
  // if (request.keyType) {
  //   flags.push("--private-key-type=" + repr(request.keyType));
  // }
  // TODO: --ssl= for the version
  if (request.ciphers) {
    flags.push("--ciphers=" + repr(request.ciphers));
  }

  if (request.timeout) {
    flags.push("--timeout=" + repr(request.timeout));
    // warn that this is not for the whole request
    warnings.push([
      "httpie-timeout",
      "HTTPie's timeout is just for the connection, not for the whole request",
    ]);
  }
  if (request.connectTimeout) {
    flags.push("--timeout=" + repr(request.connectTimeout));
  }

  // TODO: --verbose --quite
  if (url.output) {
    // TODO: pipe output
  }

  if (method) {
    flags.push(method);
  }
  // If any of the field names or headers starts with a dash, add a -- argument
  if (items.some((i) => i.startsWith("-"))) {
    items.unshift("--");
  }
  const args = [...flags, repr(urlArg), ...items];
  const multiline =
    args.length > 3 || args.reduce((a, b) => a + b.length, 0) > 80 - 5;
  const joiner = multiline ? " \\\n  " : " ";
  return "http " + args.join(joiner) + "\n";
}

export function _toHttpie(
  requests: Request[],
  warnings: Warnings = []
): string {
  const commands = [];

  for (const request of requests) {
    warnIfPartsIgnored(request, warnings, {
      dataReadsFile: true,
      // HTTPie has its own session.json file format
      // cookieFiles: true,
      multipleUrls: true,
    });
    if (
      request.dataReadsFile &&
      request.dataArray &&
      request.dataArray.length &&
      (request.dataArray.length > 1 ||
        (!(request.dataArray[0] instanceof Word) && request.dataArray[0].name))
    ) {
      warnings.push([
        "unsafe-data",
        "the generated data content is wrong, " +
          // TODO: might not come from "@"
          JSON.stringify("@" + request.dataReadsFile) +
          " means read the file " +
          JSON.stringify(request.dataReadsFile),
      ]);
    }

    for (const url of request.urls) {
      commands.push(requestToHttpie(request, url, warnings));
    }
  }
  return commands.join("\n\n");
}

export function toHttpieWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const httpie = _toHttpie(requests, warnings);
  return [httpie, warnings];
}

export function toHttpie(curlCommand: string | string[]): string {
  return toHttpieWarn(curlCommand)[0];
}
