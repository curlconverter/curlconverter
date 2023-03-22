wget --header="X-Api-Key: 123456789" \
  --output-document - \
  "http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4"
