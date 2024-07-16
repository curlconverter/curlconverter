library(httr)

headers = c(
  `x-msisdn` = "XXXXXXXXXXXXX",
  `user-agent` = "Mozilla Android6.1"
)

params = list(
  p = "5",
  pub = "testmovie",
  tkn = "817263812"
)

res <- httr::GET(url = "http://localhost:28139/vc/moviesmagic", httr::add_headers(.headers=headers), query = params)
