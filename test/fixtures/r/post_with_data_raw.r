library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = "msg1=wow&msg2=such&msg3=@rawmsg"

res <- httr::POST(url = "http://localhost:28139/post", httr::add_headers(.headers=headers), body = data)
