import fs from "fs";
import path from "path";

import test from "tape";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { fixturesDir, converters } from "./test-utils.js";
import type { Converter } from "./test-utils.js";

// The curl_commands/ directory contains input files
// The file name is a description of the command.
// For each input file, there may be a corresponding output file in
// language-specific directories: node/, php/, python/, parser/
// we get a list of all input files, iterate over it, and if an
// output file exists, compare the output.
const curlCommandsDir = path.resolve(fixturesDir, "curl_commands");

const testArgs = await yargs(hideBin(process.argv))
  .scriptName("test.js")
  .usage(
    "Usage: $0 [--language <language>] [--test <test_name>] [test_name...]",
  )
  .option("l", {
    alias: "language",
    describe: "the language to convert the curl command to",
    choices: Object.keys(converters),
    default: Object.keys(converters),
    defaultDescription: "all of them",
    demandOption: false,
    type: "string",
  })
  .option("test", {
    describe:
      "the name of a file in fixtures/curl_commands without the .sh extension",
    defaultDescription: "run all tests",
    demandOption: false,
    type: "string",
  })
  .alias("h", "help")
  .help()
  .parse();

const languages: Converter[] = Array.isArray(testArgs.language)
  ? testArgs.language
  : [testArgs.language];

// Test names can be positional args or --test=<test name>. We need to merge them
let testNames = testArgs._.slice(1);
if (Array.isArray(testArgs.test)) {
  testNames = testNames.concat(testArgs.test);
} else if (typeof testArgs.test === "string") {
  testNames.push(testArgs.test);
}

const testFileNames =
  testNames && testNames.length
    ? testNames.map((t) =>
        t
          .toString()
          .replace(/ /g, "_")
          .replace(/(\.sh)?$/, ".sh"),
      )
    : fs.readdirSync(curlCommandsDir).filter((f) => f.endsWith(".sh")); // if no --test specified, run them all

for (const outputLanguage of Object.keys(converters)) {
  // TODO: always test 'parser'?
  if (!languages.includes(outputLanguage as Converter)) {
    console.error("skipping language: " + outputLanguage);
  }
}

for (const fileName of testFileNames) {
  const inputFilePath = path.resolve(curlCommandsDir, fileName);
  const inputFileContents = fs
    .readFileSync(inputFilePath, "utf8")
    .replace(/\r\n/g, "\n");

  for (const outputLanguage of languages) {
    const converter = converters[outputLanguage];

    const filePath = path.resolve(
      fixturesDir,
      outputLanguage,
      fileName.replace(/\.sh$/, converter.extension),
    );
    const testName = fileName.replace(/_/g, " ").replace(/\.sh$/, "");
    const fullTestName = converter.name + ": " + testName;

    if (fs.existsSync(filePath)) {
      // normalize code for just \n line endings (aka fix input under Windows)
      const expected = fs
        .readFileSync(filePath, "utf-8")
        .replace(/\r\n/g, "\n");
      let actual: string;
      try {
        actual = converter.converter(inputFileContents);
      } catch (e) {
        console.error(
          "Failed converting " + fileName + " to " + converter.name + ":",
        );
        console.error(inputFileContents);
        console.error(e);
        process.exit(1);
      }
      if (outputLanguage === "parser") {
        test(fullTestName, (t) => {
          // TODO: `actual` is a needless roundtrip
          t.deepEquals(JSON.parse(actual), JSON.parse(expected));
          t.end();
        });
      } else {
        test(fullTestName, (t) => {
          t.equal(actual, expected);
          t.end();
        });
      }
    }
  }
}
