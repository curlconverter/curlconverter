require(httr)

data = upload_file('new_file')
res <- httr::PUT(url = 'http://awesomeurl.com/upload', body = data)
