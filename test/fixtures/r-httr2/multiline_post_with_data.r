library(httr2)

headers = c(
  `Origin` = "http://fiddle.jshell.net"
)

request("http://localhost:28139/echo/html/") |> 
  req_headers(!!!headers) |> 
  req_body_form(
    `msg1` = "value1",
    `msg2` = "value2"
  ) |> 
  req_perform()
