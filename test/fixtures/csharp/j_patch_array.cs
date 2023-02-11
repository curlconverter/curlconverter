using System.Net.Http;
using System.Net.Http.Headers;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Patch, "http://localhost:28139/patch");
request.Content = new StringContent("item[]=1&item[]=2&item[]=3");
request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
