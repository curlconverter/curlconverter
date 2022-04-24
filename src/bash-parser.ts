import Parser from "tree-sitter";
import Bash from "@curlconverter/tree-sitter-bash";

const parser = new Parser();
parser.setLanguage(Bash);

export default parser;
export type { Parser };
