request = %HTTPoison.Request{
  method: :post,
  url: "http://example.com/post",
  options: [],
  headers: [],
  params: [],
  body: [
    {~s|msg1|, ~s|wow|},
    {~s|msg2|, ~s|such|},
    {~s|msg3|, ~s|@rawmsg|}
  ]
}

response = HTTPoison.request(request)
