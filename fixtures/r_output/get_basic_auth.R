require(httr)

res <- httr::GET(url = 'https://api.test.com/', httr::authenticate('some_username', 'some_password'))
