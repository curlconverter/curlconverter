using System.Net.Http;
using System.Net.Http.Headers;

HttpClientHandler handler = new HttpClientHandler();
handler.AutomaticDecompression = DecompressionMethods.All;

HttpClient client = new HttpClient(handler);

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/echo/html/");

request.Headers.Add("Origin", "http://fiddle.jshell.net");
// request.Headers.Add("Accept-Encoding", "gzip, deflate");
request.Headers.Add("Accept-Language", "en-US,en;q=0.8");
request.Headers.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36");
request.Headers.Add("Accept", "*/*");
request.Headers.Add("Referer", "http://fiddle.jshell.net/_display/");
request.Headers.Add("X-Requested-With", "XMLHttpRequest");
request.Headers.Add("Connection", "keep-alive");

request.Content = new StringContent("msg1=wow&msg2=such");
request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse("application/x-www-form-urlencoded; charset=UTF-8");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
