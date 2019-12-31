request = %HTTPoison.Request{
  method: :put,
  url: "https://api.newrelic.com/v2/alerts_policy_channels.json",
  options: [],
  headers: [
    {~s|X-Api-Key|, ~s|{admin_api_key}|},
    {~s|Content-Type|, ~s|application/json|},
  ],
  params: [
    {~s|policy_id|, ~s|policy_id|},
    {~s|channel_ids|, ~s|channel_id|},
  ],
  body: ""
}

response = HTTPoison.request(request)
