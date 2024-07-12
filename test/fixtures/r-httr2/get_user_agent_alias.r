library(httr2)

params = list(
  `p` = "5",
  `pub` = "testmovie",
  `tkn` = "817263812"
)

headers = c(
  `x-msisdn` = "XXXXXXXXXXXXX",
  `user-agent` = "Mozilla Android6.1"
)

request("http://localhost:28139/vc/moviesmagic") |> 
  req_url_query(!!!params) |> 
  req_headers(!!!headers) |> 
  req_perform()
