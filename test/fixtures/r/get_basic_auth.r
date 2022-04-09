require(httr)

res <- httr::GET(url = 'https://localhost:28139/', httr::authenticate('some_username', 'some_password'))
