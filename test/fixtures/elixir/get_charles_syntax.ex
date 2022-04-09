request = %HTTPoison.Request{
  method: :get,
  url: "http://localhost:28139/",
  options: [],
  headers: [
    {~s|Host|, ~s|api.ipify.org|},
    {~s|Accept|, ~s|*/*|},
    {~s|User-Agent|, ~s|GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)|},
    {~s|Accept-Language|, ~s|en-CN;q=1, zh-Hans-CN;q=0.9|},
  ],
  params: [
    {~s|format|, ~s|json|},
  ],
  body: ""
}

response = HTTPoison.request(request)
