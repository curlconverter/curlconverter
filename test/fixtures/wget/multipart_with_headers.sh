wget --method=POST \
  --header="Authorization: Bearer ACCESS_TOKEN" \
  --header="X-Nice: Header" \
  --output-document - \
  http://localhost:28139/api/2.0/files/content
