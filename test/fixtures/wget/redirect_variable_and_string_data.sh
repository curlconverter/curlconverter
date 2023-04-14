wget --header="Content-Type: application/x-www-form-urlencoded" \
  --post-data="foo&@start"$FILENAME'end' \
  --output-document - \
  http://localhost:28139
