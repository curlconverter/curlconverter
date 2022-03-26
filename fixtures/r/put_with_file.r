require(httr)

headers = c(
  `Content-Type` = 'application/x-www-form-urlencoded'
)

data = upload_file('new_file')
res <- httr::PUT(url = 'http://awesomeurl.com/upload', httr::add_headers(.headers=headers), body = data)
