library(httr)

params = list(
  foo = "bar",
  baz = "qux"
)

res <- httr::GET(url = "http://localhost:28139", query = params)
