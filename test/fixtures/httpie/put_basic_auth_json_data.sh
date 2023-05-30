http -a admin:123 \
  --raw '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}' \
  PUT \
  :28139/test/_security \
  Content-Type:application/x-www-form-urlencoded
