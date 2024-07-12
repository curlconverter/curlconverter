library(httr)

res <- httr::GET(url = paste("http://localhost:28139?@", system("echo image.jpg", intern = TRUE), sep = ""))
