response = HTTPoison.put!(
  "http://localhost:28139/v2/alerts_policy_channels.json",
  "",
  [
    {"X-Api-Key", "{admin_api_key}"},
    {"Content-Type", "application/json"}
  ],
  [
    params: [
      {"policy_id", "policy_id"},
      {"channel_ids", "channel_id"}
    ]
  ]
)
