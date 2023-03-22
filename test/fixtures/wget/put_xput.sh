wget --method=PUT \
  --header="Content-Type: application/json" \
  --body-data='{"properties": {"email": {"type": "keyword"}}}' \
  --output-document - \
  "http://localhost:28139/twitter/_mapping/user?pretty"
