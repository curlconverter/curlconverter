import Parser from "web-tree-sitter";

// NOTE: Top-level await is not available in Safari until Safari 15
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#browser_compatibility
await Parser.init();
const Bash = await Parser.Language.load("/tree-sitter-bash.wasm");
const parser = new Parser();
parser.setLanguage(Bash);

export default parser;
export type { Parser };
