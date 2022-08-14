import * as curlconverter from "../src/index.js";
import * as utils from "../src/util.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const fixturesDir = path.resolve(__dirname, "../../test/fixtures");

// Special case that returns the parsed argument object
const toParser = (curl: string | string[]): string => {
  const parserOutput = utils.parseCurlCommand(curl);
  const code = JSON.stringify(parserOutput, null, 2);
  return code + "\n";
};

// TODO: move this (or something like this) to index.js?
// TODO: 'parser' ?
type Converter =
  | "ansible"
  | "cfml"
  | "dart"
  | "elixir"
  | "go"
  | "java"
  | "javascript"
  | "json"
  | "matlab"
  | "node"
  | "node-axios"
  | "node-request"
  | "php"
  | "python"
  | "r"
  | "ruby"
  | "rust"
  | "strest"
  | "parser";
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
    name: "Node",
    extension: ".js",
    converter: curlconverter.toNodeAxios,
  },
  "node-request": {
    name: "Node",
    extension: ".js",
    converter: curlconverter.toNodeRequest,
  },
  php: {
    name: "PHP",
    extension: ".php",
    converter: curlconverter.toPhp,
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
  strest: {
    name: "Strest",
    extension: ".strest.yml",
    converter: curlconverter.toStrest,
  },
  parser: {
    name: "Parser",
    extension: ".json",
    converter: toParser,
  },
};

// Check that we have at least one test for every generator
// https://github.com/curlconverter/curlconverter/pull/299
const testedConverters = Object.entries(converters).map(
  (c) => c[1].converter.name
);
const untestedConverters = ["toPhpRequests"];

const availableConverters = Object.entries(curlconverter)
  .map((c) => c[1].name)
  .filter((n) => n !== "CCError");
const missing = availableConverters.filter(
  (c) =>
    !testedConverters.includes(c) &&
    !untestedConverters.includes(c) &&
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
