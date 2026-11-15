using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/upload");

MultipartFormDataContent content = new MultipartFormDataContent();
content.Add(new StringContent("value"), "name");
request.Content = content;

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
