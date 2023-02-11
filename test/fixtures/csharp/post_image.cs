using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/targetservice");

MultipartFormDataContent content = new MultipartFormDataContent();
content.Add(new ByteArrayContent(File.ReadAllBytes("image.jpg")), "image", Path.GetFileName("image.jpg"));
request.Content = content;

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
