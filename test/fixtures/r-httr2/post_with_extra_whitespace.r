library(httr2)

request("http://localhost:28139/api/library") |>
  req_method("POST") |>
  req_headers(accept = "application/json") |>
  req_body_multipart(
    files = curl::form_file("47.htz"),
    name = "47",
    oldMediaId = "47",
    updateInLayouts = "1",
    deleteOldRevisions = "1"
  ) |>
  req_perform()
