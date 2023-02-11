using System.Net.Http;

HttpClientHandler handler = new HttpClientHandler();
handler.AutomaticDecompression = DecompressionMethods.All;

HttpClient client = new HttpClient(handler);

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/ajax/demo_post.asp");

request.Headers.Add("Origin", "http://www.w3schools.com");
// request.Headers.Add("Accept-Encoding", "gzip, deflate");
request.Headers.Add("Accept-Language", "en-US,en;q=0.8");
request.Headers.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36");
request.Headers.Add("Accept", "*/*");
request.Headers.Add("Referer", "http://www.w3schools.com/ajax/tryit_view.asp?x=0.07944501144811511");
request.Headers.Add("Cookie", "_gat=1; ASPSESSIONIDACCRDTDC=MCMDKFMBLLLHGKCGNMKNGPKI; _ga=GA1.2.1424920226.1419478126");
request.Headers.Add("Connection", "keep-alive");

// request.Content.Headers.ContentLength = 0;

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
