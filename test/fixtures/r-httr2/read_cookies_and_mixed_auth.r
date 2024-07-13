library(httr2)

request("http://localhost:28139") |> 
  req_headers(`Authorization` = "Bearer AAAAAAAAAAAA") |> 
  req_auth_basic("user", "pass") |> 
  req_perform()
