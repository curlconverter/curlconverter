request = %HTTPoison.Request{
  method: :options,
  url: "http://localhost:28139/api/tunein/queue-and-play",
  options: [],
  headers: [
    {~s|Pragma|, ~s|no-cache|},
    {~s|Access-Control-Request-Method|, ~s|POST|},
    {~s|Origin|, ~s|https://alexa.amazon.de|},
    {~s|Accept-Encoding|, ~s|gzip, deflate, br|},
    {~s|Accept-Language|, ~s|de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4|},
    {~s|User-Agent|, ~s|Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36|},
    {~s|Accept|, ~s|*/*|},
    {~s|Cache-Control|, ~s|no-cache|},
    {~s|Referer|, ~s|https://alexa.amazon.de/spa/index.html|},
    {~s|Connection|, ~s|keep-alive|},
    {~s|DNT|, ~s|1|},
    {~s|Access-Control-Request-Headers|, ~s|content-type,csrf|},
  ],
  params: [
    {~s|deviceSerialNumber|, ~s|xxx|},
    {~s|deviceType|, ~s|xxx|},
    {~s|guideId|, ~s|s56876|},
    {~s|contentType|, ~s|station|},
    {~s|callSign|, ""},
    {~s|mediaOwnerCustomerId|, ~s|xxx|},
  ],
  body: ""
}

response = HTTPoison.request(request)
