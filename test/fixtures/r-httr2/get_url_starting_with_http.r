library(httr2)

request("http://httpbin.org/test") |>
  req_perform()
