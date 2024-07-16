library(httr2)

request("http://localhost:28139/vc/moviesmagic") |>
  req_url_query(
    p = "5",
    pub = "testmovie",
    tkn = "817263812"
  ) |>
  req_headers(
    `x-msisdn` = "XXXXXXXXXXXXX",
    `user-agent` = "Mozilla Android6.1"
  ) |>
  req_perform()
