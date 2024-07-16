library(httr2)

request("http://localhost:28139/rest/login-sessions") |>
  req_method("POST") |>
  req_headers(`X-API-Version` = "200") |>
  req_body_raw(
    '{"userName":"username123","password":"password123", "authLoginDomain":"local"}',
    type = "application/json"
  ) |>
  req_options(ssl_verifypeer = 0) |>
  req_perform(verbosity = 1)
