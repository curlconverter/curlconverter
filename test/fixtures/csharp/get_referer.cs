using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "http://localhost:28139");

request.Headers.Add("X-Requested-With", "XMLHttpRequest");
request.Headers.Add("User-Agent", "SimCity");
request.Headers.Add("Referer", "https://website.com");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
