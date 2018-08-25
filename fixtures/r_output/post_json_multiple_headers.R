require(httr)

headers = c(
  `Content-Type` = 'application/json',
  `X-API-Version` = '200'
)

data = '{"userName":"username123","password":"password123", "authLoginDomain":"local"}'

res <- httr::POST(url = 'https://0.0.0.0/rest/login-sessions', httr::add_headers(.headers=headers), body = data, config = httr::config(ssl_verifypeer = FALSE))
