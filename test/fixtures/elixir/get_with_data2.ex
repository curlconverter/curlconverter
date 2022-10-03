request = %HTTPoison.Request{
  method: :put,
  url: "http://localhost:28139/v2/alerts_policy_channels.json",
  body: "",
  headers: [
    {"X-Api-Key", "{admin_api_key}"},
    {"Content-Type", "application/json"}
  ],
  options: [],
  params: [
    {"policy_id", "policy_id"},
    {"channel_ids", "channel_id"}
  ]
}

response = HTTPoison.request(request)
