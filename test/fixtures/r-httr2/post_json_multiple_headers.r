library(httr2)

headers = c(
  `X-API-Version` = "200"
)

request("http://localhost:28139/rest/login-sessions") |> 
  req_method("POST") |> 
  req_options(
    `ssl_verifypeer` = 0
  ) |> 
  req_headers(!!!headers) |> 
  req_body_raw('{"userName":"username123","password":"password123", "authLoginDomain":"local"}', "application/json") |> 
  req_perform(verbosity = 1)
