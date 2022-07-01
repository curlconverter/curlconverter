# curlconverter

`curlconverter` transpiles [`curl`](https://en.wikipedia.org/wiki/CURL) commands into programs in other programming languages.

```sh
$ curlconverter --data-raw "hello=world" example.com
import requests

data = {
    'hello': 'world',
}

response = requests.post('http://example.com', data=data)
```

You can choose the output language by passing `--language <language>`. The options are `python` (the default), `javascript`/`node`, `node-axios`, `php`, `go`, `java`, `r`, `rust`, `elixir`, `dart`, `matlab` and a few more.

[![NPM version][npm-image]][npm-url]

## Live Demo

https://curlconverter.com

## Install

Install the command line tool with

```sh
$ npm install --global curlconverter
```

Install the JavaScript library for use in your own projects with

```sh
$ npm install --save curlconverter
```

curlconverter requires Node 12+.

## Usage

The JavaScript API is a bunch of functions that can take either a string of Bash code or an array

```js
import * as curlconverter from 'curlconverter';

curlconverter.toPython("curl 'http://en.wikipedia.org/' -H 'Accept-Encoding: gzip, deflate, sdch' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Referer: http://www.wikipedia.org/' -H 'Cookie: GeoIP=US:Albuquerque:35.1241:-106.7675:v4; uls-previous-languages=%5B%22en%22%5D; mediaWiki.user.sessionId=VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y; centralnotice_buckets_by_campaign=%7B%22C14_enUS_dsk_lw_FR%22%3A%7B%22val%22%3A%220%22%2C%22start%22%3A1412172000%2C%22end%22%3A1422576000%7D%2C%22C14_en5C_dec_dsk_FR%22%3A%7B%22val%22%3A3%2C%22start%22%3A1417514400%2C%22end%22%3A1425290400%7D%2C%22C14_en5C_bkup_dsk_FR%22%3A%7B%22val%22%3A1%2C%22start%22%3A1417428000%2C%22end%22%3A1425290400%7D%7D; centralnotice_bannercount_fr12=22; centralnotice_bannercount_fr12-wait=14' -H 'Connection: keep-alive' --compressed");
curlconverter.toPython(['curl', 'http://en.wikipedia.org/', '-H', 'Accept-Encoding: gzip, deflate, sdch', '-H', 'Accept-Language: en-US,en;q=0.8', '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36', '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', '-H', 'Referer: http://www.wikipedia.org/', '-H', 'Cookie: GeoIP=US:Albuquerque:35.1241:-106.7675:v4; uls-previous-languages=%5B%22en%22%5D; mediaWiki.user.sessionId=VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y; centralnotice_buckets_by_campaign=%7B%22C14_enUS_dsk_lw_FR%22%3A%7B%22val%22%3A%220%22%2C%22start%22%3A1412172000%2C%22end%22%3A1422576000%7D%2C%22C14_en5C_dec_dsk_FR%22%3A%7B%22val%22%3A3%2C%22start%22%3A1417514400%2C%22end%22%3A1425290400%7D%2C%22C14_en5C_bkup_dsk_FR%22%3A%7B%22val%22%3A1%2C%22start%22%3A1417428000%2C%22end%22%3A1425290400%7D%7D; centralnotice_bannercount_fr12=22; centralnotice_bannercount_fr12-wait=14', '-H', 'Connection: keep-alive', '--compressed'])
```

and return a string of code like:

```python
import requests

cookies = {
    'GeoIP': 'US:Albuquerque:35.1241:-106.7675:v4',
    'uls-previous-languages': '%5B%22en%22%5D',
    'mediaWiki.user.sessionId': 'VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y',
    'centralnotice_buckets_by_campaign': '%7B%22C14_enUS_dsk_lw_FR%22%3A%7B%22val%22%3A%220%22%2C%22start%22%3A1412172000%2C%22end%22%3A1422576000%7D%2C%22C14_en5C_dec_dsk_FR%22%3A%7B%22val%22%3A3%2C%22start%22%3A1417514400%2C%22end%22%3A1425290400%7D%2C%22C14_en5C_bkup_dsk_FR%22%3A%7B%22val%22%3A1%2C%22start%22%3A1417428000%2C%22end%22%3A1425290400%7D%7D',
    'centralnotice_bannercount_fr12': '22',
    'centralnotice_bannercount_fr12-wait': '14',
}

headers = {
    # 'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'en-US,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': 'http://www.wikipedia.org/',
    # Requests sorts cookies= alphabetically
    # 'Cookie': 'GeoIP=US:Albuquerque:35.1241:-106.7675:v4; uls-previous-languages=%5B%22en%22%5D; mediaWiki.user.sessionId=VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y; centralnotice_buckets_by_campaign=%7B%22C14_enUS_dsk_lw_FR%22%3A%7B%22val%22%3A%220%22%2C%22start%22%3A1412172000%2C%22end%22%3A1422576000%7D%2C%22C14_en5C_dec_dsk_FR%22%3A%7B%22val%22%3A3%2C%22start%22%3A1417514400%2C%22end%22%3A1425290400%7D%2C%22C14_en5C_bkup_dsk_FR%22%3A%7B%22val%22%3A1%2C%22start%22%3A1417428000%2C%22end%22%3A1425290400%7D%7D; centralnotice_bannercount_fr12=22; centralnotice_bannercount_fr12-wait=14',
    'Connection': 'keep-alive',
}

response = requests.get('http://en.wikipedia.org/', cookies=cookies, headers=headers)
```

**Note**: you have to add `"type": "module"` to your package.json for the above example to work.

## Contributing

> I'd rather write programs to write programs than write programs.
>
> — Dick Sites, Digital Equipment Corporation, 1985

First, make sure you're running **Node 12** or greater.

If you add a new generator, you'll need to

- export it in [index.ts](src/index.ts)
- update the list of supported languages in [cli.ts](src/cli.ts) (or it won't be accessible from the command line)
- add it to [test-utils.ts](test/test-utils.ts) (to make it part of the testing)

If you want to add new functionality, start with a test.

- create a file containing the curl command in [test/fixtures/curl_commands/](test/fixtures/curl_commands) with a descriptive filename like `post_with_headers.sh`
- run `npm run gen-test post_with_headers` to save the result of converting that file to [test/fixtures/\<language>/](test/fixtures) with a matching filename but different extension like `post_with_headers.py`
- modifying the parser in [util.ts](src/util.ts) or the generators in [src/generators/](src/generators) and re-run `npm run gen-test` until your test is converted correctly
- run `npm test` to make sure the new test passes

The parser generates a generic data structure consumed by code generator functions.

You can run a specific test with:

```sh
npm test -- test_name
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

## License

MIT © [Nick Carneiro](http://trillworks.com)

[npm-url]: https://npmjs.org/package/curlconverter
[npm-image]: https://badge.fury.io/js/curlconverter.svg
