library(httr2)

request("http://localhost:28139/v3") |>
  req_method("POST") |>
  req_body_multipart(
    from = "test@tester.com",
    to = "devs@tester.net",
    subject = "Hello",
    text = "Testing the converter!"
  ) |>
  req_auth_basic("test", "") |>
  req_perform()
