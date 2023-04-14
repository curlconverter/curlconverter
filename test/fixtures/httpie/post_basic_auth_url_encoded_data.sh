http -a foo:bar \
  --form \
  http://localhost:28139/api/oauth/token/ \
  Content-Type:application/x-www-form-urlencoded \
  "grant_type=client_credentials"
