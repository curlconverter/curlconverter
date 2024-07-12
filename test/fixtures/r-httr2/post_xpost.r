library(httr2)

request("http://localhost:28139/api/xxxxxxxxxxxxxxxx") |> 
  req_method("POST") |> 
  req_body_raw('{"keywords":"php","page":1,"searchMode":1}', "application/x-www-form-urlencoded") |> 
  req_perform()
