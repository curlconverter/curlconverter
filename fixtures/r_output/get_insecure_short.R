require(httr)

res <- httr::GET(url = 'https://www.site.com/', config = httr::config(ssl_verifypeer = FALSE))
