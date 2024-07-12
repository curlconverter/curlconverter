library(httr2)

headers = c(
  `'Accept'` = "'application/json'",
  `Authorization` = "Bearer 000000000000000-0000"
)

request("http://localhost:28139/api/servers/00000000000/shared_servers/") |> 
  req_method("POST") |> 
  req_headers(!!!headers) |> 
  req_body_file("-") |> 
  req_perform()
