#!/usr/bin/env node

import { exec } from "child_process";
import fs from "fs";
import net from "net";
import path from "path";
import { promisify } from "util";

import colors from "colors";
import { diffLines } from "diff";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import * as utils from "../src/util.js";
import { fixturesDir, converters } from "../test/test-utils.js";

const awaitableExec = promisify(exec);

const DEFAULT_PORT = 28139; // chosen randomly
const EXPECTED_URL = "localhost:" + DEFAULT_PORT;

const executables = {
  // ansible: '',
  // browser: '',
  // dart: '',
  // elixir: '',
  // go: '',
  // java: '',
  // json: '',
  // matlab: '',
  // TODO: generated code uses require() so we can't run them
  // because curlconverter is an ES6 module.
  // node: 'node <file>',
  // php: '',
  python: "python3 <file>",
  r: "r < <file> --no-save",
  ruby: "ruby <file>",
  // rust: '',
  // strest: ''
};

const argv = await yargs(hideBin(process.argv))
  .scriptName("compare-request")
  .usage("Usage: $0 [--no-diff] [-l <language>] [test_name...]")
  .option("diff", {
    describe: "print a colorized diff instead of the raw requests",
    default: true,
    demandOption: false,
    type: "boolean",
  })
  .option("sort", {
    describe: "sort lines before comparing them",
    default: false,
    demandOption: false,
    type: "boolean",
  })
  .option("l", {
    alias: "language",
    describe: "the language of the generated program to compare against",
    choices: Object.keys(executables),
    default: ["python"],
    demandOption: false,
    type: "string",
  })
  .alias("h", "help")
  .help()
  .parse();

const testFile = async (testFilename: string): Promise<void> => {
  const rawRequests: string[] = [];

  const server = net.createServer();
  server.on("connection", (socket) => {
    socket.setEncoding("utf8");

    // Timeout very quickly because we only care about recieving the sent request.
    socket.setTimeout(800, () => {
      socket.end();
    });

    socket.on("data", (data) => {
      // TODO: this is not a Buffer, it's a string...
      rawRequests.push((data as unknown as string).replace(/\r\n/g, "\n"));
      // TODO: what is this?
      if (!socket.write("Data ::" + data)) {
        socket.pause();
      }
    });

    socket.on("drain", () => {
      socket.resume();
    });
    socket.on("timeout", () => {
      socket.end();
    });
    socket.on("close", (error) => {
      if (error) {
        console.error("transmission error");
      }
    });
    setTimeout(() => {
      socket.destroy();
    }, 1000);
  });

  server.maxConnections = 1;
  server.listen(DEFAULT_PORT);
  // setTimeout(function(){
  //   server.close();
  // }, 5000);

  const inputFile = path.join(
    fixturesDir,
    "curl_commands",
    testFilename + ".sh"
  );
  if (!fs.existsSync(inputFile)) {
    server.close();
    throw new Error("input file doesn't exist: " + inputFile);
  }
  const curlCommand = fs.readFileSync(inputFile, "utf8");
  const requestedUrl = utils
    .parseCurlCommand(curlCommand)
    .url.replace("http://", "");
  if (!requestedUrl.startsWith(EXPECTED_URL)) {
    console.error("bad requested URL for " + testFilename);
    console.error("  " + requestedUrl);
    console.error("it needs to request");
    console.error("  http://" + EXPECTED_URL);
    console.error("so we can capture the data it sends.");
    server.close();
    return;
  }
  try {
    await awaitableExec("bash " + inputFile);
  } catch (e) {}

  const files = languages.map((l) =>
    path.join(fixturesDir, l, testFilename + converters[l].extension)
  );
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    const languageFile = files[i];
    if (fs.existsSync(languageFile)) {
      // TODO: escape?
      const command = executables[language].replace("<file>", languageFile);
      try {
        await awaitableExec(command);
      } catch (e) {
        // Uncomment for debugging. An error always happens because
        // our server doesn't respond to requests.
        // console.error(e)
      }
    } else {
      console.error(
        language + " file doesn't exist, skipping: " + languageFile
      );
    }
  }

  // TODO: allow ignoring headers for each converter
  const sortLines = (a: string): string =>
    a
      .split("\n")
      .filter(Boolean)
      .filter((s) => !s.toLowerCase().startsWith("user-agent: "))
      .sort(Intl.Collator().compare)
      .join("\n") + "\n";

  const requestName = path.parse(inputFile).name;
  console.log(requestName);
  console.log("=".repeat(requestName.length));
  console.log(fs.readFileSync(inputFile).toString());
  for (const f of files) {
    console.log("=".repeat(requestName.length));
    console.log(fs.readFileSync(f).toString());
  }
  console.log("=".repeat(requestName.length));

  const [curlRequest, ...languageRequests] = rawRequests;
  for (const languageRequest of languageRequests) {
    if (argv.diff) {
      const a = argv.sort ? sortLines(curlRequest) : curlRequest;
      const b = argv.sort ? sortLines(languageRequest) : languageRequest;
      for (const part of diffLines(a, b)) {
        // green for additions, red for deletions
        // grey for common parts
        const color = part.added ? "green" : part.removed ? "red" : "grey";
        process.stdout.write(colors[color](part.value));
      }
    } else {
      console.log(curlRequest);
      console.log(languageRequest);
    }
  }
  console.log();

  server.close();
};

let languages: "python"[];
if (argv.language) {
  languages = Array.isArray(argv.language) ? argv.language : [argv.language];
}

// if no tests were specified, run them all
const tests = argv._.length
  ? argv._
  : fs
      .readdirSync(path.join(fixturesDir, "curl_commands"))
      .filter((n) => n.endsWith(".sh"));
for (const test of tests) {
  const testName = path.parse(test.toString()).name;
  await testFile(testName);
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  await delay(1000);
}

process.exit(0);
