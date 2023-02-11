using System.Net.Http;
using System.Net.Http.Headers;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/api/Listing.svc/PropertySearch_Post");

request.Headers.Add("Origin", "http://www.realtor.ca");
// request.Headers.Add("Accept-Encoding", "gzip, deflate");
request.Headers.Add("Accept-Language", "en-US,en;q=0.8");
request.Headers.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36");
request.Headers.Add("Accept", "*/*");
request.Headers.Add("Referer", "http://www.realtor.ca/Residential/Map.aspx");
request.Headers.Add("Connection", "keep-alive");

request.Content = new StringContent("CultureId=1&ApplicationId=1&RecordsPerPage=200&MaximumResults=200&PropertyTypeId=300&TransactionTypeId=2&StoreyRange=0-0&BuildingTypeId=1&BedRange=0-0&BathRange=0-0&LongitudeMin=-79.3676805496215&LongitudeMax=-79.27300930023185&LatitudeMin=43.660358732823845&LatitudeMax=43.692390574029936&SortOrder=A&SortBy=1&viewState=m&Longitude=-79.4107246398925&Latitude=43.6552047278685&ZoomLevel=13&CurrentPage=1");
request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse("application/x-www-form-urlencoded; charset=UTF-8");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
