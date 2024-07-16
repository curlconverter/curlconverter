library(httr)

headers = c(
  `X-Api-Key` = "{admin_api_key}",
  `Content-Type` = "application/json"
)

params = list(
  policy_id = "policy_id",
  channel_ids = "channel_id"
)

res <- httr::PUT(url = "http://localhost:28139/v2/alerts_policy_channels.json", httr::add_headers(.headers=headers), query = params)
