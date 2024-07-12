library(httr2)

headers = c(
  `accept` = "application/json"
)

request("http://localhost:28139/api/library") |> 
  req_method("POST") |> 
  req_headers(!!!headers) |> 
  req_body_multipart(
    `files` = curl::form_file("47.htz"),
    `name` = "47",
    `oldMediaId` = "47",
    `updateInLayouts` = "1",
    `deleteOldRevisions` = "1"
  ) |> 
  req_perform()
