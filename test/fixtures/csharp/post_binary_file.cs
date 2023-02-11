using System.Net.Http;
using System.Net.Http.Headers;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/american-art/query");

request.Headers.Add("Accept", "application/sparql-results+json");

request.Content = new StringContent(File.ReadAllText("./sample.sparql").Replace("\n", string.Empty).Replace("\r", string.Empty));
request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/sparql-query");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
