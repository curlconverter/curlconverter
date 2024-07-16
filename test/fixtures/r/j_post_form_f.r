library(httr)

files = list(
  d1 = "data1",
  d2 = "data"
)

res <- httr::POST(url = "http://localhost:28139/post", body = files, encode = "multipart")
