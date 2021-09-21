request = %HTTPoison.Request{
  method: :get,
  url: "http://205.147.98.6/vc/moviesmagic",
  options: [],
  headers: [
    {~s|x-msisdn|, ~s|XXXXXXXXXXXXX|},
    {~s|User-Agent|, ~s|Mozilla Android6.1|},
  ],
  params: [
    {~s|p|, ~s|5|},
    {~s|pub|, ~s|testmovie|},
    {~s|tkn|, ~s|817263812|},
  ],
  body: ""
}

response = HTTPoison.request(request)
