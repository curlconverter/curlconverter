library(httr2)

request("http://localhost:28139/post-to-me.php") |>
  req_method("POST") |>
  req_body_multipart(
    username = "davidwalsh",
    password = "something"
  ) |>
  req_perform()
