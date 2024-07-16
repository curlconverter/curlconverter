library(httr2)

request("http://localhost:28139/targetservice") |>
  req_method("POST") |>
  req_body_multipart(image = curl::form_file("image.jpg")) |>
  req_perform()
