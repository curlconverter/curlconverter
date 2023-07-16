wget --header="Content-Type: application/x-www-form-urlencoded" \
  --post-data='version=1.2&auth_user=fdgxf&auth_pwd=oxfdscds&json_data={ "operation": "core/get", "class": "Software", "key": "key" }' \
  --output-document - \
  --quiet \
  http://localhost:28139/webservices/rest.php
