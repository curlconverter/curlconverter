library(httr2)

headers = c(
  `Pragma` = "no-cache",
  `Accept-Encoding` = "gzip, deflate, br",
  `Accept-Language` = "en-US,en;q=0.9",
  `User-Agent` = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
  `accept` = "application/json",
  `Referer` = "https://httpbin.org/",
  `Connection` = "keep-alive",
  `Cache-Control` = "no-cache",
  `Sec-Metadata` = "destination=empty, site=same-origin"
)

cookies = c(
  `authCookie` = "123"
)

request("http://localhost:28139/cookies") |> 
  req_headers(!!!headers) |> 
  req_headers(!!!cookies) |> 
  req_perform()
