library(httr)

headers = c(
  `Content-Type` = "application/json",
  Authorization = paste0("Bearer ", Sys.getenv("DO_API_TOKEN"))
)

params = list(
  type = "distribution"
)

res <- httr::GET(url = "http://localhost:28139/v2/images", httr::add_headers(.headers=headers), query = params)
