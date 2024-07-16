library(httr)

headers = c(
  Origin = "http://fiddle.jshell.net",
  `Accept-Encoding` = "gzip, deflate",
  `Accept-Language` = "en-US,en;q=0.8",
  `User-Agent` = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
  `Content-Type` = "application/x-www-form-urlencoded; charset=UTF-8",
  Accept = "*/*",
  Referer = "http://fiddle.jshell.net/_display/",
  `X-Requested-With` = "XMLHttpRequest",
  Connection = "keep-alive"
)

data = list(
  msg1 = "wow",
  msg2 = "such"
)

res <- httr::POST(url = "http://localhost:28139/echo/html/", httr::add_headers(.headers=headers), body = data, encode = "form")
