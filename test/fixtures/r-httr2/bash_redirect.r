library(httr2)

params = list(
  `action` = "create",
  `title` = "UnixRecord",
  `username` = "root",
  `password` = "abc123",
  `ips` = "10.10.10.10"
)

headers = c(
  `X-Requested-With` = "curl"
)

request("http://localhost:28139/api/2.0/fo/auth/unix/") |> 
  req_method("POST") |> 
  req_url_query(!!!params) |> 
  req_headers(!!!headers) |> 
  req_body_file("add_params.xml") |> 
  req_auth_basic("USER", "PASS") |> 
  req_perform()
