method = :get
url = "http://api.ipify.org/"
headers = [
  {~s|Host|, ~s|api.ipify.org|},
  {~s|Accept|, ~s|*/*|},
  {~s|User-Agent|, ~s|GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)|},
  {~s|Accept-Language|, ~s|en-CN;q=1, zh-Hans-CN;q=0.9|},
]
body = nil
options = []
params = [
  {~s|format|, ~s|json|},
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
