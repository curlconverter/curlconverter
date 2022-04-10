request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/ajax/demo_post.asp",
  options: [hackney: [cookies: [~s|_gat=1; ASPSESSIONIDACCRDTDC=MCMDKFMBLLLHGKCGNMKNGPKI; _ga=GA1.2.1424920226.1419478126|]]],
  headers: [
    {~s|Origin|, ~s|http://www.w3schools.com|},
    {~s|Accept-Encoding|, ~s|gzip, deflate|},
    {~s|Accept-Language|, ~s|en-US,en;q=0.8|},
    {~s|User-Agent|, ~s|Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36|},
    {~s|Accept|, ~s|*/*|},
    {~s|Referer|, ~s|http://www.w3schools.com/ajax/tryit_view.asp?x=0.07944501144811511|},
    {~s|Connection|, ~s|keep-alive|},
    {~s|Content-Length|, ~s|0|},
  ],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
