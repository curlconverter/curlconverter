library(httr2)

headers = c(
  `accept` = "application/json"
)

cookies = c(
  `mysamplecookie` = "someValue",
  `emptycookie` = "",
  `otherCookie` = "2"
)

request("http://localhost:28139/cookies") |> 
  req_headers(!!!headers) |> 
  req_headers(!!!cookies) |> 
  req_perform()
