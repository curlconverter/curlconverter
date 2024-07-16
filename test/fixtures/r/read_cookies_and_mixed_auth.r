library(httr)

headers = c(
  Authorization = "Bearer AAAAAAAAAAAA"
)

res <- httr::GET(url = "http://localhost:28139", httr::add_headers(.headers=headers), httr::authenticate("user", "pass"))
