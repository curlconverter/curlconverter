library(httr2)

headers = c(
  `Accept` = "application/json"
)

request("http://localhost:28139/CurlToNode") |> 
  req_method("POST") |> 
  req_headers(!!!headers) |> 
  req_body_raw("18233982904", "application/json") |> 
  req_perform()
