library(httr2)

request(paste("http://localhost:28139?@", system("echo image.jpg", intern = TRUE), sep = "")) |> 
  req_perform()
