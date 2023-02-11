using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/api/2.0/files/content");

request.Headers.Add("Authorization", "Bearer ACCESS_TOKEN");
request.Headers.Add("X-Nice", "Header");


MultipartFormDataContent content = new MultipartFormDataContent();
content.Add(new StringContent("{\"name\":\"tigers.jpeg\", \"parent\":{\"id\":\"11446498\"}}"), "attributes");
content.Add(new ByteArrayContent(File.ReadAllBytes("myfile.jpg")), "file", Path.GetFileName("myfile.jpg"));
request.Content = content;

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
