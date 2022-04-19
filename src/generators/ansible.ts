import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";
import { ansibleTemplate } from "../templates/ansible.js";

import nunjucks from "nunjucks";
import querystring from "query-string";

const supportedArgs = new Set([
  "url",
  "request",
  "user-agent",
  "cookie",
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "referer",
  // "form",
  // "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "insecure",
  "no-insecure",
  "user",
]);

function getDataString(request: Request): string | object {
  if (!request.data) {
    return "";
  }
  const parsedQueryString = querystring.parse(request.data, { sort: false });
  const keyCount = Object.keys(parsedQueryString).length;
  const singleKeyOnly =
    keyCount === 1 && !parsedQueryString[Object.keys(parsedQueryString)[0]];
  const singularData = request.isDataBinary || singleKeyOnly;
  if (singularData) {
    try {
      // This doesn't work with --data-binary ''
      return JSON.parse(request.data);
    } catch (e) {}
  }
  return request.data;
}

export const _toAnsible = (
  request: Request,
  warnings?: Warnings
): [string, Warnings] => {
  warnings = warnings || [];
  let convertedData;
  if (request.data && typeof request.data === "string") {
    convertedData = getDataString(request);
  }
  const result = nunjucks.renderString(ansibleTemplate, {
    request,
    data: convertedData,
  });
  return [result, warnings];
};
export const toAnsibleWarn = (
  curlCommand: string | string[]
): [string, Warnings] => {
  const [request, warnings] = util.parseCurlCommand(curlCommand, supportedArgs);
  return _toAnsible(request, warnings);
};
export const toAnsible = (curlCommand: string | string[]): string => {
  return toAnsibleWarn(curlCommand)[0];
};
