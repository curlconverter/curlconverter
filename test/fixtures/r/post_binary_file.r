library(httr)

headers = c(
  `Content-type` = "application/sparql-query",
  Accept = "application/sparql-results+json"
)

data = upload_file("./sample.sparql")
res <- httr::POST(url = "http://localhost:28139/american-art/query", httr::add_headers(.headers=headers), body = data)
