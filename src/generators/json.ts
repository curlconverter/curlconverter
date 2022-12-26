// Author: ssi-anik (sirajul.islam.anik@gmail.com)

import * as util from "../util.js";
import type { Request, QueryDict, Warnings } from "../util.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "insecure",
  "no-insecure",
  "form",
  "form-string",
]);

type JSONOutput = {
  url: string;
  raw_url: string;
  method: string;
  cookies?: { [key: string]: string };
  headers?: { [key: string]: string | null };
  queries?: QueryDict;
  data?: { [key: string]: string };
  // raw_data?: string[],
  files?: { [key: string]: string };
  // raw_files: string[],
  insecure?: boolean;
  auth?: { user: string; password: string };
};

function getDataString(request: Request): {
  data?: { [key: string]: string | string[] };
} {
  if (!request.data) {
    return {};
  }
  /*
    if ( !request.isDataRaw && request.data.startsWith('@') ) {
   var filePath = request.data.slice(1);
   return filePath;
   }
   */

  const [parsedQuery, parsedQueryDict] = util.parseQueryString(request.data);
  if (!parsedQuery || !parsedQuery.length) {
    // TODO: this is not a good API
    return {
      data: {
        [request.data]: "",
      },
    };
  }
  if (parsedQueryDict) {
    return { data: parsedQueryDict };
  } else {
    // This loses data
    return { data: Object.fromEntries(parsedQuery) };
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
      data.files[m.name] = m.contentFile;
    } else {
      data.data[m.name] = m.content;
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

  const requestJson: JSONOutput = {
    url: (request.urls[0].queryDict
      ? request.urls[0].urlWithoutQueryList
      : request.urls[0].url
    ).replace(/\/$/, ""),
    // url: request.queryDict ? request.urlWithoutQueryList : request.url,
    raw_url: request.urls[0].url,
    // TODO: move this after .query?
    method: request.urls[0].method.toLowerCase(), // lowercase for backwards compatibility
  };
  // if (request.queryDict) {
  //   requestJson.query = request.queryDict
  // }

  if (request.cookies) {
    // TODO: repeated cookies
    requestJson.cookies = Object.fromEntries(request.cookies);
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
    // TODO: what if Object.keys().length !== request.headers.length?
    requestJson.headers = Object.fromEntries(request.headers);
  }

  if (request.urls[0].queryDict) {
    // TODO: rename
    requestJson.queries = request.urls[0].queryDict;
  }

  // TODO: not Object.assign, doesn't work with type system
  if (request.data && typeof request.data === "string") {
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
      user: user,
      password: password,
    };
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
