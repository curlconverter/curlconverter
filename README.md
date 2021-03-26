#  [![NPM version][npm-image]][npm-url][![Build Status](https://travis-ci.org/NickCarneiro/curlconverter.svg)](https://travis-ci.org/NickCarneiro/curlconverter)

Convert cURL syntax to native Python, Go, PHP, JavaScript, R, Elixir and Dart HTTP code

## Live Demo

https://curl.trillworks.com

## Install

```sh
$ npm install --save curlconverter
```


## Usage

```js
var curlconverter = require('curlconverter');

curlconverter.toPython("curl 'http://en.wikipedia.org/' -H 'Accept-Encoding: gzip, deflate, sdch' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Referer: http://www.wikipedia.org/' -H 'Cookie: GeoIP=US:Albuquerque:35.1241:-106.7675:v4; uls-previous-languages=%5B%22en%22%5D; mediaWiki.user.sessionId=VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y; centralnotice_buckets_by_campaign=%7B%22C14_enUS_dsk_lw_FR%22%3A%7B%22val%22%3A%220%22%2C%22start%22%3A1412172000%2C%22end%22%3A1422576000%7D%2C%22C14_en5C_dec_dsk_FR%22%3A%7B%22val%22%3A3%2C%22start%22%3A1417514400%2C%22end%22%3A1425290400%7D%2C%22C14_en5C_bkup_dsk_FR%22%3A%7B%22val%22%3A1%2C%22start%22%3A1417428000%2C%22end%22%3A1425290400%7D%7D; centralnotice_bannercount_fr12=22; centralnotice_bannercount_fr12-wait=14' -H 'Connection: keep-alive' --compressed");

```

Returns a string of Python code like:

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
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'en-US,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': 'http://www.wikipedia.org/',
    'Connection': 'keep-alive',
}

response = requests.get('http://en.wikipedia.org/', headers=headers, cookies=cookies)
```

## Contributing

> I'd rather write programs to write programs than write programs.
>
>
> Dick Sites, Digital Equipment Corporation, September 1985

Make sure you're running node 12 or greater. The test suite will fail on older versions of node.

If you add a new generator, make sure to update the list of supported languages in [cli.js](bin/cli.js) or else it won't be accessible from the command line. Further, you'll want to update test.js and index.js for your new generator to make it part of the testing.

If you want to add new functionality, start with a test.

- Create a file containing the curl command in `fixtures/curl_commands` with a descriptive filename like `post_with_headers.txt`
- Create a file containing the output in `fixtures/python_output/` with a matching filename (but different extension) like `post_with_headers.py`
- Run tests with `npm test`.
- If your filenames match correctly, you should see one failing test. Fix it by modifying the parser in `util.js` or the generators in `generators/`

The parser generates a generic data structure consumed by code generator functions.

You can run a specific test with this command:

`node test.js --test=test_name`

where "test_name" is a file (without extension) in `fixtures/curl_commands`

You can run a specific test with this command:

`node test.js --language=R`

I recommend setting this up with a debugger so you can see exactly what the parser is passing to the generator.
Here's my Intellij run configuration for a single test:
![Screenshot of intellij debug configuration](/docs/intellijconfig.png)

Before submitting a PR, please check that your JS code conforms to the code style enforced by [standardjs](https://standardjs.com). Use the following to fix your code if it doesn't:

```sh
$ standard --fix my_file.js
```

If you get stuck, please reach out via email. I am always willing to hop on a google hangout and pair program.

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

## License

MIT © [Nick Carneiro](http://trillworks.com)


[npm-url]: https://npmjs.org/package/curlconverter
[npm-image]: https://badge.fury.io/js/curlconverter.svg
