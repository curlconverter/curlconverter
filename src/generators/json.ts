// Author: ssi-anik (sirajul.islam.anik@gmail.com)

import * as util from "../util.js";
import type { AuthType, Request, Warnings } from "../util.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,

  "insecure",
  "no-insecure",

  "form",
  "form-string",

  "location",

  "max-time",
  "connect-timeout",

  "anyauth",
  "no-anyauth",
  "digest",
  "no-digest",
  "aws-sigv4",
  "negotiate",
  "no-negotiate",
  "delegation", // GSS/kerberos
  // "service-name", // GSS/kerberos, not supported
  "ntlm",
  "no-ntlm",
  "ntlm-wb",
  "no-ntlm-wb",
]);

type JSONOutput = {
  url: string;
  raw_url: string;
  method: string;
  cookies?: { [key: string]: string };
  headers?: { [key: string]: string | null };
  queries?: { [key: string]: string | string[] };
  // `| any` because of JSON
  data?: { [key: string]: string } | any; // eslint-disable-line @typescript-eslint/no-explicit-any
  // raw_data?: string[],
  files?: { [key: string]: string };
  // raw_files: string[],
  insecure?: boolean;

  auth?: { user: string; password: string };
  auth_type?: AuthType;
  aws_sigv4?: string;
  delegation?: string;

  follow_redirects?: boolean; // --location

  timeout?: number; // --max-time
  connect_timeout?: number;
};

function getDataString(request: Request): {
  data?: { [key: string]: string | string[] };
} {
  if (!request.data) {
    return {};
  }

  const contentType = util.getContentType(request);
  if (contentType === "application/json") {
    try {
      const json = JSON.parse(request.data.toString());
      return { data: json };
    } catch (e) {}
  }

  const [parsedQuery, parsedQueryDict] = util.parseQueryString(request.data);
  if (!parsedQuery || !parsedQuery.length) {
    // TODO: this is not a good API
    return {
      data: {
        [request.data.toString()]: "",
      },
    };
  }
  if (parsedQueryDict) {
    const data = Object.fromEntries(
      parsedQueryDict.map((param) => [
        param[0].toString(),
        Array.isArray(param[1])
          ? param[1].map((v) => v.toString())
          : param[1].toString(),
      ])
    );
    return { data };
  } else {
    return {
      // .fromEntries() means we lose data when there are repeated keys
      data: Object.fromEntries(
        parsedQuery.map((param) => [param[0].toString(), param[1].toString()])
      ),
    };
  }
}

function getFilesString(
  request: Request
):
  | { files?: { [key: string]: string }; data?: { [key: string]: string } }
  | undefined {
  if (!request.multipartUploads) {
    return undefined;
  }
  const data: {
    files: { [key: string]: string };
    data: { [key: string]: string };
  } = {
    files: {},
    data: {},
  };

  // TODO: this isn't great.
  for (const m of request.multipartUploads) {
    if ("contentFile" in m) {
      data.files[m.name.toString()] = m.contentFile.toString();
    } else {
      data.data[m.name.toString()] = m.content.toString();
    }
  }

  return {
    files: Object.keys(data.files).length ? data.files : undefined,
    data: Object.keys(data.data).length ? data.data : undefined,
  };
}

export const _toJsonString = (
  requests: Request[],
  warnings: Warnings = []
): string => {
  if (requests.length > 1) {
    warnings.push([
      "next",
      "got " +
        requests.length +
        " configs because of --next, using the first one",
    ]);
  }
  const request = requests[0];
  if (request.urls.length > 1) {
    warnings.push([
      "multiple-urls",
      "found " +
        request.urls.length +
        " URLs, only the first one will be used: " +
        request.urls.map((u) => JSON.stringify(u.originalUrl)).join(", "),
    ]);
  }
  if (request.dataReadsFile) {
    warnings.push([
      "unsafe-data",
      // TODO: better wording
      "the data is not correct, " +
        JSON.stringify("@" + request.dataReadsFile) +
        " means it should read the file " +
        JSON.stringify(request.dataReadsFile),
    ]);
  }
  if (request.urls[0].queryReadsFile) {
    warnings.push([
      "unsafe-query",
      // TODO: better wording
      "the URL query string is not correct, " +
        JSON.stringify("@" + request.urls[0].queryReadsFile) +
        " means it should read the file " +
        JSON.stringify(request.urls[0].queryReadsFile),
    ]);
  }

  const requestJson: JSONOutput = {
    url: (request.urls[0].queryDict
      ? request.urls[0].urlWithoutQueryList
      : request.urls[0].url
    )
      .toString()
      .replace(/\/$/, ""),
    // url: request.queryDict ? request.urlWithoutQueryList : request.url,
    raw_url: request.urls[0].url.toString(),
    // TODO: move this after .query?
    method: request.urls[0].method.toLowerCase().toString(), // lowercase for backwards compatibility
  };
  // if (request.queryDict) {
  //   requestJson.query = request.queryDict
  // }

  if (request.cookies) {
    // TODO: repeated cookies
    requestJson.cookies = Object.fromEntries(
      request.cookies.map((c) => [c[0].toString(), c[1].toString()])
    );
    // Normally when a generator uses .cookies, it should delete it from
    // headers, but users of the JSON output would expect to have all the
    // headers in .headers.
  }
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  if (request.headers) {
    const headers = request.headers
      .filter((h) => h[1] !== null)
      // TODO: warn if contains variables
      .map((h) => [h[0].toString(), h[1]!.toString()]);
    // TODO: what if Object.keys().length !== request.headers.length?
    requestJson.headers = Object.fromEntries(headers);
  }

  if (request.urls[0].queryDict) {
    // TODO: rename
    requestJson.queries = Object.fromEntries(
      request.urls[0].queryDict.map((q) => [
        q[0].toString(),
        Array.isArray(q[1]) ? q[1].map((qq) => qq.toString()) : q[1].toString(),
      ])
    );
  }

  // TODO: not Object.assign, doesn't work with type system
  if (request.data) {
    Object.assign(requestJson, getDataString(request));
  } else if (request.multipartUploads) {
    Object.assign(requestJson, getFilesString(request));
  }

  if (request.insecure) {
    requestJson.insecure = false;
  }

  if (request.urls[0].auth) {
    const [user, password] = request.urls[0].auth;
    requestJson.auth = {
      user: user.toString(),
      password: password.toString(),
    };
    if (request.authType) {
      requestJson.auth_type = request.authType;
    }
  }
  if (request.awsSigV4) {
    requestJson.aws_sigv4 = request.awsSigV4.toString();
  }
  if (request.delegation) {
    requestJson.delegation = request.delegation.toString();
  }

  if (Object.prototype.hasOwnProperty.call(request, "followRedirects")) {
    requestJson.follow_redirects = request.followRedirects;
  }

  if (request.timeout) {
    requestJson.timeout = parseFloat(request.timeout.toString());
  }
  if (request.connectTimeout) {
    requestJson.connect_timeout = parseFloat(request.connectTimeout.toString());
  }

  return (
    JSON.stringify(
      Object.keys(requestJson).length ? requestJson : "{}",
      null,
      4
    ) + "\n"
  );
};
export const toJsonStringWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const json = _toJsonString(requests, warnings);
  return [json, warnings];
};
export const toJsonString = (curlCommand: string | string[]): string => {
  return toJsonStringWarn(curlCommand)[0];
};
