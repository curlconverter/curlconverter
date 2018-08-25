require(httr)

headers = c(
  `Content-type` = 'application/sparql-query',
  `Accept` = 'application/sparql-results+json'
)

data = upload_file('./sample.sparql')
res <- httr::POST(url = 'http://lodstories.isi.edu:3030/american-art/query', httr::add_headers(.headers=headers), body = data)
