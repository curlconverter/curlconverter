# [curlconverter](https://curlconverter.com)

Transpile [`curl`](https://en.wikipedia.org/wiki/CURL) commands into Python and other languages.

Try it on [curlconverter.com](https://curlconverter.com) or from the command line:

```shell
$ curlconverter --data-raw "hello=world" example.com
import requests

data = {
    'hello': 'world',
}

response = requests.post('http://example.com', data=data)
```

Features:

- Understands most Bash syntax
  - [ANSI-C quoted strings](https://www.gnu.org/software/bash/manual/bash.html#ANSI_002dC-Quoting) (which "Copy as cURL" [can output](https://github.com/ChromeDevTools/devtools-frontend/blob/2ad2f0713a0bb5f025facd064d4e0bebc3afd33c/front_end/panels/network/NetworkLogView.ts#L2150))
  - Piped file or input (such as [heredocs](https://www.gnu.org/software/bash/manual/bash.html#Here-Documents))
  - Ignores comments
  - Reports syntax errors
- Knows about all of curl's 300 or so arguments, including deleted ones, but most are ignored
- Supports multiple short arguments passed as one, for example `-OvXPOST` instead of `-O -v -X POST`
- `--data @filename` generates Python code that reads from that file
- `--data @-` generates Python code that reads from stdin (or piped file/input)
- Converts JSON to native objects
- Warns about issues with the conversion

Limitations:

- Only HTTP is supported
- If multiple URLs are passed only the first one is used
- By default, curl doesn't follow redirects or decompress the response but the generated code will do whatever the default is for that runtime, to keep it simpler. For example Python's Requests follows redirects by default, so unless you explicitly set the redirect policy with `-L`/`--location`/`--no-location`, the resulting code will not do what curl would do if the server responds with a redirect
- Code generators for other languages are less thorough than the Python generator
- and much more

## Install

Install the JavaScript library for use in your own projects with

```sh
npm install curlconverter
```

Install the command line tool with

```sh
npm install --global curlconverter
```

curlconverter requires Node 14+.

## Usage

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


### Usage from the command line

The command line tool is a drop-in replacement for curl. Take any curl command, change "`curl`" to "`curlconverter`" and it will print code instead of making the request

```shell
$ curlconverter example.com
import requests

response = requests.get('http://example.com')
```

or you can pass `-` to tell it to read the curl command from stdin

```shell
$ echo 'curl example.com' | curlconverter -
import requests

response = requests.get('http://example.com')
```

You can choose the output language by passing `--language <language>`. The options are

- `ansible`
- `cfml`
- `csharp`
- `dart`
- `elixir`
- `go`
- `java`
- `javascript`, `node`, `node-axios`, `node-request`
- `json`
- `matlab`
- `php`, `php-request`
- `python` (the default)
- `r`
- `ruby`
- `rust`

### Usage in VS Code

There's a VS Code extension that adds a "Paste cURL as \<language\>" option to the right-click menu: [https://marketplace.visualstudio.com/items?itemName=curlconverter.curlconverter](https://marketplace.visualstudio.com/items?itemName=curlconverter.curlconverter). It [has to use an old version of curlconverter](https://github.com/curlconverter/curlconverter-vscode/issues/1), so it doesn't support the same languages, curl arguments or Bash syntax as the current version.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT © [Nick Carneiro](http://trillworks.com)
