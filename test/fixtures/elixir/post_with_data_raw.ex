request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/post",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: [
    {~s|msg1|, ~s|wow|},
    {~s|msg2|, ~s|such|},
    {~s|msg3|, ~s|@rawmsg|}
  ]
}

response = HTTPoison.request(request)
