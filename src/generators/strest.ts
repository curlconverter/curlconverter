import * as util from "../util.js";
import type { Request } from "../util.js";

import yaml from "yamljs";
import jsesc from "jsesc";
import querystring from "query-string";

function getDataString(request: Request) {
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

export const _toStrest = (request: Request) => {
  const response: { [key: string]: any } = { version: 2 };
  if (request.insecure) {
    response.allowInsecure = true;
  }
  if (!request.urlWithoutQuery.match(/https?:/)) {
    request.urlWithoutQuery = "http://" + request.urlWithoutQuery;
  }
  response.requests = {
    curl_converter: {
      request: {
        url: request.urlWithoutQuery.toString(),
        method: request.method.toUpperCase(),
      },
    },
  };
  if (request.data && typeof request.data === "string") {
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
    const basic: { [key: string]: string } = {};
    if (username) {
      basic.username = username;
    }
    basic.password = password;
    response.requests.curl_converter.auth = { basic };
  }

  let queryList;
  if (request.query) {
    // Convert nulls to empty string
    queryList = request.query.map((p) => ({ name: p[0], value: p[1] || "" }));
    response.requests.curl_converter.request.queryString = queryList;
  }

  const yamlString = yaml.stringify(response, 100, 2);
  return yamlString;
};
export const toStrest = (curlCommand: string | string[]) => {
  const request = util.parseCurlCommand(curlCommand);
  return _toStrest(request);
};
