library(httr2)

request("http://localhost:28139/") |> 
  req_options(`ssl_verifypeer` = 0) |> 
  req_auth_basic("some_username", "some_password") |> 
  req_perform()
