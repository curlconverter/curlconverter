require(httr)

res <- httr::GET(url = 'https://example.com/', config = httr::config(ssl_verifypeer = FALSE))
