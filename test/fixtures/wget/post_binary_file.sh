wget --header="Content-type: application/sparql-query" \
  --header="Accept: application/sparql-results+json" \
  --post-file=./sample.sparql \
  --output-document - \
  http://localhost:28139/american-art/query
