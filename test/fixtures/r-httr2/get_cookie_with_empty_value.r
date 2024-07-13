library(httr2)

request("http://localhost:28139/cookies") |> 
  req_headers(`accept` = "application/json") |> 
  req_headers(
    `mysamplecookie` = "someValue",
    `emptycookie` = "",
    `otherCookie` = "2"
  ) |> 
  req_perform()
