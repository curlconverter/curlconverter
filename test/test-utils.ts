import * as curlconverter from "../src/index.js";
import { Word } from "../src/shell/Word.js";
import { parse } from "../src/parse.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const fixturesDir = path.resolve(__dirname, "../../test/fixtures");

function stringifyWords(o: any): any {
  if (o instanceof Word) {
    return o.toString();
  }
  if (Array.isArray(o)) {
    return o.map((oo) => stringifyWords(oo));
  }
  if (o && o.toString() == "[object Object]") {
    return Object.fromEntries(
      Object.entries(o).map((oo) => [
        stringifyWords(oo[0]),
        stringifyWords(oo[1]),
      ]),
    );
  }
  return o;
}
// Special case that returns the parsed argument object
function toParser(curl: string | string[]): string {
  const parserOutput = parse(curl);
  const code = JSON.stringify(stringifyWords(parserOutput), null, 2);
  return code + "\n";
}

// TODO: move this (or something like this) to index.js?
const converters = {
  ansible: {
    name: "Ansible",
    extension: ".yml",
    converter: curlconverter.toAnsible,
  },
  c: {
    name: "C",
    extension: ".c",
    converter: curlconverter.toC,
  },
  cfml: {
    name: "ColdFusion",
    extension: ".cfm",
    converter: curlconverter.toCFML,
  },
  clojure: {
    name: "Clojure",
    extension: ".clj",
    converter: curlconverter.toClojure,
  },
  csharp: {
    name: "C#",
    extension: ".cs",
    converter: curlconverter.toCSharp,
  },
  dart: {
    name: "Dart",
    extension: ".dart",
    converter: curlconverter.toDart,
  },
  elixir: {
    name: "Elixir",
    extension: ".ex",
    converter: curlconverter.toElixir,
  },
  go: {
    name: "Go",
    extension: ".go",
    converter: curlconverter.toGo,
  },
  har: {
    name: "HAR",
    extension: ".json",
    converter: curlconverter.toHarString,
  },
  http: {
    name: "HTTP",
    extension: ".txt",
    converter: curlconverter.toHTTP,
  },
  httpie: {
    name: "HTTPie",
    extension: ".sh",
    converter: curlconverter.toHttpie,
  },
  java: {
    name: "Java + HttpClient",
    extension: ".java",
    converter: curlconverter.toJava,
  },
  "java-httpurlconnection": {
    name: "Java + HttpUrlConnection",
    extension: ".java",
    converter: curlconverter.toJavaHttpUrlConnection,
  },
  "java-jsoup": {
    name: "Java + jsoup",
    extension: ".java",
    converter: curlconverter.toJavaJsoup,
  },
  "java-okhttp": {
    name: "Java + OkHttp",
    extension: ".java",
    converter: curlconverter.toJavaOkHttp,
  },
  javascript: {
    name: "JavaScript",
    extension: ".js",
    converter: curlconverter.toJavaScript,
  },
  "javascript-jquery": {
    name: "JavaScript + jQuery",
    extension: ".js",
    converter: curlconverter.toJavaScriptJquery,
  },
  "javascript-xhr": {
    name: "JavaScript + XHR",
    extension: ".js",
    converter: curlconverter.toJavaScriptXHR,
  },
  json: {
    name: "Json",
    extension: ".json",
    converter: curlconverter.toJsonString,
  },
  julia: {
    name: "Julia",
    extension: ".jl",
    converter: curlconverter.toJulia,
  },
  kotlin: {
    name: "Kotlin",
    extension: ".kt",
    converter: curlconverter.toKotlin,
  },
  lua: {
    name: "Lua",
    extension: ".lua",
    converter: curlconverter.toLua,
  },
  matlab: {
    name: "MATLAB",
    extension: ".m",
    converter: curlconverter.toMATLAB,
  },
  node: {
    name: "Node",
    extension: ".js",
    converter: curlconverter.toNode,
  },
  "node-axios": {
    name: "Node + Axios",
    extension: ".js",
    converter: curlconverter.toNodeAxios,
  },
  "node-got": {
    name: "Node + Got",
    extension: ".js",
    converter: curlconverter.toNodeGot,
  },
  "node-http": {
    name: "Node + http",
    extension: ".js",
    converter: curlconverter.toNodeHttp,
  },
  "node-ky": {
    name: "Node + Ky",
    extension: ".js",
    converter: curlconverter.toNodeKy,
  },
  "node-request": {
    name: "Node + request",
    extension: ".js",
    converter: curlconverter.toNodeRequest,
  },
  "node-superagent": {
    name: "Node + SuperAgent",
    extension: ".js",
    converter: curlconverter.toNodeSuperAgent,
  },
  objectivec: {
    name: "Objective-C",
    extension: ".m",
    converter: curlconverter.toObjectiveC,
  },
  ocaml: {
    name: "OCaml",
    extension: ".ml",
    converter: curlconverter.toOCaml,
  },
  perl: {
    name: "Perl",
    extension: ".pl",
    converter: curlconverter.toPerl,
  },
  php: {
    name: "PHP",
    extension: ".php",
    converter: curlconverter.toPhp,
  },
  "php-guzzle": {
    name: "PHP + Guzzle",
    extension: ".php",
    converter: curlconverter.toPhpGuzzle,
  },
  powershell: {
    name: "PowerShell",
    extension: ".ps1",
    converter: curlconverter.toPowershellRestMethod,
  },
  python: {
    name: "Python",
    extension: ".py",
    converter: curlconverter.toPython,
  },
  r: {
    name: "R",
    extension: ".r",
    converter: curlconverter.toR,
  },
  "r-httr2": {
    name: "R + httr2",
    extension: ".r",
    converter: curlconverter.toRHttr2,
  },
  ruby: {
    name: "Ruby",
    extension: ".rb",
    converter: curlconverter.toRuby,
  },
  "ruby-httparty": {
    name: "Ruby HTTParty",
    extension: ".rb",
    converter: curlconverter.toRubyHttparty,
  },
  rust: {
    name: "Rust",
    extension: ".rs",
    converter: curlconverter.toRust,
  },
  swift: {
    name: "Swift",
    extension: ".swift",
    converter: curlconverter.toSwift,
  },
  wget: {
    name: "Wget",
    extension: ".sh",
    converter: curlconverter.toWget,
  },
  parser: {
    name: "Parser",
    extension: ".json",
    converter: toParser,
  },
} as const;
type Converter = keyof typeof converters;

// Check that we have at least one test for every generator
// https://github.com/curlconverter/curlconverter/pull/299
const testedConverters = Object.entries(converters).map(
  (c) => c[1].converter.name,
);
const untestedConverters = ["toPhpRequests"];
const notConverterExports = ["Word"];

const availableConverters = Object.entries(curlconverter)
  .map((c) => c[1].name)
  .filter((n) => n !== "CCError");
const missing = availableConverters.filter(
  (c) =>
    !testedConverters.includes(c) &&
    !untestedConverters.includes(c) &&
    !notConverterExports.includes(c) &&
    !c.endsWith("Warn"),
);
const extra = testedConverters.filter(
  (c) => !availableConverters.includes(c) && c !== "toParser",
);
if (missing.length) {
  console.error("these converters are not tested: " + missing.join(", "));
}
if (extra.length) {
  console.error(
    "these non-existant converters are being tested: " + extra.join(", "),
  );
}
for (const [converterName, converter] of Object.entries(converters)) {
  const testDir = path.resolve(fixturesDir, converterName);
  if (fs.existsSync(testDir)) {
    const dirContents = fs.readdirSync(testDir);
    if (!dirContents.length) {
      console.error(testDir + " doesn't contain any files");
    } else if (
      !dirContents.filter((f) => f.endsWith(converter.extension)).length
    ) {
      // TODO: early stopping
      console.error(
        testDir +
          " doesn't have any files ending with '" +
          converter.extension +
          "'",
      );
    }
  } else {
    console.error(
      converterName + " doesn't have a corresponding directory in fixtures/",
    );
  }
}

export { converters };
export type { Converter };
