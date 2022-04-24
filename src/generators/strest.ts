import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import yaml from "yamljs";
import jsesc from "jsesc";
import querystring from "query-string";

const supportedArgs = new Set([
  "url",
  "request",
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "user-agent",
  "cookie",
  "referer",
  "header",
  "get",
  "head",
  "no-head",
  "user",
  "insecure",
  "no-insecure",
]);

function getDataString(request: Request): PostData | null {
  if (!request.data) {
    return null;
  }
  let mimeType = "application/json";
  if (request.data.indexOf("'") > -1) {
    request.data = jsesc(request.data);
  }
  const parsedQueryString = querystring.parse(request.data, { sort: false });
  const keyCount = Object.keys(parsedQueryString).length;
  const singleKeyOnly =
    keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]];
  const singularData = request.isDataBinary || singleKeyOnly;
  if (singularData) {
    // This doesn't work with --data-binary ''
    try {
      return {
        mimeType,
        text: JSON.parse(request.data),
      };
    } catch (e) {}
  }

  for (const [paramName, paramValue] of request.headers || []) {
    if (paramName.toLowerCase() === "content-type" && paramValue !== null) {
      mimeType = paramValue;
    }
  }
  return {
    mimeType,
    text: request.data,
  };
}

type PostData = {
  mimeType: string;
  text: object | string;
};

type BasicAuth = {
  username?: string;
  password: string;
};

type StrestOutput = {
  version: number;
  allowInsecure?: boolean;
  requests?: {
    curl_converter: {
      request: {
        url: string;
        method: string;
        postData?: PostData | null;
        headers?: {
          name: string;
          value: string | null;
        }[];
        queryString?: { name: string; value: string }[];
      };
      auth?: {
        basic: BasicAuth;
      };
    };
  };
};

export const _toStrest = (
  request: Request,
  warnings: Warnings = []
): string => {
  const response: StrestOutput = { version: 2 };
  if (request.insecure) {
    response.allowInsecure = true;
  }
  response.requests = {
    curl_converter: {
      request: {
        url: request.urlWithoutQuery.toString(),
        method: request.method.toUpperCase(),
      },
    },
  };
  if (request.data) {
    response.requests.curl_converter.request.postData = getDataString(request);
  }

  if (request.headers) {
    response.requests.curl_converter.request.headers = [];
    for (const [name, value] of request.headers) {
      response.requests.curl_converter.request.headers.push({
        name,
        value,
      });
    }
  }
  if (request.auth) {
    const [username, password] = request.auth;
    const basic: { username?: string; password?: string } = {};
    if (username) {
      basic.username = username;
    }
    basic.password = password;
    response.requests.curl_converter.auth = { basic: basic as BasicAuth };
  }

  let queryList;
  if (request.query) {
    // Convert nulls to empty string
    queryList = request.query.map((p) => ({ name: p[0], value: p[1] || "" }));
    response.requests.curl_converter.request.queryString = queryList;
  }

  return yaml.stringify(response, 100, 2);
};
export const toStrestWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const strest = _toStrest(request, warnings);
  return [strest, warnings];
};
export const toStrest = (curlCommand: string | string[]): string => {
  return toStrestWarn(curlCommand)[0];
};
