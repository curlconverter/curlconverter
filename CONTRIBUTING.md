# Development

> I'd rather write programs to write programs than write programs.
>
> — Dick Sites, May 1974

### Setup

First, make sure you're running **Node.js 16+**.

You can install Node.js 18 and npm on Ubuntu 22.10 with

```sh
sudo apt update
sudo apt install nodejs npm
```

on older Ubuntu versions follow [these instructions](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-2-installing-node-js-with-apt-using-a-nodesource-ppa).

Then install [Docker Engine](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository).

On macOS, install Node.js with [Homebrew](https://brew.sh/)

```sh
brew install node@18
```

and add these lines to your ~/.bashrc file

```sh
export PATH="/opt/homebrew/opt/node@18/bin:$PATH"
export LDFLAGS="-L/opt/homebrew/opt/node@18/lib"
export CPPFLAGS="-I/opt/homebrew/opt/node@18/include"
```

then install [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/) for macOS and start it.

Docker is used as a hack to run an older version of Emscripten because the current release of tree-sitter [doesn't work with Emscripten 3](https://github.com/tree-sitter/tree-sitter/issues/1560).

### Adding a new generator

If you add a new generator, you'll need to

- add it to [README.md](./README.md) in two places
- export it in [index.ts](src/index.ts)
- update the list of supported languages in [cli.ts](src/cli.ts) (or it won't be accessible from the command line)
- add it to [test-utils.ts](test/test-utils.ts) (to make it part of the testing)
- create a directory in [test/fixtures](test/fixtures/)
- generate tests with `npm run gen-test -- --language <your language> --all`

If you want to add new functionality you can start with a test.

- create a file containing the curl command in [test/fixtures/curl_commands/](test/fixtures/curl_commands) with a descriptive filename like `post_with_headers.sh`
- run `npm run gen-test post_with_headers` to save the result of converting that file to [test/fixtures/\<language>/](test/fixtures) with a matching filename but different file extension like `post_with_headers.py`
- modifying the code and re-run `npm run gen-test` until your test is converted correctly
- run `npm test` to make sure the old tests still pass

You can run a specific test with:

```sh
npm test -- --test post_with_data_binary.sh
```

where `test_name` is a file (with or without the `.sh` extension) in [test/fixtures/curl_commands/](test/fixtures/curl_commands)

You can run only the tests for a specific language generator with:

```sh
npm test -- --language python
```

### Debugging commands

First check which characters the input is made up of (it might contain [non-breaking spaces](https://github.com/curlconverter/curlconverter/issues/331) for example) with `xxd` or https://verhovs.ky/text-inspector/ .

Next, check how the Bash is parsed on the [tree-sitter playground](https://tree-sitter.github.io/tree-sitter/playground). Keep in mind that the playground runs the `master` branch of [tree-sitter-bash](https://github.com/tree-sitter/tree-sitter-bash). curlconverter uses an [internal fork](https://github.com/curlconverter/tree-sitter-bash) that might be a few commits behind.

## How it works

curlconverter supports two types of input. Either a string of Bash code:

- `toPython('curl example.com')` (used on [curlconverter.com](https://curlconverter.com))
- `echo curl example.com | curlconverter -`

or an array of arguments:

- `toPython(['curl', 'example.com'])`
- `curlconverter example.com`

There are 5 steps. When the input is a string, we:

1. Parse Bash code into an [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST) using [tree-sitter-bash](https://github.com/tree-sitter/tree-sitter-bash) (an imperfect approximation of the real Bash grammar)
2. Convert the AST into an array of `Word`s, i.e. shell tokens, doing things like removing quotes around strings. If the command pipes in input via stdin, we also keep track of that

```none
curl --data $VAR "example.com"

->

program [0, 0] - [2, 0]
  command [0, 0] - [0, 30]
    name: command_name [0, 0] - [0, 4]
      word [0, 0] - [0, 4]
    argument: word [0, 5] - [0, 11]
    argument: simple_expansion [0, 12] - [0, 16]
      variable_name [0, 13] - [0, 16]
    argument: string [0, 17] - [0, 30]

->

['curl', '--data', <Shell variable>, 'example.com']
```

These first two steps are skipped if the input is already an array of strings.

3. Iterate over the list of shell tokens and convert it into an object that mostly just maps argument names to a value (boolean, `Word` or list of `Word`s). A few arguments write to the same argument name here.

```none
->

[{
  url: 'example.com',
  data: <Shell variable>
}]
```

4. Convert that object into a more advanced object, for example with the input URLs split into their parts: scheme/path/etc.
5. Generate a string of code in the desired output language by looking at that object

The entry point of the code is a bunch of `toPython()`, `toJavaScript()`, etc. functions. They store a list of which curl arguments are supported by the language they generate, and pass that into the parser so that we can report when the input command uses an argument that is ignored by the code generator.

They call [`parseCurlCommand()`](https://github.com/curlconverter/curlconverter/blob/4761ee93a91e0553b2cf6f24f4c66c900b05f3f6/src/parse.ts#L42) which performs steps 1 and 2 and then calls [`parseArgs()`](https://github.com/curlconverter/curlconverter/blob/0edf039c15b5ec750553807b79848c5d7247e4c1/src/util.ts#L1235), essentially a re-implementation of curl's [`parse_args()`](https://github.com/curl/curl/blob/curl-7_88_1/src/tool_getparam.c#L2476) that implements step 3.

The command line acts as a drop-in replacement for the `curl` command but has a few of its own arguments and can repurpose some of curl's arguments for its own use: `--language <>` selects the output language, `--verbose` enables printing of warnings (and a stack traces if an error happens) during conversion and `-` reads the input command from stdin instead.

### How curl parses arguments

First, Bash parses the curl command you type, expands the environment variables and passes an array of strings to the curl binary. Bash's parser is implemented using [GNU Bison](https://www.gnu.org/software/bison/manual/bison.html#Concepts).

https://github.com/bminor/bash/blob/master/parse.y

curl is split into two parts, the C library (in [lib/](https://github.com/curl/curl/blob/curl-7_84_0/lib)) and the command line interface to that C library (in [src/](https://github.com/curl/curl/blob/curl-7_84_0/src)). Like every C program, the array of arguments from the shell is passed into its `main()` function

https://github.com/curl/curl/blob/curl-7_84_0/src/tool_main.c#L237

https://github.com/curl/curl/blob/curl-7_84_0/src/tool_operate.c#L2594

and is passed to `parse_args()`, which is where curl does the first (and most important) step of interpreting the arguments

https://github.com/curl/curl/blob/curl-7_84_0/src/tool_getparam.c#L2401

Each argument is either a binary toggle or will consume a value after itself. Files are opened for reading and writing at this step as well.

The result is a linked list of structs. A curl command can query multiple URLs and each URL can contain ["glob" expressions](https://everything.curl.dev/cmdline/globbing),

```sh
curl http://example.com/file[1-100:10].txt http://example.com/another-range/[1-10].png
```

will query 20 URLs. Each item in the linked list is a "URL" and it can have a corresponding output file handle and things like that. There is also a "global" struct that contains options which will apply to all URLs. These structs are defined in

https://github.com/curl/curl/blob/curl-7_84_0/src/tool_cfgable.h

https://github.com/curl/curl/blob/curl-7_84_0/src/tool_urlglob.h

https://github.com/curl/curl/blob/curl-7_84_0/src/tool_sdecls.h

Then it passes this linked list to `run_all_transfers()`

https://github.com/curl/curl/blob/curl-7_84_0/src/tool_operate.c#L2684

and ultimately the code ends up in `single_transfer()`, which creates the object that the C library expects, mostly this involves just copying stuff from the struct to a new struct

https://github.com/curl/curl/blob/curl-7_84_0/src/tool_operate.c#L688

## Links

### External docs

#### Bash

- https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html
- http://aosabook.org/en/bash.html
- http://mywiki.wooledge.org/BashParser
- Run Bash through VS Code's debugger: https://stackoverflow.com/a/75539741

#### curl

- https://curl.se/docs/manpage.html
- https://curl.se/libcurl/c/libcurl-tutorial.html
- https://everything.curl.dev/
- Run curl through VS Code's debugger: https://stackoverflow.com/a/75523303

### Source code

#### Chrome's "Copy as cURL"

https://github.com/ChromeDevTools/devtools-frontend/blob/c9afdb4745a76866f7486be0e5cdd4e2b270d8af/front_end/panels/network/NetworkLogView.ts#L2033

#### Safari

https://github.com/WebKit/WebKit/blob/f58ef38d48f42f5d7723691cb090823908ff5f9f/Source/WebInspectorUI/UserInterface/Models/Resource.js#L1224

#### Firefox

https://hg.mozilla.org/mozilla-central/file/tip/devtools/client/shared/curl.js

## Contributors

- jeayu (Java support)
- Muhammad Reza Irvanda (python env vars)
- Weslen Nascimento (Node fetch)
- Roman Druzki (Backlog scrubbing, parsing improvements)
- NoahCardoza (Command line interface)
- ssi-anik (JSON support)
- hrbrmstr (R support)
- daniellockard (Go support)
- eliask (improve python output)
- trdarr (devops and code style)
- nashe (fix PHP output)
- bfontaine (reduce code duplication in test suite)
- seadog007
- nicktimko
- wkalt
- nico202
- r3m0t
- csells (Dart support)
- yanshiyason (Elixir support)
- Robertof (Rust enhancements, correctness, es6)
- clintonc (Code quality / brevity, test suite consistency)
- MarkReeder (JSON formatting)
- cf512 (bugfixes and feature requests)
- DainisGorbunovs (MATLAB support)
- TennyZhuang (data-raw support)
- scottsteinbeck (CFML support)
