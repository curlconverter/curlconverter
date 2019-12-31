method = :put
url = "https://api.newrelic.com/v2/alerts_policy_channels.json"
headers = [
  {~s|X-Api-Key|, ~s|{admin_api_key}|},
  {~s|Content-Type|, ~s|application/json|},
]
body = nil
options = []
params = [
  {~s|policy_id|, ~s|policy_id|},
  {~s|channel_ids|, ~s|channel_id|},
]

request = %HTTPoison.Request{
  method: method,
  url: url,
  body: body,
  headers: headers,
  options: options,
  params: params,
}

response = HTTPoison.request(request)
