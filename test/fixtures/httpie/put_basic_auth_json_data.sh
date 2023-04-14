http -a admin:123 \
  --raw '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}' \
  PUT \
  http://localhost:28139/test/_security \
  Content-Type:application/x-www-form-urlencoded
