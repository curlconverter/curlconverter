library(httr)

headers = c(
  Range = "bytes=600-"
)

res <- httr::GET(url = "http://localhost:28139", httr::add_headers(.headers=headers))
