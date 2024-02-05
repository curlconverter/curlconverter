import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";
import type { AuthType } from "../Request.js";
import { parseQueryString } from "../Query.js";

export const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,

  "insecure",
  "no-insecure",

  "form",
  "form-string",

  "compressed",

  "location",
  "no-location",
  "location-trusted",
  "no-location-trusted",

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

// TODO: export this or Request
type JSONOutput = {
  url: string;
  raw_url: string;
  method: string;
  cookies?: { [key: string]: string };
  headers?: { [key: string]: string | null };
  queries?: { [key: string]: string | string[] };
  // `| any` because of JSON
  data?: { [key: string]: string } | string | any;
  // raw_data?: string[],
  files?: { [key: string]: string };
  // raw_files: string[],
  insecure?: boolean;
  compressed?: boolean;

  auth?: { user: string; password: string };
  auth_type?: AuthType;
  aws_sigv4?: string;
  delegation?: string;

  follow_redirects?: boolean; // --location

  timeout?: number; // --max-time
  connect_timeout?: number;
};

function getDataString(
  request: Request,
): { [key: string]: string | string[] } | string {
  if (!request.data) {
    return {};
  }

  const contentType = request.headers.getContentType();
  if (contentType === "application/json") {
    try {
      return JSON.parse(request.data.toString());
    } catch (e) {}
  }

  if (contentType === "application/x-www-form-urlencoded") {
    const [parsedQuery, parsedQueryDict] = parseQueryString(request.data);
    if (parsedQueryDict) {
      return Object.fromEntries(
        parsedQueryDict.map((param) => [
          param[0].toString(),
          Array.isArray(param[1])
            ? param[1].map((v) => v.toString())
            : param[1].toString(),
        ]),
      );
    }
    if (parsedQuery) {
      // .fromEntries() means we lose data when there are repeated keys
      return Object.fromEntries(
        parsedQuery.map((param) => [param[0].toString(), param[1].toString()]),
      );
    }
  }

  // TODO: this leads to ambiguity with JSON strings
  return request.data.toString();
}

function getFilesString(
  request: Request,
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

export function _toJsonString(
  requests: Request[],
  warnings: Warnings = [],
): string {
  const request = getFirst(requests, warnings);

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
      request.cookies.map((c) => [c[0].toString(), c[1].toString()]),
    );
    // Normally when a generator uses .cookies, it should delete it from
    // headers, but users of the JSON output would expect to have all the
    // headers in .headers.
  }

  if (request.headers.length) {
    const headers = request.headers.headers
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
      ]),
    );
  }

  if (request.data) {
    requestJson.data = getDataString(request);
  } else if (request.multipartUploads) {
    // TODO: not Object.assign, doesn't work with type system
    Object.assign(requestJson, getFilesString(request));
  }

  if (request.compressed) {
    requestJson.compressed = true;
  }
  if (request.insecure) {
    // TODO: rename to verify? insecure=false doesn't make sense
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
      4,
    ) + "\n"
  );
}
export function toJsonStringWarn(
  curlCommand: string | string[],
  warnings: Warnings = [],
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const json = _toJsonString(requests, warnings);
  return [json, warnings];
}
export function toJsonString(curlCommand: string | string[]): string {
  return toJsonStringWarn(curlCommand)[0];
}
