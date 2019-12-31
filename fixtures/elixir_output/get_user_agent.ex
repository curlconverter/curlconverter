method = :get
url = "http://205.147.98.6/vc/moviesmagic"
headers = [
  {~s|x-msisdn|, ~s|XXXXXXXXXXXXX|},
  {~s|User-Agent|, ~s|Mozilla Android6.1|},
]
body = nil
options = []
params = [
  {~s|p|, ~s|5|},
  {~s|pub|, ~s|testmovie|},
  {~s|tkn|, ~s|817263812|},
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
