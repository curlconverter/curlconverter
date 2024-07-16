library(httr2)

request("http://localhost:28139/webservices/rest.php") |>
  req_method("POST") |>
  req_body_raw(
    'version=1.2&auth_user=fdgxf&auth_pwd=oxfdscds&json_data={ "operation": "core/get", "class": "Software", "key": "key" }',
    type = "application/x-www-form-urlencoded"
  ) |>
  req_perform()
