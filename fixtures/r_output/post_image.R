require(httr)

files = list(
  `image` = upload_file('image.jpg')
)

res <- httr::POST(url = 'http://example.com/targetservice', body = files)
