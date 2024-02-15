library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'

res <- httr::PUT(url = "http://localhost:28139/test/_security", httr::add_headers(.headers=headers), body = data, httr::authenticate("admin", "123"))
