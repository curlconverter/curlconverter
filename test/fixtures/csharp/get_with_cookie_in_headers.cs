using System.Net.Http;

HttpClientHandler handler = new HttpClientHandler();
handler.AutomaticDecompression = DecompressionMethods.All;

HttpClient client = new HttpClient(handler);

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "http://localhost:28139/cookies");

request.Headers.Add("Pragma", "no-cache");
// request.Headers.Add("Accept-Encoding", "gzip, deflate, br");
request.Headers.Add("Accept-Language", "en-US,en;q=0.9");
request.Headers.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36");
request.Headers.Add("accept", "application/json");
request.Headers.Add("Referer", "https://httpbin.org/");
request.Headers.Add("Cookie", "authCookie=123");
request.Headers.Add("Connection", "keep-alive");
request.Headers.Add("Cache-Control", "no-cache");
request.Headers.Add("Sec-Metadata", "destination=empty, site=same-origin");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
