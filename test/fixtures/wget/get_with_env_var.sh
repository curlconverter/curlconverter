wget --header="Content-Type: application/json" \
  --header="Authorization: Bearer "$DO_API_TOKEN \
  --output-document - \
  "http://localhost:28139/v2/images?type=distribution"
