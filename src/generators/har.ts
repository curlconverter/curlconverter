import { warnIfPartsIgnored } from "../Warnings.js";
import { parseCurlCommand, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, RequestUrl, Warnings } from "../parse.js";
import { parseQueryString } from "../Query.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,

  //   "form",
  //   "form-string",

  // TODO: generate digest auth header
  "anyauth",
  "no-anyauth",

  "http1.1",
  "http2",
  "http2-prior-knowledge",
  "http3",
  "http3-only",
]);

type HARCookie = {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  comment?: string;
};

type HARHeader = {
  name: string;
  value: string;
  comment?: string;
};
type HARQuery = {
  name: string;
  value: string;
  comment?: string;
};

type HARParams = {
  name: string;
  value?: string;
  fileName?: string;
  contentType?: string;
  comment?: string;
};
type HARPostData = {
  mimeType: string;
  comment?: string;
} & ({ params: HARParams[] } | { text: string });

type HARRequest = {
  method: string;
  url: string;
  httpVersion: string;
  cookies: HARCookie[];
  headers: HARHeader[];
  queryString: HARQuery[];
  postData?: HARPostData;
  headersSize: -1;
  bodySize: -1;
  comment?: string;
};

export type HAROutput = {
  log: {
    version: "1.2";
    entries: {
      request: HARRequest;
    }[];
  };
};

function getDataString(request: Request): HARPostData | null {
  if (!request.data) {
    return null;
  }

  // TODO: is this correct?
  const mimeType = request.headers.getContentType() || "";
  try {
    // TODO: look at dataArray and generate fileName:
    const [parsedQuery] = parseQueryString(request.data);
    if (parsedQuery && parsedQuery.length) {
      return {
        mimeType,
        params: parsedQuery.map((q) => ({
          name: q[0].toString(),
          value: q[1].toString(),
        })),
      };
    }
  } catch {}
  const text = request.data.toString();
  return { mimeType, text };
}

export function _requestAndUrlToHar(
  request: Request,
  url: RequestUrl,
  warnings: Warnings = []
): HARRequest {
  const requestHar: HARRequest = {
    method: url.method.toString(),
    url: (url.queryList ? url.urlWithoutQueryList : url.url).toString(),
    httpVersion: request.http3
      ? "HTTP/3"
      : request.http2
      ? "HTTP/2"
      : "HTTP/1.1",
    cookies: [],
    headers: [],
    queryString: [],
    headersSize: -1,
    bodySize: -1,
  };

  if (request.cookies) {
    // TODO: repeated cookies
    requestHar.cookies = request.cookies.map((c) => ({
      name: c[0].toString(),
      value: c[1].toString(),
    }));
    // TODO: delete Cookies header?
  }

  if (request.headers.length) {
    requestHar.headers = request.headers.headers
      .filter((h) => h[1] !== null)
      .map((h) => ({ name: h[0].toString(), value: h[1]!.toString() }));
  }
  if (request.urls[0].auth) {
    const [user, password] = request.urls[0].auth;
    if (request.authType === "basic") {
      // Generate Authorization header by hand
      const authHeader =
        "Basic " + btoa(`${user.toString()}:${password.toString()}`);
      requestHar.headers.push({ name: "Authorization", value: authHeader });
    }
  }

  if (url.queryList) {
    requestHar.queryString = url.queryList.map((q) => ({
      // TODO: warn about variables
      name: q[0].toString(),
      value: q[1].toString(),
    }));
  }

  // TODO: not Object.assign, doesn't work with type system
  if (request.data) {
    Object.assign(requestHar, getDataString(request));
  }

  return requestHar;
}

export function _toHarString(
  requests: Request[],
  warnings: Warnings = []
): string {
  const harRequests = [];
  for (const request of requests) {
    for (const url of request.urls) {
      harRequests.push(_requestAndUrlToHar(request, url, warnings));
    }
  }
  return (
    JSON.stringify(
      {
        log: {
          version: "1.2",
          entries: harRequests.map((r) => ({ request: r })),
        },
      },
      null,
      4
    ) + "\n"
  );
}

export function toHarStringWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parseCurlCommand(curlCommand, supportedArgs, warnings);
  requests.map((r) => warnIfPartsIgnored(r, warnings, { multipleUrls: true }));

  const har = _toHarString(requests, warnings);
  return [har, warnings];
}
export function toHarString(curlCommand: string | string[]): string {
  return toHarStringWarn(curlCommand)[0];
}
