http PUT \
  "http://localhost:28139/twitter/_mapping/user?pretty" \
  Content-Type:application/json \
  "properties[email][type]"=keyword
