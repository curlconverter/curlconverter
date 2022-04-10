request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/echo/html/",
  options: [],
  headers: [
    {~s|Origin|, ~s|http://fiddle.jshell.net|},
    {~s|Accept-Encoding|, ~s|gzip, deflate|},
    {~s|Accept-Language|, ~s|en-US,en;q=0.8|},
    {~s|User-Agent|, ~s|Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36|},
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded; charset=UTF-8|},
    {~s|Accept|, ~s|*/*|},
    {~s|Referer|, ~s|http://fiddle.jshell.net/_display/|},
    {~s|X-Requested-With|, ~s|XMLHttpRequest|},
    {~s|Connection|, ~s|keep-alive|},
  ],
  params: [],
  body: [
    {~s|msg1|, ~s|wow|},
    {~s|msg2|, ~s|such|}
  ]
}

response = HTTPoison.request(request)
