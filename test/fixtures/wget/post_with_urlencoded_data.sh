wget --header="Origin: http://fiddle.jshell.net" \
  --header="Accept-Encoding: gzip, deflate" \
  --header="Accept-Language: en-US,en;q=0.8" \
  --header="User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36" \
  --header="Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  --header="Accept: */*" \
  --header="Referer: http://fiddle.jshell.net/_display/" \
  --header="X-Requested-With: XMLHttpRequest" \
  --header="Connection: keep-alive" \
  --compression=auto \
  --post-data="msg1=wow&msg2=such" \
  --output-document - \
  http://localhost:28139/echo/html/
