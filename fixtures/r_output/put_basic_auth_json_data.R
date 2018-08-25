require(httr)

data = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'

res <- httr::PUT(url = 'http://localhost:5984/test/_security', body = data, httr::authenticate('admin', '123'))
