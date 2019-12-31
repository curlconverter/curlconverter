method = :get
url = "https://synthetics.newrelic.com/synthetics/api/v3/monitors"
headers = [
  {~s|X-Api-Key|, ~s|123456789|},
]
body = nil
options = []
params = [
  {~s|test|, ~s|2|},
  {~s|limit|, ~s|100|},
  {~s|w|, ~s|4|},
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
