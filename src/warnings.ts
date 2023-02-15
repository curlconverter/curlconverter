import type { Parser } from "./bashParser.js";
import type { GlobalConfig } from "./curl/opts.js";

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
