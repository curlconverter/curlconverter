library(httr)

headers = c(
  foo = "bar"
)

res <- httr::GET(url = "http://localhost:28139/", httr::add_headers(.headers=headers))
