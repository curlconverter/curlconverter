library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = paste("foo&@start", Sys.getenv("FILENAME"), "$end", sep = "")

res <- httr::POST(url = "http://localhost:28139", httr::add_headers(.headers=headers), body = data)
