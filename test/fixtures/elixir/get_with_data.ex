request = %HTTPoison.Request{
  method: :get,
  url: "https://synthetics.newrelic.com/synthetics/api/v3/monitors",
  options: [],
  headers: [
    {~s|X-Api-Key|, ~s|123456789|},
  ],
  params: [
    {~s|test|, ~s|2|},
    {~s|limit|, ~s|100|},
    {~s|w|, ~s|4|},
  ],
  body: ""
}

response = HTTPoison.request(request)
