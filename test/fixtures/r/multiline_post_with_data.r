library(httr)

headers = c(
  Origin = "http://fiddle.jshell.net",
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = list(
  msg1 = "value1",
  msg2 = "value2"
)

res <- httr::GET(url = "http://localhost:28139/echo/html/", httr::add_headers(.headers=headers), body = data, encode = "form")
