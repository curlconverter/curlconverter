library(httr)

headers = c(
  `'Accept'` = "'application/json'",
  Authorization = "Bearer 000000000000000-0000",
  `Content-Type` = "application/json"
)

data = upload_file("-")
res <- httr::POST(url = "http://localhost:28139/api/servers/00000000000/shared_servers/", httr::add_headers(.headers=headers), body = data)
