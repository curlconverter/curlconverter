library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = list(
  data1 = "data1",
  data2 = "data2",
  data3 = "data3"
)

res <- httr::POST(url = "http://localhost:28139/post", httr::add_headers(.headers=headers), body = data, encode = "form")
