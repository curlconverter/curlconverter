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

import { parse } from "../src/parse.js";
import { fixturesDir, converters } from "../test/test-utils.js";

const awaitableExec = promisify(exec);

const DEFAULT_PORT = 28139; // chosen randomly
const EXPECTED_URL = "localhost:" + DEFAULT_PORT;

const MINIMAL_HTTP_RESPONSE = `\
HTTP/1.1 200 OK
Content-Length: 12
Content-Type: text/plain; charset=utf-8

Hello World!`.replace(/\n/g, "\r\n");

const setup = {
  // ansible: "",
  // cfml: "",
  clojure: "mkdir -p /tmp/curlconverter-clojure",
  csharp:
    "cd /tmp && dotnet new console -o curlconverter-csharp && sed -i '' 's/<ImplicitUsings>enable/<ImplicitUsings>disable/' /tmp/curlconverter-csharp/curlconverter-csharp.csproj",
  dart: "cd /tmp && mkdir curlconverter-dart && cd /tmp/curlconverter-dart && echo $'name:\\n  curlconverter_dart\\nenvironment:\\n  sdk: \">=2.14.0\"\\ndependencies:\\n  http: any\\n' > pubspec.yaml && dart pub get",
  // mix new /tmp/curlconverterelixir/ && sed -i '' 's/# {:dep_from_hexpm, "~> 0.3.0"}/{:httpoison, "~> 1.8"}/g' /tmp/curlconverterelixir/mix.exs && cd /tmp/curlconverterelixir/ && mix deps.get
  elixir:
    "mix new /tmp/curlconverterelixir/ && sed -i '' 's/# {:dep_from_hexpm, \"~> 0.3.0\"}/{:httpoison, \"~> 1.8\"}/g' /tmp/curlconverterelixir/mix.exs && cd /tmp/curlconverterelixir/ && mix deps.get",
  // (on not macOS (Linux and maybe Windows))
  // elixir:
  //   "mix new /tmp/curlconverterelixir/ && sed -i 's/# {:dep_from_hexpm, \"~> 0.3.0\"}/{:httpoison, \"~> 1.8\"}/g' /tmp/curlconverterelixir/mix.exs && cd /tmp/curlconverterelixir/ && mix deps.get",
  go: "",
  httpie: "",
  java: "mkdir -p /tmp/curlconverter-java",
  // javascript: "",
  // json: "",
  // matlab: "",
  node: "cd /tmp && mkdir curlconverter-node && cd curlconverter-node && npm init -y && npm install node-fetch",
  // "node-axios": "",
  // "node-got": "",
  // "node-request": "",
  php: "",
  // php composer.phar global require guzzlehttp/guzzle:^7.0
  "php-guzzle":
    "cd /tmp && mkdir curlconverter-php-guzzle && cd curlconverter-php-guzzle && php composer.phar require guzzlehttp/guzzle:^7.0",
  python: "",
  r: "",
  ruby: "",
  rust: "cd /tmp && cargo init --vcs none /tmp/curlconverter-rust && cd /tmp/curlconverter-rust && cargo add reqwest --features reqwest/blocking,reqwest/json",
  wget: "",
} as const;

const executables = {
  // ansible: "",
  // cfml: "",
  clojure:
    'cp <file> /tmp/curlconverter-clojure/main.clj && cd /tmp/curlconverter-clojure && clj -Sdeps \'{:deps {clj-http/clj-http {:mvn/version "3.12.3"} cheshire/cheshire {:mvn/version "5.11.0"}}}\' -M main.clj',
  csharp:
    "cp <file> /tmp/curlconverter-csharp/Program.cs && cd /tmp/curlconverter-csharp && dotnet run",
  dart: "cp <file> /tmp/curlconverter-dart/main.dart && cd /tmp/curlconverter-dart && dart run main.dart",
  elixir:
    "cp <file> /tmp/curlconverterelixir/main.ex && cd /tmp/curlconverterelixir && mix run main.ex",
  go: "go build -o /tmp/curlconverter-go <file> && /tmp/curlconverter-go",
  httpie:
    'printf "%s --ignore-stdin" "$(cat <file>)" > /tmp/curlconverter-httpie && chmod +x /tmp/curlconverter-httpie && /tmp/curlconverter-httpie',
  java: "cp <file> /tmp/curlconverter-java/Main.java && cd /tmp/curlconverter-java && javac Main.java && java Main",
  // javascript: "",
  // json: "",
  // matlab: "",
  node: "cp <file> /tmp/curlconverter-node/main.js && cd /tmp/curlconverter-node && node main.js",
  // "node-axios": "",
  // "node-got": "",
  // "node-request": "",
  php: "php <file>",
  "php-guzzle":
    "cp <file> /tmp/curlconverter-php-guzzle/main.php && cd /tmp/curlconverter-php-guzzle && php main.php",
  python: "python3 <file>",
  r: "r < <file> --no-save",
  ruby: "ruby <file>",
  rust: "cp <file> /tmp/curlconverter-rust/src/main.rs && cd /tmp/curlconverter-rust && cargo run",
  wget: "bash <file>",
} as const;

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

const languages: (keyof typeof executables)[] = Array.isArray(argv.language)
  ? argv.language
  : [argv.language];

const testFile = async (
  testFilename: string,
  languages: (keyof typeof executables)[]
): Promise<void> => {
  const rawRequests: string[] = [];

  // TODO: this is flaky
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

      if (!socket.write(MINIMAL_HTTP_RESPONSE)) {
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
  const requestedUrl = parse(curlCommand)[0]
    .urls[0].url.replace("http://", "")
    .toString();
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

  const files = languages.map((l: keyof typeof executables) =>
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
        // Uncomment for debugging. An error can happen because
        // our server responds with a generic response.
        console.error(e);
      }
    } else {
      console.error(
        language + " file doesn't exist, skipping: " + languageFile
      );
    }
  }

  // TODO: allow ignoring headers for each converter
  function sortLines(a: string): string {
    return (
      a
        .split("\n")
        .filter(Boolean)
        .filter((s) => !s.toLowerCase().startsWith("user-agent: "))
        .sort(Intl.Collator().compare)
        .join("\n") + "\n"
    );
  }

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

// if no tests were specified, run them all
const tests = argv._.length
  ? argv._
  : fs
      .readdirSync(path.join(fixturesDir, "curl_commands"))
      .filter((n) => n.endsWith(".sh"));

// await awaitableExec("rm -rf /tmp/curlconverter*");
if (tests.length) {
  for (const l of languages) {
    const setupCommands = setup[l];
    if (setupCommands) {
      console.error("running");
      console.error(setupCommands);
      await awaitableExec(setupCommands);
      console.error();
    }
  }
}
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
for (const test of tests.sort()) {
  const testName = path.parse(test.toString()).name;
  await testFile(testName, languages);
  await delay(1000);
}

process.exit(0);
