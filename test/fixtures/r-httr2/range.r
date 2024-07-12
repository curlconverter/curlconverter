library(httr2)

headers = c(
  `Range` = "bytes=600-"
)

request("http://localhost:28139") |> 
  req_headers(!!!headers) |> 
  req_perform()
