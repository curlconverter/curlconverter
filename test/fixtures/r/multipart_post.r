library(httr)

headers = c(
  Authorization = "Bearer ACCESS_TOKEN"
)

files = list(
  attributes = '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}',
  file = upload_file("myfile.jpg")
)

res <- httr::POST(url = "http://localhost:28139/api/2.0/files/content", httr::add_headers(.headers=headers), body = files, encode = "multipart")
