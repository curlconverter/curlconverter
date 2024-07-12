library(httr2)

headers = c(
  `sec-ch-ua` = '" Not A;Brand";v="99", "Chromium";v="92"'
)

request("http://localhost:28139") |> 
  req_headers(!!!headers) |> 
  req_perform()
