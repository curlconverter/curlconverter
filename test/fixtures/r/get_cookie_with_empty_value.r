library(httr)

cookies = c(
  mysamplecookie = "someValue",
  emptycookie = "",
  otherCookie = "2"
)

headers = c(
  accept = "application/json"
)

res <- httr::GET(url = "http://localhost:28139/cookies", httr::add_headers(.headers=headers), httr::set_cookies(.cookies = cookies))
