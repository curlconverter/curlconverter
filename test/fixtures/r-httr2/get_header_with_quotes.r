library(httr2)

request("http://localhost:28139") |>
  req_headers(`sec-ch-ua` = '" Not A;Brand";v="99", "Chromium";v="92"') |>
  req_perform()
