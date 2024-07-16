library(httr)

headers = c(
  `Content-Type` = "text/xml;charset=UTF-8",
  getWorkOrderCancel = ""
)

res <- httr::GET(url = "http://localhost:28139/get", httr::add_headers(.headers=headers))
