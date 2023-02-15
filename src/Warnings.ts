import type { Parser } from "./shell/Parser.js";
import type { GlobalConfig } from "./curl/opts.js";
import type { Request } from "./Request.js";

export type Warnings = [string, string][];

export function warnf(global: GlobalConfig, warning: [string, string]) {
  global.warnings.push(warning);
}

export function underlineNode(
  node: Parser.SyntaxNode,
  curlCommand?: string
): string {
  // TODO: If this needs to be desirialized, it would be more efficient
  // to pass the original command as a string.
  curlCommand = node.tree.rootNode.text;

  // TODO: is this exactly how tree-sitter splits lines?
  const line = curlCommand.split("\n")[node.startPosition.row];
  const onOneLine = node.endPosition.row === node.startPosition.row;
  const end = onOneLine ? node.endPosition.column : line.length;
  return (
    `${line}\n` +
    " ".repeat(node.startPosition.column) +
    "^".repeat(end - node.startPosition.column) +
    (onOneLine ? "" : "^") // TODO: something else?
  );
}

export function underlineNodeEnd(
  node: Parser.SyntaxNode,
  curlCommand?: string
): string {
  curlCommand = node.tree.rootNode.text;

  // TODO: is this exactly how tree-sitter splits lines?
  const line = curlCommand.split("\n")[node.endPosition.row];
  const onOneLine = node.endPosition.row === node.startPosition.row;
  const start = onOneLine ? node.startPosition.column : 0;
  // TODO: cut off line if it's too long
  return `${line}\n` + " ".repeat(start) + "^".repeat(node.endPosition.column);
}

export interface Support {
  // multipleRequests?: boolean; // Why call this function?
  multipleUrls?: boolean;
  dataReadsFile?: boolean;
  queryReadsFile?: boolean;
  cookieFiles?: boolean;
}

export function warnIfPartsIgnored(
  request: Request,
  warnings: Warnings,
  support?: Support
) {
  if (request.urls.length > 1 && !support?.multipleUrls) {
    warnings.push([
      "multiple-urls",
      "found " +
        request.urls.length +
        " URLs, only the first one will be used: " +
        request.urls
          .map((u) => JSON.stringify(u.originalUrl.toString()))
          .join(", "),
    ]);
  }
  if (request.dataReadsFile && !support?.multipleUrls) {
    warnings.push([
      "unsafe-data",
      // TODO: better wording. Could be "body:" too
      "the generated data content is wrong, " +
        JSON.stringify("@" + request.dataReadsFile) +
        " means read the file " +
        JSON.stringify(request.dataReadsFile),
    ]);
  }
  if (request.urls[0].queryReadsFile && !support?.queryReadsFile) {
    warnings.push([
      "unsafe-query",
      "the generated URL query string is wrong, " +
        JSON.stringify("@" + request.urls[0].queryReadsFile) +
        " means read the file " +
        JSON.stringify(request.urls[0].queryReadsFile),
    ]);
  }
  if (request.cookieFiles && !support?.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c.toString())).join(", "),
    ]);
  }
}
