wget --header="Content-Type: application/x-www-form-urlencoded" \
  --post-data="foo&@"`echo myfile.jg` \
  --output-document - \
  http://localhost:28139
