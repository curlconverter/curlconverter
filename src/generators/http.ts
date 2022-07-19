import type { Request, Warnings } from "../util.js";
import { parseCurlCommand } from "../util.js";

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

export const _toRawHttp = (
  request: Request,
  warnings: Warnings = []
): string => {
  const method = request.method.toUpperCase();
  const raw_url = request.url;
  const headers = Object.fromEntries(request.headers ?? []);

  return `${method} ${raw_url}
${headersToString(headers)}${bodyToString(request.data)}`;
};

function headersToString(headers?: { [key: string]: string | null }) {
  if (!headers) return "";
  const headerString = Object.entries(headers)
    .filter(([name, value]) => value)
    .map(([name, value]) => `${name}: ${value}`)
    .join("\n");
  if (!headerString) return "";
  return headerString + "\n";
}

function bodyToString(body?: string) {
  if (!body) return "";
  return "\n" + body + "\n";
}

export const toRawHttpWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = parseCurlCommand(curlCommand, supportedArgs, warnings);
  const rawHttp = _toRawHttp(request, warnings);
  return [rawHttp, warnings];
};
export const toRawHttp = (curlCommand: string | string[]): string => {
  console.log(curlCommand);
  return toRawHttpWarn(curlCommand)[0];
};
