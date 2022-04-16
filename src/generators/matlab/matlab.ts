import * as util from "../../util.js";
import type { Request } from "../../util.js";

import { toWebServices } from "./webservices.js";
import { toHTTPInterface } from "./httpinterface.js";

export const _toMATLAB = (request: Request): string => {
  const lines = toWebServices(request).concat("", toHTTPInterface(request));
  return lines
    .flat()
    .filter((line) => line !== null)
    .join("\n");
};
export const toMATLAB = (curlCommand: string | string[]): string => {
  const [request, warnings] = util.parseCurlCommand(curlCommand);
  return _toMATLAB(request);
};
