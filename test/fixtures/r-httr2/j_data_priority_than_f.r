library(httr2)

request("http://localhost:28139/post") |>
  req_method("POST") |>
  req_body_form(
    data1 = "data1",
    data2 = "data2",
    data3 = "data3"
  ) |>
  req_perform()
