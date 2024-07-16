library(httr)

headers = c(
  Accept = "application/json",
  `user-token` = "75d7ce4350c7d6239347bf23d3a3e668"
)

res <- httr::GET(url = "http://localhost:28139/api/retail/books/list", httr::add_headers(.headers=headers))
