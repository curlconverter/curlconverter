library(httr)

files = list(
  from = "test@tester.com",
  to = "devs@tester.net",
  subject = "Hello",
  text = "Testing the converter!"
)

res <- httr::POST(url = "http://localhost:28139/v3", body = files, encode = "multipart", httr::authenticate("test", ""))
