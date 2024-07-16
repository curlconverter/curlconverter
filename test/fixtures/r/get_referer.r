library(httr)

headers = c(
  `X-Requested-With` = "XMLHttpRequest",
  `User-Agent` = "SimCity",
  Referer = "https://website.com"
)

res <- httr::GET(url = "http://localhost:28139", httr::add_headers(.headers=headers))
