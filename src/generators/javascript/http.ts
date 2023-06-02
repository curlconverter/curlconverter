import { CCError } from "../../utils.js";
import { Word } from "../../shell/Word.js";
import { parse, getFirst, COMMON_SUPPORTED_ARGS } from "../../parse.js";
import type { Request, Warnings } from "../../parse.js";

const supportedArgs = new Set([...COMMON_SUPPORTED_ARGS]);

export function _toNodeHttp(
  requests: Request[],
  warnings: Warnings = []
): string {
  const request = getFirst(requests, warnings);
  return "";
}

export function toNodeHttpWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const code = _toNodeHttp(requests, warnings);
  return [code, warnings];
}
export function toNodeHttp(curlCommand: string | string[]): string {
  return toNodeHttpWarn(curlCommand)[0];
}
