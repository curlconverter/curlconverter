request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/post-to-me.php",
  options: [],
  headers: [],
  params: [],
  body: {:multipart, [
    {~s|username|, ~s|davidwalsh|},
    {~s|password|, ~s|something|}
]}
}

response = HTTPoison.request(request)
