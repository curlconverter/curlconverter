wget --header="Content-Type: application/x-www-form-urlencoded" \
  --user=foo \
  --password=bar \
  --auth-no-challenge \
  --post-data="grant_type=client_credentials" \
  --output-document - \
  http://localhost:28139/api/oauth/token/
