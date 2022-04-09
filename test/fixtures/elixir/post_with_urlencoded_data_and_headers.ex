request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/api/Listing.svc/PropertySearch_Post",
  options: [],
  headers: [
    {~s|Origin|, ~s|http://www.realtor.ca|},
    {~s|Accept-Encoding|, ~s|gzip, deflate|},
    {~s|Accept-Language|, ~s|en-US,en;q=0.8|},
    {~s|User-Agent|, ~s|Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36|},
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded; charset=UTF-8|},
    {~s|Accept|, ~s|*/*|},
    {~s|Referer|, ~s|http://www.realtor.ca/Residential/Map.aspx|},
    {~s|Connection|, ~s|keep-alive|},
  ],
  params: [],
  body: [
    {~s|CultureId|, ~s|1|},
    {~s|ApplicationId|, ~s|1|},
    {~s|RecordsPerPage|, ~s|200|},
    {~s|MaximumResults|, ~s|200|},
    {~s|PropertyTypeId|, ~s|300|},
    {~s|TransactionTypeId|, ~s|2|},
    {~s|StoreyRange|, ~s|0-0|},
    {~s|BuildingTypeId|, ~s|1|},
    {~s|BedRange|, ~s|0-0|},
    {~s|BathRange|, ~s|0-0|},
    {~s|LongitudeMin|, ~s|-79.3676805496215|},
    {~s|LongitudeMax|, ~s|-79.27300930023185|},
    {~s|LatitudeMin|, ~s|43.660358732823845|},
    {~s|LatitudeMax|, ~s|43.692390574029936|},
    {~s|SortOrder|, ~s|A|},
    {~s|SortBy|, ~s|1|},
    {~s|viewState|, ~s|m|},
    {~s|Longitude|, ~s|-79.4107246398925|},
    {~s|Latitude|, ~s|43.6552047278685|},
    {~s|ZoomLevel|, ~s|13|},
    {~s|CurrentPage|, ~s|1|}
  ]
}

response = HTTPoison.request(request)
