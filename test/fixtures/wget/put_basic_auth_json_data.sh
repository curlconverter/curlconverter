wget --method=PUT \
  --header="Content-Type: application/x-www-form-urlencoded" \
  --user=admin \
  --password=123 \
  --auth-no-challenge \
  --body-data='{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}' \
  --output-document - \
  http://localhost:28139/test/_security
