// This file replaces Parser.ts when curlconverter is running in the browser.

import { Parser, Language } from "web-tree-sitter";

// NOTE: top-level await requires Safari 15+
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#browser_compatibility
await Parser.init({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locateFile(url: string, scriptDirectory: string) {
    return "/" + url;
  },
} as unknown as EmscriptenModule); // TODO: remove https://github.com/tree-sitter/tree-sitter/pull/4482

const Bash = await Language.load("/tree-sitter-bash.wasm");
const parser = new Parser();
parser.setLanguage(Bash);

export default parser;
export type { Parser };
