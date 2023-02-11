using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/post-to-me.php");

MultipartFormDataContent content = new MultipartFormDataContent();
content.Add(new StringContent("davidwalsh"), "username");
content.Add(new StringContent("something"), "password");
request.Content = content;

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
