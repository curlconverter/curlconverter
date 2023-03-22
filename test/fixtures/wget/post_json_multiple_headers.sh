wget --header="Content-Type: application/json" \
  --header="X-API-Version: 200" \
  --post-data='{"userName":"username123","password":"password123", "authLoginDomain":"local"}' \
  --no-check-certificate \
  --output-document - \
  http://localhost:28139/rest/login-sessions
