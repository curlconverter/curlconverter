library(httr2)

headers = c(
  `Accept` = "application/json"
)

request("http://localhost:28139") |> 
  req_method("POST") |> 
  req_headers(!!!headers) |> 
  req_body_raw("{   }", "application/json") |> 
  req_perform()
