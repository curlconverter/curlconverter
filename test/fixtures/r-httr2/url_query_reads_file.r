library(httr2)

request("http://localhost:28139?name=@myfile.jpg") |>
  req_perform()
