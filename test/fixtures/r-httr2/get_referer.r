library(httr2)

headers = c(
  `X-Requested-With` = "XMLHttpRequest",
  `User-Agent` = "SimCity",
  `Referer` = "https://website.com"
)

request("http://localhost:28139") |> 
  req_headers(!!!headers) |> 
  req_perform()
