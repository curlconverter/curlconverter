library(httr)

headers = c(
  `X-Api-Key` = "123456789"
)

params = list(
  test = "2",
  limit = "100",
  w = "4"
)

res <- httr::GET(url = "http://localhost:28139/synthetics/api/v3/monitors", httr::add_headers(.headers=headers), query = params)
