request = %HTTPoison.Request{
  method: :get,
  url: "http://localhost:28139/",
  options: [hackney: [cookies: [~s|GeoIP=US:Albuquerque:35.1241:-106.7675:v4; uls-previous-languages=%5B%22en%22%5D; mediaWiki.user.sessionId=VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y; centralnotice_buckets_by_campaign=%7B%22C14_enUS_dsk_lw_FR%22%3A%7B%22val%22%3A%220%22%2C%22start%22%3A1412172000%2C%22end%22%3A1422576000%7D%2C%22C14_en5C_dec_dsk_FR%22%3A%7B%22val%22%3A3%2C%22start%22%3A1417514400%2C%22end%22%3A1425290400%7D%2C%22C14_en5C_bkup_dsk_FR%22%3A%7B%22val%22%3A1%2C%22start%22%3A1417428000%2C%22end%22%3A1425290400%7D%7D; centralnotice_bannercount_fr12=22; centralnotice_bannercount_fr12-wait=14|]]],
  headers: [
    {~s|Accept-Encoding|, ~s|gzip, deflate, sdch|},
    {~s|Accept-Language|, ~s|en-US,en;q=0.8|},
    {~s|User-Agent|, ~s|Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36|},
    {~s|Accept|, ~s|text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8|},
    {~s|Referer|, ~s|http://www.wikipedia.org/|},
    {~s|Connection|, ~s|keep-alive|},
  ],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
