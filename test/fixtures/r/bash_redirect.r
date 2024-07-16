library(httr)

headers = c(
  `X-Requested-With` = "curl",
  `Content-Type` = "text/xml"
)

params = list(
  action = "create",
  title = "UnixRecord",
  username = "root",
  password = "abc123",
  ips = "10.10.10.10"
)

data = upload_file("add_params.xml")
res <- httr::POST(url = "http://localhost:28139/api/2.0/fo/auth/unix/", httr::add_headers(.headers=headers), query = params, body = data, httr::authenticate("USER", "PASS"))
