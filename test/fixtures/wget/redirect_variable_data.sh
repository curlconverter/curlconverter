wget --header="Content-Type: application/x-www-form-urlencoded" \
  --post-data="foo&@"$FILENAME \
  --output-document - \
  http://localhost:28139
