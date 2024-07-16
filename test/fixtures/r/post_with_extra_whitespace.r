library(httr)

headers = c(
  accept = "application/json",
  `Content-Type` = "multipart/form-data"
)

files = list(
  files = upload_file("47.htz"),
  name = "47",
  oldMediaId = "47",
  updateInLayouts = "1",
  deleteOldRevisions = "1"
)

res <- httr::POST(url = "http://localhost:28139/api/library", httr::add_headers(.headers=headers), body = files, encode = "multipart")
