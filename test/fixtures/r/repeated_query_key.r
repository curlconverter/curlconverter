library(httr)

params = list(
  key = "one",
  key = "two"
)

res <- httr::GET(url = "http://localhost:28139", query = params)
