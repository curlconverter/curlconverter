library(httr)

headers = c(
  `Content-Type` = "application/json",
  `X-API-Version` = "200"
)

data = '{"userName":"username123","password":"password123", "authLoginDomain":"local"}'

res <- httr::POST(url = "http://localhost:28139/rest/login-sessions", httr::add_headers(.headers=headers), body = data, config = httr::config(ssl_verifypeer = FALSE))
