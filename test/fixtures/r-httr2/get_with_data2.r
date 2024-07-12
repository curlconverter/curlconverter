library(httr2)

params = list(
  `policy_id` = "policy_id",
  `channel_ids` = "channel_id"
)

headers = c(
  `X-Api-Key` = "{admin_api_key}"
)

request("http://localhost:28139/v2/alerts_policy_channels.json") |> 
  req_method("PUT") |> 
  req_url_query(!!!params) |> 
  req_headers(!!!headers) |> 
  req_perform()
