wget --method=POST \
  --header="accept: application/json" \
  --header="Content-Type: multipart/form-data" \
  --output-document - \
  http://localhost:28139/api/library
