import Parser, { type Language } from "tree-sitter";
import Bash from "tree-sitter-bash";

const parser = new Parser();
parser.setLanguage(Bash as unknown as Language);

export default parser;
export type { Parser };
