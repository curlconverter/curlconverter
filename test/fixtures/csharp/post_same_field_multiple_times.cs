using System.Net.Http;
using System.Net.Http.Headers;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/");
request.Content = new StringContent("foo=bar&foo=&foo=barbar");
request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
