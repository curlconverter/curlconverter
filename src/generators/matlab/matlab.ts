import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import { toWebServices } from "./webservices.js";
import { toHTTPInterface } from "./httpinterface.js";

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
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "insecure",
  "no-insecure",
  "user",
]);

export const _toMATLAB = (
  request: Request,
  warnings: Warnings = []
): string => {
  let webServicesLines, httpInterfaceLines;
  [webServicesLines, warnings] = toWebServices(request, warnings);
  [httpInterfaceLines, warnings] = toHTTPInterface(request, warnings);
  const lines = webServicesLines.concat("", httpInterfaceLines);
  return lines
    .flat()
    .filter((line) => line !== null)
    .join("\n");
};
export const toMATLABWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const matlab = _toMATLAB(request, warnings);
  return [matlab, warnings];
};
export const toMATLAB = (curlCommand: string | string[]): string => {
  return toMATLABWarn(curlCommand)[0];
};
