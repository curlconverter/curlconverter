library(httr2)

params = list(
  `foo` = "bar",
  `baz` = "qux"
)

request("http://localhost:28139") |> 
  req_url_query(!!!params) |> 
  req_perform()
