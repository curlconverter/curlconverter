library(httr2)

request("http://localhost:28139/post") |>
  req_method("POST") |>
  req_body_raw(
    "msg1=wow&msg2=such&msg3=@rawmsg",
    type = "application/x-www-form-urlencoded"
  ) |>
  req_perform()
