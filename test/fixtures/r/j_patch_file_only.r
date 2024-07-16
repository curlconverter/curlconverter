library(httr)

files = list(
  file1 = upload_file("./test/fixtures/curl_commands/delete.sh")
)

res <- httr::PATCH(url = "http://localhost:28139/patch", body = files, encode = "multipart")
