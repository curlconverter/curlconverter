library(httr2)

request("http://localhost:28139/synthetics/api/v3/monitors") |>
  req_url_query(
    test = "2",
    limit = "100",
    w = "4"
  ) |>
  req_headers(`X-Api-Key` = "123456789") |>
  req_perform(verbosity = 1)
