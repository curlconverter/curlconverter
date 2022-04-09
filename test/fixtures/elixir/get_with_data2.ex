request = %HTTPoison.Request{
  method: :put,
  url: "http://localhost:28139/v2/alerts_policy_channels.json",
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
