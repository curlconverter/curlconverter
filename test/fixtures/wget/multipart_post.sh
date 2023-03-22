wget --method=POST \
  --header="Authorization: Bearer ACCESS_TOKEN" \
  --output-document - \
  http://localhost:28139/api/2.0/files/content
