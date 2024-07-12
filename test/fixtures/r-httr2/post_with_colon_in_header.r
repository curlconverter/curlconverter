library(httr2)

headers = c(
  `key` = "abcdefg"
)

request("http://localhost:28139/endpoint") |> 
  req_method("POST") |> 
  req_headers(!!!headers) |> 
  req_perform()
