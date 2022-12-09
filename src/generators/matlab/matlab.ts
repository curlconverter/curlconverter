import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import { toWebServices } from "./webservices.js";
import { toHTTPInterface } from "./httpinterface.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "insecure",
  "no-insecure",
  "form",
  "form-string",
]);

export const _toMATLAB = (
  request: Request,
  warnings: Warnings = []
): string => {
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

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
