using System.Net.Http;

HttpClientHandler handler = new HttpClientHandler();
handler.AutomaticDecompression = DecompressionMethods.All;

HttpClient client = new HttpClient(handler);

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Options, "http://localhost:28139/api/tunein/queue-and-play?deviceSerialNumber=xxx&deviceType=xxx&guideId=s56876&contentType=station&callSign=&mediaOwnerCustomerId=xxx");

request.Headers.Add("Pragma", "no-cache");
request.Headers.Add("Access-Control-Request-Method", "POST");
request.Headers.Add("Origin", "https://alexa.amazon.de");
// request.Headers.Add("Accept-Encoding", "gzip, deflate, br");
request.Headers.Add("Accept-Language", "de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4");
request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36");
request.Headers.Add("Accept", "*/*");
request.Headers.Add("Cache-Control", "no-cache");
request.Headers.Add("Referer", "https://alexa.amazon.de/spa/index.html");
request.Headers.Add("Connection", "keep-alive");
request.Headers.Add("DNT", "1");
request.Headers.Add("Access-Control-Request-Headers", "content-type,csrf");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
