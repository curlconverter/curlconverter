wget --header="Pragma: no-cache" \
  --header="Accept-Encoding: gzip, deflate, br" \
  --header="Accept-Language: en-US,en;q=0.9" \
  --header="User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36" \
  --header="accept: application/json" \
  --header="Referer: https://httpbin.org/" \
  --header="Cookie: authCookie=123" \
  --header="Connection: keep-alive" \
  --header="Cache-Control: no-cache" \
  --header="Sec-Metadata: destination=empty, site=same-origin" \
  --compression=auto \
  --output-document - \
  http://localhost:28139/cookies
