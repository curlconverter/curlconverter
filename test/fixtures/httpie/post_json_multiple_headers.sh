http --verify=no \
  --verbose \
  :28139/rest/login-sessions \
  Content-Type:application/json \
  X-API-Version:200 \
  userName=username123 \
  password=password123 \
  authLoginDomain=local
