library(httr2)

headers = c(
  `A` = "''a'",
  `B` = '"'
)

cookies = c(
  `x` = "1'",
  `y` = '2"'
)

request("http://localhost:28139") |> 
  req_method("POST") |> 
  req_headers(!!!headers) |> 
  req_headers(!!!cookies) |> 
  req_body_raw("a=b&c=\"&d='", "application/x-www-form-urlencoded") |> 
  req_auth_basic("ol'", 'asd"') |> 
  req_perform()
