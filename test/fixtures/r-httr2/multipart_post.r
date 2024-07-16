library(httr2)

request("http://localhost:28139/api/2.0/files/content") |>
  req_method("POST") |>
  req_headers(Authorization = "Bearer ACCESS_TOKEN") |>
  req_body_multipart(
    attributes = '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}',
    file = curl::form_file("myfile.jpg")
  ) |>
  req_perform()
