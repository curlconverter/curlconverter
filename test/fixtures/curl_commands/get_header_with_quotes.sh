# https://github.com/curlconverter/curlconverter/issues/272
curl 'http://localhost:28139' \
  -H 'sec-ch-ua: " Not A;Brand";v="99", "Chromium";v="92"' \
  --compressed
