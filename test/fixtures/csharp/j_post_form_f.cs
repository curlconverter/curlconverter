using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/post");

MultipartFormDataContent content = new MultipartFormDataContent();
content.Add(new StringContent("data1"), "d1");
content.Add(new StringContent("data"), "d2");
request.Content = content;

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
