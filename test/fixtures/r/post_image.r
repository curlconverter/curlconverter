library(httr)

files = list(
  image = upload_file("image.jpg")
)

res <- httr::POST(url = "http://localhost:28139/targetservice", body = files, encode = "multipart")
