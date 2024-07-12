library(httr2)

headers = c(
  `foo` = "bar"
)

request("http://localhost:28139/") |> 
  req_headers(!!!headers) |> 
  req_perform()
