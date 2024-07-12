library(httr2)

params = list(
  `type` = "distribution"
)

headers = c(
  `Authorization` = paste("Bearer ", Sys.getenv("DO_API_TOKEN"), sep = "")
)

request("http://localhost:28139/v2/images") |> 
  req_url_query(!!!params) |> 
  req_headers(!!!headers) |> 
  req_perform()
