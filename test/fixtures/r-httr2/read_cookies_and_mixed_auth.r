library(httr2)

headers = c(
  `Authorization` = "Bearer AAAAAAAAAAAA"
)

request("http://localhost:28139") |> 
  req_headers(!!!headers) |> 
  req_auth_basic("user", "pass") |> 
  req_perform()
