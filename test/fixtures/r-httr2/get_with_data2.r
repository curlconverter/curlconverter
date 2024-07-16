library(httr2)

request("http://localhost:28139/v2/alerts_policy_channels.json") |>
  req_method("PUT") |>
  req_url_query(
    policy_id = "policy_id",
    channel_ids = "channel_id"
  ) |>
  req_headers(`X-Api-Key` = "{admin_api_key}") |>
  req_perform()
