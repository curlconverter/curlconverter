library(httr2)

params = list(
  `key` = "one",
  `key` = "two"
)

request("http://localhost:28139") |> 
  req_url_query(!!!params) |> 
  req_perform()
