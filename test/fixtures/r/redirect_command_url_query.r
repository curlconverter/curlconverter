library(httr)

res <- httr::GET(url = paste0("http://localhost:28139?@", system("echo image.jpg", intern = TRUE)))
