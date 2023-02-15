#!/usr/bin/env node

import { CCError, has } from "./util.js";
import type { Warnings } from "./Warnings.js";
import { Word } from "./shell/Word.js";
import { parseArgs, curlLongOpts, curlShortOpts } from "./curl/opts.js";
import type { LongOpts, ShortOpts } from "./curl/opts.js";

import { buildRequests } from "./Request.js";
import type { Request } from "./Request.js";

import { _toAnsible, toAnsibleWarn } from "./generators/ansible.js";
import { _toCFML, toCFMLWarn } from "./generators/cfml.js";
import { _toCSharp, toCSharpWarn } from "./generators/csharp.js";
import { _toDart, toDartWarn } from "./generators/dart.js";
import { _toElixir, toElixirWarn } from "./generators/elixir.js";
import { _toGo, toGoWarn } from "./generators/go.js";
import { _toJava, toJavaWarn } from "./generators/java.js";
import {
  _toJavaScript,
  toJavaScriptWarn,
} from "./generators/javascript/javascript.js";
import { _toJsonString, toJsonStringWarn } from "./generators/json.js";
import { _toMATLAB, toMATLABWarn } from "./generators/matlab/matlab.js";
import { _toNode, toNodeWarn } from "./generators/javascript/javascript.js";
import {
  _toNodeAxios,
  toNodeAxiosWarn,
} from "./generators/javascript/axios.js";
import { _toNodeGot, toNodeGotWarn } from "./generators/javascript/got.js";
import {
  _toNodeRequest,
  toNodeRequestWarn,
} from "./generators/javascript/request.js";
import { _toPhp, toPhpWarn } from "./generators/php/php.js";
import {
  _toPhpRequests,
  toPhpRequestsWarn,
} from "./generators/php/requests.js";
import { _toPython, toPythonWarn } from "./generators/python.js";
import { _toR, toRWarn } from "./generators/r.js";
import { _toRuby, toRubyWarn } from "./generators/ruby.js";
import { _toRust, toRustWarn } from "./generators/rust.js";

import fs from "fs";

// This line is updated by extract_curl_args.py
const VERSION = "4.5.0 (curl 7.88.0)";

// sets a default in case --language isn't passed
const defaultLanguage = "python";

// Maps options for --language to functions
// NOTE: make sure to update this when adding language support
const translate: {
  [key: string]: [
    (request: Request[], warnings?: Warnings) => string,
    (curlCommand: string | string[], warnings?: Warnings) => [string, Warnings]
  ];
} = {
  ansible: [_toAnsible, toAnsibleWarn],
  cfml: [_toCFML, toCFMLWarn],
  csharp: [_toCSharp, toCSharpWarn],
  "c#": [_toCSharp, toCSharpWarn], // undocumented alias
  browser: [_toJavaScript, toJavaScriptWarn], // for backwards compatibility, undocumented
  dart: [_toDart, toDartWarn],
  elixir: [_toElixir, toElixirWarn],
  go: [_toGo, toGoWarn],
  golang: [_toGo, toGoWarn], // undocumented alias
  java: [_toJava, toJavaWarn],
  javascript: [_toJavaScript, toJavaScriptWarn],
  "javascript-fetch": [_toJavaScript, toJavaScriptWarn], // undocumented alias
  "javascript-axios": [_toNodeAxios, toNodeAxiosWarn], // undocumented alias
  "javascript-got": [_toNodeGot, toNodeGotWarn], // undocumented alias
  "javascript-request": [_toNodeRequest, toNodeRequestWarn], // undocumented alias
  json: [_toJsonString, toJsonStringWarn],
  matlab: [_toMATLAB, toMATLABWarn],
  node: [_toNode, toNodeWarn],
  "node-fetch": [_toNode, toNodeWarn], // undocumented alias
  "node-axios": [_toNodeAxios, toNodeAxiosWarn],
  "node-got": [_toNodeGot, toNodeGotWarn],
  "node-request": [_toNodeRequest, toNodeRequestWarn],
  nodejs: [_toNode, toNodeWarn], // undocumented alias
  "nodejs-fetch": [_toNode, toNodeWarn], // undocumented alias
  "nodejs-axios": [_toNodeAxios, toNodeAxiosWarn], // undocumented alias
  "nodejs-got": [_toNodeGot, toNodeGotWarn], // undocumented alias
  "nodejs-request": [_toNodeRequest, toNodeRequestWarn], // undocumented alias
  php: [_toPhp, toPhpWarn],
  "php-requests": [_toPhpRequests, toPhpRequestsWarn],
  python: [_toPython, toPythonWarn],
  r: [_toR, toRWarn],
  ruby: [_toRuby, toRubyWarn],
  rust: [_toRust, toRustWarn],
};

const USAGE = `Usage: curlconverter [--language <language>] [-] [curl_options...]

language: the language to convert the curl command to. The choices are
  ansible
  cfml
  csharp
  dart
  elixir
  go
  java
  javascript
  json
  matlab
  node
  node-axios
  node-request
  php
  php-requests
  python (the default)
  r
  ruby
  rust

-: read curl command from stdin

--verbose/-v: print warnings and error tracebacks

curl_options: these should be passed exactly as they would be passed to curl.
  see 'curl --help' or 'curl --manual' for which options are allowed here`;

const curlconverterLongOpts: LongOpts = {
  language: { type: "string", name: "language" },
  stdin: { type: "bool", name: "stdin" },
};
const curlconverterShortOpts: ShortOpts = {
  // a single "-" (dash) tells curlconverter to read input from stdin
  "": "stdin",
};
const longOpts: LongOpts = { ...curlLongOpts, ...curlconverterLongOpts };
const shortOpts: ShortOpts = { ...curlShortOpts, ...curlconverterShortOpts };

function printWarnings(warnings: Warnings, verbose: boolean): Warnings {
  if (!verbose) {
    return warnings;
  }
  for (const w of warnings) {
    for (const line of w[1].trim().split("\n")) {
      console.error("warning: " + line);
    }
  }
  return [];
}
function exitWithError(error: unknown, verbose = false): never {
  let errMsg: Error | string | unknown = error;
  if (!verbose) {
    if (error instanceof CCError) {
      errMsg = "";
      for (const line of error.message.toString().split("\n")) {
        errMsg += "error: " + line + "\n";
      }
      errMsg = (errMsg as string).trimEnd();
    } else if (error instanceof Error) {
      // .toString() removes the traceback
      errMsg = error.toString();
    }
  }
  console.error(errMsg);
  process.exit(2); // curl exits with 2 so we do too
}

// argv is ['node', 'cli.js', ...]
// parseArgs() ignores the first argument but we need to remove "node"
const argv = process.argv.slice(1).map((arg) => new Word(arg));
let global;
let warnings: Warnings = [];
try {
  // TODO: we don't get "unsupported argument" warnings because we don't
  // know which language we're converting to yet.
  global = parseArgs(argv, longOpts, shortOpts, undefined, warnings);
} catch (e) {
  exitWithError(e);
}
if (global.help) {
  console.log(USAGE.trim());
  process.exit(0);
}
if (global.version) {
  console.log("curlconverter " + VERSION);
  process.exit(0);
}
const verbose = !!global.verbose;
const config = global.configs[0];
const commandFromStdin = global.stdin;
const language = global.language || defaultLanguage;
if (!has(translate, language)) {
  exitWithError(
    new CCError(
      "unexpected --language: " +
        JSON.stringify(language) +
        "\n" +
        "must be one of: " +
        Object.keys(translate).sort().join(", ")
    ),
    verbose
  );
}

let extraArgs = Object.keys(config).filter((a) => a !== "authtype");
if (global.configs.length > 1) {
  extraArgs.push("next");
}
if (!extraArgs.length && !commandFromStdin && !verbose && !global.language) {
  console.log(USAGE.trim());
  process.exit(2);
}

const [generator, warnGenerator] = translate[language];
let code;
if (commandFromStdin) {
  // This lets you do
  // echo curl example.com | curlconverter --verbose
  // TODO: check configs.length > 1 and merge global and config[0]
  if (extraArgs.length > 0) {
    // TODO: there's a similar issue for --location-trusted
    const authArgsLocation = extraArgs.indexOf("authArgs");
    if (authArgsLocation > -1) {
      const authArgs = config.authArgs!.map((a) => (a[1] ? "" : "no-") + a[0]);

      console.log(authArgs);
      extraArgs.splice(authArgsLocation, 1);
      extraArgs = extraArgs.concat(authArgs);
    }

    const extraArgsStr = extraArgs.map((a) => "--" + a).join(", ");
    // Throw an error so that if user typos something like
    // curlconverter - -data
    // they aren't stuck with what looks like a hung terminal.
    exitWithError(
      new CCError(
        "if you pass --stdin or -, you can't also pass " + extraArgsStr
      ),
      verbose
    );
  }
  const input = fs.readFileSync(0, "utf8");
  try {
    [code, warnings] = warnGenerator(input, warnings);
  } catch (e) {
    printWarnings(warnings, true); // print warnings to help figure out the error
    exitWithError(e, verbose);
  }
  warnings = printWarnings(warnings, verbose);
} else {
  warnings = printWarnings(warnings, verbose);

  let stdin;
  if (!process.stdin.isTTY) {
    // TODO: what if there's an EOF character? does curl read each @- until EOF?
    stdin = new Word(fs.readFileSync(0).toString());
  }
  let requests;
  try {
    requests = buildRequests(global, stdin);
  } catch (e) {
    exitWithError(e, verbose);
  }
  warnings = printWarnings(warnings, verbose);
  // Warning for users using the pre-4.0 CLI
  if (requests[0].urls[0].originalUrl.startsWith("curl ")) {
    console.error(`\
warning: Passing a whole curl command as a single argument?
warning: Pass options to curlconverter as if it was curl instead:
warning: curlconverter 'curl example.com' -> curlconverter example.com`);
  }
  try {
    code = generator(requests, warnings);
  } catch (e) {
    exitWithError(e, verbose);
  }
  warnings = printWarnings(warnings, verbose);
}

printWarnings(warnings, verbose);
process.stdout.write(code);
