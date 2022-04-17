import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import { toWebServices } from "./webservices.js";
import { toHTTPInterface } from "./httpinterface.js";

const supportedArgs = new Set([
  "url",
  "request",
  "compressed",
  "no-compressed",
  "digest",
  "no-digest",
  "http1.0",
  "http1.1",
  "http2",
  "http2-prior-knowledge",
  "http3",
  "http0.9",
  "no-http0.9",
  "user-agent",
  "cookie",
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "referer",
  "cert",
  "cacert",
  "key",
  "capath",
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "insecure",
  "no-insecure",
  "output",
  "user",
  "proxy-user",
  "proxy",
]);

export const _toMATLAB = (request: Request): string => {
  const lines = toWebServices(request).concat("", toHTTPInterface(request));
  return lines
    .flat()
    .filter((line) => line !== null)
    .join("\n");
};
export const toMATLABWarn = (
  curlCommand: string | string[]
): [string, Warnings] => {
  const [request, warnings] = util.parseCurlCommand(curlCommand, supportedArgs);
  return [_toMATLAB(request), warnings];
};
export const toMATLAB = (curlCommand: string | string[]): string => {
  const [request, warnings] = util.parseCurlCommand(curlCommand);
  return _toMATLAB(request);
};
