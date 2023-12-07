import { CCError } from "../utils.js";
import { Word, eq, mergeWords } from "../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";

import {
  repr,
  printImports,
  formatHeaders,
  type OSVars,
} from "./python/python.js";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "max-time",
  "insecure",
  "no-insecure",
  // "upload-file",
]);

export function _toPerl(requests: Request[], warnings: Warnings = []): string {
  const request = getFirst(requests, warnings);

  const code = "";
  return code;
}

export function toPerlWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const code = _toPerl(requests, warnings);
  return [code, warnings];
}
export function toPerl(curlCommand: string | string[]): string {
  return toPerlWarn(curlCommand)[0];
}
