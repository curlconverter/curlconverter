request = %HTTPoison.Request{
  method: :post,
  url: "http://domain.tld/post-to-me.php",
  options: [],
  headers: [],
  params: [],
  body: {:multipart, [
    {~s|username|, ~s|davidwalsh|},
    {~s|password|, ~s|something|}
]}
}

response = HTTPoison.request(request)
