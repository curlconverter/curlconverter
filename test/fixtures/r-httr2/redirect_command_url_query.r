library(httr2)

request(paste0("http://localhost:28139?@", system("echo image.jpg", intern = TRUE))) |>
  req_perform()
