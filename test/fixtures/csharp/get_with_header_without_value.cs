using System.Net.Http;
using System.Net.Http.Headers;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "http://localhost:28139/get");

request.Headers.Add("getWorkOrderCancel", "");

request.Content = new StringContent("");
request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse("text/xml;charset=UTF-8");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
