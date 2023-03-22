wget --header="Content-Type: application/x-www-form-urlencoded" \
  --post-data="foo=bar&foo=&foo=barbar" \
  --output-document - \
  http://localhost:28139/
