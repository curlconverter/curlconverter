library(httr)

headers = c(
  `sec-ch-ua` = '" Not A;Brand";v="99", "Chromium";v="92"'
)

res <- httr::GET(url = "http://localhost:28139", httr::add_headers(.headers=headers))
