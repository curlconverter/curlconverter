library(httr2)

params = list(
  `test` = "2",
  `limit` = "100",
  `w` = "4"
)

headers = c(
  `X-Api-Key` = "123456789"
)

request("http://localhost:28139/synthetics/api/v3/monitors") |> 
  req_url_query(!!!params) |> 
  req_headers(!!!headers) |> 
  req_perform(`verbosity` = 1)
