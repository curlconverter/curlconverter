library(httr2)

request("http://localhost:28139/v2/images") |>
  req_url_query(type = "distribution") |>
  req_headers(Authorization = paste0("Bearer ", Sys.getenv("DO_API_TOKEN"))) |>
  req_perform()
