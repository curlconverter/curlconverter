import type { Parser } from "./bashParser.js";

export { Word, eq, firstShellToken, joinWords } from "./word.js";
export type { Warnings } from "./parseCommand.js";
export type { Request } from "./request.js";
export type { DataParam, QueryList, QueryDict } from "./query.js";
export { AuthType } from "./curl/auth.js";
export { COMMON_SUPPORTED_ARGS } from "./curl/opts.js";
export {
  getHeader,
  getContentType,
  hasHeader,
  _setHeaderIfMissing,
  setHeaderIfMissing,
  deleteHeader,
} from "./headers.js";
export { parseCurlCommand } from "./parseCommand.js";
export {
  parseQueryString,
  percentEncode,
  percentEncodePlus,
  wordDecodeURIComponent,
} from "./query.js";

export class CCError extends Error {}

export const UTF8encoder = new TextEncoder();

// Note: !has() will lead to type errors
// TODO: replace with Object.hasOwn() once Node 16 is EOL'd on 2023-09-11
export function has<T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function isInt(s: string): boolean {
  return /^\s*[+-]?\d+$/.test(s);
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
