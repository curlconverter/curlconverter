using System.Net.Http;
using System.Net.Http.Headers;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Put, "http://localhost:28139/upload");
request.Content = new StringContent(File.ReadAllText("new_file").Replace("\n", string.Empty).Replace("\r", string.Empty));
request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
