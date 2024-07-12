library(httr2)

headers = c(
  `Accept` = "application/json",
  `user-token` = "75d7ce4350c7d6239347bf23d3a3e668"
)

request("http://localhost:28139/api/retail/books/list") |> 
  req_headers(!!!headers) |> 
  req_perform()
