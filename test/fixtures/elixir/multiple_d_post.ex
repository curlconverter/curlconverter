response = HTTPoison.post!(
  "http://localhost:28139/webservices/rest.php",
  "version=1.2&auth_user=fdgxf&auth_pwd=oxfdscds&json_data={ \"operation\": \"core/get\", \"class\": \"Software\", \"key\": \"key\" }",
  [
    {"Content-Type", "application/x-www-form-urlencoded"}
  ]
)
