library(httr)

cookies = c(
  authCookie = "123"
)

headers = c(
  Pragma = "no-cache",
  `Accept-Encoding` = "gzip, deflate, br",
  `Accept-Language` = "en-US,en;q=0.9",
  `User-Agent` = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
  accept = "application/json",
  Referer = "https://httpbin.org/",
  Connection = "keep-alive",
  `Cache-Control` = "no-cache",
  `Sec-Metadata` = "destination=empty, site=same-origin"
)

res <- httr::GET(url = "http://localhost:28139/cookies", httr::add_headers(.headers=headers), httr::set_cookies(.cookies = cookies))
