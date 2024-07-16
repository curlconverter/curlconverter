library(httr2)

request("http://localhost:28139/cookies") |>
  req_headers(
    accept = "application/json",
    Cookie = "mysamplecookie=someValue; emptycookie=; otherCookie=2"
  ) |>
  req_perform()
