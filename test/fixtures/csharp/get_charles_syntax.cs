using System.Net.Http;

HttpClientHandler handler = new HttpClientHandler();
handler.AutomaticDecompression = DecompressionMethods.All;

HttpClient client = new HttpClient(handler);

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "http://localhost:28139/?format=json&");

request.Headers.Add("Host", "api.ipify.org");
request.Headers.Add("Accept", "*/*");
request.Headers.Add("User-Agent", "GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)");
request.Headers.Add("Accept-Language", "en-CN;q=1, zh-Hans-CN;q=0.9");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
