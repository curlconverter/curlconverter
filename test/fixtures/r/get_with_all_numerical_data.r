library(httr)

headers = c(
  `Content-Type` = "application/json",
  Accept = "application/json"
)

data = "18233982904"

res <- httr::POST(url = "http://localhost:28139/CurlToNode", httr::add_headers(.headers=headers), body = data)
