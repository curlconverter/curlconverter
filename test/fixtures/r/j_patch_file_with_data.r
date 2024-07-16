library(httr)

files = list(
  file1 = upload_file("./test/fixtures/curl_commands/delete.sh"),
  form1 = "form+data+1",
  form2 = "form_data_2"
)

res <- httr::PATCH(url = "http://localhost:28139/patch", body = files, encode = "multipart")
