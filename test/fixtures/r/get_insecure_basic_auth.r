library(httr)

res <- httr::GET(url = "http://localhost:28139/", config = httr::config(ssl_verifypeer = FALSE), httr::authenticate("some_username", "some_password"))
