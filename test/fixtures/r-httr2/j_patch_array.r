library(httr2)

request("http://localhost:28139/patch") |>
  req_method("PATCH") |>
  req_body_raw(
    "item[]=1&item[]=2&item[]=3",
    type = "application/x-www-form-urlencoded"
  ) |>
  req_perform()
