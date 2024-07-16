library(httr2)

request("http://localhost:28139/post") |>
  req_method("POST") |>
  req_body_multipart(
    d1 = "data1",
    d2 = "data"
  ) |>
  req_perform()
