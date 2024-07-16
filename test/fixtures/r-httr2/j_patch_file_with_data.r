library(httr2)

request("http://localhost:28139/patch") |>
  req_method("PATCH") |>
  req_body_multipart(
    file1 = curl::form_file("./test/fixtures/curl_commands/delete.sh"),
    form1 = "form+data+1",
    form2 = "form_data_2"
  ) |>
  req_perform()
