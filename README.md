# [curlconverter](https://curlconverter.com)

Transpile [`curl`](https://en.wikipedia.org/wiki/CURL) commands into C#, ColdFusion ML, Clojure, Dart, Elixir, Go, HTTPie, Java, JavaScript, MATLAB, PHP, Python, R, Ruby, Rust, Wget, Ansible, HAR, HTTP or JSON.

Try it on [curlconverter.com](https://curlconverter.com) or from the command line as a drop-in replacement for `curl`:

```shell
$ curlconverter --data "hello=world" example.com
import requests

data = {
    'hello': 'world',
}

response = requests.post('http://example.com', data=data)
```

Features:

- Knows about all 250 of curl's arguments, as well as the deleted ones, but most are ignored
- Implements a lot of curl's argument parsing logic
  - Supports shortening `-O -v -X POST` to `-OvXPOST`
  - `--data @filename` generates code that reads that file and `@-` reads stdin
- Understands Bash syntax
  - [ANSI-C quoted strings](https://www.gnu.org/software/bash/manual/bash.html#ANSI_002dC-Quoting), which "Copy as cURL" [can output](https://github.com/ChromeDevTools/devtools-frontend/blob/2ad2f0713a0bb5f025facd064d4e0bebc3afd33c/front_end/panels/network/NetworkLogView.ts#L2150)
  - Stdin redirects and [heredocs](https://www.gnu.org/software/bash/manual/bash.html#Here-Documents)
  - Generates code that gets environment variables and runs subcommands
  - Ignores comments
  - Reports syntax errors
- Converts JSON data to native objects
- Warns about issues with the conversion

Limitations:

- Only HTTP is supported
- Code generators for other languages are less thorough than the Python generator
- curl doesn't follow redirects or decompress gzip-compressed responses by default, but the generated code will do whatever the default is for that runtime, to keep it shorter. For example Python's Requests library [follows redirects by default](https://requests.readthedocs.io/en/latest/user/quickstart/#redirection-and-history), so unless you explicitly set the redirect policy with `-L`/`--location`/`--no-location`, the generated code will not handle redirects the same way as the curl command
- Shell variables can arbitrarily change how the command would be parsed at runtime. For example, in a command like `curl example.com?foo=bar&baz=$VAR`, if `$VAR` contains `=` or `&` characters or percent encoded characters, that could make the generated code wrong. curlconverter assumes that environment variables don't contain characters that would affect parsing
- Only simple subcommands such as `curl $(echo example.com)` work, more complicated subcommands (such as nested commands or subcommands that redirect the output) won't generate valid code
- The Bash parser isn't the real Bash's parser
- Piped commands are not supported
- and much more

## Install

Install the command line tool with

```sh
npm install --global curlconverter
```

Install the JavaScript library for use in your own projects with

```sh
npm install curlconverter
```

curlconverter requires Node 12+.

## Usage

### Usage from the command line

The command line tool acts as a drop-in replacement for curl. Take a curl command, change "`curl`" to "`curlconverter`" and it will print code instead of making the request

```shell
$ curlconverter example.com
import requests

response = requests.get('http://example.com')
```

or pass `-` to read the curl command from stdin

```shell
$ echo 'curl example.com' | curlconverter -
import requests

response = requests.get('http://example.com')
```

Choose the output language by passing `--language <language>`. The options are

- `ansible`
- `cfml`
- `clojure`
- `csharp`
- `dart`
- `elixir`
- `go`
- `har`
- `http`
- `httpie`
- `java`
- `javascript`, `node`, `node-axios`, `node-got`, `node-request`
- `json`
- `matlab`
- `php`, `php-guzzle`, `php-requests`
- `python` (the default)
- `r`
- `ruby`
- `rust`
- `wget`

`--verbose` enables printing of conversion warnings and error tracebacks.

### Usage as a library

The JavaScript API is a bunch of functions that can take either a string of Bash code or an array of already-parsed arguments (like [`process.argv`](https://nodejs.org/docs/latest/api/process.html#processargv)) and return a string with the resulting program:

```js
import * as curlconverter from 'curlconverter';

curlconverter.toPython('curl example.com');
curlconverter.toPython(['curl', 'example.com']);
// "import requests\n\nresponse = requests.get('http://example.com')\n"
```

**Note**: add `"type": "module"` to your package.json for the `import` statement above to work.

There's a corresponding set of functions that also return an array of warnings if there are any issues with the conversion:

```js
curlconverter.toPythonWarn('curl ftp://example.com');
curlconverter.toPythonWarn(['curl', 'ftp://example.com']);
// [
//   "import requests\n\nresponse = requests.get('ftp://example.com')\n",
//   [ [ 'bad-scheme', 'Protocol "ftp" not supported' ] ]
// ]
```

If you want to host curlconverter yourself and use it in the browser, it needs two [WASM](https://developer.mozilla.org/en-US/docs/WebAssembly) files to work, `tree-sitter.wasm` and `tree-sitter-bash.wasm`, which it will request from the root directory of your web server. If you are hosting a static website and using Webpack, you need to copy these files from the node_modules/ directory to your server's root directory in order to serve them. You can look at the [webpack.config.js](https://github.com/curlconverter/curlconverter.github.io/blob/2e1722891be22b1bb5c47976fb7873f6eb86b94d/webpack.config.js#L130-L131) for [curlconverter.com](https://curlconverter.com/) to see how this is done. You will also need to set `{module: {experiments: {topLevelAwait: true}}}` in your webpack.config.js.

### Usage in VS Code

There's a VS Code extension that adds a "Paste cURL as \<language\>" option to the right-click menu: [https://marketplace.visualstudio.com/items?itemName=curlconverter.curlconverter](https://marketplace.visualstudio.com/items?itemName=curlconverter.curlconverter). It [has to use an old version of curlconverter](https://github.com/curlconverter/curlconverter-vscode/issues/1), so it doesn't support the same languages, curl arguments or Bash syntax as the current version.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT © [Nick Carneiro](http://trillworks.com)
