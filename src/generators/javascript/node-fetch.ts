import * as util from "../../util.js";
import type { Request } from "../../util.js";
import { _toJavaScript } from "./javascript.js";

const importStatement = "var fetch = require('node-fetch');\n\n";

export const _toNode = (request: Request): string => {
  return importStatement + _toJavaScript(request);
};
export const toNode = (curlCommand: string | string[]): string => {
  const request = util.parseCurlCommand(curlCommand);
  return _toNode(request);
};
