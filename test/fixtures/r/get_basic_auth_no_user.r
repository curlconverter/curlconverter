require(httr)

res <- httr::GET(url = 'http://localhost:28139/', httr::authenticate('', 'some_password'))
