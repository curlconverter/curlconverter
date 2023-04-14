http --form \
  http://localhost:28139/ \
  Content-Type:application/x-www-form-urlencoded \
  "foo=bar" \
  "foo=" \
  "foo=barbar"
