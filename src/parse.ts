import { CCError } from "./utils.js";
import { Word } from "./shell/Word.js";
import { tokenize } from "./shell/tokenizer.js";
import * as curl from "./curl/opts.js";
import {
  curlLongOpts,
  curlLongOptsShortened,
  curlShortOpts,
} from "./curl/opts.js";
import { buildRequests } from "./Request.js";
import type { Request, RequestUrl } from "./Request.js";
import type { Warnings } from "./Warnings.js";

export { COMMON_SUPPORTED_ARGS } from "./curl/opts.js";
export { getFirst } from "./Request.js";

export type { Request, RequestUrl, Warnings };

export function clip(s: string, maxLength = 30): string {
  if (s.length > maxLength) {
    return s.slice(0, maxLength - 3) + "...";
  }
  return s;
}

function toArgv(
  curlCommand: string | string[],
  warnings: Warnings
): [Word[], Word?, Word?] {
  if (typeof curlCommand === "string") {
    return tokenize(curlCommand, warnings);
  }

  if (curlCommand.length === 0) {
    throw new CCError("no arguments provided");
  }
  if (curlCommand[0].trim() !== "curl") {
    throw new CCError(
      'command should begin with "curl" but instead begins with ' +
        JSON.stringify(clip(curlCommand[0]))
    );
  }
  return [curlCommand.map((arg) => new Word(arg)), undefined, undefined];
}

export function parseCurlCommand(
  curlCommand: string | string[],
  supportedArgs?: Set<string>,
  warnings: Warnings = []
): Request[] {
  const [argv, stdin, stdinFile] = toArgv(curlCommand, warnings);

  const globalConfig = curl.parseArgs(
    argv,
    curlLongOpts,
    curlLongOptsShortened,
    curlShortOpts,
    supportedArgs,
    warnings
  );

  return buildRequests(globalConfig, stdin, stdinFile);
}
