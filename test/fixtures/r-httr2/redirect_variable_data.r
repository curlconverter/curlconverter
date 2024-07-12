library(httr2)

request("http://localhost:28139") |> 
  req_method("POST") |> 
  req_body_raw(paste("foo&@", Sys.getenv("FILENAME"), sep = ""), "application/x-www-form-urlencoded") |> 
  req_perform()
