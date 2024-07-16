library(httr2)

request("http://localhost:28139") |>
  req_headers(
    `X-Requested-With` = "XMLHttpRequest",
    `User-Agent` = "SimCity",
    Referer = "https://website.com"
  ) |>
  req_perform()
