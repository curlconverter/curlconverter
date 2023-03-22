wget --method=PUT \
  --header="Content-Type: application/json" \
  --body-file=my_file.txt \
  --output-document - \
  "http://localhost:28139/twitter/_mapping/user?pretty"
