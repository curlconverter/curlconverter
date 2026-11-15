library(httr)

files = list(
  name = "value"
)

res <- httr::POST(url = "http://localhost:28139/upload", body = files, encode = "multipart")
