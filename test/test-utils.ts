import * as curlconverter from "../src/index.js";
import { Word } from "../src/shell/Word.js";
import { parseCurlCommand } from "../src/parse.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const fixturesDir = path.resolve(__dirname, "../../test/fixtures");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      ])
    );
  }
  return o;
}
// Special case that returns the parsed argument object
function toParser(curl: string | string[]): string {
  const parserOutput = parseCurlCommand(curl);
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
  java: {
    name: "Java",
    extension: ".java",
    converter: curlconverter.toJava,
  },
  javascript: {
    name: "JavaScript",
    extension: ".js",
    converter: curlconverter.toJavaScript,
  },
  json: {
    name: "Json",
    extension: ".json",
    converter: curlconverter.toJsonString,
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
  "node-request": {
    name: "Node + request",
    extension: ".js",
    converter: curlconverter.toNodeRequest,
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
  ruby: {
    name: "Ruby",
    extension: ".rb",
    converter: curlconverter.toRuby,
  },
  rust: {
    name: "Rust",
    extension: ".rs",
    converter: curlconverter.toRust,
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
  (c) => c[1].converter.name
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
    !c.endsWith("Warn")
);
const extra = testedConverters.filter(
  (c) => !availableConverters.includes(c) && c !== "toParser"
);
if (missing.length) {
  console.error("these converters are not tested: " + missing.join(", "));
}
if (extra.length) {
  console.error(
    "these non-existant converters are being tested: " + extra.join(", ")
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
          "'"
      );
    }
  } else {
    console.error(
      converterName + " doesn't have a corresponding directory in fixtures/"
    );
  }
}

export { converters };
export type { Converter };
