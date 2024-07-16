library(httr2)

request("http://localhost:28139/api/2.0/fo/auth/unix/") |>
  req_method("POST") |>
  req_url_query(
    action = "create",
    title = "UnixRecord",
    username = "root",
    password = "abc123",
    ips = "10.10.10.10"
  ) |>
  req_headers(`X-Requested-With` = "curl") |>
  req_body_file("add_params.xml") |>
  req_auth_basic("USER", "PASS") |>
  req_perform()
