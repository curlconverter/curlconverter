# Development

> I'd rather write programs to write programs than write programs.
>
> — Dick Sites, May 1974

### Setup

First, make sure you're running **Node.js 16** or **18**. curlconverter currently [doesn't work](https://github.com/tree-sitter/tree-sitter/issues/1945) on Node 19.

Ubuntu 22.10 lets you install Node.js 18 and npm like this:

```sh
sudo apt update
sudo apt install nodejs npm
```

on other Ubuntu versions folow [these instructions](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-2-installing-node-js-with-apt-using-a-nodesource-ppa).

Then install [Docker Engine](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository).

On macOS you will need to install Node.js with [Homebrew](https://brew.sh/)

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

### Adding a new generator

If you add a new generator, you'll need to

- export it in [index.ts](src/index.ts)
- update the list of supported languages in [cli.ts](src/cli.ts) (or it won't be accessible from the command line)
- add it to [test-utils.ts](test/test-utils.ts) (to make it part of the testing)
- add it to [README.md](./README.md)

If you want to add new functionality, start with a test.

- create a file containing the curl command in [test/fixtures/curl_commands/](test/fixtures/curl_commands) with a descriptive filename like `post_with_headers.sh`
- run `npm run gen-test post_with_headers` to save the result of converting that file to [test/fixtures/\<language>/](test/fixtures) with a matching filename but different file extension like `post_with_headers.py`
- modifying the parser in [util.ts](src/util.ts) or the generators in [src/generators/](src/generators) and re-run `npm run gen-test` until your test is converted correctly
- run `npm test` to make sure the new test passes

The parser generates a generic data structure consumed by code generator functions.

You can run a specific test with:

```sh
npm test -- --test test_name
```

where `test_name` is a file (with or without the `.sh` extension) in [test/fixtures/curl_commands/](test/fixtures/curl_commands)

You can run only the tests for a specific language generator with:

```sh
npm test -- --language python
```

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
