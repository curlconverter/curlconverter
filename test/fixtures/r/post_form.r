library(httr)

files = list(
  username = "davidwalsh",
  password = "something"
)

res <- httr::POST(url = "http://localhost:28139/post-to-me.php", body = files, encode = "multipart")
